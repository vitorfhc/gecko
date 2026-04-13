import browser from "webextension-polyfill";
import { Mutex } from "async-mutex";
import { Source, SourceType, Finding, Settings } from "../shared/types";
import { defaultSettings } from "../shared/constants";

let currentTab: browser.Tabs.Tab | null = null;
let storageMutex = new Mutex();
const MAX_FINDINGS = 5000;

const currentSettings: Settings = JSON.parse(JSON.stringify(defaultSettings));

browser.storage.local.get("settings").then((items) => {
  if (!items.settings) {
    browser.storage.local.set({ settings: defaultSettings });
  } else {
    Object.assign(currentSettings, items.settings);
  }
});

browser.storage.local.onChanged.addListener((changes) => {
  if (changes.findings && changes.findings.newValue) {
    const newLength = (changes.findings.newValue as any[]).length;

    if (newLength === 0) {
      storageMutex.runExclusive(async () => {
        await browser.storage.local.set({ findingsCache: {} });
      });
    }

    if (newLength) {
      browser.action.setBadgeText({
        text: `${newLength}`,
      });
      browser.action.setBadgeBackgroundColor({
        color: "#cc3300",
      });
    } else {
      browser.action.setBadgeText({
        text: "",
      });
    }
  }

  if (changes.settings) {
    Object.assign(currentSettings, changes.settings.newValue);
  }
});

function generateCacheKey(finding: Finding): string {
  const { source, target } = finding;
  return `${source.url}-${source.value}-${target.url}`;
}

function storeFinding(finding: Finding) {
  storageMutex.runExclusive(async () => {
    const items = await browser.storage.local.get([
      "findings",
      "findingsCache",
    ]);

    const cache = (items.findingsCache as Record<string, boolean>) || {};
    const cacheKey = generateCacheKey(finding);
    if (cache[cacheKey]) {
      return;
    }
    cache[cacheKey] = true;

    const findings: Finding[] = Array.isArray(items.findings)
      ? items.findings
      : [];
    findings.push(finding);
    if (findings.length > MAX_FINDINGS) {
      findings.splice(0, findings.length - MAX_FINDINGS);
    }
    await browser.storage.local.set({ findings, findingsCache: cache });
  });
}

let updateCounter = 0;
function updateCurrentTab() {
  const myCounter = ++updateCounter;
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (myCounter === updateCounter && tabs.length > 0) {
      currentTab = tabs[0];
    }
  });
}

browser.tabs.onActivated.addListener(updateCurrentTab);
browser.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    updateCurrentTab();
  }
});

browser.webNavigation.onCommitted.addListener((details) => {
  if (
    details.frameId === 0 &&
    currentSettings.display.clearOnRefresh &&
    (details as any).transitionType === "reload" &&
    currentTab &&
    details.tabId === currentTab.id
  ) {
    browser.storage.local.set({ findings: [] });
  }
});

updateCurrentTab();

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!details.initiator && !details.originUrl) {
      return undefined;
    }

    if (currentTab && currentTab.url && details.tabId === currentTab.id) {
      if (details.url === currentTab.url) {
        return undefined;
      }
      const sources = urlToSources(currentTab.url);
      const findings = generateFindings(details.url, sources);
      findings.forEach((finding) => storeFinding(finding)); // TODO: store multiple findings at once
    }
    return undefined;
  },
  { urls: ["<all_urls>"] },
);

function urlToSources(url: string): Source[] {
  const sources: Source[] = [];
  const u = new URL(url);

  if (currentSettings.scanners.searchQueryValues) {
    const query = u.searchParams;
    query.forEach((v) => {
      sources.push({
        type: SourceType.QueryValue,
        url: url,
        value: v,
      });

      const decoded = decodeURIComponent(v);
      if (decoded !== v) {
        sources.push({
          type: SourceType.QueryValueDecoded,
          url: url,
          value: decoded,
        });
      }

      const encoded = encodeURIComponent(v);
      if (encoded !== v) {
        sources.push({
          type: SourceType.QueryValueEncoded,
          url: url,
          value: encoded,
        });
      }
    });
  }

  if (currentSettings.scanners.searchPath) {
    const pathParts = u.pathname.split("/");
    pathParts.forEach((part) => {
      sources.push({
        type: SourceType.PathValue,
        url: url,
        value: part,
      });

      const decoded = decodeURIComponent(part);
      if (decoded !== part) {
        sources.push({
          type: SourceType.PathValueDecoded,
          url: url,
          value: decoded,
        });
      }

      const encoded = encodeURIComponent(part);
      if (encoded !== part) {
        sources.push({
          type: SourceType.PathValueEncoded,
          url: url,
          value: encoded,
        });
      }
    });
  }

  if (currentSettings.scanners.searchNullUndefined) {
    const undefinedValue = "undefined";
    sources.push({
      type: SourceType.UndefinedValue,
      url: url,
      value: undefinedValue,
    });

    const nullValue = "null";
    sources.push({
      type: SourceType.NullValue,
      url: url,
      value: nullValue,
    });
  }

  return sources.filter((source) => source.value.length > 0);
}

function generateFindings(url: string, sources: Source[]): Finding[] {
  const findings: Finding[] = [];

  const u = new URL(url);
  const pathParts = u.pathname.split("/");

  const ignoredTargetOrigins = [
    /adservice\.google\.com/,
    /ad\.doubleclick\.net/,
  ];

  const isIgnored = ignoredTargetOrigins.some((origin) =>
    origin.test(u.hostname),
  );

  if (isIgnored) {
    return findings;
  }

  sources.forEach((source) => {
    pathParts.forEach((part) => {
      let mPart = part;
      let mSourceValue = source.value;

      if (currentSettings.matching.caseInsensitive) {
        mPart = part.toLowerCase();
        mSourceValue = source.value.toLowerCase();
      }

      let usePartialMatch = currentSettings.matching.partial;
      if (
        !usePartialMatch ||
        mSourceValue.length < currentSettings.matching.partialMinLength
      ) {
        usePartialMatch = false;
      }

      const match = usePartialMatch
        ? mPart.includes(mSourceValue)
        : mPart === mSourceValue;
      if (mPart.length !== 0 && match) {
        findings.push({
          source,
          target: {
            url,
          },
        });
      }
    });
  });

  return findings;
}

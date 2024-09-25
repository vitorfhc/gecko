import { Mutex } from "async-mutex";
import { Source, SourceType, Finding, Settings } from "../shared/types";
import { defaultSettings } from "../shared/constants";

let currentTab: chrome.tabs.Tab | null = null;
let storageMutex = new Mutex();

const currentSettings: Settings = defaultSettings;

chrome.storage.local.get("settings", (items) => {
  if (!items.settings) {
    chrome.storage.local.set({ settings: defaultSettings });
  } else {
    Object.assign(currentSettings, items.settings);
  }
});

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.findings) {
    const newLength = changes.findings.newValue.length;

    if (newLength) {
      chrome.action.setBadgeText({
        text: `${newLength}`,
      });
      chrome.action.setBadgeBackgroundColor({
        color: "#cc3300",
      });
    } else {
      chrome.action.setBadgeText({
        text: "",
      });
    }
  }

  if (changes.settings) {
    Object.assign(currentSettings, changes.settings.newValue);
  }
});

function storeFinding(finding: Finding) {
  storageMutex.runExclusive(async () => {
    chrome.storage.local.get("findings", (items) => {
      const findings = items.findings || [];
      findings.push(finding);
      chrome.storage.local.set({ findings });
    });
  });
}

function updateCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      currentTab = tabs[0];
    }
  });
}

chrome.tabs.onActivated.addListener(updateCurrentTab);
chrome.tabs.onUpdated.addListener(updateCurrentTab);

updateCurrentTab();

// function contentLog(message: any) {
//   chrome.scripting.executeScript({
//     target: { tabId: currentTab?.id || 0 },
//     func: (m) => {
//       console.log(m);
//     },
//     args: [message],
//   });
// }

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!details.initiator) {
      return;
    }

    if (currentTab && currentTab.url) {
      if (details.url === currentTab.url) {
        return;
      }
      const sources = urlToSources(currentTab.url);
      const findings = generateFindings(details.url, sources);
      findings.forEach((finding) => storeFinding(finding)); // TODO: store multiple findings at once
    }
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
  const pathParts = new URL(url).pathname.split("/");

  sources.forEach((source) => {
    pathParts.forEach((part) => {
      let mPart = part;
      let mSourceValue = source.value;

      if (currentSettings.matching.caseInsensitive) {
        mPart = part.toLowerCase();
        mSourceValue = source.value.toLowerCase();
      }

      const match = currentSettings.matching.partial
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

import browser from "webextension-polyfill";
import { Settings } from "./types";
import { defaultSettings } from "./constants";

// Fills in sections and fields missing from settings saved by older versions,
// or from no saved settings at all.
function normalizeSettings(stored?: unknown): Settings {
  const s = (stored ?? {}) as Partial<Settings>;
  return {
    scanners: { ...defaultSettings.scanners, ...s.scanners },
    matching: { ...defaultSettings.matching, ...s.matching },
    display: { ...defaultSettings.display, ...s.display },
    filters: { ...defaultSettings.filters, ...s.filters },
  };
}

async function loadSettings(): Promise<Settings> {
  const items = await browser.storage.local.get("settings");
  return normalizeSettings(items.settings);
}

function toRegExp(pattern: string, flags = ""): RegExp | null {
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

// Invalid patterns are dropped; the popup lists them so the user can fix them.
function compileIgnorePatterns(settings: Settings): RegExp[] {
  const flags = settings.matching.caseInsensitive ? "i" : "";
  return settings.filters.ignorePatterns
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => toRegExp(p, flags))
    .filter((re): re is RegExp => re !== null);
}

function isIgnoredTarget(url: string, ignorePatterns: RegExp[]): boolean {
  if (ignorePatterns.length === 0) return false;
  const targetPath = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  })();
  return ignorePatterns.some((re) => re.test(targetPath));
}

export {
  normalizeSettings,
  loadSettings,
  toRegExp,
  compileIgnorePatterns,
  isIgnoredTarget,
};

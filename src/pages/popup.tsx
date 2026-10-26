import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import Toggle from "../components/ui/toggle";
import "../tailwind/styles.css";
import { Settings } from "../shared/types";
import { loadSettings, toRegExp } from "../shared/settings";
import InfoAlert from "../components/ui/info-alert";
import browser from "webextension-polyfill";

export default function Popup() {
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [patternsText, setPatternsText] = React.useState("");

  useEffect(() => {
    loadSettings().then((stored) => {
      setSettings(stored);
      setPatternsText(stored.filters.ignorePatterns.join("\n"));
    });
  }, []);

  const updateSettings = (next: Settings) => {
    setSettings(next);
    browser.storage.local.set({ settings: next });
  };

  const commitPatterns = () => {
    if (!settings) return;
    if (patternsText === settings.filters.ignorePatterns.join("\n")) return;
    updateSettings({
      ...settings,
      filters: {
        ...settings.filters,
        ignorePatterns: patternsText.split("\n"),
      },
    });
  };

  // Patterns are saved once typing pauses, so a half-typed regex such as "/"
  // or "/api|" doesn't briefly hide every finding in the panel.
  useEffect(() => {
    const timer = setTimeout(commitPatterns, 500);
    window.addEventListener("pagehide", commitPatterns);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pagehide", commitPatterns);
    };
  }, [patternsText, settings]);

  if (!settings) return null;

  const minLenClasses = settings.matching.partial ? "" : "hidden";
  const invalidPatterns = patternsText
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && toRegExp(p) === null);

  return (
    <div className="min-w-[300px] p-4 bg-white">
      <p className="text-xl font-semibold mb-4">Settings</p>
      <hr className="mb-4" />
      <div className="space-y-4">
        <Toggle
          label="Search in Query Values"
          enabled={settings.scanners.searchQueryValues}
          onChange={() => {
            updateSettings({
              ...settings,
              scanners: {
                ...settings.scanners,
                searchQueryValues: !settings.scanners.searchQueryValues,
              },
            });
          }}
        />
        <Toggle
          label="Search in Path"
          enabled={settings.scanners.searchPath}
          onChange={() => {
            updateSettings({
              ...settings,
              scanners: {
                ...settings.scanners,
                searchPath: !settings.scanners.searchPath,
              },
            });
          }}
        />
        <Toggle
          label="Search for null/undefined"
          enabled={settings.scanners.searchNullUndefined}
          onChange={() => {
            updateSettings({
              ...settings,
              scanners: {
                ...settings.scanners,
                searchNullUndefined: !settings.scanners.searchNullUndefined,
              },
            });
          }}
        />
      </div>
      <hr className="my-4" />
      <div className="space-y-4">
        <Toggle
          label="Partial Matching"
          enabled={settings.matching.partial}
          onChange={() => {
            updateSettings({
              ...settings,
              matching: {
                ...settings.matching,
                partial: !settings.matching.partial,
              },
            });
          }}
        />
        <div
          className={`flex justify-between grid-cols-4 items-center ${minLenClasses}`}
        >
          <label className="block text-sm font-medium text-gray-900">
            Minimum Length
          </label>
          <input
            type="number"
            className="h-6 max-w-12 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-200"
            value={settings.matching.partialMinLength}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (isNaN(value)) return;
              updateSettings({
                ...settings,
                matching: {
                  ...settings.matching,
                  partialMinLength: value,
                },
              });
            }}
          />
        </div>
        <hr className="my-4" />
        <Toggle
          label="Clear Findings on Refresh"
          enabled={settings.display.clearOnRefresh}
          onChange={() => {
            updateSettings({
              ...settings,
              display: {
                ...settings.display,
                clearOnRefresh: !settings.display.clearOnRefresh,
              },
            });
          }}
        />
        <Toggle
          label="Case Insensitive"
          enabled={settings.matching.caseInsensitive}
          onChange={() => {
            updateSettings({
              ...settings,
              matching: {
                ...settings.matching,
                caseInsensitive: !settings.matching.caseInsensitive,
              },
            });
          }}
        />
      </div>
      <hr className="my-4" />
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Ignore Patterns
        </label>
        <p className="text-xs text-gray-500 mb-2">
          One regex per line. Findings whose target path matches any pattern
          will be hidden. Follows the Case Insensitive setting.
        </p>
        <textarea
          className="w-full p-2 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-200 resize-y"
          rows={4}
          placeholder={"/stealth\n/health-check"}
          value={patternsText}
          onChange={(e) => setPatternsText(e.target.value)}
          onBlur={commitPatterns}
        />
        {invalidPatterns.length > 0 && (
          <p className="text-xs text-danger-dark mt-1">
            Invalid regex, not applied: {invalidPatterns.join(", ")}
          </p>
        )}
      </div>
      <hr className="my-4" />
      <InfoAlert message="Open the DevTools Gecko panel to see the findings." />
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
} else {
  console.error("Root container not found");
}

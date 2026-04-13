import React, { createContext, useContext, useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { Finding, Search, Settings } from "../shared/types";
import { defaultSettings } from "../shared/constants";

interface FindingsContextType {
  findings: Finding[];
  clearFindings: () => void;
  refreshFindings: () => void;
  search: Search;
  setSearch: (search: Search) => void;
}

const FindingsContext = createContext<FindingsContextType | null>(null);

export const FindingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [rawFindings, setRawFindings] = useState<Finding[]>([]);
  const [filteredFindings, setFilteredFindings] = useState<Finding[]>([]);
  const [search, setSearch] = useState<Search>({
    value: "",
    source: "",
    target: "",
  });
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    browser.storage.local.get("settings").then((items) => {
      if (items.settings) setSettings(items.settings);
    });
    const listener = (
      changes: browser.Storage.StorageAreaOnChangedChangesType,
    ) => {
      if (changes.settings) {
        setSettings(changes.settings.newValue);
      }
    };
    browser.storage.local.onChanged.addListener(listener);
    return () => {
      browser.storage.local.onChanged.removeListener(listener);
    };
  }, []);

  const fetchFindings = () => {
    browser.storage.local.get("findings").then((data) => {
      data.findings = data.findings || [];
      const findingsData = data as { findings: Finding[] };
      setRawFindings(findingsData.findings);
    });
  };

  const clearFindings = () => {
    browser.storage.local.set({ findings: [] });
    setRawFindings([]);
  };

  useEffect(() => {
    fetchFindings();
    const listener = (
      changes: browser.Storage.StorageAreaOnChangedChangesType,
    ) => {
      if (changes.findings) {
        fetchFindings();
      }
    };
    browser.storage.local.onChanged.addListener(listener);
    return () => {
      browser.storage.local.onChanged.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    const activePatterns = (settings.filters?.ignorePatterns ?? [])
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    let valueSearch = search.value.toLowerCase().trim();
    let targetSearch = search.target.toLowerCase().trim();
    let sourceSearch = search.source.toLowerCase().trim();

    const valueTerms = valueSearch.split(/\s+/).filter((t) => t.length > 0);
    const targetTerms = targetSearch.split(/\s+/).filter((t) => t.length > 0);
    const sourceTerms = sourceSearch.split(/\s+/).filter((t) => t.length > 0);

    const checkTerms = (text: string, terms: string[]) => {
      return terms.every((t) => {
        if (t.startsWith("-") && t.length > 1)
          return !text.includes(t.slice(1));
        return text.includes(t);
      });
    };

    let filtered = rawFindings;

    if (activePatterns.length > 0) {
      filtered = filtered.filter((f) => {
        const targetPath = (() => {
          try {
            return new URL(f.target.url).pathname;
          } catch {
            return f.target.url;
          }
        })();
        return !activePatterns.some((pattern) => {
          try {
            return new RegExp(pattern).test(targetPath);
          } catch {
            return false;
          }
        });
      });
    }

    if (
      valueTerms.length > 0 ||
      targetTerms.length > 0 ||
      sourceTerms.length > 0
    ) {
      filtered = filtered.filter((f) => {
        const source = f.source.url.toLowerCase();
        const target = f.target.url.toLowerCase();
        const value = f.source.value.toLowerCase();

        if (valueTerms.length > 0 && !checkTerms(value, valueTerms))
          return false;
        if (sourceTerms.length > 0 && !checkTerms(source, sourceTerms))
          return false;
        if (targetTerms.length > 0 && !checkTerms(target, targetTerms))
          return false;

        return true;
      });
    }

    setFilteredFindings(filtered);
  }, [search, rawFindings, settings]);

  return (
    <FindingsContext.Provider
      value={{
        findings: filteredFindings,
        clearFindings,
        refreshFindings: fetchFindings,
        search,
        setSearch,
      }}
    >
      {children}
    </FindingsContext.Provider>
  );
};

export const useFindings = () => {
  const context = useContext(FindingsContext);
  if (!context) {
    throw new Error("useFindings must be used within a FindingsProvider");
  }
  return context;
};

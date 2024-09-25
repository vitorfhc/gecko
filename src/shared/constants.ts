import { Settings } from "./types";

const defaultSettings: Settings = {
  scanners: {
    searchQueryValues: true,
    searchPath: true,
    searchNullUndefined: true,
  },
  matching: {
    partial: false,
    caseInsensitive: true,
  },
  display: {
    clearOnRefresh: false,
  },
};

export { defaultSettings };

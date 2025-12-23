import React, { useEffect } from "react";
import { useState } from "react";
import { Finding, FindingUI } from "../shared/types";
import "../tailwind/styles.css";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

interface FindingsTableProps {
  onRowClick: (finding: FindingUI) => void;
}

export default function FindingsTable({ onRowClick }: FindingsTableProps) {
  const [findings, setFindings] = useState<FindingUI[]>([]);

  const clearFindings = () => {
    chrome.storage.local.set({ findings: [] });
    setFindings([]);
  };

  const fetchFindings = () => {
    chrome.storage.local.get("findings", (data) => {
      const uiFindings: FindingUI[] = data.findings
        ? data.findings.reverse().map((finding: Finding, index: number) => {
            return {
              index: data.findings.length - index,
              finding: finding,
              croppedSourceUrl: removeProtocol(finding.source.url),
              croppedTargetUrl: removeProtocol(finding.target.url),
            };
          })
        : [];
      setFindings(uiFindings);
    });
  };

  const removeProtocol = (url: string) => {
    return url.replace("https://", "").replace("http://", "");
  };

  useEffect(() => {
    fetchFindings();
  }, []);

  chrome.storage.local.onChanged.addListener((changes) => {
    if (changes.findings) {
      fetchFindings();
    }
  });

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-4 mb-2">
        <h1 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Findings ({findings.length})
        </h1>
        <button
          type="button"
          className="text-[10px] font-semibold text-danger hover:text-danger-dark transition-colors uppercase tracking-tight"
          onClick={clearFindings}
        >
          Clear All
        </button>
      </div>
      <div className="flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border-t border-gray-100">
              <table className="min-w-full divide-y divide-gray-100 cursor-pointer table-fixed">
                <tbody className="divide-y divide-gray-50 bg-white">
                  {findings.map((finding) => (
                    <tr
                      key={finding.index}
                      className="hover:bg-gray-50 transition-colors"
                      onClick={() => onRowClick(finding)}
                    >
                      <td className="w-10 whitespace-nowrap py-2 pl-4 text-[10px] font-medium text-gray-400">
                        {finding.index}
                      </td>
                      <td className="px-3 py-2 text-sm truncate">
                        <div className="flex flex-col min-w-0">
                          <div className="text-[13px] font-medium text-gray-900 truncate mb-0.5">
                            {finding.finding.source.value}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-gray-400 truncate">
                            <div className="truncate flex-shrink min-w-0">
                              <span className="font-semibold text-gray-300 mr-1">
                                S
                              </span>
                              {finding.croppedSourceUrl}
                            </div>
                            <div className="truncate flex-shrink min-w-0">
                              <span className="font-semibold text-gray-300 mr-1">
                                T
                              </span>
                              {finding.croppedTargetUrl}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="w-8 pr-4 text-right">
                        <ChevronRightIcon
                          aria-hidden="true"
                          className="h-4 w-4 inline text-gray-300"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect } from "react";
import { useState } from "react"
import { Finding, FindingUI } from "../shared/types";
import '../tailwind/styles.css';
import { ChevronRightIcon } from '@heroicons/react/20/solid'

interface FindingsTableProps {
  onRowClick: (finding: FindingUI) => void;
}

export default function FindingsTable({ onRowClick }: FindingsTableProps) {
  const [findings, setFindings] = useState<FindingUI[]>([]);

  const clearFindings = () => {
    chrome.storage.local.set({ findings: [] });
    setFindings([]);
  }

  const fetchFindings = () => {
    chrome.storage.local.get('findings', (data) => {
      const uiFindings: FindingUI[] = data.findings ? data.findings.reverse().map((finding: Finding, index: number) => {
        return {
          index: data.findings.length - index,
          finding: finding,
          croppedSourceUrl: removeProtocol(finding.source.url),
          croppedTargetUrl: removeProtocol(finding.target.url)
        }
      }) : [];
      setFindings(uiFindings);
    });
  }

  const removeProtocol = (url: string) => {
    return url.replace('https://', '').replace('http://', '');
  }


  useEffect(() => {
    fetchFindings();
  }, []);

  chrome.storage.local.onChanged.addListener((changes) => {
    if (changes.findings) {
      fetchFindings();
    }
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Findings</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all findings the extension has detected.
          </p>
        </div>
        <div className="mt-2 sm:ml-2 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="max-w-40 min-w-40 block rounded-md bg-danger px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-danger-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-dark"
            onClick={clearFindings}
          >
            Clear findings
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 cursor-pointer table-fixed">
                <tbody className="divide-y divide-gray-200 bg-white">
                  {findings.map((finding) => (
                    <tr key={finding.index} className="hover:bg-gray-50" onClick={() => onRowClick(finding)}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-500 sm:pl-6">{finding.index}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate max-w-0 w-full space-y-2">
                        <dl>
                          <dt className="text-gray-500 text-xs">Value</dt>
                          <dd className="text-sm text-gray-800 truncate">{finding.finding.source.value}</dd>
                        </dl>
                        <dl>
                          <dt className="text-gray-500 text-xs">Source</dt>
                          <dd className="text-sm text-gray-800 truncate">{finding.croppedSourceUrl}</dd>
                        </dl>
                        <dl>
                          <dt className="text-gray-500 text-xs">Target</dt>
                          <dd className="text-sm text-gray-800 truncate">{finding.croppedTargetUrl}</dd>
                        </dl>
                      </td>
                      <td>
                        <ChevronRightIcon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400" />
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
  )
}

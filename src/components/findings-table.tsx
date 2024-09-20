import React, { useEffect } from "react";
import { useState } from "react"
import { Finding, FindingUI } from "../shared/types";
import '../tailwind/styles.css';

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
          croppedSourceUrl: cropUrl(finding.source.url, 40),
          croppedTargetUrl: cropUrl(finding.target.url, 40)
        }
      }) : [];
      setFindings(uiFindings);
    });
  }

  const cropUrl = (text: string, length: number) => {
    text = text.replace('https://', '').replace('http://', '');
    return text.length > length ? text.substring(0, length - 3) + '...' : text;
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
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-danger px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-danger-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
              <table className="min-w-full divide-y divide-gray-300 cursor-pointer">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      #
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Value
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Source
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Target
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {findings.map((finding) => (
                    <tr key={finding.index} className="hover:bg-gray-50" onClick={() => onRowClick(finding)}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {finding.index}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{finding.finding.source.value}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cropUrl(finding.croppedSourceUrl, 40)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cropUrl(finding.croppedTargetUrl, 40)}</td>
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

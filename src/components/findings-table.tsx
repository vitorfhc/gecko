import React, { useEffect } from "react";
import { useState } from "react"
import { Finding } from "../shared/types";
import '../tailwind/styles.css';

export default function FindingsTable() {
  const [findings, setFindings] = useState<Finding[]>([]);

  const clearFindings = () => {
    chrome.storage.local.set({ findings: [] });
    setFindings([]);
  }

  const fetchFindings = () => {
    chrome.storage.local.get('findings', (data) => {
      setFindings(data.findings ? data.findings.reverse() : []);
    });
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
                    {/* <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Edit</span>
                    </th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {findings.map((finding, index) => (
                    <tr key={`finding-${index}`} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {findings.length - index}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{finding.source.value}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{finding.source.url}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{finding.targetUrl}</td>
                      {/* <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                          Edit<span className="sr-only">, {finding.name}</span>
                        </a>
                      </td> */}
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

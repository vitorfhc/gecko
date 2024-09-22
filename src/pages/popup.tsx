import React from "react";
import { createRoot } from "react-dom/client";
import Toggle from "../components/ui/toggle";
import "../tailwind/styles.css";

export default function Popup() {
  return (
    <div className="min-w-[300px] p-4 bg-white">
      <p className="text-xl font-semibold mb-4">Settings</p>
      <hr className="mb-4" />
      <div className="space-y-4">
        <Toggle
          label="Search in Query Values"
          enabled={true}
          setEnabled={() => {}}
        />
        <Toggle label="Search in Path" enabled={true} setEnabled={() => {}} />
        <Toggle
          label="Search for null/undefined"
          enabled={true}
          setEnabled={() => {}}
        />
      </div>
      <hr className="my-4" />
      <div className="space-y-4">
        <Toggle label="Partial Matching" enabled={true} setEnabled={() => {}} />
        <Toggle
          label="Clear Findings on Refresh"
          enabled={true}
          setEnabled={() => {}}
        />
      </div>
      <hr className="my-4" />
      <button
        type="button"
        className="min-w-full rounded-md bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
      >
        See Findings
      </button>
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

import React from "react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

interface InfoAlertProps {
  message: string;
}

export default function InfoAlert({ message }: InfoAlertProps) {
  return (
    <div className="rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <InformationCircleIcon
            aria-hidden="true"
            className="h-5 w-5 text-blue-400"
          />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-blue-700">{message}</p>
        </div>
      </div>
    </div>
  );
}

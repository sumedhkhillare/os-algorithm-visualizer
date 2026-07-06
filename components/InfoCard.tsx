"use client";

import { useState } from "react";

interface InfoCardProps {
  title: string;
  definition: string;
  example: string;
}

export default function InfoCard({ title, definition, example }: InfoCardProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        <span className="text-slate-400 text-sm">{open ? "Hide ▲" : "Show ▼"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 text-sm text-slate-300">
          <div>
            <h3 className="mb-1 font-medium text-indigo-400">Definition</h3>
            <p className="leading-relaxed">{definition}</p>
          </div>
          <div>
            <h3 className="mb-1 font-medium text-emerald-400">Example</h3>
            <p className="leading-relaxed whitespace-pre-line">{example}</p>
          </div>
        </div>
      )}
    </div>
  );
}

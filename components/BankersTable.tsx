"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  safetyCheck,
  calculateNeed,
  type BankersInput,
  type BankersResult,
} from "@/lib/bankers";

// Default example: classic textbook Banker's Algorithm scenario, 5 processes, 3 resource types (A, B, C)
const DEFAULT_PROCESS_IDS = ["P0", "P1", "P2", "P3", "P4"];
const DEFAULT_ALLOCATION = [
  [0, 1, 0],
  [2, 0, 0],
  [3, 0, 2],
  [2, 1, 1],
  [0, 0, 2],
];
const DEFAULT_MAX = [
  [7, 5, 3],
  [3, 2, 2],
  [9, 0, 2],
  [2, 2, 2],
  [4, 3, 3],
];
const DEFAULT_AVAILABLE = [3, 3, 2];
const RESOURCE_LABELS = ["A", "B", "C"];

function Matrix({
  title,
  rows,
  processIds,
  onChange,
  editable,
}: {
  title: string;
  rows: number[][];
  processIds: string[];
  onChange?: (i: number, j: number, value: number) => void;
  editable: boolean;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-slate-300">{title}</h3>
      <table className="text-sm text-slate-200">
        <thead>
          <tr>
            <th className="w-12"></th>
            {RESOURCE_LABELS.map((r) => (
              <th key={r} className="px-2 pb-1 font-normal text-slate-400">
                {r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="pr-2 text-slate-400">{processIds[i]}</td>
              {row.map((val, j) => (
                <td key={j} className="p-1">
                  {editable ? (
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => onChange?.(i, j, Number(e.target.value))}
                      className="w-14 rounded bg-slate-900 border border-slate-700 px-1.5 py-1 text-center"
                    />
                  ) : (
                    <div className="w-14 rounded bg-slate-900/50 px-1.5 py-1 text-center">
                      {val}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BankersTable() {
  const [allocation, setAllocation] = useState<number[][]>(DEFAULT_ALLOCATION);
  const [max, setMax] = useState<number[][]>(DEFAULT_MAX);
  const [available, setAvailable] = useState<number[]>(DEFAULT_AVAILABLE);
  const [result, setResult] = useState<BankersResult | null>(null);
  const [visibleSteps, setVisibleSteps] = useState(0);

  const need = calculateNeed(max, allocation);

  function updateAllocation(i: number, j: number, value: number) {
    const updated = allocation.map((row) => [...row]);
    updated[i][j] = value;
    setAllocation(updated);
  }

  function updateMax(i: number, j: number, value: number) {
    const updated = max.map((row) => [...row]);
    updated[i][j] = value;
    setMax(updated);
  }

  function updateAvailable(j: number, value: number) {
    const updated = [...available];
    updated[j] = value;
    setAvailable(updated);
  }

  function runCheck() {
    const input: BankersInput = {
      processIds: DEFAULT_PROCESS_IDS,
      allocation,
      max,
      available,
    };
    const res = safetyCheck(input);
    setResult(res);
    setVisibleSteps(0);
  }

  function nextStep() {
    if (result && visibleSteps < result.steps.length) {
      setVisibleSteps((v) => v + 1);
    }
  }

  function resetSteps() {
    setVisibleSteps(0);
  }

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">Resource Matrices</h2>

        <div className="grid gap-8 sm:grid-cols-2">
          <Matrix
            title="Allocation"
            rows={allocation}
            processIds={DEFAULT_PROCESS_IDS}
            onChange={updateAllocation}
            editable
          />
          <Matrix
            title="Max"
            rows={max}
            processIds={DEFAULT_PROCESS_IDS}
            onChange={updateMax}
            editable
          />
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium text-slate-300">Need (Max − Allocation)</h3>
          <Matrix title="" rows={need} processIds={DEFAULT_PROCESS_IDS} editable={false} />
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium text-slate-300">Available</h3>
          <div className="flex gap-3">
            {available.map((val, j) => (
              <div key={j} className="text-center">
                <div className="mb-1 text-xs text-slate-400">{RESOURCE_LABELS[j]}</div>
                <input
                  type="number"
                  value={val}
                  onChange={(e) => updateAvailable(j, Number(e.target.value))}
                  className="w-14 rounded bg-slate-900 border border-slate-700 px-1.5 py-1 text-center text-slate-100"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={runCheck}
          className="mt-6 rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          ▶ Check Safety
        </button>
      </div>

      {/* Step-through trace */}
      {result && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Safety Algorithm Trace</h2>
            <div className="flex gap-2">
              <button
                onClick={resetSteps}
                className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
              >
                Reset
              </button>
              <button
                onClick={nextStep}
                disabled={visibleSteps >= result.steps.length}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600"
              >
                Next Step →
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {result.steps.slice(0, visibleSteps).map((step) => (
                <motion.div
                  key={step.stepNumber}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg border p-3 text-sm ${
                    step.chosenProcess
                      ? "border-emerald-700 bg-emerald-950/30 text-emerald-200"
                      : "border-red-700 bg-red-950/30 text-red-200"
                  }`}
                >
                  <span className="font-semibold">Step {step.stepNumber}:</span> {step.reason}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {visibleSteps >= result.steps.length && (
            <div
              className={`mt-4 rounded-lg p-4 text-center font-semibold ${
                result.isSafe
                  ? "bg-emerald-900/40 text-emerald-300"
                  : "bg-red-900/40 text-red-300"
              }`}
            >
              {result.isSafe
                ? `System is SAFE. Safe sequence: ${result.safeSequence.join(" → ")}`
                : "System is UNSAFE — deadlock risk detected."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

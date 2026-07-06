"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fifo, lru, type PagingResult } from "@/lib/paging";

const DEFAULT_REFERENCE = "7,0,1,2,0,3,0,4,2,3,0,3,2";
const DEFAULT_FRAME_COUNT = 3;

export default function FrameVisualizer() {
  const [referenceInput, setReferenceInput] = useState(DEFAULT_REFERENCE);
  const [frameCount, setFrameCount] = useState(DEFAULT_FRAME_COUNT);
  const [algorithm, setAlgorithm] = useState<"fifo" | "lru">("fifo");
  const [result, setResult] = useState<PagingResult | null>(null);
  const [visibleSteps, setVisibleSteps] = useState(0);

  function runAlgorithm() {
    const refString = referenceInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number);

    const res = algorithm === "fifo" ? fifo(refString, frameCount) : lru(refString, frameCount);
    setResult(res);
    setVisibleSteps(0);
  }

  function nextStep() {
    if (result && visibleSteps < result.steps.length) {
      setVisibleSteps((v) => v + 1);
    }
  }

  function playAll() {
    if (!result) return;
    let i = visibleSteps;
    const interval = setInterval(() => {
      i++;
      setVisibleSteps(i);
      if (i >= result.steps.length) clearInterval(interval);
    }, 500);
  }

  function reset() {
    setVisibleSteps(0);
  }

  const current = result?.steps[visibleSteps - 1];

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">Reference String</h2>

        <label className="mb-1 block text-sm text-slate-400">
          Page reference string (comma-separated)
        </label>
        <input
          value={referenceInput}
          onChange={(e) => setReferenceInput(e.target.value)}
          className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100"
        />

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div>
            <label className="mr-2 text-sm text-slate-400">Frame count</label>
            <input
              type="number"
              value={frameCount}
              onChange={(e) => setFrameCount(Number(e.target.value))}
              className="w-20 rounded bg-slate-900 border border-slate-700 px-2 py-1.5 text-slate-100"
            />
          </div>

          <div>
            <label className="mr-2 text-sm text-slate-400">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as "fifo" | "lru")}
              className="rounded bg-slate-900 border border-slate-700 px-2 py-1.5 text-slate-100"
            >
              <option value="fifo">FIFO</option>
              <option value="lru">LRU</option>
            </select>
          </div>

          <button
            onClick={runAlgorithm}
            className="ml-auto rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            ▶ Run
          </button>
        </div>
      </div>

      {/* Visualization */}
      {result && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Frame Simulation</h2>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
              >
                Reset
              </button>
              <button
                onClick={playAll}
                className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
              >
                ▶ Play All
              </button>
              <button
                onClick={nextStep}
                disabled={visibleSteps >= result.steps.length}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
              >
                Next Step →
              </button>
            </div>
          </div>

          {/* Reference string with highlighting of current position */}
          <div className="mb-6 flex flex-wrap gap-2">
            {result.steps.map((step, idx) => (
              <div
                key={idx}
                className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  idx === visibleSteps - 1
                    ? "border-indigo-400 bg-indigo-600 text-white"
                    : idx < visibleSteps
                    ? step.isFault
                      ? "border-red-700 bg-red-950/40 text-red-300"
                      : "border-emerald-700 bg-emerald-950/40 text-emerald-300"
                    : "border-slate-700 bg-slate-900 text-slate-500"
                }`}
              >
                {step.page}
              </div>
            ))}
          </div>

          {/* Current frame state */}
          {current && (
            <>
              <div className="mb-4 flex gap-3">
                <AnimatePresence mode="popLayout">
                  {current.frames.map((f, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`flex h-16 w-16 items-center justify-center rounded-lg border-2 text-lg font-bold ${
                        f === current.page && current.isFault
                          ? "border-red-500 bg-red-950/50 text-red-200"
                          : f === current.page
                          ? "border-emerald-500 bg-emerald-950/50 text-emerald-200"
                          : "border-slate-700 bg-slate-900 text-slate-300"
                      }`}
                    >
                      {f ?? "—"}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div
                className={`rounded-lg border p-3 text-sm ${
                  current.isFault
                    ? "border-red-700 bg-red-950/30 text-red-200"
                    : "border-emerald-700 bg-emerald-950/30 text-emerald-200"
                }`}
              >
                <span className="font-semibold">Step {current.stepNumber}:</span> {current.reason}
              </div>
            </>
          )}

          {/* Final summary */}
          {visibleSteps >= result.steps.length && (
            <div className="mt-4 flex gap-6 rounded-lg bg-slate-900/50 p-4 text-sm text-slate-300">
              <div>
                Total Faults: <span className="font-semibold text-red-400">{result.totalFaults}</span>
              </div>
              <div>
                Total Hits: <span className="font-semibold text-emerald-400">{result.totalHits}</span>
              </div>
              <div>
                Fault Rate:{" "}
                <span className="font-semibold text-amber-400">
                  {(result.faultRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

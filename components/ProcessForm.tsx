"use client";

import { useState } from "react";
import type { Process } from "@/lib/scheduling";

interface ProcessFormProps {
  onRun: (processes: Process[], algorithm: string, quantum: number) => void;
}

const DEFAULT_PROCESSES: Process[] = [
  { id: "P1", arrival: 0, burst: 5 },
  { id: "P2", arrival: 1, burst: 3 },
  { id: "P3", arrival: 2, burst: 8 },
  { id: "P4", arrival: 3, burst: 6 },
];

export default function ProcessForm({ onRun }: ProcessFormProps) {
  const [processes, setProcesses] = useState<Process[]>(DEFAULT_PROCESSES);
  const [algorithm, setAlgorithm] = useState("fcfs");
  const [quantum, setQuantum] = useState(2);

  function updateProcess(index: number, field: keyof Process, value: string) {
    const updated = [...processes];
    updated[index] = { ...updated[index], [field]: field === "id" ? value : Number(value) };
    setProcesses(updated);
  }

  function addProcess() {
    const nextNum = processes.length + 1;
    setProcesses([...processes, { id: `P${nextNum}`, arrival: 0, burst: 1 }]);
  }

  function removeProcess(index: number) {
    setProcesses(processes.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Processes</h2>
        <button
          onClick={addProcess}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
        >
          + Add process
        </button>
      </div>

      <table className="w-full text-sm text-slate-200">
        <thead>
          <tr className="text-left text-slate-400">
            <th className="pb-2 font-normal">Process</th>
            <th className="pb-2 font-normal">Arrival</th>
            <th className="pb-2 font-normal">Burst</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p, idx) => (
            <tr key={idx}>
              <td className="py-1 pr-2">
                <input
                  value={p.id}
                  onChange={(e) => updateProcess(idx, "id", e.target.value)}
                  className="w-20 rounded bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
                />
              </td>
              <td className="py-1 pr-2">
                <input
                  type="number"
                  value={p.arrival}
                  onChange={(e) => updateProcess(idx, "arrival", e.target.value)}
                  className="w-20 rounded bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
                />
              </td>
              <td className="py-1 pr-2">
                <input
                  type="number"
                  value={p.burst}
                  onChange={(e) => updateProcess(idx, "burst", e.target.value)}
                  className="w-20 rounded bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
                />
              </td>
              <td>
                <button
                  onClick={() => removeProcess(idx)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div>
          <label className="mr-2 text-sm text-slate-400">Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="rounded bg-slate-900 border border-slate-700 px-2 py-1.5 text-slate-100"
          >
            <option value="fcfs">FCFS</option>
            <option value="sjf">SJF (non-preemptive)</option>
            <option value="rr">Round Robin</option>
          </select>
        </div>

        {algorithm === "rr" && (
          <div>
            <label className="mr-2 text-sm text-slate-400">Time Quantum</label>
            <input
              type="number"
              value={quantum}
              onChange={(e) => setQuantum(Number(e.target.value))}
              className="w-20 rounded bg-slate-900 border border-slate-700 px-2 py-1.5 text-slate-100"
            />
          </div>
        )}

        <button
          onClick={() => onRun(processes, algorithm, quantum)}
          className="ml-auto rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          ▶ Run
        </button>
      </div>
    </div>
  );
}

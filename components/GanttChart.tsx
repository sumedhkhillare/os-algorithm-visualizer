"use client";

import { motion } from "framer-motion";
import type { SchedulingResult } from "@/lib/scheduling";

interface GanttChartProps {
  result: SchedulingResult;
}

// A fixed color per process id, so the same process always gets the same color
const COLORS = [
  "bg-indigo-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-violet-500", "bg-lime-500",
];

function colorFor(id: string, allIds: string[]) {
  const idx = allIds.indexOf(id) % COLORS.length;
  return COLORS[idx];
}

export default function GanttChart({ result }: GanttChartProps) {
  const { timeline, results, avgWaiting, avgTurnaround } = result;
  const totalTime = Math.max(...timeline.map((b) => b.end));
  const uniqueIds = Array.from(new Set(timeline.map((b) => b.id)));

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-100">Gantt Chart</h2>

      {/* The animated timeline */}
      <div className="relative flex h-14 w-full overflow-hidden rounded-md border border-slate-700">
        {timeline.map((block, i) => {
          const widthPct = ((block.end - block.start) / totalTime) * 100;
          return (
            <motion.div
              key={i}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${widthPct}%`, opacity: 1 }}
              transition={{ delay: i * 0.4, duration: 0.5, ease: "easeOut" }}
              className={`flex items-center justify-center text-xs font-semibold text-white border-r border-slate-900/40 ${colorFor(
                block.id,
                uniqueIds
              )}`}
            >
              {block.id}
            </motion.div>
          );
        })}
      </div>

      {/* Time markers */}
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>0</span>
        <span>{totalTime}</span>
      </div>

      {/* Metrics table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm text-slate-200">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="pb-2 font-normal">Process</th>
              <th className="pb-2 font-normal">Arrival</th>
              <th className="pb-2 font-normal">Burst</th>
              <th className="pb-2 font-normal">Completion</th>
              <th className="pb-2 font-normal">Turnaround</th>
              <th className="pb-2 font-normal">Waiting</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-t border-slate-700/50">
                <td className="py-1.5">{r.id}</td>
                <td className="py-1.5">{r.arrival}</td>
                <td className="py-1.5">{r.burst}</td>
                <td className="py-1.5">{r.completion}</td>
                <td className="py-1.5">{r.turnaround}</td>
                <td className="py-1.5">{r.waiting}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-6 text-sm">
        <div className="text-slate-300">
          Avg Waiting Time:{" "}
          <span className="font-semibold text-emerald-400">{avgWaiting.toFixed(2)}</span>
        </div>
        <div className="text-slate-300">
          Avg Turnaround Time:{" "}
          <span className="font-semibold text-emerald-400">{avgTurnaround.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import ProcessForm from "@/components/ProcessForm";
import GanttChart from "@/components/GanttChart";
import InfoCard from "@/components/InfoCard";
import { fcfs, sjf, roundRobin, type Process, type SchedulingResult } from "@/lib/scheduling";

const ALGORITHM_INFO = {
  fcfs: {
    title: "FCFS — First Come First Serve",
    definition:
      "Processes are executed strictly in the order they arrive, with no interruption. Whichever process arrives first gets the CPU first, and runs to completion before the next one starts. It's the simplest scheduling algorithm, but can cause long waiting times if a short process arrives right after a long one (this is called the 'convoy effect').",
    example:
      "P1 (arrival 0, burst 5), P2 (arrival 1, burst 3):\nP1 runs 0→5 (it arrived first), then P2 runs 5→8, even though P2 only needed 3 units and P1 needed 5 — P2 still had to wait for the longer job to finish first.",
  },
  sjf: {
    title: "SJF — Shortest Job First (non-preemptive)",
    definition:
      "Among all processes that have already arrived, the CPU always picks the one with the smallest burst time next. Once a process starts, it runs to completion without interruption (that's the 'non-preemptive' part). This minimizes average waiting time compared to FCFS, but requires knowing burst times in advance, which isn't always realistic.",
    example:
      "P1 (burst 5) arrives at 0, P2 (burst 3) and P3 (burst 8) arrive at 1:\nAt time 0, only P1 has arrived, so it runs first (0→5). At time 5, both P2 and P3 have arrived — SJF picks P2 (shorter burst) to run next (5→8), even though P3 arrived earlier.",
  },
  rr: {
    title: "Round Robin (preemptive, fixed time quantum)",
    definition:
      "Every process gets a fixed time slice (the 'quantum') to run. If it doesn't finish in that time, it's paused and sent to the back of the queue, and the next process gets its turn. This cycle repeats until all processes finish. It's fair and responsive (nobody waits too long for their first turn), but can have higher total completion times than SJF because of frequent context switching.",
    example:
      "P1 (burst 5), P2 (burst 3), quantum = 2:\nP1 runs 0→2 (3 left), P2 runs 2→4 (1 left), P1 runs 4→6 (1 left), P2 runs 6→7 (finishes), P1 runs 7→8 (finishes). Notice both processes got CPU time early on, instead of P2 waiting for all of P1's 5 units like in FCFS.",
  },
};

export default function SchedulingPage() {
  const [result, setResult] = useState<SchedulingResult | null>(null);
  // key forces GanttChart to remount so the Framer Motion animation replays on every run
  const [runKey, setRunKey] = useState(0);
  const [selectedAlgo, setSelectedAlgo] = useState<"fcfs" | "sjf" | "rr">("fcfs");

  function handleRun(processes: Process[], algorithm: string, quantum: number) {
    let res: SchedulingResult;
    if (algorithm === "fcfs") res = fcfs(processes);
    else if (algorithm === "sjf") res = sjf(processes);
    else res = roundRobin(processes, quantum);

    setSelectedAlgo(algorithm as "fcfs" | "sjf" | "rr");
    setResult(res);
    setRunKey((k) => k + 1);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Back to modules
        </Link>
        <h1 className="mt-2 mb-1 text-3xl font-bold text-slate-100">CPU Scheduling</h1>
        <p className="mb-8 text-slate-400">
          Enter processes, pick an algorithm, and watch the schedule build block by block.
        </p>

        <div className="space-y-6">
          <InfoCard {...ALGORITHM_INFO[selectedAlgo]} />
          <ProcessForm onRun={handleRun} />
          {result && <GanttChart key={runKey} result={result} />}
        </div>
      </div>
    </main>
  );
}

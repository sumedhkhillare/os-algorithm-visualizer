// lib/scheduling.ts
// Pure functions — no UI, no side effects. Easy to test, easy to reason about.

export interface Process {
  id: string;       // e.g. "P1"
  arrival: number;
  burst: number;
  priority?: number; // lower number = higher priority (optional, for priority scheduling)
}

export interface ScheduleBlock {
  id: string;        // process id running in this block
  start: number;
  end: number;
}

export interface ProcessResult {
  id: string;
  arrival: number;
  burst: number;
  completion: number;
  turnaround: number; // completion - arrival
  waiting: number;    // turnaround - burst
}

export interface SchedulingResult {
  timeline: ScheduleBlock[];      // for drawing the Gantt chart
  results: ProcessResult[];       // per-process metrics
  avgWaiting: number;
  avgTurnaround: number;
}

function summarize(timeline: ScheduleBlock[], processes: Process[]): SchedulingResult {
  // completion time = the end time of a process's LAST block in the timeline
  const completionMap = new Map<string, number>();
  timeline.forEach((b) => completionMap.set(b.id, b.end));

  const results: ProcessResult[] = processes.map((p) => {
    const completion = completionMap.get(p.id) ?? p.arrival + p.burst;
    const turnaround = completion - p.arrival;
    const waiting = turnaround - p.burst;
    return { id: p.id, arrival: p.arrival, burst: p.burst, completion, turnaround, waiting };
  });

  const avgWaiting = results.reduce((s, r) => s + r.waiting, 0) / results.length;
  const avgTurnaround = results.reduce((s, r) => s + r.turnaround, 0) / results.length;

  return { timeline, results, avgWaiting, avgTurnaround };
}

// ---------- FCFS: First Come First Serve ----------
export function fcfs(processes: Process[]): SchedulingResult {
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  const timeline: ScheduleBlock[] = [];
  let clock = 0;

  for (const p of sorted) {
    const start = Math.max(clock, p.arrival);
    const end = start + p.burst;
    timeline.push({ id: p.id, start, end });
    clock = end;
  }

  return summarize(timeline, processes);
}

// ---------- SJF: Shortest Job First (non-preemptive) ----------
export function sjf(processes: Process[]): SchedulingResult {
  const remaining = [...processes];
  const timeline: ScheduleBlock[] = [];
  let clock = 0;

  while (remaining.length > 0) {
    // among processes that have arrived by `clock`, pick the shortest burst
    const available = remaining.filter((p) => p.arrival <= clock);

    if (available.length === 0) {
      // nothing has arrived yet — jump clock forward to the next arrival
      clock = Math.min(...remaining.map((p) => p.arrival));
      continue;
    }

    available.sort((a, b) => a.burst - b.burst);
    const next = available[0];

    const start = Math.max(clock, next.arrival);
    const end = start + next.burst;
    timeline.push({ id: next.id, start, end });
    clock = end;

    remaining.splice(remaining.indexOf(next), 1);
  }

  return summarize(timeline, processes);
}

// ---------- Round Robin (preemptive, fixed time quantum) ----------
export function roundRobin(processes: Process[], quantum: number): SchedulingResult {
  const remainingBurst = new Map<string, number>();
  processes.forEach((p) => remainingBurst.set(p.id, p.burst));

  const sortedByArrival = [...processes].sort((a, b) => a.arrival - b.arrival);
  const queue: Process[] = [];
  const timeline: ScheduleBlock[] = [];

  let clock = 0;
  let i = 0; // pointer into sortedByArrival for processes not yet queued
  const arrived = new Set<string>();

  // seed queue with anything arriving at time 0
  while (i < sortedByArrival.length && sortedByArrival[i].arrival <= clock) {
    queue.push(sortedByArrival[i]);
    arrived.add(sortedByArrival[i].id);
    i++;
  }

  while (queue.length > 0) {
    const p = queue.shift()!;
    const remaining = remainingBurst.get(p.id)!;
    const runTime = Math.min(quantum, remaining);
    const start = clock;
    const end = clock + runTime;

    timeline.push({ id: p.id, start, end });
    clock = end;
    remainingBurst.set(p.id, remaining - runTime);

    // enqueue anyone who arrived during this slice (before re-adding current process)
    while (i < sortedByArrival.length && sortedByArrival[i].arrival <= clock) {
      queue.push(sortedByArrival[i]);
      arrived.add(sortedByArrival[i].id);
      i++;
    }

    if (remainingBurst.get(p.id)! > 0) {
      queue.push(p); // not done — goes to the back of the queue
    }
  }

  // For Round Robin, completion = end time of the LAST block for that process (summarize handles this)
  return summarize(timeline, processes);
}

import Link from "next/link";

const modules = [
  {
    href: "/scheduling",
    title: "CPU Scheduling",
    description: "FCFS, SJF, Round Robin — watch the Gantt chart build in real time.",
    status: "ready",
  },
  {
    href: "/bankers",
    title: "Banker's Algorithm",
    description: "Step through deadlock avoidance and safe-sequence detection.",
    status: "ready",
  },
  {
    href: "/paging",
    title: "Page Replacement",
    description: "LRU and FIFO frame-by-frame, with hits and faults highlighted.",
    status: "ready",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-slate-100">OS Algorithm Visualizer</h1>
        <p className="mt-3 text-slate-400">
          Interactive, step-by-step animations for core Operating System algorithms.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.status === "ready" ? m.href : "#"}
            className={`rounded-xl border border-slate-700 bg-slate-800/50 p-6 transition-colors ${
              m.status === "ready"
                ? "hover:border-indigo-500 hover:bg-slate-800"
                : "cursor-default opacity-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">{m.title}</h2>
              {m.status !== "ready" && (
                <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                  soon
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-400">{m.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

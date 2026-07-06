import Link from "next/link";
import BankersTable from "@/components/BankersTable";
import InfoCard from "@/components/InfoCard";

export default function BankersPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Back to modules
        </Link>
        <h1 className="mt-2 mb-1 text-3xl font-bold text-slate-100">Banker&apos;s Algorithm</h1>
        <p className="mb-8 text-slate-400">
          Edit the Allocation and Max matrices and Available vector, then step through the
          safety algorithm to see which process gets picked at each stage — and why.
        </p>

        <div className="space-y-6">
          <InfoCard
            title="Banker's Algorithm — Deadlock Avoidance"
            definition={
              "A resource-allocation algorithm that decides, before granting a request, whether the system will remain in a 'safe state' — meaning there exists at least one order in which all processes can finish without deadlock. It works like a cautious bank manager who never lends money if there's a chance not everyone could be repaid. Each process declares its Maximum resource need upfront; the algorithm checks if it can find a safe sequence using the Allocation (what's currently held), Max (what could be needed), and Available (what's free right now)."
            }
            example={
              "5 processes, 3 resource types (A, B, C), Available = [3, 3, 2]:\nThe algorithm looks for any process whose remaining Need is ≤ what's currently Available. It picks P1 first (its need [1,2,2] fits within [3,3,2]), lets it finish and release its resources back, then repeats with the new (larger) available pool — picking P3, then P4, P0, P2 in turn. The resulting order P1→P3→P4→P0→P2 is called the 'safe sequence.' If at some point NO process's need can be satisfied, the state is unsafe — a potential deadlock."
            }
          />
          <BankersTable />
        </div>
      </div>
    </main>
  );
}

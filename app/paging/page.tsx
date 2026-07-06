import Link from "next/link";
import FrameVisualizer from "@/components/FrameVisualizer";
import InfoCard from "@/components/InfoCard";

export default function PagingPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Back to modules
        </Link>
        <h1 className="mt-2 mb-1 text-3xl font-bold text-slate-100">Page Replacement</h1>
        <p className="mb-8 text-slate-400">
          Enter a reference string and frame count, pick FIFO or LRU, then step through each
          reference to see hits, faults, and evictions frame by frame.
        </p>

        <div className="space-y-6">
          <InfoCard
            title="Page Replacement — FIFO vs LRU"
            definition={
              "When a program references a page that isn't currently in memory (a 'page fault'), and all frames are full, the OS must decide which existing page to evict to make room. FIFO (First In First Out) evicts whichever page has been in memory the longest, regardless of how recently it was used. LRU (Least Recently Used) instead evicts the page that hasn't been touched in the longest time, which usually performs better because it reflects actual usage patterns rather than just arrival order."
            }
            example={
              "Reference string 7,0,1,2,0,3,0,4,2,3,0,3,2 with 3 frames:\nBoth FIFO and LRU start the same way — 7, 0, 1 all cause faults filling the 3 empty frames. When page 2 arrives, both evict 7 (it's both the oldest AND least recently used at that point). The difference appears later: when page 3 arrives with frames [2,0,1], FIFO evicts 0 (oldest inserted) even though 0 was just used — while LRU evicts 1 (truly least recently used), since 0 was touched more recently. Over the full string, this example gives 9 faults for FIFO but only 8 for LRU."
            }
          />
          <FrameVisualizer />
        </div>
      </div>
    </main>
  );
}

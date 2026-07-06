// lib/paging.ts
// Pure functions implementing FIFO and LRU page replacement.
// Each returns a step-by-step trace of frame contents so the UI can animate it.

export interface PageStep {
  stepNumber: number;
  page: number;           // the page being referenced at this step
  frames: (number | null)[]; // frame contents AFTER this step (null = empty slot)
  isFault: boolean;       // true if this reference caused a page fault
  evicted: number | null; // which page was evicted this step, if any
  reason: string;
}

export interface PagingResult {
  steps: PageStep[];
  totalFaults: number;
  totalHits: number;
  faultRate: number; // 0..1
}

// ---------- FIFO: First In First Out ----------
export function fifo(referenceString: number[], frameCount: number): PagingResult {
  const frames: (number | null)[] = new Array(frameCount).fill(null);
  const queue: number[] = []; // tracks insertion order for eviction
  const steps: PageStep[] = [];
  let faults = 0;

  referenceString.forEach((page, idx) => {
    const alreadyPresent = frames.includes(page);

    if (alreadyPresent) {
      steps.push({
        stepNumber: idx + 1,
        page,
        frames: [...frames],
        isFault: false,
        evicted: null,
        reason: `Page ${page} is already in a frame — HIT.`,
      });
      return;
    }

    // Page fault
    faults++;
    let evicted: number | null = null;

    const emptyIndex = frames.indexOf(null);
    if (emptyIndex !== -1) {
      // free slot available, just place it there
      frames[emptyIndex] = page;
      queue.push(page);
    } else {
      // evict the oldest-inserted page (front of queue)
      evicted = queue.shift()!;
      const evictIndex = frames.indexOf(evicted);
      frames[evictIndex] = page;
      queue.push(page);
    }

    steps.push({
      stepNumber: idx + 1,
      page,
      frames: [...frames],
      isFault: true,
      evicted,
      reason: evicted
        ? `Page ${page} not in memory — FAULT. Frames full, evict oldest page (${evicted}, FIFO order).`
        : `Page ${page} not in memory — FAULT. Placed in a free frame.`,
    });
  });

  return {
    steps,
    totalFaults: faults,
    totalHits: referenceString.length - faults,
    faultRate: faults / referenceString.length,
  };
}

// ---------- LRU: Least Recently Used ----------
export function lru(referenceString: number[], frameCount: number): PagingResult {
  const frames: (number | null)[] = new Array(frameCount).fill(null);
  const lastUsed = new Map<number, number>(); // page -> the step index it was last used at
  const steps: PageStep[] = [];
  let faults = 0;

  referenceString.forEach((page, idx) => {
    const alreadyPresent = frames.includes(page);

    if (alreadyPresent) {
      lastUsed.set(page, idx);
      steps.push({
        stepNumber: idx + 1,
        page,
        frames: [...frames],
        isFault: false,
        evicted: null,
        reason: `Page ${page} is already in a frame — HIT.`,
      });
      return;
    }

    // Page fault
    faults++;
    let evicted: number | null = null;

    const emptyIndex = frames.indexOf(null);
    if (emptyIndex !== -1) {
      frames[emptyIndex] = page;
    } else {
      // find the page in frames with the smallest (oldest) lastUsed step
      let lruPage = frames[0] as number;
      let oldestStep = lastUsed.get(lruPage) ?? -1;
      for (const f of frames) {
        const usedAt = lastUsed.get(f as number) ?? -1;
        if (usedAt < oldestStep) {
          oldestStep = usedAt;
          lruPage = f as number;
        }
      }
      evicted = lruPage;
      const evictIndex = frames.indexOf(evicted);
      frames[evictIndex] = page;
    }

    lastUsed.set(page, idx);

    steps.push({
      stepNumber: idx + 1,
      page,
      frames: [...frames],
      isFault: true,
      evicted,
      reason: evicted
        ? `Page ${page} not in memory — FAULT. Frames full, evict least-recently-used page (${evicted}).`
        : `Page ${page} not in memory — FAULT. Placed in a free frame.`,
    });
  });

  return {
    steps,
    totalFaults: faults,
    totalHits: referenceString.length - faults,
    faultRate: faults / referenceString.length,
  };
}

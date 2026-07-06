// lib/bankers.ts
// Pure function implementing the Banker's Algorithm safety check.
// Returns a full step-by-step trace so the UI can animate/walk through it.

export interface BankersInput {
  processIds: string[];        // e.g. ["P0", "P1", "P2", "P3", "P4"]
  allocation: number[][];      // allocation[i][j] = units of resource j held by process i
  max: number[][];             // max[i][j] = max units of resource j process i may need
  available: number[];         // available[j] = free units of resource j right now
}

export interface SafetyStep {
  stepNumber: number;
  chosenProcess: string | null; // null if no process could be picked this step (unsafe)
  need: number[];                // that process's need vector at the time it was picked
  availableBefore: number[];
  availableAfter: number[];
  reason: string;                // human-readable explanation for the UI
}

export interface BankersResult {
  isSafe: boolean;
  safeSequence: string[];
  steps: SafetyStep[];
  needMatrix: number[][]; // need[i][j] = max[i][j] - allocation[i][j], shown to the user up front
}

export function calculateNeed(max: number[][], allocation: number[][]): number[][] {
  return max.map((row, i) => row.map((val, j) => val - allocation[i][j]));
}

function vecLTE(a: number[], b: number[]): boolean {
  // true if every element of a <= corresponding element of b
  return a.every((val, i) => val <= b[i]);
}

function vecAdd(a: number[], b: number[]): number[] {
  return a.map((val, i) => val + b[i]);
}

export function safetyCheck(input: BankersInput): BankersResult {
  const { processIds, allocation, max, available } = input;
  const need = calculateNeed(max, allocation);

  let work = [...available];
  const finished = new Set<string>();
  const safeSequence: string[] = [];
  const steps: SafetyStep[] = [];

  let stepNumber = 1;

  // Keep looping until either everyone is finished, or a full pass finds no candidate (unsafe)
  while (finished.size < processIds.length) {
    let foundThisPass = false;

    for (let i = 0; i < processIds.length; i++) {
      const pid = processIds[i];
      if (finished.has(pid)) continue;

      if (vecLTE(need[i], work)) {
        // This process CAN finish with current work/available resources
        const availableBefore = [...work];
        work = vecAdd(work, allocation[i]); // it finishes and releases its allocation back
        finished.add(pid);
        safeSequence.push(pid);
        foundThisPass = true;

        steps.push({
          stepNumber,
          chosenProcess: pid,
          need: need[i],
          availableBefore,
          availableAfter: [...work],
          reason: `${pid}'s need [${need[i].join(", ")}] ≤ available [${availableBefore.join(
            ", "
          )}], so it can finish. Its allocation is released back, making available = [${work.join(
            ", "
          )}].`,
        });
        stepNumber++;
        break; // restart scan from the top after each pick (standard Banker's approach)
      }
    }

    if (!foundThisPass) {
      // No remaining process can be satisfied — system is in an unsafe state
      steps.push({
        stepNumber,
        chosenProcess: null,
        need: [],
        availableBefore: [...work],
        availableAfter: [...work],
        reason: `No remaining process's need can be met with available [${work.join(
          ", "
        )}]. The system is UNSAFE.`,
      });
      return { isSafe: false, safeSequence, steps, needMatrix: need };
    }
  }

  return { isSafe: true, safeSequence, steps, needMatrix: need };
}

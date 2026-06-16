import { Task } from "@/types/types";

const EPSILON = 1e-9;
const INITIAL_GAP = 65536;

export function midpoint(prev: number | null, next: number | null): number {
    if (prev === null && next === null) {
        return INITIAL_GAP;
    }

    if (prev === null) {
        return (next as number) / 2;
    }

    if (next === null) {
        return prev + INITIAL_GAP;
    }

    return (prev + next) / 2;
}

export function needsRebalance(
    prev: number | null,
    next: number | null,
): boolean {
    if (prev === null || next === null) {
        return false;
    }

    return next - prev < EPSILON * 2;
}

export function rebalanceTasks(tasks: Task[]): Task[] {
    return tasks.map((task, i) => ({
        ...task,
        position: (i + 1) * INITIAL_GAP,
    }));
}

export function getSurroundingPositions(
    tasks: Task[],
    insertIndex: number,
): { prev: number | null; next: number | null } {
    const sorted = [...tasks].sort((a, b) => a.position - b.position);
    const clampedIndex = Math.min(insertIndex, sorted.length);
    const prev = clampedIndex > 0 ? sorted[clampedIndex - 1].position : null;
    const next =
        clampedIndex < sorted.length ? sorted[clampedIndex].position : null;

    return { prev, next };
}

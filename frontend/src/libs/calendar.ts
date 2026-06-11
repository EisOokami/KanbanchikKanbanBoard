import { Task } from "@/types/types";
import { toDateStr, toDate } from "./utils";

export function taskDateStr(task: Task): string | null {
    const d = toDate(task.due_date);
    if (!d) return null;
    return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

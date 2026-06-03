import { Task } from "@/types/types";
import { toDateStr, toDueDate } from "./utils";

export function taskDateStr(task: Task): string | null {
    const d = toDueDate(task.due_date);
    if (!d) return null;
    return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

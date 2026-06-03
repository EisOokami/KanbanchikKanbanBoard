import { Columns } from "@/types/types";
import { clsx, type ClassValue } from "clsx";
import { isPast, isToday, isTomorrow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function toDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function todayStr(): string {
    const d = new Date();
    return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

export function toDueDate(v: string | Date | undefined | null): Date | null {
    if (!v) return null;
    return v instanceof Date ? v : new Date(v);
}

export function getInitials(name: string, surname: string) {
    return name.toUpperCase().slice(0, 1) + surname.toUpperCase().slice(0, 1);
}

export function isOverdue(
    dueDate: string | Date | undefined,
    status: Columns,
): boolean {
    if (!dueDate || status === "done") return false;
    return isPast(dueDate) && !isToday(dueDate);
}

export function formatDate(date: string | Date): string {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";

    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

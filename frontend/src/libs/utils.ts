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

export function toDate(v: string | Date | undefined | null): Date | null {
    if (!v) return null;
    return v instanceof Date ? v : new Date(v);
}

export function getInitials(name: string, surname: string) {
    return name.toUpperCase().slice(0, 1) + surname.toUpperCase().slice(0, 1);
}

export function isOverdue(
    dueDate: string | Date | undefined,
    status: string,
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

export function convertToSlug(text: string): string {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");
}

export function formatSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageFile(file: File) {
    return file.type.startsWith("image/");
}

export function isVideoFile(file: File) {
    return file.type.startsWith("video/");
}

export function isPdfFile(file: File) {
    return file.type === "application/pdf";
}

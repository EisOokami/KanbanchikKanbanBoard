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
    const date = new Date();

    return toDateStr(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

export function toDate(value: string | Date | undefined | null): Date | null {
    if (!value) {
        return null;
    }

    return value instanceof Date ? value : new Date(value);
}

export function getInitials(name: string, surname: string) {
    return name.toUpperCase().slice(0, 1) + surname.toUpperCase().slice(0, 1);
}

export function isOverdue(
    dueDate: string | Date | undefined,
    status: string,
): boolean {
    if (!dueDate || status === "done") {
        return false;
    }

    return isPast(dueDate) && !isToday(dueDate);
}

export function formatDate(date: string | Date): string {
    if (isToday(date)) {
        return "Today";
    }
    if (isTomorrow(date)) {
        return "Tomorrow";
    }

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

export function formatBackupCode(raw: string): string {
    const cleaned = raw
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 8);

    if (cleaned.length <= 4) {
        return cleaned;
    }

    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
}

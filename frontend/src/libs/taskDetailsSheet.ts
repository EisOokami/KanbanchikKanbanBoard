import { ActivityEntry } from "@/types/taskDetailsSheet";
import { Task } from "@/types/types";
import { format, isPast, isToday, isTomorrow } from "date-fns";

export function dueDateMeta(
    date: Date | null | undefined,
): { text: string; color: string; bg: string; border: string } | null {
    if (!date) return null;
    if (!isToday(date) && isPast(date))
        return {
            text: "Overdue",
            color: "#D93025",
            bg: "#FEF0EF",
            border: "#FACACB",
        };
    if (isToday(date))
        return {
            text: "Today",
            color: "#C9620A",
            bg: "#FEF4EC",
            border: "#FCD9B5",
        };
    if (isTomorrow(date))
        return {
            text: "Tomorrow",
            color: "#1A6BBF",
            bg: "#EEF4FD",
            border: "#BDD5F5",
        };
    return {
        text: format(date, "MMM d, yyyy"),
        color: "#374151",
        bg: "#F9FAFB",
        border: "#E5E7EB",
    };
}

export function commentsToActivity(
    comments: Task["comments"],
): ActivityEntry[] {
    return comments.map((c) => ({
        id: c.id,
        type: "comment" as const,
        author: c.assignee,
        body: c.body,
        timestamp:
            c.created_at instanceof Date
                ? c.created_at
                : new Date(c.created_at),
    }));
}

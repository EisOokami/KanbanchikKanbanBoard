import { Notification, NotificationGroup } from "@/types/notifications";

export function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
}

export function groupByDate(items: Notification[]): NotificationGroup[] {
    const groups: string[] = [];
    const buckets: Record<string, Notification[]> = {};

    items.forEach((n) => {
        const diff = Date.now() - n.time;
        const label: string =
            diff < 3_600_000 * 2
                ? "Last hour"
                : diff < 86_400_000
                  ? "Today"
                  : diff < 86_400_000 * 2
                    ? "Yesterday"
                    : "Earlier";
        if (!buckets[label]) {
            buckets[label] = [];
            groups.push(label);
        }
        buckets[label].push(n);
    });

    return groups.map((g) => ({ label: g, items: buckets[g] }));
}

import { deadlines } from "@/constants/feature";

export default function DeadlinesVisual() {
    return (
        <ul className="flex h-full flex-col divide-y rounded-md border bg-background-secondary">
            {deadlines.map((deadline) => (
                <li
                    key={deadline.title}
                    className="flex flex-1 items-center gap-3 px-3 py-2.5"
                >
                    <span className="flex size-9 shrink-0 flex-col items-center justify-center rounded-md border bg-control leading-none">
                        <span className="text-[10px] text-muted-foreground">
                            {deadline.month}
                        </span>
                        <span className="mt-0.5 text-sm font-semibold">
                            {deadline.day}
                        </span>
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium">
                            {deadline.title}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                            {deadline.meta}
                        </span>
                    </span>
                </li>
            ))}
        </ul>
    );
}

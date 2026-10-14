import { columns } from "@/constants/feature";
import { cn } from "@/libs/utils";

export default function BoardsVisual() {
    return (
        <div className="grid h-full grid-cols-3 gap-2 rounded-md border bg-background-secondary p-2">
            {columns.map((column) => (
                <div key={column.title} className="rounded bg-column p-1.5">
                    <p className="mb-1.5 truncate px-0.5 text-[11px] font-medium text-muted-foreground">
                        {column.title}
                    </p>
                    <div className="space-y-1.5">
                        {Array.from({ length: column.cards }, (_, i) => (
                            <div
                                key={i}
                                className="space-y-1.5 rounded border bg-control p-1.5"
                            >
                                <div className="h-1.5 w-3/4 rounded-full bg-foreground/15" />
                                <div
                                    className={cn(
                                        "h-1.5 w-1/2 rounded-full",
                                        column.accent && i === 0
                                            ? "bg-bright-blue"
                                            : "bg-foreground/10",
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

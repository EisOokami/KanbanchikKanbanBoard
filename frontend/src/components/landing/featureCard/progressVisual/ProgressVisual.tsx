import { Progress } from "@/components/ui/shadcn/progress";

export default function ProgressVisual() {
    return (
        <div className="h-full rounded-md border bg-background-secondary p-3">
            <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-semibold tabular-nums tracking-tight">
                    68%
                </span>
                <span className="text-xs text-muted-foreground">
                    18 of 27 tasks
                </span>
            </div>
            <Progress
                value={68}
                className="mt-3 h-2 w-full [&>*]:bg-bright-blue"
            />
        </div>
    );
}

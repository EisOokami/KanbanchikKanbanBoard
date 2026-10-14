import { Progress } from "@/components/ui/shadcn/progress";
import { workload } from "@/constants/feature";

export default function InsightsVisual() {
    return (
        <div className="h-full rounded-md border bg-background-secondary p-3">
            <p className="text-xs text-muted-foreground">
                Open tasks by member
            </p>
            <ul className="mt-3 space-y-2.5">
                {workload.map((member) => (
                    <li
                        key={member.name}
                        className="grid grid-cols-[3rem_1fr] items-center gap-2 text-xs"
                    >
                        <span>{member.name}</span>
                        <Progress
                            value={member.barClass}
                            className="mt-3 h-2 w-full [&>*]:bg-bright-blue"
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

"use client";

import { PRIORITY_CONFIG } from "@/constants/constants";
import { cn } from "@/libs/utils";
import { Priority } from "@/types/types";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { BaseAction } from "@/types/actions";

interface PrioritySectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    priority: string;
    onPriorityChange: (priority: string) => void;
}

export default function PrioritySection({
    formState,
    isPending,
    priority,
    onPriorityChange,
}: Readonly<PrioritySectionProps>) {
    return (
        <div className="space-y-1">
            <label className="font-semibold">
                Priority <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(
                    (priorityConfig) => (
                        <button
                            key={priorityConfig}
                            type="button"
                            onClick={() => onPriorityChange(priorityConfig)}
                            className={cn(
                                "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                                priority === priorityConfig
                                    ? "scale-105 cursor-default"
                                    : "opacity-60 hover:opacity-100",
                            )}
                            style={{
                                backgroundColor:
                                    PRIORITY_CONFIG[priorityConfig].color,
                                color: "#fff",
                            }}
                            disabled={isPending}
                        >
                            {PRIORITY_CONFIG[priorityConfig].label}
                        </button>
                    ),
                )}
            </div>
            <ZodErrors error={formState?.zodErrors?.priority} />
        </div>
    );
}

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
    showPriorityEmoji: boolean;
    onPriorityChange: (priority: string) => void;
}

export default function PrioritySection({
    formState,
    isPending,
    priority,
    showPriorityEmoji,
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
                                "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-white transition-all",
                                priority === priorityConfig
                                    ? "scale-105 cursor-default"
                                    : "opacity-60 hover:opacity-100",
                            )}
                            style={{
                                backgroundColor:
                                    PRIORITY_CONFIG[priorityConfig].color,
                            }}
                            disabled={isPending}
                        >
                            {showPriorityEmoji
                                ? PRIORITY_CONFIG[priorityConfig].emoji + " "
                                : ""}
                            {PRIORITY_CONFIG[priorityConfig].label}
                        </button>
                    ),
                )}
            </div>
            <div>
                <ZodErrors error={formState?.zodErrors?.priority} />
            </div>
        </div>
    );
}

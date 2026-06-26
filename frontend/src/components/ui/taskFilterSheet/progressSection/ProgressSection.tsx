"use client";

import { ChartLineIcon } from "@phosphor-icons/react";
import FilterSection from "../filterSection/FilterSection";
import { Slider } from "../../shadcn/slider";
import { FilterState } from "@/types/types";
import { useState } from "react";

interface ProgressSectionProps {
    filters: FilterState;
    onUpdate: (patch: Partial<FilterState>) => void;
}

export default function ProgressSection({
    filters,
    onUpdate,
}: Readonly<ProgressSectionProps>) {
    const progress = filters.progress!;
    const [localProgress, setLocalProgress] =
        useState<[number, number]>(progress);

    return (
        <FilterSection
            title="Progress"
            icon={<ChartLineIcon weight="duotone" size={16} />}
            count={progress[0] > 0 || progress[1] < 100 ? 1 : undefined}
        >
            <div className="px-1 pb-1 pt-2">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-medium">
                        Completion range
                    </span>
                    <span className="rounded-md px-2 py-0.5 text-xs font-semibold">
                        {localProgress[0]}% - {progress[1]}%
                    </span>
                </div>
                <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={localProgress}
                    onValueChange={(value) =>
                        setLocalProgress(value as [number, number])
                    }
                    onValueCommit={(value) =>
                        onUpdate({
                            progress: value as [number, number],
                        })
                    }
                    className="[&_.bg-primary]:bg-bright-blue [&_[role=slider]]:border-bright-blue [&_[role=slider]]:bg-white"
                />
                <div className="mt-2 flex justify-between">
                    <span className="text-[10px]">0%</span>
                    <span className="text-[10px]">100%</span>
                </div>
            </div>
        </FilterSection>
    );
}

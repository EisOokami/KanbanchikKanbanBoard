"use client";

import { BaseAction } from "@/types/actions";
import { Checkbox } from "../../shadcn/checkbox";
import { useState } from "react";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface PrioritySectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
}

export default function PrioritySection({
    formState,
    isPending,
}: Readonly<PrioritySectionProps>) {
    const [isChecked, setIsChecked] = useState<boolean>();

    return (
        <div className="space-y-2">
            <h3 className="block font-semibold">Priority</h3>
            <div className="flex items-center gap-2">
                <Checkbox
                    id="show-priority-emoji-input"
                    name="show-priority-emoji-input"
                    checked={isChecked}
                    onCheckedChange={() => setIsChecked(!isChecked)}
                    defaultValue={
                        formState?.formData
                            ?.get("show-priority-emoji-input")
                            ?.toString() ?? undefined
                    }
                    className="rounded-md border-border data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                    disabled={isPending}
                />
                <label
                    htmlFor="show-priority-emoji-input"
                    className="text-sm text-muted-foreground"
                >
                    Show emoji in the priority
                </label>
            </div>
            <input
                type="hidden"
                name="show-priority-emoji"
                value={String(!!isChecked)}
            />
            <ZodErrors error={formState?.zodErrors?.showPriorityEmoji} />
        </div>
    );
}

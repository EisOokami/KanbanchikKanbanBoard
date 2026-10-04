"use client";

import { BaseAction } from "@/types/actions";
import { Textarea } from "../../shadcn/textarea";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { useState } from "react";
import { cn } from "@/libs/utils";

interface DescriptionSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
}

export default function DescriptionSection({
    formState,
    isPending,
}: Readonly<DescriptionSectionProps>) {
    const [description, setDescription] = useState<string>("");

    return (
        <div className="relative space-y-1">
            <label className="font-semibold" htmlFor="description">
                Description
            </label>
            <Textarea
                id="description"
                name="description"
                value={description}
                placeholder="Add context, goals, or acceptance criteria..."
                defaultValue={
                    formState?.formData?.get("description")?.toString() ??
                    undefined
                }
                onChange={(e) => setDescription(e.target.value)}
                className={cn(
                    "min-h-32 bg-control text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue",
                    formState?.zodErrors?.description ? "border-red-500" : "",
                )}
                disabled={isPending}
            />
            <div className="absolute right-0">
                <span
                    className={cn(
                        "text-xs",
                        description.length > 5000
                            ? "text-red-500"
                            : "text-muted-foreground",
                    )}
                >
                    {description.length}/5000
                </span>
            </div>
            <div>
                <ZodErrors error={formState?.zodErrors?.description} />
            </div>
        </div>
    );
}

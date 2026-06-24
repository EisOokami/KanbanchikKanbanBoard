"use client";

import { cn } from "@/libs/utils";
import { Textarea } from "../../shadcn/textarea";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { BaseAction } from "@/types/actions";

interface DescriptionSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
}

export default function DescriptionSection({
    formState,
    isPending,
}: Readonly<DescriptionSectionProps>) {
    return (
        <div>
            <label className="mb-2 block font-semibold" htmlFor="description">
                Description
            </label>
            <Textarea
                id="description"
                name="description"
                placeholder="What is this project about?"
                defaultValue={
                    formState?.formData?.get("description")?.toString() ??
                    undefined
                }
                className={cn(
                    "min-h-[72px] resize-none bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue",
                    formState?.zodErrors?.description ? "border-red-500" : "",
                )}
                disabled={isPending}
            />
            <ZodErrors error={formState?.zodErrors?.description} />
        </div>
    );
}

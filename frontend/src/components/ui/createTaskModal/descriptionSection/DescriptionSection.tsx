"use client";

import { BaseAction } from "@/types/actions";
import { Textarea } from "../../shadcn/textarea";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface DescriptionSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
}

export default function DescriptionSection({
    formState,
    isPending,
}: Readonly<DescriptionSectionProps>) {
    return (
        <div className="space-y-1">
            <label className="font-semibold" htmlFor="description">
                Description
            </label>
            <Textarea
                id="description"
                name="description"
                placeholder="Add context, goals, or acceptance criteria…"
                defaultValue={
                    formState?.formData?.get("description")?.toString() ??
                    undefined
                }
                className={`min-h-[72px] resize-none bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue ${
                    formState?.zodErrors?.description ? "border-red-500" : ""
                }`}
                disabled={isPending}
            />
            <ZodErrors error={formState?.zodErrors?.description} />
        </div>
    );
}

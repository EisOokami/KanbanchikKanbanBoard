"use client";

import { BaseAction } from "@/types/actions";
import { Input } from "../../shadcn/input";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { cn } from "@/libs/utils";

interface TitleSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
}

export default function TitleSection({
    formState,
    isPending,
}: Readonly<TitleSectionProps>) {
    return (
        <div className="space-y-1">
            <label className="font-semibold" htmlFor="title">
                Task title <span className="text-red-500">*</span>
            </label>
            <Input
                id="title"
                name="title"
                placeholder="e.g. Design login screen"
                defaultValue={
                    formState?.formData?.get("title")?.toString() ?? undefined
                }
                className={cn(
                    "h-9 bg-control text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue",
                    formState?.zodErrors?.title ? "border-red-500" : "",
                )}
                disabled={isPending}
            />
            <div>
                <ZodErrors error={formState?.zodErrors?.title} />
            </div>
        </div>
    );
}

"use client";

import { cn } from "@/libs/utils";
import { Input } from "../../shadcn/input";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { BaseAction } from "@/types/actions";

interface NameSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
}

export default function NameSection({
    formState,
    isPending,
}: Readonly<NameSectionProps>) {
    return (
        <div>
            <label className="mb-2 block font-semibold" htmlFor="name">
                Project name <span className="text-red-500">*</span>
            </label>
            <Input
                id="name"
                name="name"
                placeholder="e.g. Website Redesign"
                defaultValue={
                    formState?.formData?.get("name")?.toString() ?? undefined
                }
                className={cn(
                    "h-9 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue",
                    formState?.zodErrors?.name ? "border-red-500" : "",
                )}
                disabled={isPending}
            />
            <ZodErrors error={formState?.zodErrors?.name} />
        </div>
    );
}

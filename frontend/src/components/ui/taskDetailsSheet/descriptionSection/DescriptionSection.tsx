"use client";

import { ArticleIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Textarea } from "../../shadcn/textarea";
import { useState } from "react";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { BaseAction } from "@/types/actions";
import { cn } from "@/libs/utils";

interface DescriptionSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    description: string;
    hasPermission: boolean;
    onDescriptionChange: (description: string) => void;
}

export default function DescriptionSection({
    formState,
    isPending,
    description,
    hasPermission,
    onDescriptionChange,
}: Readonly<DescriptionSectionProps>) {
    const [editingDesc, setEditingDesc] = useState<boolean>(false);

    return (
        <div className="mb-5">
            <div className="mb-3 flex items-center gap-1.5">
                <ArticleIcon
                    weight="duotone"
                    size={16}
                    className="text-gray-500"
                />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Description
                </span>
            </div>
            {editingDesc ? (
                <Textarea
                    name="description"
                    autoFocus
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    defaultValue={
                        formState?.formData?.get("description")?.toString() ??
                        undefined
                    }
                    onBlur={() => setEditingDesc(false)}
                    rows={5}
                    className="min-h-32 max-w-[550px] break-words rounded-md bg-control text-sm leading-relaxed placeholder:text-control-active focus-visible:ring-1 focus-visible:ring-bright-blue"
                    placeholder="Add a description…"
                    disabled={isPending}
                />
            ) : (
                <>
                    <div
                        onClick={() => {
                            if (!isPending && hasPermission) {
                                setEditingDesc(true);
                            }
                        }}
                        className={cn(
                            "group/desc min-h-32 max-w-[550px] rounded-md border border-border bg-control px-3 py-2.5 text-sm leading-relaxed",
                            hasPermission &&
                                "cursor-text transition-all hover:bg-control-active",
                        )}
                    >
                        <p
                            className={cn(
                                "whitespace-pre-wrap break-words",
                                !description && "text-control-text",
                            )}
                        >
                            {description || "Add a description…"}
                            {hasPermission && (
                                <PencilSimpleIcon
                                    weight="duotone"
                                    size={16}
                                    className="ml-2 inline text-gray-500 opacity-0 transition-opacity group-hover/desc:opacity-100"
                                />
                            )}
                        </p>
                    </div>
                    <input
                        type="hidden"
                        name="description"
                        value={description}
                    />
                </>
            )}
            <ZodErrors error={formState?.zodErrors?.description} />
        </div>
    );
}

"use client";

import { ArticleIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Textarea } from "../../shadcn/textarea";
import { useState } from "react";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { BaseAction } from "@/types/actions";

interface DescriptionSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    description: string;
    onDescriptionChange: (description: string) => void;
}

export default function DescriptionSection({
    formState,
    isPending,
    description,
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
                    className="min-h-32 max-w-[550px] break-words rounded-md text-sm leading-relaxed placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                    placeholder="Add a description…"
                    disabled={isPending}
                />
            ) : (
                <>
                    <div
                        onClick={() => {
                            if (!isPending) {
                                setEditingDesc(true);
                            }
                        }}
                        className="group/desc min-h-32 max-w-[550px] cursor-text rounded-md border px-3 py-2.5 text-sm leading-relaxed transition-all hover:bg-gray-50"
                        style={{
                            color: description ? "#374151" : "#D1D5DB",
                        }}
                    >
                        <p className="whitespace-pre-wrap break-words">
                            {description || "Add a description…"}
                            {description && (
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

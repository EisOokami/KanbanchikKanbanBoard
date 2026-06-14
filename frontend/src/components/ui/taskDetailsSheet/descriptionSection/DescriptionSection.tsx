"use client";

import { ArticleIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Textarea } from "../../shadcn/textarea";
import { useState } from "react";
import { Task } from "@/types/types";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { BaseAction } from "@/types/actions";

interface DescriptionSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    task: Task;
}

export default function DescriptionSection({
    formState,
    isPending,
    task,
}: Readonly<DescriptionSectionProps>) {
    const [description, setDescription] = useState<string>(task.description);
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
                    onChange={(e) => setDescription(e.target.value)}
                    defaultValue={
                        formState?.formData?.get("description")?.toString() ??
                        undefined
                    }
                    onBlur={() => setEditingDesc(false)}
                    rows={5}
                    className="resize-none rounded-md text-sm leading-relaxed placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
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
                        className="group/desc cursor-text rounded-md border px-3 py-2.5 text-sm leading-relaxed transition-all hover:bg-gray-50"
                        style={{
                            color: description ? "#374151" : "#D1D5DB",
                        }}
                    >
                        {description || "Add a description…"}
                        {description && (
                            <PencilSimpleIcon
                                weight="duotone"
                                size={16}
                                className="ml-2 inline text-gray-500 opacity-0 transition-opacity group-hover/desc:opacity-100"
                            />
                        )}
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

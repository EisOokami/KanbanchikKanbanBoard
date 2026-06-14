"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Textarea } from "../../shadcn/textarea";
import { useState } from "react";
import { Task } from "@/types/types";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { BaseAction } from "@/types/actions";

interface TitleSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    task: Task;
}

export default function TitleSection({
    formState,
    isPending,
    task,
}: Readonly<TitleSectionProps>) {
    const [title, setTitle] = useState<string>(task.title);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);

    return (
        <div>
            {editingTitle ? (
                <Textarea
                    name="title"
                    autoFocus
                    value={title}
                    defaultValue={
                        formState?.formData?.get("title")?.toString() ??
                        undefined
                    }
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            setEditingTitle(false);
                        }
                    }}
                    rows={2}
                    className="resize-none rounded-none border-0 border-b bg-transparent px-0 !text-xl font-bold leading-tight transition-colors focus-visible:border-bright-blue focus-visible:ring-0"
                    disabled={isPending}
                />
            ) : (
                <>
                    <h1
                        onClick={() => {
                            if (!isPending) {
                                setEditingTitle(true);
                            }
                        }}
                        className="group -mx-2 flex cursor-text items-center gap-2 rounded-md px-2 py-1 text-xl font-bold leading-tight transition-colors hover:bg-gray-50"
                    >
                        <span className="flex-1">
                            {title.trim() || (
                                <span className="text-gray-300">
                                    Untitled task
                                </span>
                            )}
                        </span>
                        <PencilSimpleIcon
                            weight="duotone"
                            size={16}
                            className="text-gray-500 opacity-0 transition-opacity group-hover:opacity-100"
                        />
                    </h1>
                    <input type="hidden" name="title" value={title} />
                </>
            )}
            <ZodErrors error={formState?.zodErrors?.title} />
        </div>
    );
}

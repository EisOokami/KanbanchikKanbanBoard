"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Textarea } from "../../shadcn/textarea";
import { useState } from "react";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { BaseAction } from "@/types/actions";
import { cn } from "@/libs/utils";

interface TitleSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    title: string;
    hasPermission: boolean;
    onTitleChange: (title: string) => void;
}

export default function TitleSection({
    formState,
    isPending,
    title,
    hasPermission,
    onTitleChange,
}: Readonly<TitleSectionProps>) {
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
                    onChange={(e) => onTitleChange(e.target.value)}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            setEditingTitle(false);
                        }
                    }}
                    rows={2}
                    className="max-w-[550px] resize-none rounded-none border-0 border-b bg-transparent px-0 !text-xl font-bold leading-tight transition-colors focus-visible:border-bright-blue focus-visible:ring-0"
                    disabled={isPending}
                />
            ) : (
                <>
                    <h1
                        onClick={() => {
                            if (!isPending && hasPermission) {
                                setEditingTitle(true);
                            }
                        }}
                        className={cn(
                            "group -mx-2 flex max-w-[550px] items-center gap-2 rounded-md px-2 py-1 text-xl font-bold leading-tight",
                            hasPermission &&
                                "cursor-text transition-colors hover:bg-background-secondary",
                        )}
                    >
                        <span className="max-w-[95%] flex-1 break-words">
                            {title.trim() || (
                                <span className="text-gray-300 dark:text-gray-700">
                                    Untitled task
                                </span>
                            )}
                        </span>
                        <PencilSimpleIcon
                            weight="duotone"
                            size={16}
                            className={cn(
                                "text-gray-500 opacity-0",
                                hasPermission &&
                                    "transition-opacity group-hover:opacity-100",
                            )}
                        />
                    </h1>
                    <input type="hidden" name="title" value={title} />
                </>
            )}
            <ZodErrors error={formState?.zodErrors?.title} />
        </div>
    );
}

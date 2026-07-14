"use client";

import { getFileIcon, isImage } from "@/libs/taskDetailsSheet";
import { formatSize } from "@/libs/utils";
import { ArrowLineDownIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useMemo } from "react";

interface NewAttachmentRowProps {
    attachment: { id: number | string; file: File };
    isPending: boolean;
    canPreview: boolean;
    hasPermission: boolean;
    onRemove: (id: number | string) => void;
    onPreview: (attachment: { id: number | string; file: File }) => void;
}

export default function NewAttachmentRow({
    attachment,
    isPending,
    canPreview,
    hasPermission,
    onRemove,
    onPreview,
}: Readonly<NewAttachmentRowProps>) {
    const fileUrl = useMemo(
        () => URL.createObjectURL(attachment.file),
        [attachment.file],
    );

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();

        const a = document.createElement("a");

        a.href = fileUrl;
        a.download = attachment.file.name;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
    };

    return (
        <div
            className={`group/att flex items-center gap-3 rounded-md border border-border bg-control px-3 py-2 transition-colors hover:bg-control-active ${canPreview ? "cursor-pointer" : ""}`}
            onClick={canPreview ? () => onPreview(attachment) : undefined}
        >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-200 dark:bg-zinc-800">
                {getFileIcon(attachment.file.type)}
            </div>
            {isImage(attachment.file.type) && (
                <Image
                    src={fileUrl}
                    alt={attachment.file.name}
                    width={300}
                    height={300}
                    className="size-8 shrink-0 rounded-md object-cover"
                    loading="lazy"
                />
            )}
            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                    {attachment.file.name}
                </p>
                <p className="text-xs text-gray-500">
                    {formatSize(attachment.file.size)}
                </p>
            </div>
            {hasPermission && (
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-all group-hover/att:opacity-100">
                    {!canPreview && (
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="text-gray-300 transition-colors hover:text-violet-500"
                            disabled={isPending}
                            title="Download"
                        >
                            <ArrowLineDownIcon weight="duotone" size={16} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(attachment.id);
                        }}
                        className="text-gray-300 transition-colors hover:text-red-400"
                        disabled={isPending}
                        title="Remove"
                    >
                        <TrashSimpleIcon weight="duotone" size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

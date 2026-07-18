"use client";

import { Button } from "@/components/ui/shadcn/button";
import { getFileIcon, isImage } from "@/libs/taskDetailsSheet";
import { formatSize } from "@/libs/utils";
import { Attachment } from "@/types/types";
import { ArrowLineDownIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import Image from "next/image";

interface AttachmentRowProps {
    attachment: Attachment;
    isPending: boolean;
    canPreview: boolean;
    hasPermission: boolean;
    onRemove: (id: number) => void;
    onPreview: (id: number) => void;
}

export default function AttachmentRow({
    attachment,
    isPending,
    canPreview,
    hasPermission,
    onRemove,
    onPreview,
}: Readonly<AttachmentRowProps>) {
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();

        const a = document.createElement("a");

        a.href = attachment.file_url;
        a.download = attachment.filename;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
    };

    return (
        <div
            className={`group/att flex items-center gap-3 rounded-md border border-border bg-control px-3 py-2 transition-colors hover:bg-control-active ${canPreview ? "cursor-pointer" : ""}`}
            onClick={canPreview ? () => onPreview(attachment.id) : undefined}
        >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-200 dark:bg-zinc-800">
                {getFileIcon(attachment.mime_type)}
            </div>
            {isImage(attachment.mime_type) && (
                <Image
                    src={attachment.file_url}
                    alt={attachment.filename}
                    width={300}
                    height={300}
                    className="size-8 shrink-0 rounded-md object-cover"
                    loading="lazy"
                />
            )}
            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                    {attachment.filename}
                </p>
                <p className="text-xs text-gray-500">
                    {formatSize(attachment.size_bytes)}
                </p>
            </div>
            {hasPermission && (
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-all group-hover/att:opacity-100">
                    {!canPreview && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleDownload}
                            className="size-7 text-control-text hover:bg-control hover:text-violet-500"
                            disabled={isPending}
                        >
                            <ArrowLineDownIcon weight="duotone" size={16} />
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(attachment.id);
                        }}
                        className="size-7 text-control-text hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-600"
                        disabled={isPending}
                    >
                        <TrashSimpleIcon weight="duotone" size={16} />
                    </Button>
                </div>
            )}
        </div>
    );
}

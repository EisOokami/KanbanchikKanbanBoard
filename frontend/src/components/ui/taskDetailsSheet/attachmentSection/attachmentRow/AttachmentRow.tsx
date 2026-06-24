"use client";

import { formatSize, getFileIcon, isImage } from "@/libs/taskDetailsSheet";
import { Attachment } from "@/types/types";
import { ArrowLineDownIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import Image from "next/image";

interface AttachmentRowProps {
    attachment: Attachment;
    onRemove: (id: number) => void;
    onPreview: (id: number) => void;
    isPending: boolean;
    canPreview: boolean;
}

export default function AttachmentRow({
    attachment,
    onRemove,
    onPreview,
    isPending,
    canPreview,
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
            className={`group/att flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-gray-50 ${canPreview ? "cursor-pointer" : ""}`}
            onClick={canPreview ? () => onPreview(attachment.id) : undefined}
        >
            <div
                className="flex size-8 shrink-0 items-center justify-center rounded-md"
                style={{ background: "#EDE9FD" }}
            >
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
        </div>
    );
}

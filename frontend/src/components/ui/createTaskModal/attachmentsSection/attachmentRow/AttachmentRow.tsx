"use client";

import { Button } from "@/components/ui/shadcn/button";
import { getFileIcon, isImage } from "@/libs/createTaskModal";
import { formatSize } from "@/libs/utils";
import { ArrowLineDownIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface AttachmentValue {
    id: number | string;
    file: File;
}

interface CreateAttachmentRowProps {
    attachment: AttachmentValue;
    isPending: boolean;
    onRemove: (attachment: AttachmentValue) => void;
    onPreview: (attachment: AttachmentValue) => void;
}

export default function AttachmentRow({
    attachment,
    isPending,
    onRemove,
    onPreview,
}: Readonly<CreateAttachmentRowProps>) {
    const { file } = attachment;
    const mimeType = file.type;
    const canPreview =
        isImage(mimeType) ||
        mimeType.startsWith("video/") ||
        mimeType === "application/pdf";
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setObjectUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!objectUrl) {
            return;
        }

        const a = document.createElement("a");

        a.href = objectUrl;
        a.download = file.name;
        a.click();
    };

    return (
        <div
            className={`group flex items-center gap-2.5 rounded-md border border-border bg-control px-3 py-2 transition-colors hover:bg-control-active ${canPreview ? "cursor-pointer" : ""}`}
            onClick={canPreview ? () => onPreview(attachment) : undefined}
        >
            <div
                className="flex size-7 flex-shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: "#6366f1" + "22" }}
            >
                {getFileIcon(mimeType)}
            </div>
            {isImage(mimeType) && objectUrl && (
                <Image
                    src={objectUrl}
                    alt={file.name}
                    width={300}
                    height={300}
                    className="size-7 shrink-0 rounded-md object-cover"
                    unoptimized
                />
            )}
            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{file.name}</p>
                <p className="text-[10px] text-muted-foreground">
                    {formatSize(file.size)}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
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
                        onRemove(attachment);
                    }}
                    className="size-7 text-control-text hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-600"
                    disabled={isPending}
                >
                    <TrashSimpleIcon weight="duotone" size={16} />
                </Button>
            </div>
        </div>
    );
}

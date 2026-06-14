"use client";

import { BaseAction } from "@/types/actions";
import { CreateTaskFormData } from "@/types/types";
import { Attachment } from "@/types/types";
import {
    PaperclipIcon,
    TrashSimpleIcon,
    UploadSimpleIcon,
} from "@phosphor-icons/react";
import { useRef } from "react";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface AttachmentsSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    formData: CreateTaskFormData;
    onFormDataChange: (formData: CreateTaskFormData) => void;
}

export default function AttachmentsSection({
    formState,
    isPending,
    formData,
    onFormDataChange,
}: Readonly<AttachmentsSectionProps>) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);

        onFormDataChange({
            ...formData,
            attachments: [
                ...formData.attachments,
                ...files.map((file) => ({
                    id: new Date().getTime(),
                    uploader_id: new Date().getTime(),
                    filename: file.name,
                    file_url: "",
                    mime_type: file.type,
                    size_bytes: file.size,
                    created_at: new Date(),
                })),
            ],
        });
        e.target.value = "";
    };

    const onAttachmentRemove = (attachmentValue: Attachment) => {
        onFormDataChange({
            ...formData,
            attachments: formData.attachments.filter(
                (attachment) => attachment.id !== attachmentValue.id,
            ),
        });
    };

    return (
        <div className="space-y-1">
            <label className="font-semibold" htmlFor="attachment">
                Attachments
            </label>
            <div className="space-y-1">
                <input
                    id="attachment"
                    ref={fileInputRef}
                    defaultValue={
                        formState?.formData?.get("attachment")?.toString() ??
                        undefined
                    }
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isPending}
                />
                {formData.attachments.length > 0 && (
                    <div className="space-y-1.5">
                        {formData.attachments.map((attachment) => (
                            <div
                                key={attachment.id}
                                className="group flex items-center gap-2.5 rounded-md border border-border/50 bg-white px-3 py-2"
                            >
                                <div
                                    className="flex size-7 flex-shrink-0 items-center justify-center rounded-md"
                                    style={{
                                        backgroundColor: "#6366f1" + "22",
                                    }}
                                >
                                    <PaperclipIcon
                                        weight="duotone"
                                        className="size-4"
                                        style={{
                                            color: "#6366f1",
                                        }}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium">
                                        {attachment.filename}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {attachment.size_bytes}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onAttachmentRemove(attachment)
                                    }
                                    className="text-muted-foreground/50 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                                    disabled={isPending}
                                >
                                    <TrashSimpleIcon
                                        weight="duotone"
                                        className="size-4"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h+over:text-foreground flex h-32 w-full items-center justify-center gap-2 rounded-md border border-dashed border-border/60 bg-white px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/30"
                    disabled={isPending}
                >
                    <UploadSimpleIcon weight="duotone" className="size-4" />
                    Upload files or drag &amp; drop
                </button>
            </div>
            <ZodErrors error={formState?.zodErrors?.attachments} />
        </div>
    );
}

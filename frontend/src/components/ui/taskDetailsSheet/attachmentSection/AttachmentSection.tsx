"use client";

import { BaseAction } from "@/types/actions";
import { UpdateTaskFormData, User } from "@/types/types";
import {
    FileIcon,
    PaperclipIcon,
    TrashSimpleIcon,
    UploadSimpleIcon,
} from "@phosphor-icons/react";
import { useRef } from "react";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface AttachmentSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    formData: UpdateTaskFormData;
    userData: Omit<User, "email">;
    onFormDataChange: (formData: UpdateTaskFormData) => void;
}

export default function AttachmentSection({
    formState,
    isPending,
    formData,
    userData,
    onFormDataChange,
}: Readonly<AttachmentSectionProps>) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const newAttachments = files.map((f) => ({
            id: Date.now() + Math.random(),
            uploader_id: userData.id,
            filename: f.name,
            file_url: URL.createObjectURL(f),
            mime_type: f.type,
            size_bytes: f.size,
            created_at: new Date(),
        }));

        onFormDataChange({
            ...formData,
            newAttachments: [...formData.newAttachments, ...newAttachments],
        });
    };

    const removeAttachment = (id: number) => {
        onFormDataChange({
            ...formData,
            attachments: formData.attachments.filter(
                (attachment) => attachment.id !== id,
            ),
            newAttachments: formData.newAttachments.filter(
                (attachment) => attachment.id !== id,
            ),
        });
    };

    return (
        <div className="mb-5">
            <div className="mb-3 flex items-center gap-1.5">
                <PaperclipIcon
                    weight="duotone"
                    size={16}
                    className="text-gray-500"
                />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Attachments
                </span>
                {formData.attachments.length ||
                formData.newAttachments.length ? (
                    <span className="text-xs text-gray-500">
                        {formData.attachments.length +
                            formData.newAttachments.length}
                    </span>
                ) : null}
            </div>
            <input
                name="attachments"
                ref={fileInputRef}
                type="file"
                multiple
                defaultValue={
                    formState?.formData?.get("attachments")?.toString() ??
                    undefined
                }
                className="hidden"
                onChange={handleFileChange}
                disabled={isPending}
            />
            {formData.attachments.length || formData.newAttachments.length ? (
                <div className="mb-2 space-y-2">
                    {formData.attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="group/att flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-gray-50"
                        >
                            <div
                                className="flex size-8 shrink-0 items-center justify-center rounded-md"
                                style={{
                                    background: "#EDE9FD",
                                }}
                            >
                                <FileIcon
                                    weight="duotone"
                                    size={16}
                                    className="text-violet-600"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium">
                                    {attachment.filename}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(attachment.size_bytes / 1024).toFixed(1)}{" "}
                                    KB
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeAttachment(attachment.id)}
                                className="shrink-0 text-gray-300 opacity-0 transition-all hover:text-red-400 group-hover/att:opacity-100"
                                disabled={isPending}
                            >
                                <TrashSimpleIcon weight="duotone" size={16} />
                            </button>
                        </div>
                    ))}
                    {formData.newAttachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="group/att flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-gray-50"
                        >
                            <div
                                className="flex size-8 shrink-0 items-center justify-center rounded-md"
                                style={{
                                    background: "#EDE9FD",
                                }}
                            >
                                <FileIcon
                                    weight="duotone"
                                    size={16}
                                    className="text-violet-600"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium">
                                    {attachment.filename}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(attachment.size_bytes / 1024).toFixed(1)}{" "}
                                    KB
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeAttachment(attachment.id)}
                                className="shrink-0 text-gray-300 opacity-0 transition-all hover:text-red-400 group-hover/att:opacity-100"
                                disabled={isPending}
                            >
                                <TrashSimpleIcon weight="duotone" size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : null}
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50"
                disabled={isPending}
            >
                <UploadSimpleIcon weight="duotone" size={14} />
                Upload file
            </button>
            <ZodErrors error={formState?.zodErrors?.attachments} />
            <ZodErrors error={formState?.zodErrors?.newAttachments} />
        </div>
    );
}

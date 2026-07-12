"use client";

import { BaseAction } from "@/types/actions";
import { UpdateTaskFormData, User } from "@/types/types";
import { PaperclipIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { deleteAttachmentAction } from "@/data/actions";
import Lightbox from "yet-another-react-lightbox";
import { buildSlides, isImage, isPdf, isVideo } from "@/libs/taskDetailsSheet";
import AttachmentRow from "./attachmentRow/AttachmentRow";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { toast } from "sonner";

interface AttachmentSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    formData: UpdateTaskFormData;
    userData: Omit<User, "email">;
    hasPermission: boolean;
    onFormDataChange: (formData: UpdateTaskFormData) => void;
}

export default function AttachmentSection({
    formState,
    isPending,
    formData,
    userData,
    hasPermission,
    onFormDataChange,
}: Readonly<AttachmentSectionProps>) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
    const [lightboxIndex, setLightboxIndex] = useState<number>(0);

    const allAttachments = [
        ...formData.attachments,
        ...formData.newAttachments,
    ];
    const lightboxSlides = buildSlides(allAttachments);
    const slideIndexMap = (() => {
        const map: Record<number, number> = {};

        let slideIdx = 0;

        for (const attachment of allAttachments) {
            if (
                isImage(attachment.mime_type) ||
                isVideo(attachment.mime_type)
            ) {
                map[attachment.id] = slideIdx++;
            }
        }

        return map;
    })();

    const handlePreview = (id: number) => {
        const attachment = allAttachments.find(
            (attachment) => attachment.id === id,
        );

        if (!attachment) {
            return;
        }

        if (isPdf(attachment.mime_type)) {
            window.open(attachment.file_url, "_blank", "noopener,noreferrer");

            return;
        }

        const index = slideIndexMap[id];

        if (index !== undefined) {
            setLightboxIndex(index);
            setLightboxOpen(true);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const newAttachments = files.map((file) => ({
            id: Date.now() + Math.random(),
            uploader_id: userData.id,
            filename: file.name,
            file_url: URL.createObjectURL(file),
            mime_type: file.type,
            size_bytes: file.size,
            created_at: new Date(),
        }));

        onFormDataChange({
            ...formData,
            newAttachments: [...formData.newAttachments, ...newAttachments],
        });
    };

    const removeAttachment = async (id: number) => {
        const result = await deleteAttachmentAction(id);

        if (!result || !result.ok) {
            toast.success("Error", {
                description: "Something went wrong",
            });
        }

        if (result && !result.ok) {
            toast.success("Error", {
                description: result.message,
            });
        }

        if (result && result.ok) {
            toast.success("Success", {
                description: `Attachment has been deleted`,
            });

            onFormDataChange({
                ...formData,
                attachments: formData.attachments.filter(
                    (attachments) => attachments.id !== id,
                ),
                newAttachments: formData.newAttachments.filter(
                    (attachments) => attachments.id !== id,
                ),
            });
        }
    };

    const total = formData.attachments.length + formData.newAttachments.length;

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
                {total > 0 && (
                    <span className="text-xs text-gray-500">{total}</span>
                )}
            </div>
            <input
                name="attachments"
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={isPending}
            />
            {total > 0 && (
                <div className="mb-2 space-y-2">
                    {allAttachments.map((attachment) => {
                        const canPreview =
                            isImage(attachment.mime_type) ||
                            isVideo(attachment.mime_type) ||
                            isPdf(attachment.mime_type);

                        return (
                            <AttachmentRow
                                key={attachment.id}
                                attachment={attachment}
                                isPending={isPending}
                                canPreview={canPreview}
                                hasPermission={hasPermission}
                                onRemove={removeAttachment}
                                onPreview={handlePreview}
                            />
                        );
                    })}
                </div>
            )}
            {hasPermission && (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50"
                    disabled={isPending}
                >
                    <UploadSimpleIcon weight="duotone" size={14} />
                    Upload file
                </button>
            )}
            <ZodErrors error={formState?.zodErrors?.attachments} />
            <ZodErrors error={formState?.zodErrors?.newAttachments} />
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={lightboxSlides}
                plugins={[Video]}
                styles={{
                    container: { backgroundColor: "rgba(0,0,0,0.85)" },
                }}
            />
        </div>
    );
}

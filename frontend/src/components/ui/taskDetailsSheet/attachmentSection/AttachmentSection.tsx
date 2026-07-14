"use client";

import { BaseAction } from "@/types/actions";
import { UpdateTaskFormData } from "@/types/types";
import { PaperclipIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useMemo, useRef, useState } from "react";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { deleteAttachmentAction } from "@/data/actions";
import Lightbox from "yet-another-react-lightbox";
import { buildSlides, isImage, isPdf, isVideo } from "@/libs/taskDetailsSheet";
import AttachmentRow from "./attachmentRow/AttachmentRow";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { toast } from "sonner";
import { Button } from "../../shadcn/button";
import NewAttachmentRow from "./newAttachmentRow/NewAttachmentRow";
import { isImageFile, isPdfFile, isVideoFile } from "@/libs/utils";

interface AttachmentSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    formData: UpdateTaskFormData;
    hasPermission: boolean;
    onFormDataChange: (formData: UpdateTaskFormData) => void;
}

export default function AttachmentSection({
    formState,
    isPending,
    formData,
    hasPermission,
    onFormDataChange,
}: Readonly<AttachmentSectionProps>) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
    const [lightboxIndex, setLightboxIndex] = useState<number>(0);

    const existingSlides = buildSlides(formData.attachments) ?? [];

    const newSlides = useMemo(() => {
        return formData.newAttachments
            .filter(
                (attachment) =>
                    isImageFile(attachment.file) ||
                    isVideoFile(attachment.file),
            )
            .map((attachment) => {
                const url = URL.createObjectURL(attachment.file);

                if (isVideoFile(attachment.file)) {
                    return {
                        type: "video" as const,
                        width: 1280,
                        height: 720,
                        sources: [{ src: url, type: attachment.file.type }],
                    };
                }

                return { src: url, alt: attachment.file.name };
            });
    }, [formData.newAttachments]);

    const lightboxSlides = [...existingSlides, ...newSlides];

    const existingSlideIndexMap = (() => {
        const map: Record<number, number> = {};
        let slideIndex = 0;

        for (const attachment of formData.attachments) {
            if (
                isImage(attachment.mime_type) ||
                isVideo(attachment.mime_type)
            ) {
                map[attachment.id] = slideIndex++;
            }
        }

        return map;
    })();

    const newSlideIndexMap = (() => {
        const map: Record<string | number, number> = {};
        let slideIndex = existingSlides.length;

        for (const attachment of formData.newAttachments) {
            if (isImageFile(attachment.file) || isVideoFile(attachment.file)) {
                map[attachment.id] = slideIndex++;
            }
        }

        return map;
    })();

    const handlePreviewExisting = (id: number) => {
        const attachment = formData.attachments.find(
            (attachment) => attachment.id === id,
        );

        if (!attachment) {
            return;
        }

        if (isPdf(attachment.mime_type)) {
            window.open(attachment.file_url, "_blank", "noopener,noreferrer");

            return;
        }

        const index = existingSlideIndexMap[id];

        if (index !== undefined) {
            setLightboxIndex(index);
            setLightboxOpen(true);
        }
    };

    const handlePreviewNew = (attachment: {
        id: number | string;
        file: File;
    }) => {
        if (isPdfFile(attachment.file)) {
            const url = URL.createObjectURL(attachment.file);
            window.open(url, "_blank", "noopener,noreferrer");

            return;
        }

        const index = newSlideIndexMap[attachment.id];

        if (index !== undefined) {
            setLightboxIndex(index);
            setLightboxOpen(true);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);

        const newAttachments = files.map((file, index) => ({
            id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
            file,
        }));

        onFormDataChange({
            ...formData,
            newAttachments: [...formData.newAttachments, ...newAttachments],
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeNewAttachment = (id: number | string) => {
        onFormDataChange({
            ...formData,
            newAttachments: formData.newAttachments.filter(
                (attachment) => attachment.id !== id,
            ),
        });
    };

    const removeExistingAttachment = async (id: number) => {
        const result = await deleteAttachmentAction(id);

        if (!result || !result.ok) {
            toast.error("Error", {
                description: result?.message ?? "Something went wrong",
            });

            return;
        }

        toast.success("Success", {
            description: `Attachment has been deleted`,
        });

        onFormDataChange({
            ...formData,
            attachments: formData.attachments.filter(
                (attachment) => attachment.id !== id,
            ),
        });
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
                    {formData.attachments.map((attachment) => {
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
                                onRemove={removeExistingAttachment}
                                onPreview={handlePreviewExisting}
                            />
                        );
                    })}
                    {formData.newAttachments.map((attachment) => (
                        <NewAttachmentRow
                            key={attachment.id}
                            attachment={attachment}
                            isPending={isPending}
                            hasPermission={hasPermission}
                            onRemove={removeNewAttachment}
                            onPreview={handlePreviewNew}
                            canPreview={
                                isImageFile(attachment.file) ||
                                isVideoFile(attachment.file) ||
                                isPdfFile(attachment.file)
                            }
                        />
                    ))}
                </div>
            )}
            {hasPermission && (
                <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border border-dashed border-border bg-control py-2 text-xs font-medium text-control-text hover:bg-control-active hover:text-foreground"
                    disabled={isPending}
                >
                    <UploadSimpleIcon weight="duotone" size={14} />
                    Upload file
                </Button>
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

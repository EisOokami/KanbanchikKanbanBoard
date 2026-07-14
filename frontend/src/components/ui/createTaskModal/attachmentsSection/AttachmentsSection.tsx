"use client";

import { BaseAction } from "@/types/actions";
import { CreateTaskFormData } from "@/types/types";
import { UploadSimpleIcon } from "@phosphor-icons/react";
import { useMemo, useRef, useState } from "react";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { isImageFile, isPdfFile, isVideoFile } from "@/libs/createTaskModal";
import AttachmentRow from "./attachmentRow/AttachmentRow";

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
    const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
    const [lightboxIndex, setLightboxIndex] = useState<number>(0);

    const slides = useMemo(() => {
        return formData.attachments
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
    }, [formData.attachments]);

    const slideIndexMap = useMemo(() => {
        const map: Record<string | number, number> = {};
        let index = 0;

        for (const attachment of formData.attachments) {
            if (isImageFile(attachment.file) || isVideoFile(attachment.file)) {
                map[attachment.id] = index++;
            }
        }

        return map;
    }, [formData.attachments]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);

        onFormDataChange({
            ...formData,
            attachments: [
                ...formData.attachments,
                ...files.map((file) => ({
                    id: new Date().getTime(),
                    file: file,
                })),
            ],
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onAttachmentRemove = (attachmentValue: {
        id: number | string;
        file: File;
    }) => {
        onFormDataChange({
            ...formData,
            attachments: formData.attachments.filter(
                (attachment) => attachment.id !== attachmentValue.id,
            ),
        });
    };

    const handlePreview = (attachment: { id: number | string; file: File }) => {
        if (isPdfFile(attachment.file)) {
            const url = URL.createObjectURL(attachment.file);
            window.open(url, "_blank", "noopener,noreferrer");

            return;
        }

        const index = slideIndexMap[attachment.id];

        if (index !== undefined) {
            setLightboxIndex(index);
            setLightboxOpen(true);
        }
    };

    return (
        <div className="space-y-1">
            <label className="font-semibold" htmlFor="attachments">
                Attachments
            </label>
            <div className="space-y-1">
                <input
                    id="attachments"
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isPending}
                />
                {formData.attachments.length > 0 && (
                    <div className="space-y-1.5">
                        {formData.attachments.map((attachment) => (
                            <AttachmentRow
                                key={attachment.id}
                                attachment={attachment}
                                isPending={isPending}
                                onRemove={onAttachmentRemove}
                                onPreview={handlePreview}
                            />
                        ))}
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h+over:text-foreground flex h-32 w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-control px-3 py-2.5 text-sm text-control-text transition-colors hover:bg-control-active"
                    disabled={isPending}
                >
                    <UploadSimpleIcon weight="duotone" className="size-4" />
                    Upload files or drag &amp; drop
                </button>
            </div>
            <div>
                <ZodErrors error={formState?.zodErrors?.attachments} />
            </div>
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={slides}
                plugins={[Video]}
                styles={{
                    container: { backgroundColor: "rgba(0,0,0,0.85)" },
                }}
            />
        </div>
    );
}

import Lightbox from "yet-another-react-lightbox";
import { ActivityEntry } from "@/types/taskDetailsSheet";
import { Attachment, Task } from "@/types/types";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import {
    FileIcon,
    FilePdfIcon,
    FileVideoIcon,
    ImageIcon,
} from "@phosphor-icons/react";

export function dateMeta(
    date: Date | null | undefined,
): { text: string; color: string; bg: string; border: string } | null {
    if (!date) {
        return null;
    }

    if (!isToday(date) && isPast(date)) {
        return {
            text: "Overdue",
            color: "#D93025",
            bg: "#FEF0EF",
            border: "#FACACB",
        };
    }

    if (isToday(date)) {
        return {
            text: "Today",
            color: "#C9620A",
            bg: "#FEF4EC",
            border: "#FCD9B5",
        };
    }

    if (isTomorrow(date)) {
        return {
            text: "Tomorrow",
            color: "#1A6BBF",
            bg: "#EEF4FD",
            border: "#BDD5F5",
        };
    }

    return {
        text: format(date, "MMM d, yyyy"),
        color: "#374151",
        bg: "#F9FAFB",
        border: "#E5E7EB",
    };
}

export function commentsToActivity(
    comments: Task["comments"],
): ActivityEntry[] {
    return comments.map((c) => ({
        id: c.id,
        type: "comment" as const,
        author: c.member,
        body: c.body,
        timestamp:
            c.created_at instanceof Date
                ? c.created_at
                : new Date(c.created_at),
    }));
}

export function isImage(mime: string) {
    return mime.startsWith("image/");
}

export function isVideo(mime: string) {
    return mime.startsWith("video/");
}

export function isPdf(mime: string) {
    return mime === "application/pdf";
}

export function formatSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(mime: string) {
    if (isImage(mime))
        return (
            <ImageIcon weight="duotone" size={16} className="text-violet-600" />
        );
    if (isVideo(mime))
        return (
            <FileVideoIcon
                weight="duotone"
                size={16}
                className="text-violet-600"
            />
        );
    if (isPdf(mime))
        return (
            <FilePdfIcon
                weight="duotone"
                size={16}
                className="text-violet-600"
            />
        );
    return <FileIcon weight="duotone" size={16} className="text-violet-600" />;
}

export function buildSlides(attachments: Attachment[]) {
    return attachments
        .filter(
            (a) =>
                isImage(a.mime_type) ||
                isVideo(a.mime_type) ||
                isPdf(a.mime_type),
        )
        .map((a) => {
            if (isVideo(a.mime_type)) {
                return {
                    type: "video" as const,
                    width: 1280,
                    height: 720,
                    sources: [{ src: a.file_url, type: a.mime_type }],
                };
            }

            if (isPdf(a.mime_type)) {
                return null;
            }

            return {
                src: a.file_url,
                alt: a.filename,
            };
        })
        .filter(Boolean) as Parameters<typeof Lightbox>[0]["slides"];
}

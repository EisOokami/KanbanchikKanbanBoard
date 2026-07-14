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
    options?: {
        showOverdue?: boolean;
    },
): { text: string; className: string } | null {
    if (!date) {
        return null;
    }

    const showOverdue = options?.showOverdue ?? true;

    if (showOverdue && !isToday(date) && isPast(date)) {
        return {
            text: "Overdue",
            className:
                "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
        };
    }

    if (isToday(date)) {
        return {
            text: "Today",
            className:
                "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
        };
    }

    if (isTomorrow(date)) {
        return {
            text: "Tomorrow",
            className:
                "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",
        };
    }

    return {
        text: format(date, "MMM d, yyyy"),
        className: "border-border bg-muted text-muted-foreground",
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

export function getFileIcon(mime: string) {
    if (isImage(mime)) {
        return (
            <ImageIcon weight="duotone" size={16} className="text-violet-600" />
        );
    }

    if (isVideo(mime)) {
        return (
            <FileVideoIcon
                weight="duotone"
                size={16}
                className="text-violet-600"
            />
        );
    }

    if (isPdf(mime)) {
        return (
            <FilePdfIcon
                weight="duotone"
                size={16}
                className="text-violet-600"
            />
        );
    }

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

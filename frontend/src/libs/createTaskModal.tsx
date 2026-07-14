import {
    FileIcon,
    FilePdfIcon,
    FileVideoIcon,
    ImageIcon,
} from "@phosphor-icons/react";

export function isImageFile(file: File) {
    return file.type.startsWith("image/");
}

export function isVideoFile(file: File) {
    return file.type.startsWith("video/");
}

export function isPdfFile(file: File) {
    return file.type === "application/pdf";
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

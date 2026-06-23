"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Colorful } from "@uiw/react-color";
import { useEffect, useRef, useState } from "react";

interface ProjectColorPickerProps {
    projectColor: string;
    isPending: boolean;
    onProjectColorChange: (color: string) => void;
}

export default function ProjectColorPicker({
    projectColor,
    isPending,
    onProjectColorChange,
}: Readonly<ProjectColorPickerProps>) {
    const [open, setOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handler = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => {
                    setOpen(!open);
                }}
                className="relative flex size-14 items-center justify-center rounded-md border transition-all hover:brightness-95"
                style={{
                    background: `${projectColor}20`,
                    borderColor: `${projectColor}40`,
                }}
                disabled={isPending}
            >
                <div
                    className="size-6 rounded-full shadow-sm"
                    style={{
                        background: projectColor,
                    }}
                />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-bright-blue">
                    <PencilSimpleIcon
                        weight="duotone"
                        size={9}
                        className="text-white"
                    />
                </span>
            </button>
            {open && (
                <Colorful
                    color={projectColor}
                    onChange={(color) => {
                        onProjectColorChange(color.hex);
                    }}
                    style={{
                        position: "absolute",
                    }}
                />
            )}
        </div>
    );
}

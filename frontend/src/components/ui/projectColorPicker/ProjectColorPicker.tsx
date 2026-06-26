"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Colorful } from "@uiw/react-color";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";

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

    useEffect(() => {
        console.log(open);
    }, [open]);

    return (
        <Popover onOpenChange={setOpen} open={open} modal={true}>
            <PopoverTrigger disabled={isPending}>
                <button
                    type="button"
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
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0">
                <Colorful
                    color={projectColor}
                    onChange={(color) => {
                        onProjectColorChange(color.hex);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}

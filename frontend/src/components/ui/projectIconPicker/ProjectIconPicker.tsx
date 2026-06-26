"use client";

import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import {
    EmojiPicker,
    EmojiPickerContent,
    EmojiPickerFooter,
    EmojiPickerSearch,
} from "../shadcn/emoji-picker";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";

interface ProjectIconPickerProps {
    projectIcon: string;
    projectColor: string;
    isPending: boolean;
    onProjectIconChange: (icon: string) => void;
}

export default function ProjectIconPicker({
    projectIcon,
    projectColor,
    isPending,
    onProjectIconChange,
}: Readonly<ProjectIconPickerProps>) {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger disabled={isPending}>
                <button
                    type="button"
                    className="relative flex size-14 items-center justify-center rounded-md border text-2xl transition-all hover:brightness-95"
                    style={{
                        background: `${projectColor}15`,
                        borderColor: `${projectColor}30`,
                    }}
                    disabled={isPending}
                >
                    {projectIcon}
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
                <EmojiPicker
                    className="h-[342px]"
                    onEmojiSelect={({ emoji }) => {
                        onProjectIconChange(emoji);
                    }}
                >
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                </EmojiPicker>
            </PopoverContent>
        </Popover>
    );
}

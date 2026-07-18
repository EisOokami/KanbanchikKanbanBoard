"use client";

import { useState } from "react";
import { cn } from "@/libs/utils";
import { Colorful } from "@uiw/react-color";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../shadcn/popover";
import { Button } from "@/components/ui/shadcn/button";

interface AvatarColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    isPending?: boolean;
    buttonClassName?: string;
}

export default function AvatarColorPicker({
    value,
    onChange,
    isPending,
    buttonClassName,
}: Readonly<AvatarColorPickerProps>) {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Popover onOpenChange={setOpen} open={open} modal={true}>
            <PopoverTrigger disabled={isPending}>
                <Button
                    type="button"
                    size="sm"
                    className={cn(
                        "h-7 bg-green-500 text-xs text-white hover:bg-green-600",
                        buttonClassName,
                    )}
                    disabled={isPending}
                >
                    Pick a avatar color
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit border-border p-0">
                <Colorful
                    color={value}
                    onChange={(color) => onChange(color.hex)}
                />
            </PopoverContent>
        </Popover>
    );
}

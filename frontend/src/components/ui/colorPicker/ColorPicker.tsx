"use client";

import { useState } from "react";
import { cn } from "@/libs/utils";
import { Colorful } from "@uiw/react-color";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    isPending?: boolean;
    buttonClassName?: string;
}

export default function ColorPicker({
    value,
    onChange,
    isPending,
    buttonClassName,
}: Readonly<ColorPickerProps>) {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger disabled={isPending}>
                <div
                    className={cn(
                        "size-8 rounded-md border border-border ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-2",
                        buttonClassName,
                    )}
                    style={{ backgroundColor: value }}
                />
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

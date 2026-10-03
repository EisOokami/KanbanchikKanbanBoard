"use client";

import { useEffect, useState } from "react";
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
    const [localColor, setLocalColor] = useState(value);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalColor(value);
    }, [value]);

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);

                if (!next && localColor !== value) {
                    onChange(localColor);
                }
            }}
        >
            <PopoverTrigger disabled={isPending} asChild>
                <div
                    className={cn(
                        "size-8 rounded-md border border-border ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-2",
                        buttonClassName,
                    )}
                    style={{ backgroundColor: localColor }}
                />
            </PopoverTrigger>
            <PopoverContent className="w-fit border-border p-0">
                <Colorful
                    color={localColor}
                    onChange={(color) => setLocalColor(color.hex)}
                />
            </PopoverContent>
        </Popover>
    );
}

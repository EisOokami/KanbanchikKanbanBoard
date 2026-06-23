"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/libs/utils";
import { Colorful } from "@uiw/react-color";

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    colors?: string[];
    isPending?: boolean;
    buttonClassName?: string;
}

export default function ColorPicker({
    value,
    onChange,
    colors,
    isPending,
    buttonClassName,
}: Readonly<ColorPickerProps>) {
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
        <div ref={containerRef} className="relative flex items-center">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    "size-8 rounded-md border border-border/60 ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-2",
                    buttonClassName,
                )}
                style={{ backgroundColor: value }}
                disabled={isPending}
            />
            {open && (
                <div className="absolute left-0 top-9 z-50 flex flex-col gap-3 rounded-xl border border-border/60 bg-white p-3 shadow-md">
                    {colors && colors.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => onChange(color)}
                                    className={cn(
                                        "size-5 rounded-full border border-black/10 transition-transform hover:scale-110",
                                        value === color &&
                                            "ring-2 ring-offset-1",
                                    )}
                                    style={{
                                        backgroundColor: color,
                                        outline:
                                            value === color
                                                ? `2px solid ${color}`
                                                : "none",
                                        outlineOffset: 2,
                                    }}
                                    disabled={isPending}
                                />
                            ))}
                        </div>
                    )}
                    <Colorful
                        color={value}
                        onChange={(color) => onChange(color.hex)}
                    />
                </div>
            )}
        </div>
    );
}

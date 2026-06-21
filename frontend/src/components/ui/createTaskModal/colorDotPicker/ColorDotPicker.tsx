"use client";

import { CheckIcon } from "@phosphor-icons/react";

interface ColorDotPickerProps {
    value: string;
    onChange: (color: string) => void;
    colors: string[];
}

export default function ColorDotPicker({
    value,
    onChange,
    colors,
}: Readonly<ColorDotPickerProps>) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {colors.map((color) => (
                <button
                    key={color}
                    type="button"
                    onClick={() => onChange(color)}
                    className="size-5 rounded-full ring-offset-background transition-transform"
                    style={{
                        backgroundColor: color,
                        outline:
                            value === color ? `2px solid ${color}` : "none",
                        outlineOffset: 2,
                    }}
                >
                    {value === color && (
                        <CheckIcon
                            weight="duotone"
                            className="mx-auto size-3 text-white"
                        />
                    )}
                </button>
            ))}
        </div>
    );
}

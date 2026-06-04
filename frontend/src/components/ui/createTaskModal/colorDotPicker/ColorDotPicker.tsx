"use client";

import { Check } from "lucide-react";

export default function ColorDotPicker({
    value,
    onChange,
    colors,
}: {
    value: string;
    onChange: (c: string) => void;
    colors: string[];
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {colors.map((c) => (
                <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    className="size-5 rounded-full ring-offset-background transition-transform"
                    style={{
                        backgroundColor: c,
                        outline: value === c ? `2px solid ${c}` : "none",
                        outlineOffset: 2,
                    }}
                >
                    {value === c && (
                        <Check className="mx-auto size-3 text-white" />
                    )}
                </button>
            ))}
        </div>
    );
}

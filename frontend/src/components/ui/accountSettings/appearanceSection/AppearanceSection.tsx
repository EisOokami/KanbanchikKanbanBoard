"use client";

import { useState } from "react";
import { ThemeId } from "@/types/accountSettings";
import { accents, themes } from "@/constants/accountSettings";
import SaveBar from "../saveBar/SaveBar";
import SectionTitle from "../sectionTitle/SectionTitle";
import { CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/libs/utils";

export default function AppearanceSection() {
    const [theme, setTheme] = useState<ThemeId>("system");
    const [accent, setAccent] = useState<string>("#6366f1");
    const [dirty, setDirty] = useState<boolean>(false);

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-bold text-gray-800">Appearance</h2>
                <p className="mt-0.5 text-sm text-gray-400">
                    Personalise how Project looks for you
                </p>
            </div>
            <div className="space-y-2">
                <SectionTitle>Theme</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                    {themes.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => {
                                setTheme(id);
                                setDirty(true);
                            }}
                            className={cn(
                                "relative flex flex-col items-center gap-2 rounded-md border-2 p-4 transition-all",
                                theme === id
                                    ? "border-blue-500 bg-blue-50"
                                    : "bg-white hover:border-gray-300",
                            )}
                        >
                            <div
                                className={cn(
                                    "rounded-md p-2",
                                    theme === id
                                        ? "bg-blue-100"
                                        : "bg-gray-100",
                                )}
                            >
                                <Icon
                                    weight="duotone"
                                    className={cn(
                                        "size-5",
                                        theme === id
                                            ? "text-bright-blue"
                                            : "text-gray-500",
                                    )}
                                />
                            </div>
                            <span
                                className={cn(
                                    "text-xs font-semibold",
                                    theme === id
                                        ? "text-blue-600"
                                        : "text-gray-600",
                                )}
                            >
                                {label}
                            </span>
                            {theme === id && (
                                <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-bright-blue">
                                    <CheckIcon
                                        weight="duotone"
                                        className="size-2.5 text-white"
                                    />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <SectionTitle>Accent colour</SectionTitle>
                <div className="flex gap-3">
                    {accents.map((accentColour) => (
                        <button
                            key={accentColour}
                            onClick={() => {
                                setAccent(accentColour);
                                setDirty(true);
                            }}
                            className={cn(
                                "flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110",
                                accent === accentColour
                                    ? "scale-110 ring-2 ring-gray-400 ring-offset-2"
                                    : "",
                            )}
                            style={{ background: accentColour }}
                        >
                            {accent === accentColour && (
                                <CheckIcon
                                    weight="duotone"
                                    className="size-3.5 text-white"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
            <SaveBar
                dirty={dirty}
                onSave={() => setDirty(false)}
                onDiscard={() => setDirty(false)}
            />
        </div>
    );
}

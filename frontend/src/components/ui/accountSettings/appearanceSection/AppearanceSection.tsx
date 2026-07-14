"use client";

import { useState } from "react";
import { themes } from "@/constants/accountSettings";
import SaveBar from "../saveBar/SaveBar";
import SectionTitle from "../sectionTitle/SectionTitle";
import { CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/libs/utils";
import { useTheme } from "next-themes";

export default function AppearanceSection() {
    const { theme, setTheme } = useTheme();
    const [currentTheme, setCurrentTheme] = useState<string | undefined>(theme);
    const [isChanged, setIsChanged] = useState<boolean>(false);

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-bold">Appearance</h2>
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

                                if (id === currentTheme) {
                                    setIsChanged(false);
                                } else {
                                    setIsChanged(true);
                                }
                            }}
                            className={cn(
                                "relative flex flex-col items-center gap-2 rounded-md border-2 border-border p-4 transition-all",
                                theme === id
                                    ? "border-bright-blue bg-blue-50 dark:bg-blue-950"
                                    : "bg-background",
                            )}
                        >
                            <div
                                className={cn(
                                    "rounded-md p-2",
                                    theme === id
                                        ? "bg-blue-100 dark:bg-blue-900"
                                        : "bg-gray-100 dark:bg-gray-900",
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
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-600 dark:text-gray-400",
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
            <SaveBar
                isChanged={isChanged}
                onSave={() => {
                    setIsChanged(false);
                    setCurrentTheme(theme);
                }}
                onDiscard={() => {
                    setIsChanged(false);
                    setTheme(currentTheme ?? "system");
                }}
            />
        </div>
    );
}

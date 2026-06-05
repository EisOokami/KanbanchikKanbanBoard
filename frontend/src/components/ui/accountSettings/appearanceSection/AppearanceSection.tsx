"use client";

import { useState } from "react";
import { DensityId, FontId, ThemeId } from "@/types/accountSettings";
import { accents, densities, themes } from "@/constants/accountSettings";
import { Check } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../shadcn/select";
import SaveBar from "../saveBar/SaveBar";
import SectionTitle from "../sectionTitle/SectionTitle";
import FieldRow from "../fieldRow/FieldRow";

export default function AppearanceSection() {
    const [theme, setTheme] = useState<ThemeId>("system");
    const [accent, setAccent] = useState<string>("#6366f1");
    const [density, setDensity] = useState<DensityId>("comfortable");
    const [font, setFont] = useState<FontId>("system");
    const [dirty, setDirty] = useState<boolean>(false);

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">Appearance</h2>
                <p className="mt-0.5 text-sm text-gray-400">
                    Personalise how KanbanBoard looks for you
                </p>
            </div>
            <SectionTitle>Theme</SectionTitle>
            <div className="mb-6 grid grid-cols-3 gap-3">
                {themes.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => {
                            setTheme(id);
                            setDirty(true);
                        }}
                        className={`relative flex flex-col items-center gap-2 rounded-md border-2 p-4 transition-all ${theme === id ? "border-blue-500 bg-blue-50" : "bg-white hover:border-gray-300"}`}
                    >
                        <div
                            className={`rounded-md p-2 ${theme === id ? "bg-blue-100" : "bg-gray-100"}`}
                        >
                            <Icon
                                className={`size-5 ${theme === id ? "text-bright-blue" : "text-gray-500"}`}
                            />
                        </div>
                        <span
                            className={`text-xs font-semibold ${theme === id ? "text-blue-600" : "text-gray-600"}`}
                        >
                            {label}
                        </span>
                        {theme === id && (
                            <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-bright-blue">
                                <Check className="size-2.5 text-white" />
                            </span>
                        )}
                    </button>
                ))}
            </div>
            <SectionTitle>Accent colour</SectionTitle>
            <div className="mb-6 flex gap-3">
                {accents.map((c) => (
                    <button
                        key={c}
                        onClick={() => {
                            setAccent(c);
                            setDirty(true);
                        }}
                        className={`flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${accent === c ? "scale-110 ring-2 ring-gray-400 ring-offset-2" : ""}`}
                        style={{ background: c }}
                    >
                        {accent === c && (
                            <Check className="size-3.5 text-white" />
                        )}
                    </button>
                ))}
            </div>
            <SectionTitle>Density</SectionTitle>
            <div className="mb-6 grid grid-cols-3 gap-3">
                {densities.map(({ id, label, sub }) => (
                    <button
                        key={id}
                        onClick={() => {
                            setDensity(id);
                            setDirty(true);
                        }}
                        className={`flex flex-col gap-1 rounded-md border-2 p-3.5 text-left transition-all ${density === id ? "border-blue-500 bg-blue-50" : "bg-white hover:border-gray-300"}`}
                    >
                        <span
                            className={`text-xs font-bold ${density === id ? "text-blue-600" : "text-gray-700"}`}
                        >
                            {label}
                        </span>
                        <span className="text-xs text-gray-400">{sub}</span>
                    </button>
                ))}
            </div>
            <SectionTitle>Font</SectionTitle>
            <div className="mb-6 divide-y divide-gray-100 overflow-hidden rounded-md border px-5">
                <FieldRow
                    label="Interface font"
                    hint="Applied across the entire app"
                >
                    <Select
                        value={font}
                        onValueChange={(v: FontId) => {
                            setFont(v);
                            setDirty(true);
                        }}
                    >
                        <SelectTrigger className="h-8 w-44 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="system">
                                System default
                            </SelectItem>
                            <SelectItem value="geist">Geist</SelectItem>
                            <SelectItem value="ibm">IBM Plex Sans</SelectItem>
                            <SelectItem value="jetbrains">
                                JetBrains Mono
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </FieldRow>
            </div>
            <SaveBar
                dirty={dirty}
                onSave={() => setDirty(false)}
                onDiscard={() => setDirty(false)}
            />
        </div>
    );
}

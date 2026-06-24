"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import ProjectColorPicker from "../../projectColorPicker/ProjectColorPicker";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { PROJECT_COLORS, PROJECT_ICONS } from "@/constants/constants";
import { cn } from "@/libs/utils";
import { useState } from "react";
import { BaseAction } from "@/types/actions";

interface IconSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
}

export default function IconSection({
    formState,
    isPending,
}: Readonly<IconSectionProps>) {
    const [icon, setIcon] = useState<string>("🚀");
    const [projectColor, setProjectColor] = useState<string>(PROJECT_COLORS[0]);
    const [iconPickerOpen, setIconPickerOpen] = useState<boolean>(false);

    return (
        <div className="relative space-y-1">
            <h3 className="font-semibold">Project icon</h3>
            <div className="relative flex items-start gap-6">
                <div className="flex items-start gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setIconPickerOpen(!iconPickerOpen);
                        }}
                        className="relative flex size-14 items-center justify-center rounded-md border text-2xl transition-all hover:brightness-95"
                        style={{
                            background: `${projectColor}15`,
                            borderColor: `${projectColor}30`,
                        }}
                        disabled={isPending}
                    >
                        {icon}
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-bright-blue">
                            <PencilSimpleIcon
                                weight="duotone"
                                size={9}
                                className="text-white"
                            />
                        </span>
                    </button>
                    <ProjectColorPicker
                        projectColor={projectColor}
                        onProjectColorChange={setProjectColor}
                        isPending={isPending}
                    />
                </div>
            </div>
            <ZodErrors error={formState?.zodErrors?.icon} />
            <ZodErrors error={formState?.zodErrors?.color} />
            {iconPickerOpen && (
                <div className="flex flex-wrap gap-1.5 rounded-md border bg-gray-50 p-3">
                    {PROJECT_ICONS.map((projectIcon) => (
                        <button
                            type="button"
                            key={projectIcon}
                            onClick={() => {
                                setIcon(projectIcon);
                                setIconPickerOpen(false);
                            }}
                            className={cn(
                                "flex size-9 items-center justify-center rounded-md text-xl transition-all hover:bg-white",
                                icon === projectIcon
                                    ? "bg-white ring-2 ring-bright-blue"
                                    : "",
                            )}
                            disabled={isPending}
                        >
                            {projectIcon}
                        </button>
                    ))}
                </div>
            )}
            <input type="hidden" name="icon" value={icon} />
            <input type="hidden" name="color" value={projectColor} />
        </div>
    );
}

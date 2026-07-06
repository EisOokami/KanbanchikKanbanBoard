"use client";

import ProjectColorPicker from "../../projectColorPicker/ProjectColorPicker";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { useState } from "react";
import { BaseAction } from "@/types/actions";
import ProjectIconPicker from "../../projectIconPicker/ProjectIconPicker";

interface IconSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
}

export default function IconSection({
    formState,
    isPending,
}: Readonly<IconSectionProps>) {
    const [icon, setIcon] = useState<string>("🚀");
    const [projectColor, setProjectColor] = useState<string>("#3B82F6");

    return (
        <div className="relative space-y-1">
            <h3 className="font-semibold">Project icon</h3>
            <div className="relative flex items-start gap-6">
                <div className="flex items-start gap-3">
                    <ProjectIconPicker
                        projectIcon={icon}
                        projectColor={projectColor}
                        onProjectIconChange={setIcon}
                        isPending={isPending}
                    />
                    <ProjectColorPicker
                        projectColor={projectColor}
                        onProjectColorChange={setProjectColor}
                        isPending={isPending}
                    />
                </div>
            </div>
            <div>
                <ZodErrors error={formState?.zodErrors?.icon} />
                <ZodErrors error={formState?.zodErrors?.color} />
            </div>
            <input type="hidden" name="icon" value={icon} />
            <input type="hidden" name="color" value={projectColor} />
        </div>
    );
}

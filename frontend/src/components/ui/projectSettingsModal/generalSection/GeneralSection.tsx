"use client";

import { CheckIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Textarea } from "../../shadcn/textarea";
import { Input } from "../../shadcn/input";
import {
    PROJECT_COLORS,
    PROJECT_ICONS,
    STATUS_CONFIG,
} from "@/constants/constants";
import { useState } from "react";
import { Status } from "@/types/types";
import { cn } from "@/libs/utils";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface GeneralSectionProps {
    icon: string;
    color: string;
    name: string;
    description: string;
    status: Status;
    formState: BaseAction | undefined;
    isPending: boolean;
    onIconChange: (iconValue: string) => void;
    onColorChange: (colorValue: string) => void;
    onNameChange: (nameValue: string) => void;
    onDescriptionChange: (descriptionValue: string) => void;
    onStatusChange: (status: Status) => void;
}

export default function GeneralSection({
    icon,
    color,
    name,
    description,
    status,
    formState,
    isPending,
    onIconChange,
    onColorChange,
    onNameChange,
    onDescriptionChange,
    onStatusChange,
}: Readonly<GeneralSectionProps>) {
    const [iconPickerOpen, setIconPickerOpen] = useState<boolean>(false);
    const [colorPickerOpen, setColorPickerOpen] = useState<boolean>(false);

    return (
        <div className="space-y-5">
            <div className="flex items-start gap-6">
                <div className="space-y-2">
                    <h3 className="font-semibold">Project Icon</h3>
                    <div className="flex items-start gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIconPickerOpen(!iconPickerOpen);
                                setColorPickerOpen(false);
                            }}
                            className="relative flex size-14 items-center justify-center rounded-md border text-2xl transition-all hover:brightness-95"
                            style={{
                                background: `${color}15`,
                                borderColor: `${color}30`,
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
                        <button
                            type="button"
                            onClick={() => {
                                setColorPickerOpen(!colorPickerOpen);
                                setIconPickerOpen(false);
                            }}
                            className="relative flex size-14 items-center justify-center rounded-md border transition-all hover:brightness-95"
                            style={{
                                background: `${color}20`,
                                borderColor: `${color}40`,
                            }}
                            disabled={isPending}
                        >
                            <div
                                className="size-6 rounded-full shadow-sm"
                                style={{
                                    background: color,
                                }}
                            />
                            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-bright-blue">
                                <PencilSimpleIcon
                                    weight="duotone"
                                    size={9}
                                    className="text-white"
                                />
                            </span>
                        </button>
                    </div>
                    <ZodErrors error={formState?.zodErrors?.icon} />
                    <ZodErrors error={formState?.zodErrors?.color} />
                </div>
            </div>
            {iconPickerOpen && (
                <div className="flex flex-wrap gap-1.5 rounded-md border bg-gray-50 p-3">
                    {PROJECT_ICONS.map((projectIcon) => (
                        <button
                            type="button"
                            key={projectIcon}
                            onClick={() => {
                                onIconChange(projectIcon);
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
            {colorPickerOpen && (
                <div className="rounded-md border bg-gray-50 p-3">
                    <p className="mb-2.5 text-xs font-medium text-gray-500">
                        Select color
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {PROJECT_COLORS.map((projectIcon) => (
                            <button
                                type="button"
                                key={projectIcon}
                                onClick={() => {
                                    onColorChange(projectIcon);
                                    setColorPickerOpen(false);
                                }}
                                className={cn(
                                    "flex size-8 items-center justify-center rounded-full transition-all hover:brightness-90",
                                    color === projectIcon
                                        ? "ring-2 ring-offset-2"
                                        : "",
                                )}
                                style={{
                                    background: projectIcon,
                                    ...(color === projectIcon
                                        ? {
                                              ringColor: projectIcon,
                                          }
                                        : {}),
                                    outline:
                                        color === projectIcon
                                            ? `2px solid ${projectIcon}`
                                            : "none",
                                    outlineOffset:
                                        color === projectIcon ? "2px" : "0",
                                }}
                                disabled={isPending}
                            >
                                {color === projectIcon && (
                                    <CheckIcon
                                        weight="duotone"
                                        size={13}
                                        className="text-white"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="space-y-1">
                <h3 className="font-semibold">Name</h3>
                <Input
                    value={name}
                    defaultValue={
                        formState?.formData?.get("name")?.toString() ??
                        undefined
                    }
                    onChange={(e) => onNameChange(e.target.value)}
                    className={cn(
                        "h-10 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue",
                        formState?.zodErrors?.name ? "border-red-500" : "",
                    )}
                    disabled={isPending}
                />
                <ZodErrors error={formState?.zodErrors?.name} />
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold">Description</h3>
                <Textarea
                    name="description"
                    value={description}
                    defaultValue={
                        formState?.formData?.get("description")?.toString() ??
                        undefined
                    }
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    rows={4}
                    className={cn(
                        "resize-none rounded-md text-xs placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue",
                        formState?.zodErrors?.description
                            ? "border-red-500"
                            : "",
                    )}
                    disabled={isPending}
                />
                <p className="mt-1 text-xs text-gray-500">
                    {description ? description.length : 0}
                    /500
                </p>
                <ZodErrors error={formState?.zodErrors?.description} />
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold">Status</h3>
                <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(STATUS_CONFIG) as Status[]).map(
                        (statusConfig) => (
                            <button
                                key={statusConfig}
                                type="button"
                                onClick={() => onStatusChange(statusConfig)}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium transition-all hover:bg-muted",
                                    status === statusConfig
                                        ? "bg-muted ring-1 ring-border"
                                        : "opacity-60 hover:opacity-100",
                                )}
                                disabled={isPending}
                            >
                                <span
                                    className="size-1.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            STATUS_CONFIG[statusConfig].dot,
                                    }}
                                />
                                {STATUS_CONFIG[statusConfig].label}
                            </button>
                        ),
                    )}
                </div>
                <ZodErrors error={formState?.zodErrors?.status} />
            </div>
        </div>
    );
}

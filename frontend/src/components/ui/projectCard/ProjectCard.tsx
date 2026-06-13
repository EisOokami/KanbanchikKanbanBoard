"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/shadcn/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/shadcn/avatar";
import { Progress } from "@/components/ui/shadcn/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { ProjectSettingsDialog } from "../projectSettingsDialog/ProjectSettingsDialog";
import { useState } from "react";
import { Project } from "@/types/types";
import { STATUS_CONFIG } from "@/constants/constants";
import { convertToSlug, getInitials } from "@/libs/utils";
import {
    ArchiveIcon,
    CheckSquareIcon,
    DotsThreeOutlineIcon,
    PencilSimpleIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

interface ProjectCardProps {
    project: Project;
    onDelete: (id: number) => void;
}

export default function ProjectCard({
    project,
    onDelete,
}: Readonly<ProjectCardProps>) {
    const [showProjectSettings, setShowProjectSettings] =
        useState<boolean>(false);

    const status = STATUS_CONFIG[project.status];
    const visibleMembers = project.members.slice(0, 3);
    const extraMembers = project.members.length - 3;
    const progress = Math.round(
        ((project.tasks_done ?? 0) * 100) / (project.tasks_total ?? 1),
    );

    const handleShopProjectSettings = () => {
        setShowProjectSettings(!showProjectSettings);
    };

    return (
        <>
            <Link
                href={`/board/${convertToSlug(project.name)}?id=${project.id}`}
                className="grid"
            >
                <Card className="group relative flex flex-col overflow-hidden border border-border/60 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
                    <CardHeader className="flex-row items-start justify-between gap-2 px-3 pb-0 pt-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div
                                className="mt-0.5 flex size-9 flex-shrink-0 items-center justify-center rounded-lg font-bold text-white"
                                style={{
                                    background: project.color + "30",
                                    color: project.color,
                                }}
                            >
                                <span className="text-lg">{project.icon}</span>
                            </div>
                            <div className="min-w-0">
                                <h3 className="max-w-[180px] truncate text-sm font-medium leading-tight text-foreground">
                                    {project.name}
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="size-1.5 flex-shrink-0 rounded-full"
                                        style={{
                                            backgroundColor: status.dot,
                                        }}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {status.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    asChild
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <button className="rounded p-1 transition-colors hover:bg-accent">
                                        <DotsThreeOutlineIcon
                                            weight="duotone"
                                            className="size-4 text-muted-foreground"
                                        />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-44"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <DropdownMenuItem
                                        onClick={handleShopProjectSettings}
                                    >
                                        <PencilSimpleIcon
                                            weight="duotone"
                                            className="size-4"
                                        />{" "}
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <ArchiveIcon
                                            weight="duotone"
                                            className="size-4"
                                        />{" "}
                                        Archive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => onDelete(project.id)}
                                    >
                                        <TrashIcon
                                            weight="duotone"
                                            className="size-4"
                                        />{" "}
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="flex h-full flex-1 flex-col justify-between gap-3 p-3">
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {project.description}
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs">Progress</span>
                                <span className="text-xs font-medium tabular-nums">
                                    {progress}%
                                </span>
                            </div>
                            <Progress
                                value={progress}
                                className="h-1.5 [&>*]:bg-bright-blue"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t border-border/50 p-3">
                        <div className="flex items-center">
                            <div className="flex -space-x-2">
                                {visibleMembers.map((m) => (
                                    <Avatar
                                        key={m.id}
                                        className="size-6 border-2 border-background"
                                    >
                                        <AvatarImage src={m.avatar_url} />
                                        <AvatarFallback
                                            className="text-[9px] font-semibold"
                                            style={{
                                                background:
                                                    project.color + "33",
                                                color: project.color,
                                            }}
                                        >
                                            {getInitials(m.name, m.surname)}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                            {extraMembers > 0 && (
                                <span className="ml-1 text-[10px] text-muted-foreground">
                                    +{extraMembers}
                                </span>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CheckSquareIcon
                                    weight="duotone"
                                    className="size-3.5 flex-shrink-0"
                                />
                                <span>
                                    {project.tasks_done
                                        ? project.tasks_done
                                        : 0}
                                    /
                                    {project.tasks_total
                                        ? project.tasks_total
                                        : 0}{" "}
                                    tasks
                                </span>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </Link>
            <ProjectSettingsDialog
                open={showProjectSettings}
                onOpenChange={handleShopProjectSettings}
                projectData={project}
                columnsData={project.columns}
            />
        </>
    );
}

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
import ProjectSettingsModal from "../projectSettingsModal/ProjectSettingsModal";
import { useState } from "react";
import { Project, User } from "@/types/types";
import { STATUS_CONFIG } from "@/constants/constants";
import { getInitials } from "@/libs/utils";
import {
    CheckSquareIcon,
    DotsThreeOutlineIcon,
    PencilSimpleIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "../shadcn/button";

interface ProjectCardProps {
    projectData: Project;
    userData: User;
    onDelete: (slug: string) => void;
}

export default function ProjectCard({
    projectData,
    userData,
    onDelete,
}: Readonly<ProjectCardProps>) {
    const [showProjectSettings, setShowProjectSettings] =
        useState<boolean>(false);

    const status = STATUS_CONFIG[projectData.status];
    const visibleMembers = projectData.members.slice(0, 3);
    const extraMembers = projectData.members.length - 3;
    const progress = Math.round(
        ((projectData.tasks_done ? projectData.tasks_done : 0) * 100) /
            (projectData.tasks_total ? projectData.tasks_total : 1),
    );
    const updatedUserData = {
        ...userData,
        role: projectData.members.find((member) => member.id === userData.id)
            ?.role,
    };
    const hasPermission =
        updatedUserData.role === "admin" || updatedUserData.role === "owner";

    const handleShopProjectSettings = () => {
        setShowProjectSettings(!showProjectSettings);
    };

    return (
        <>
            <Link href={`/project/${projectData.slug}`} className="grid">
                <Card className="group relative flex flex-col overflow-hidden border border-border bg-card shadow-sm transition-all duration-200 hover:bg-card-active hover:shadow-md">
                    <CardHeader className="flex-row items-start justify-between gap-2 px-3 pb-0 pt-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div
                                className="mt-0.5 flex size-9 flex-shrink-0 items-center justify-center rounded-lg font-bold text-white"
                                style={{
                                    background: projectData.color + "30",
                                    color: projectData.color,
                                }}
                            >
                                <span className="text-lg">
                                    {projectData.icon}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <h3 className="max-w-[180px] truncate text-sm font-medium leading-tight text-foreground">
                                    {projectData.name}
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
                        {hasPermission && (
                            <div className="flex flex-shrink-0 items-center gap-1">
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        asChild
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 text-control-text transition-colors hover:bg-control-active"
                                        >
                                            <DotsThreeOutlineIcon
                                                weight="duotone"
                                                className="text-muted-foreground"
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-44 border-border bg-background-secondary"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        <DropdownMenuItem
                                            onClick={handleShopProjectSettings}
                                            className="hover:!bg-control-active"
                                        >
                                            <PencilSimpleIcon
                                                weight="duotone"
                                                className="size-4"
                                            />{" "}
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-500 hover:!bg-control-active focus:text-red-500 dark:text-red-400 dark:focus:text-red-400"
                                            onClick={() =>
                                                onDelete(projectData.slug)
                                            }
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
                        )}
                    </CardHeader>
                    <CardContent className="flex h-full flex-1 flex-col justify-between gap-3 p-3">
                        <p className="line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground">
                            {projectData.description}
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
                    <CardFooter className="flex items-center justify-between border-t border-border p-3">
                        <div className="flex items-center">
                            <div className="flex -space-x-2">
                                {visibleMembers.map((member) => (
                                    <Avatar
                                        key={member.id}
                                        className="size-6 border-2 border-background"
                                    >
                                        <AvatarImage src={member.avatar_url} />
                                        <AvatarFallback
                                            className="text-[9px] font-semibold text-white"
                                            style={{
                                                background: member.color,
                                            }}
                                        >
                                            {getInitials(
                                                member.name,
                                                member.surname,
                                            )}
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
                                    {projectData.tasks_done
                                        ? projectData.tasks_done
                                        : 0}
                                    /
                                    {projectData.tasks_total
                                        ? projectData.tasks_total
                                        : 0}{" "}
                                    tasks
                                </span>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </Link>
            {hasPermission && (
                <ProjectSettingsModal
                    open={showProjectSettings}
                    onOpenChange={handleShopProjectSettings}
                    projectData={projectData}
                    columnsData={projectData.columns}
                    userData={updatedUserData}
                />
            )}
        </>
    );
}

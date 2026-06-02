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
import {
    MoreHorizontal,
    Star,
    Archive,
    Pencil,
    Trash2,
    CheckSquare,
} from "lucide-react";
import { ProjectSettingsDialog } from "../projectSettingsDialog/ProjectSettingsDialog";
import { useState } from "react";

type Priority = "low" | "medium" | "high" | "critical";
type Status = "active" | "paused" | "completed" | "archived";

interface Member {
    id: string;
    name: string;
    avatar?: string;
}

interface Project {
    id: string;
    name: string;
    icon: string;
    description: string;
    status: Status;
    priority: Priority;
    progress: number;
    tasksTotal: number;
    tasksDone: number;
    members: Member[];
    dueDate: string;
    color: string;
    starred: boolean;
}

function initials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}

const STATUS_CONFIG: Record<Status, { label: string; dot: string }> = {
    active: { label: "Active", dot: "bg-emerald-500" },
    paused: { label: "Paused", dot: "bg-amber-400" },
    completed: { label: "Completed", dot: "bg-blue-400" },
    archived: { label: "Archived", dot: "bg-slate-400" },
};

export default function ProjectCard({
    project,
    onStar,
    onDelete,
}: {
    project: Project;
    onStar: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const [showProjectSettings, setShowProjectSettings] =
        useState<boolean>(false);

    const status = STATUS_CONFIG[project.status];
    const visibleMembers = project.members.slice(0, 3);
    const extraMembers = project.members.length - 3;

    const handleShopProjectSettings = () => {
        setShowProjectSettings(!showProjectSettings);
    };

    return (
        <>
            <Card className="group relative flex flex-col overflow-hidden border border-border/60 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
                <CardHeader className="flex-row items-start justify-between gap-2 px-5 pb-3 pt-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            className="mt-0.5 flex size-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                            style={{
                                background: project.color + "22",
                                color: project.color,
                            }}
                        >
                            <span>{project.icon}</span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="max-w-[180px] truncate text-sm font-semibold leading-tight text-foreground">
                                {project.name}
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <span
                                    className={`size-1.5 flex-shrink-0 rounded-full ${status.dot}`}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {status.label}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                        <button
                            onClick={() => onStar(project.id)}
                            className="rounded p-1 transition-colors hover:bg-accent"
                        >
                            {project.starred ? (
                                <Star className="size-4 fill-amber-400 text-amber-400" />
                            ) : (
                                <Star className="size-4 text-muted-foreground" />
                            )}
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="rounded p-1 transition-colors hover:bg-accent">
                                    <MoreHorizontal className="size-4 text-muted-foreground" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                    onClick={handleShopProjectSettings}
                                >
                                    <Pencil className="size-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Archive className="size-4" /> Archive
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => onDelete(project.id)}
                                >
                                    <Trash2 className="size-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4 px-5 pb-4">
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {project.description}
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                Progress
                            </span>
                            <span className="text-xs font-medium tabular-nums">
                                {project.progress}%
                            </span>
                        </div>
                        <Progress
                            value={project.progress}
                            className="h-1.5 [&>*]:bg-bright-blue"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t border-border/50 px-5 py-3">
                    <div className="flex items-center">
                        <div className="flex -space-x-2">
                            {visibleMembers.map((m) => (
                                <Avatar
                                    key={m.id}
                                    className="size-6 border-2 border-background"
                                >
                                    {m.avatar && <AvatarImage src={m.avatar} />}
                                    <AvatarFallback
                                        className="text-[9px] font-semibold"
                                        style={{
                                            background: project.color + "33",
                                            color: project.color,
                                        }}
                                    >
                                        {initials(m.name)}
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
                            <CheckSquare className="size-3.5 flex-shrink-0" />
                            <span>
                                {project.tasksDone}/{project.tasksTotal} tasks
                            </span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
            <ProjectSettingsDialog
                open={showProjectSettings}
                onOpenChange={handleShopProjectSettings}
            />
        </>
    );
}

import {
    TEAM_COLORS,
    TEAM_NAMES,
    TYPE_CONFIG,
} from "@/constants/notifications";
import { timeAgo } from "@/libs/notifications";
import { Notification, TypeConfig } from "@/types/notifications";
import {
    Archive,
    ArrowUpRight,
    Bell,
    CheckCheck,
    Circle,
    Star,
    Trash2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip";
import { ScrollArea } from "../shadcn/scroll-area";
import { Avatar, AvatarFallback } from "../shadcn/avatar";
import { Button } from "../shadcn/button";

interface DetailPanelProps {
    notif: Notification | null;
    onRead: (id: number) => void;
    onArchive: (id: number) => void;
    onDelete: (id: number) => void;
    onPin: (id: number) => void;
}

export default function DetailPanel({
    notif,
    onRead,
    onArchive,
    onDelete,
    onPin,
}: DetailPanelProps) {
    if (!notif) {
        return (
            <div className="flex flex-1 select-none flex-col items-center justify-center text-gray-300">
                <Bell className="mb-3 size-12 opacity-25" />
                <p className="text-sm font-semibold text-gray-400">
                    No notification selected
                </p>
                <p className="mt-1 text-xs text-gray-300">
                    Click a notification to read it here
                </p>
            </div>
        );
    }

    const cfg: TypeConfig = TYPE_CONFIG[notif.type];
    const Icon = cfg.icon;

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b px-8 py-4">
                <div className="flex items-center gap-2">
                    <span
                        className={`rounded-md px-2.5 py-1 text-xs font-bold ${cfg.bg} ${cfg.text} flex items-center gap-1.5`}
                    >
                        <Icon className="size-3" />
                        {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400">
                        {timeAgo(notif.time)}
                    </span>
                    {notif.pinned && (
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onPin(notif.id)}
                                className="rounded-md p-2 transition-colors hover:bg-gray-100"
                            >
                                <Star
                                    className={`size-4 ${notif.pinned ? "fill-amber-400 text-amber-400" : "text-gray-400"}`}
                                />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {notif.pinned ? "Unpin" : "Pin"}
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onRead(notif.id)}
                                className="rounded-md p-2 transition-colors hover:bg-gray-100"
                            >
                                {notif.read ? (
                                    <Circle className="size-4 text-gray-400" />
                                ) : (
                                    <CheckCheck className="size-4 text-bright-blue" />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {notif.read ? "Mark unread" : "Mark read"}
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onArchive(notif.id)}
                                className="rounded-md p-2 transition-colors hover:bg-gray-100"
                            >
                                <Archive className="size-4 text-gray-400" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Archive</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onDelete(notif.id)}
                                className="rounded-md p-2 transition-colors hover:bg-rose-50"
                            >
                                <Trash2 className="size-4 text-gray-400 hover:text-rose-500" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="px-8 py-6">
                    {notif.actor && (
                        <div className="mb-5 flex items-center gap-3">
                            <Avatar className="size-10">
                                <AvatarFallback
                                    className={`text-xs font-bold text-white ${TEAM_COLORS[notif.actor]}`}
                                >
                                    {notif.actor}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">
                                    {TEAM_NAMES[notif.actor]}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(notif.time).toLocaleDateString(
                                        "en-US",
                                        {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                        },
                                    )}
                                    {" · "}
                                    {new Date(notif.time).toLocaleTimeString(
                                        "en-US",
                                        { hour: "2-digit", minute: "2-digit" },
                                    )}
                                </p>
                            </div>
                        </div>
                    )}
                    <h2 className="mb-3 text-base font-bold leading-snug text-gray-800">
                        {notif.title}
                    </h2>
                    <div className="mb-5 rounded-md border bg-gray-50 p-4">
                        <p className="text-sm leading-relaxed text-gray-600">
                            {notif.body}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="w-20 text-xs font-semibold text-gray-400">
                                Project
                            </span>
                            <span
                                className="rounded-md px-2.5 py-1 text-xs font-semibold"
                                style={{
                                    background: `${notif.projectColor}18`,
                                    color: notif.projectColor,
                                }}
                            >
                                {notif.project}
                            </span>
                        </div>
                        {notif.task && (
                            <div className="flex items-center gap-3">
                                <span className="w-20 text-xs font-semibold text-gray-400">
                                    Task
                                </span>
                                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    {notif.task}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="w-20 text-xs font-semibold text-gray-400">
                                Type
                            </span>
                            <span
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
                            >
                                {cfg.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-20 text-xs font-semibold text-gray-400">
                                Status
                            </span>
                            <span
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${notif.read ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-bright-blue"}`}
                            >
                                {notif.read ? "Read" : "Unread"}
                            </span>
                        </div>
                    </div>
                    {notif.action && (
                        <div className="mt-6">
                            <Button className="w-full gap-2 bg-bright-blue text-sm hover:bg-blue-600">
                                {notif.action}
                                <ArrowUpRight className="size-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

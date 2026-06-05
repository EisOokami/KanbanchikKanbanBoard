import { TEAM_COLORS, TYPE_CONFIG } from "@/constants/notifications";
import { Notification, TypeConfig } from "@/types/notifications";
import { Avatar, AvatarFallback } from "../shadcn/avatar";
import { timeAgo } from "@/libs/notifications";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip";
import { Archive, CheckCheck, Circle, Star, Trash2 } from "lucide-react";

interface NotifRowProps {
    notif: Notification;
    selected: boolean;
    onSelect: (id: number) => void;
    onRead: (id: number) => void;
    onArchive: (id: number) => void;
    onDelete: (id: number) => void;
    onPin: (id: number) => void;
}

export default function NotifRow({
    notif,
    selected,
    onSelect,
    onRead,
    onArchive,
    onDelete,
    onPin,
}: NotifRowProps) {
    const cfg: TypeConfig = TYPE_CONFIG[notif.type];
    const Icon = cfg.icon;

    return (
        <div
            onClick={() => onSelect(notif.id)}
            className={`
                group relative flex cursor-pointer gap-3 border-b px-8 py-3.5
                transition-all duration-150 last:border-0
                ${selected ? "border-l-2 border-l-bright-blue bg-blue-50/70" : "border-l-2 border-l-transparent hover:bg-gray-50"}
                ${!notif.read && !selected ? "bg-white" : ""}
            `}
        >
            {!notif.read && (
                <span className="absolute left-3 top-1/2 size-2 flex-shrink-0 -translate-y-1/2 rounded-full bg-bright-blue" />
            )}
            <div className="mt-0.5 flex-shrink-0">
                {notif.actor ? (
                    <div className="relative">
                        <Avatar className="size-8">
                            <AvatarFallback
                                className={`text-[10px] font-bold text-white ${TEAM_COLORS[notif.actor]}`}
                            >
                                {notif.actor}
                            </AvatarFallback>
                        </Avatar>
                        <span
                            className={`absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full ${cfg.bg}`}
                        >
                            <Icon className={`size-2.5 ${cfg.text}`} />
                        </span>
                    </div>
                ) : (
                    <div
                        className={`flex size-8 items-center justify-center rounded-full ${cfg.bg}`}
                    >
                        <Icon className={`size-4 ${cfg.text}`} />
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p
                        className={`text-xs leading-snug ${notif.read ? "font-medium text-gray-500" : "font-semibold text-gray-800"}`}
                    >
                        {notif.title}
                    </p>
                    <span className="mt-0.5 flex-shrink-0 text-[10px] text-gray-400">
                        {timeAgo(notif.time)}
                    </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-400">
                    {notif.body}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                    <span
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{
                            background: `${notif.projectColor}18`,
                            color: notif.projectColor,
                        }}
                    >
                        {notif.project}
                    </span>
                    {notif.pinned && (
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                    )}
                </div>
            </div>
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-gray-100 opacity-0 transition-opacity group-hover:opacity-100">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={(
                                e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                                e.stopPropagation();
                                onRead(notif.id);
                            }}
                            className="rounded p-1 transition-colors hover:bg-gray-200"
                        >
                            {notif.read ? (
                                <Circle className="size-3 text-gray-400" />
                            ) : (
                                <CheckCheck className="size-3 text-bright-blue" />
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                        {notif.read ? "Mark unread" : "Mark read"}
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={(
                                e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                                e.stopPropagation();
                                onPin(notif.id);
                            }}
                            className="rounded p-1 transition-colors hover:bg-gray-200"
                        >
                            <Star
                                className={`size-3 ${notif.pinned ? "fill-amber-400 text-amber-400" : "text-gray-400"}`}
                            />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                        {notif.pinned ? "Unpin" : "Pin"}
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={(
                                e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                                e.stopPropagation();
                                onArchive(notif.id);
                            }}
                            className="rounded p-1 transition-colors hover:bg-gray-200"
                        >
                            <Archive className="size-3 text-gray-400" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                        Archive
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={(
                                e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                                e.stopPropagation();
                                onDelete(notif.id);
                            }}
                            className="rounded p-1 transition-colors hover:bg-rose-100"
                        >
                            <Trash2 className="size-3 text-gray-400 hover:text-rose-500" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                        Delete
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}

"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
} from "@/components/ui/shadcn/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import {
    CheckCheck,
    Trash2,
    Search,
    Settings,
    RefreshCw,
    X,
    SlidersHorizontal,
    Inbox,
} from "lucide-react";
import {
    Notification,
    NotificationGroup,
    NotificationType,
    TabValue,
    TypeConfig,
} from "@/types/notifications";
import { initialNotifications, TYPE_CONFIG } from "@/constants/notifications";
import { groupByDate } from "@/libs/notifications";
import NotifRow from "@/components/ui/notifRow/NotifRow";
import DetailPanel from "@/components/ui/detailPanel/DetailPanel";

export default function Notifications() {
    const [items, setItems] = useState<Notification[]>(initialNotifications);
    const [selectedId, setSelectedId] = useState<number | null>(1);
    const [tab, setTab] = useState<TabValue>("all");
    const [search, setSearch] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<NotificationType[]>([]);

    const unreadCount: number = items.filter(
        (n) => !n.read && !n.archived,
    ).length;
    const pinnedCount: number = items.filter(
        (n) => n.pinned && !n.archived,
    ).length;

    const mutate = (id: number, patch: Partial<Notification>): void =>
        setItems((prev) =>
            prev.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        );

    const markRead = (id: number): void => mutate(id, { read: true });

    const toggleRead = (id: number): void => {
        const current = items.find((n) => n.id === id);
        if (current) mutate(id, { read: !current.read });
    };

    const togglePin = (id: number): void => {
        const current = items.find((n) => n.id === id);
        if (current) mutate(id, { pinned: !current.pinned });
    };

    const archiveOne = (id: number): void => mutate(id, { archived: true });

    const deleteOne = (id: number): void => {
        setItems((prev) => prev.filter((n) => n.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const markAllRead = (): void =>
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));

    const clearAll = (): void => {
        setItems((prev) => prev.filter((n) => n.pinned));
        setSelectedId(null);
    };

    const handleSelect = (id: number): void => {
        setSelectedId(id);
        markRead(id);
    };

    const filtered: Notification[] = useMemo(() => {
        return items.filter((n) => {
            if (tab === "unread" && (n.read || n.archived)) return false;
            if (tab === "pinned" && (!n.pinned || n.archived)) return false;
            if (tab === "archived" && !n.archived) return false;
            if (tab === "all" && n.archived) return false;
            if (typeFilter.length && !typeFilter.includes(n.type)) return false;
            if (
                search &&
                !n.title.toLowerCase().includes(search.toLowerCase()) &&
                !n.body.toLowerCase().includes(search.toLowerCase())
            )
                return false;
            return true;
        });
    }, [items, tab, typeFilter, search]);

    const grouped: NotificationGroup[] = groupByDate(filtered);
    const selected: Notification | null =
        items.find((n) => n.id === selectedId) ?? null;

    const toggleTypeFilter = (type: NotificationType): void =>
        setTypeFilter((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type],
        );

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-20 flex items-center gap-4 border-b bg-white px-8 py-4">
                <h1 className="text-xl font-semibold leading-none">
                    Notifications
                </h1>
                {unreadCount > 0 && (
                    <Badge className="h-5 bg-bright-blue px-2 text-xs text-white">
                        {unreadCount} new
                    </Badge>
                )}
                <div className="ml-auto flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllRead}
                                className="gap-1.5 text-xs text-gray-500 hover:text-bright-blue"
                            >
                                <CheckCheck className="size-3.5" /> Mark all
                                read
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark all as read</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className="gap-1.5 text-xs text-gray-500 hover:text-rose-500"
                            >
                                <Trash2 className="size-3.5" /> Clear all
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear all notifications</TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" className="h-5" />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400"
                            >
                                <Settings className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Notification settings</TooltipContent>
                    </Tooltip>
                </div>
            </header>
            <div className="flex max-h-[calc(100svh-69px)] min-h-0 flex-1">
                <div className="flex w-[380px] flex-shrink-0 flex-col border-r bg-white">
                    <div className="px-8 pt-4">
                        <Tabs
                            value={tab}
                            onValueChange={(v) => setTab(v as TabValue)}
                        >
                            <TabsList className="h-9 w-full bg-gray-100 p-1">
                                <TabsTrigger
                                    value="all"
                                    className="h-7 flex-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    All
                                </TabsTrigger>
                                <TabsTrigger
                                    value="unread"
                                    className="h-7 flex-1 gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Unread
                                    {unreadCount > 0 && (
                                        <span className="flex size-4 items-center justify-center rounded-full bg-bright-blue text-[9px] font-bold text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="pinned"
                                    className="h-7 flex-1 gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Pinned
                                    {pinnedCount > 0 && (
                                        <span className="text-[10px] font-bold text-amber-500">
                                            {pinnedCount}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="archived"
                                    className="h-7 flex-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Archive
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="flex gap-2 px-8 pb-4 pt-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-gray-400" />
                            <Input
                                value={search}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => setSearch(e.target.value)}
                                placeholder="Search notifications…"
                                className="h-8 pl-7 text-xs placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                    <X className="size-3 text-gray-400" />
                                </button>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-8 gap-1.5 px-2.5 text-xs ${typeFilter.length ? "border-blue-300 bg-blue-50 text-bright-blue" : "text-gray-500"}`}
                                >
                                    <SlidersHorizontal className="size-3" />
                                    {typeFilter.length
                                        ? `${typeFilter.length} types`
                                        : "Filter"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs text-gray-500">
                                    Filter by type
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {(
                                    Object.entries(TYPE_CONFIG) as [
                                        NotificationType,
                                        TypeConfig,
                                    ][]
                                ).map(([key, cfg]) => {
                                    const Icon = cfg.icon;
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={key}
                                            checked={typeFilter.includes(key)}
                                            onCheckedChange={() =>
                                                toggleTypeFilter(key)
                                            }
                                            className="gap-2 text-xs"
                                        >
                                            <Icon
                                                className={`size-3.5 ${cfg.text}`}
                                            />
                                            {cfg.label}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                                {typeFilter.length > 0 && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => setTypeFilter([])}
                                            className="text-xs text-gray-400"
                                        >
                                            Clear filters
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <ScrollArea className="flex-1">
                        {grouped.length === 0 ? (
                            <div className="flex h-48 flex-col items-center justify-center border-t text-gray-300">
                                <Inbox className="mb-2 size-10 opacity-40" />
                                <p className="text-sm font-semibold text-gray-400">
                                    Nothing here
                                </p>
                                <p className="mt-0.5 text-xs">
                                    No notifications match your filters
                                </p>
                            </div>
                        ) : (
                            grouped.map(({ label, items: groupItems }) => (
                                <div key={label}>
                                    <div className="sticky top-0 z-10 border-y bg-gray-50/80 px-8 py-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            {label}
                                        </span>
                                    </div>
                                    {groupItems.map((n) => (
                                        <NotifRow
                                            key={n.id}
                                            notif={n}
                                            selected={selectedId === n.id}
                                            onSelect={handleSelect}
                                            onRead={toggleRead}
                                            onArchive={archiveOne}
                                            onDelete={deleteOne}
                                            onPin={togglePin}
                                        />
                                    ))}
                                </div>
                            ))
                        )}
                    </ScrollArea>
                    <div className="flex items-center justify-between border-t px-8 py-2.5">
                        <span className="text-xs text-gray-400">
                            {filtered.length} notification
                            {filtered.length !== 1 ? "s" : ""}
                        </span>
                        <button className="flex items-center gap-1 text-xs font-semibold text-bright-blue hover:text-blue-600">
                            <RefreshCw className="size-3" /> Refresh
                        </button>
                    </div>
                </div>
                <div className="flex min-h-0 flex-1 flex-col bg-white">
                    <DetailPanel
                        notif={selected}
                        onRead={toggleRead}
                        onArchive={archiveOne}
                        onDelete={deleteOne}
                        onPin={togglePin}
                    />
                </div>
            </div>
        </div>
    );
}

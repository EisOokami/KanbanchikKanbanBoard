"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    CalendarCheck,
    CheckCircle2,
    Circle,
    Loader2,
    AlertCircle,
    LucideProps,
} from "lucide-react";
import { CreateTaskModal } from "@/components/ui/createTaskModal/CreateTaskModal";
import { TaskDetailsSheet } from "@/components/ui/taskDetailsSheet/TaskDetailsSheet";

type TeamMember = "AK" | "JS" | "MO" | "KL" | "NP";

type ProjectName =
    | "Design System"
    | "Marketing Q2"
    | "Backend API"
    | "Mobile App"
    | "Analytics"
    | "Onboarding";

type Priority = "critical" | "high" | "medium" | "low";

type Status = "todo" | "inprogress" | "review" | "done";

interface CalendarEvent {
    id: number;
    title: string;
    date: string;
    project: ProjectName;
    priority: Priority;
    status: Status;
    assignee: TeamMember;
    time: string;
}

interface TeamColorConfig {
    bg: string;
    hex: string;
}

interface ProjectConfig {
    color: string;
    emoji: string;
}

interface PriorityConfig {
    label: string;
    dot: string;
    text: string;
}

interface StatusConfig {
    label: string;
    icon: React.FC<LucideProps>;
    color: string;
}

const TEAM_COLORS: Record<TeamMember, TeamColorConfig> = {
    AK: { bg: "bg-blue-500", hex: "#6366f1" },
    JS: { bg: "bg-rose-500", hex: "#f43f5e" },
    MO: { bg: "bg-amber-500", hex: "#f59e0b" },
    KL: { bg: "bg-teal-500", hex: "#14b8a6" },
    NP: { bg: "bg-violet-500", hex: "#8b5cf6" },
};

const PROJECT_CONFIG: Record<ProjectName, ProjectConfig> = {
    "Design System": { color: "#6366f1", emoji: "🎨" },
    "Marketing Q2": { color: "#f59e0b", emoji: "📣" },
    "Backend API": { color: "#10b981", emoji: "⚙️" },
    "Mobile App": { color: "#ec4899", emoji: "📱" },
    Analytics: { color: "#0ea5e9", emoji: "📊" },
    Onboarding: { color: "#8b5cf6", emoji: "🚀" },
};

const PRIORITY_CONFIG: Record<Priority, PriorityConfig> = {
    critical: { label: "Critical", dot: "bg-rose-500", text: "text-rose-600" },
    high: { label: "High", dot: "bg-orange-400", text: "text-orange-600" },
    medium: { label: "Medium", dot: "bg-blue-400", text: "text-bright-blue" },
    low: { label: "Low", dot: "bg-gray-400", text: "text-gray-500" },
};

const STATUS_CONFIG: Record<Status, StatusConfig> = {
    todo: { label: "To Do", icon: Circle, color: "text-gray-400" },
    inprogress: {
        label: "In Progress",
        icon: Loader2,
        color: "text-blue-500",
    },
    review: { label: "In Review", icon: AlertCircle, color: "text-amber-500" },
    done: { label: "Done", icon: CheckCircle2, color: "text-emerald-500" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;

const seedEvents: CalendarEvent[] = [
    {
        id: 1,
        title: "Redesign onboarding flow",
        date: "2026-02-03",
        project: "Design System",
        priority: "high",
        status: "done",
        assignee: "AK",
        time: "09:00",
    },
    {
        id: 2,
        title: "API rate limiting middleware",
        date: "2026-02-07",
        project: "Backend API",
        priority: "critical",
        status: "done",
        assignee: "JS",
        time: "10:30",
    },
    {
        id: 3,
        title: "Dark mode toggle",
        date: "2026-02-10",
        project: "Design System",
        priority: "medium",
        status: "done",
        assignee: "MO",
        time: "14:00",
    },
    {
        id: 4,
        title: "Dashboard analytics widgets",
        date: "2026-02-14",
        project: "Analytics",
        priority: "medium",
        status: "review",
        assignee: "NP",
        time: "11:00",
    },
    {
        id: 5,
        title: "Fix broken image uploads",
        date: "2026-02-18",
        project: "Backend API",
        priority: "critical",
        status: "done",
        assignee: "KL",
        time: "09:30",
    },
    {
        id: 6,
        title: "Sprint #14 planning",
        date: "2026-02-20",
        project: "Design System",
        priority: "high",
        status: "done",
        assignee: "AK",
        time: "10:00",
    },
    {
        id: 7,
        title: "Component library audit",
        date: "2026-02-21",
        project: "Design System",
        priority: "low",
        status: "done",
        assignee: "MO",
        time: "13:00",
    },
    {
        id: 8,
        title: "Unit tests for auth module",
        date: "2026-02-24",
        project: "Backend API",
        priority: "medium",
        status: "inprogress",
        assignee: "JS",
        time: "09:00",
    },
    {
        id: 9,
        title: "Marketing landing page copy",
        date: "2026-02-25",
        project: "Marketing Q2",
        priority: "high",
        status: "inprogress",
        assignee: "NP",
        time: "11:30",
    },
    {
        id: 10,
        title: "Mobile nav pattern review",
        date: "2026-02-25",
        project: "Mobile App",
        priority: "medium",
        status: "todo",
        assignee: "AK",
        time: "14:00",
    },
    {
        id: 11,
        title: "GraphQL migration kickoff",
        date: "2026-02-26",
        project: "Backend API",
        priority: "critical",
        status: "inprogress",
        assignee: "KL",
        time: "09:00",
    },
    {
        id: 12,
        title: "Analytics export feature",
        date: "2026-02-27",
        project: "Analytics",
        priority: "high",
        status: "inprogress",
        assignee: "NP",
        time: "15:00",
    },
    {
        id: 13,
        title: "Design tokens documentation",
        date: "2026-02-28",
        project: "Design System",
        priority: "medium",
        status: "todo",
        assignee: "MO",
        time: "10:00",
    },
    {
        id: 14,
        title: "Sprint review & retrospective",
        date: "2026-02-28",
        project: "Backend API",
        priority: "high",
        status: "todo",
        assignee: "JS",
        time: "16:00",
    },
    {
        id: 15,
        title: "Email sequence setup",
        date: "2026-03-03",
        project: "Marketing Q2",
        priority: "medium",
        status: "todo",
        assignee: "NP",
        time: "09:00",
    },
    {
        id: 16,
        title: "iOS navigation overhaul",
        date: "2026-03-05",
        project: "Mobile App",
        priority: "high",
        status: "todo",
        assignee: "AK",
        time: "10:30",
    },
    {
        id: 17,
        title: "WebSocket support",
        date: "2026-03-05",
        project: "Backend API",
        priority: "critical",
        status: "todo",
        assignee: "JS",
        time: "14:00",
    },
    {
        id: 18,
        title: "Analytics dashboard launch",
        date: "2026-03-08",
        project: "Analytics",
        priority: "high",
        status: "todo",
        assignee: "KL",
        time: "11:00",
    },
    {
        id: 19,
        title: "Paid ads creative brief",
        date: "2026-03-10",
        project: "Marketing Q2",
        priority: "medium",
        status: "todo",
        assignee: "MO",
        time: "13:00",
    },
    {
        id: 20,
        title: "Design System 3.0 launch",
        date: "2026-03-15",
        project: "Design System",
        priority: "critical",
        status: "todo",
        assignee: "AK",
        time: "10:00",
    },
];

// let eventIdCounter = 21;

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function toDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayStr(): string {
    const d = new Date();
    return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

interface EventChipProps {
    event: CalendarEvent;
    onClick: (event: CalendarEvent) => void;
}

function EventChip({ event, onClick }: EventChipProps) {
    const proj: ProjectConfig = PROJECT_CONFIG[event.project] ?? {
        color: "#94a3b8",
        emoji: "📌",
    };
    const isDone = event.status === "done";

    return (
        <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onClick(event);
            }}
            className="flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-semibold transition-all hover:brightness-95"
            style={{
                background: `${proj.color}18`,
                color: isDone ? "#94a3b8" : proj.color,
                textDecoration: isDone ? "line-through" : "none",
                opacity: isDone ? 0.65 : 1,
            }}
            title={event.title}
        >
            <span className="flex-shrink-0 opacity-70">{event.time}</span>
            <span className="truncate">{event.title}</span>
        </button>
    );
}

interface DayCellProps {
    day: number;
    dateStr: string;
    events: CalendarEvent[];
    isToday: boolean;
    isSelected: boolean;
    isOtherMonth: boolean;
    onClick: (dateStr: string) => void;
}

function DayCell({
    day,
    dateStr,
    events,
    isToday,
    isSelected,
    isOtherMonth,
    onClick,
}: DayCellProps) {
    const visible = events.slice(0, 3);
    const overflow = events.length - 3;

    return (
        <div
            onClick={() => onClick(dateStr)}
            className={[
                "flex min-h-[110px] cursor-pointer flex-col gap-1 border-b border-r p-2 transition-colors",
                isOtherMonth ? "bg-gray-50/50" : "bg-white hover:bg-blue-50/25",
                isSelected
                    ? "bg-blue-50/50 ring-1 ring-inset ring-blue-300"
                    : "",
            ].join(" ")}
        >
            <div className="mb-0.5 flex items-center justify-between">
                <span
                    className={[
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                        isToday
                            ? "bg-bright-blue text-white"
                            : isOtherMonth
                              ? "text-gray-300"
                              : "text-gray-600",
                    ].join(" ")}
                >
                    {day}
                </span>
                {events.length > 0 && (
                    <span className="text-[9px] font-bold text-gray-400">
                        {events.length}
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
                {visible.map((ev) => (
                    <EventChip
                        key={ev.id}
                        event={ev}
                        onClick={() => onClick(dateStr)}
                    />
                ))}
                {overflow > 0 && (
                    <span className="pl-1.5 text-[10px] font-semibold text-gray-400">
                        +{overflow} more
                    </span>
                )}
            </div>
        </div>
    );
}

interface SidebarEventCardProps {
    event: CalendarEvent;
    onOpen: () => void;
    // onUpdate: (event: CalendarEvent) => void;
    // onDelete: (id: number) => void;
}

function SidebarEventCard({
    event,
    onOpen,
    // onUpdate
    // onDelete
}: SidebarEventCardProps) {
    const proj: ProjectConfig = PROJECT_CONFIG[event.project] ?? {
        color: "#94a3b8",
        emoji: "📌",
    };
    const priority: PriorityConfig = PRIORITY_CONFIG[event.priority];
    const isDone = event.status === "done";

    // const STATUS_ORDER: Status[] = ["todo", "inprogress", "review", "done"];

    // const cycleStatus = (): void => {
    //     const next: Status =
    //         STATUS_ORDER[
    //             (STATUS_ORDER.indexOf(event.status) + 1) % STATUS_ORDER.length
    //         ];
    //     onUpdate({ ...event, status: next });
    // };

    const StatusIcon = STATUS_CONFIG[event.status].icon;
    const statusColor = STATUS_CONFIG[event.status].color;

    return (
        <button
            className={`w-full rounded-md border p-3 text-left transition-all ${isDone ? "bg-gray-50/60 opacity-60" : "bg-white hover:border-blue-200 hover:shadow-sm"}`}
            onClick={onOpen}
        >
            <div className="flex items-start gap-2">
                <div
                    // onClick={cycleStatus}
                    className={`mt-0.5 flex-shrink-0 ${statusColor} transition-transform hover:scale-110`}
                    title="Click to advance status"
                >
                    <StatusIcon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p
                        className={`text-xs font-semibold leading-tight ${isDone ? "text-gray-400 line-through" : "text-gray-800"}`}
                    >
                        {event.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                            className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{
                                background: `${proj.color}15`,
                                color: proj.color,
                            }}
                        >
                            {proj.emoji} {event.project}
                        </span>
                        <span
                            className={`flex items-center gap-1 text-[10px] font-semibold ${priority.text}`}
                        >
                            <span
                                className={`size-1.5 rounded-full ${priority.dot}`}
                            />
                            {priority.label}
                        </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Clock className="size-3" /> {event.time}
                        </div>
                        <div className="flex items-center gap-1">
                            <Avatar className="size-5">
                                <AvatarFallback
                                    className={`text-[8px] font-bold text-white ${TEAM_COLORS[event.assignee]?.bg ?? "bg-gray-400"}`}
                                >
                                    {event.assignee}
                                </AvatarFallback>
                            </Avatar>
                            {/* <button
                                onClick={() => onDelete(event.id)}
                                className="rounded p-0.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
                            >
                                <X className="size-3" />
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </button>
    );
}

// type EventFormState = Omit<CalendarEvent, "id" | "date">;

// interface AddEventDialogProps {
//     dateStr: string;
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     onSave: (event: CalendarEvent) => void;
// }

// function AddEventDialog({
//     dateStr,
//     open,
//     onOpenChange,
//     onSave,
// }: AddEventDialogProps) {
//     const [form, setForm] = useState<EventFormState>({
//         title: "",
//         project: "Design System",
//         priority: "medium",
//         status: "todo",
//         assignee: "AK",
//         time: "09:00",
//     });

//     const up = <K extends keyof EventFormState>(
//         key: K,
//         value: EventFormState[K],
//     ): void => {
//         setForm((f) => ({ ...f, [key]: value }));
//     };

//     const handleSave = (): void => {
//         if (!form.title.trim()) return;
//         onSave({ ...form, id: eventIdCounter++, date: dateStr });
//         setForm({
//             title: "",
//             project: "Design System",
//             priority: "medium",
//             status: "todo",
//             assignee: "AK",
//             time: "09:00",
//         });
//     };

//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//             <DialogContent className="sm:max-w-sm">
//                 <DialogHeader>
//                     <DialogTitle className="text-sm font-bold">
//                         Add Task —{" "}
//                         {dateStr
//                             ? new Date(
//                                   dateStr + "T00:00:00",
//                               ).toLocaleDateString("en-US", {
//                                   month: "long",
//                                   day: "numeric",
//                                   year: "numeric",
//                               })
//                             : ""}
//                     </DialogTitle>
//                 </DialogHeader>
//                 <div className="space-y-3 py-1">
//                     <div className="space-y-1">
//                         <Label className="text-xs font-bold uppercase tracking-wide text-gray-500">
//                             Title
//                         </Label>
//                         <Input
//                             value={form.title}
//                             onChange={(
//                                 e: React.ChangeEvent<HTMLInputElement>,
//                             ) => up("title", e.target.value)}
//                             placeholder="Task name…"
//                             className="h-8 text-sm"
//                         />
//                     </div>
//                     <div className="grid grid-cols-2 gap-3">
//                         <div className="space-y-1">
//                             <Label className="text-xs font-bold uppercase tracking-wide text-gray-500">
//                                 Project
//                             </Label>
//                             <Select
//                                 value={form.project}
//                                 onValueChange={(v: ProjectName) =>
//                                     up("project", v)
//                                 }
//                             >
//                                 <SelectTrigger className="h-8 text-xs">
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {(
//                                         Object.keys(
//                                             PROJECT_CONFIG,
//                                         ) as ProjectName[]
//                                     ).map((p) => (
//                                         <SelectItem
//                                             key={p}
//                                             value={p}
//                                             className="text-xs"
//                                         >
//                                             {PROJECT_CONFIG[p].emoji} {p}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                         <div className="space-y-1">
//                             <Label className="text-xs font-bold uppercase tracking-wide text-gray-500">
//                                 Time
//                             </Label>
//                             <Input
//                                 value={form.time}
//                                 onChange={(
//                                     e: React.ChangeEvent<HTMLInputElement>,
//                                 ) => up("time", e.target.value)}
//                                 placeholder="09:00"
//                                 className="h-8 text-sm"
//                             />
//                         </div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-3">
//                         <div className="space-y-1">
//                             <Label className="text-xs font-bold uppercase tracking-wide text-gray-500">
//                                 Priority
//                             </Label>
//                             <Select
//                                 value={form.priority}
//                                 onValueChange={(v: Priority) =>
//                                     up("priority", v)
//                                 }
//                             >
//                                 <SelectTrigger className="h-8 text-xs">
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {(
//                                         Object.entries(PRIORITY_CONFIG) as [
//                                             Priority,
//                                             PriorityConfig,
//                                         ][]
//                                     ).map(([k, v]) => (
//                                         <SelectItem
//                                             key={k}
//                                             value={k}
//                                             className="text-xs"
//                                         >
//                                             {v.label}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                         <div className="space-y-1">
//                             <Label className="text-xs font-bold uppercase tracking-wide text-gray-500">
//                                 Assignee
//                             </Label>
//                             <div className="flex gap-1 pt-1.5">
//                                 {(Object.keys(TEAM_COLORS) as TeamMember[]).map(
//                                     (m) => (
//                                         <button
//                                             key={m}
//                                             onClick={() => up("assignee", m)}
//                                             className={`size-6 rounded-full text-[9px] font-bold text-white transition-all ${TEAM_COLORS[m].bg} ${form.assignee === m ? "scale-110 ring-2 ring-blue-400 ring-offset-1" : "opacity-40 hover:opacity-75"}`}
//                                         >
//                                             {m}
//                                         </button>
//                                     ),
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <DialogFooter>
//                     <Button
//                         variant="ghost"
//                         onClick={() => onOpenChange(false)}
//                         className="h-8 text-xs"
//                     >
//                         Cancel
//                     </Button>
//                     <Button
//                         disabled={!form.title.trim()}
//                         onClick={handleSave}
//                         className="h-8 bg-bright-blue text-xs hover:bg-blue-600"
//                     >
//                         Add Task
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// }

interface MiniCalendarProps {
    viewYear: number;
    viewMonth: number;
    selectedDate: string;
    onSelectDate: (dateStr: string) => void;
    eventDates: Set<string>;
}

function MiniCalendar({
    viewYear,
    viewMonth,
    selectedDate,
    onSelectDate,
    eventDates,
}: MiniCalendarProps) {
    const [mYear, setMYear] = useState<number>(viewYear);
    const [mMonth, setMMonth] = useState<number>(viewMonth);
    const daysInMonth = getDaysInMonth(mYear, mMonth);
    const firstDay = getFirstDayOfMonth(mYear, mMonth);
    const today = todayStr();

    const prev = (): void => {
        if (mMonth === 0) {
            setMMonth(11);
            setMYear((y) => y - 1);
        } else {
            setMMonth((m) => m - 1);
        }
    };

    const next = (): void => {
        if (mMonth === 11) {
            setMMonth(0);
            setMYear((y) => y + 1);
        } else {
            setMMonth((m) => m + 1);
        }
    };

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">
                    {MONTHS[mMonth].slice(0, 3)} {mYear}
                </span>
                <div className="flex gap-0.5">
                    <button
                        onClick={prev}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100"
                    >
                        <ChevronLeft className="size-3" />
                    </button>
                    <button
                        onClick={next}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100"
                    >
                        <ChevronRight className="size-3" />
                    </button>
                </div>
            </div>
            <div className="mb-1 grid grid-cols-7">
                {WEEKDAYS.map((d) => (
                    <div
                        key={d}
                        className="pb-1 text-center text-[9px] font-bold text-gray-400"
                    >
                        {d[0]}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day, i) => {
                    if (day === null) return <div key={`_${i}`} />;
                    const ds = toDateStr(mYear, mMonth, day);
                    const isT = ds === today;
                    const isSel = ds === selectedDate;
                    const hasEv = eventDates.has(ds);

                    return (
                        <button
                            key={ds}
                            onClick={() => onSelectDate(ds)}
                            className={[
                                "flex aspect-square flex-col items-center justify-center rounded-full text-[10px] font-semibold transition-all",
                                isT
                                    ? "bg-bright-blue text-white"
                                    : isSel
                                      ? "bg-blue-100 text-blue-600"
                                      : "text-gray-600 hover:bg-gray-100",
                            ].join(" ")}
                        >
                            {day}
                            {hasEv && !isT && (
                                <span className="-mt-0.5 h-1 w-1 rounded-full bg-blue-400" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

interface DaySidebarProps {
    dateStr: string;
    events: CalendarEvent[];
    onAddEvent: (event: CalendarEvent) => void;
    onUpdateEvent: (event: CalendarEvent) => void;
    onDeleteEvent: (id: number) => void;
}

type GroupedEvents = Record<Status, CalendarEvent[]>;

function DaySidebar({
    dateStr,
    events,
    // onAddEvent,
    // onUpdateEvent,
    // onDeleteEvent,
}: DaySidebarProps) {
    const [addOpen, setAddOpen] = useState<boolean>(false);
    const [openDetails, setOpenDetails] = useState<boolean>(false);

    const date = new Date(dateStr + "T00:00:00");
    const isToday = dateStr === todayStr();

    const grouped: GroupedEvents = {
        inprogress: events.filter((e) => e.status === "inprogress"),
        todo: events.filter((e) => e.status === "todo"),
        review: events.filter((e) => e.status === "review"),
        done: events.filter((e) => e.status === "done"),
    };

    return (
        <div className="flex w-72 flex-shrink-0 flex-col border-l">
            <div className="border-b px-4 py-4">
                <div className="mb-0.5 flex items-center gap-2">
                    <span
                        className={`text-3xl font-black leading-none ${isToday ? "text-bright-blue" : "text-gray-800"}`}
                    >
                        {date.getDate()}
                    </span>
                    {isToday && (
                        <span className="rounded-full border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                            Today
                        </span>
                    )}
                </div>
                <p className="text-xs font-medium text-gray-400">
                    {date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        year: "numeric",
                    })}
                </p>
            </div>
            <div className="border-b px-4 py-3">
                <Button
                    onClick={() => setAddOpen(true)}
                    size="sm"
                    className="h-8 w-full gap-1.5 bg-bright-blue text-xs hover:bg-blue-600"
                >
                    <Plus className="size-3.5" /> Add Task
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-5 px-4 py-3">
                    {events.length === 0 ? (
                        <div className="py-10 text-center text-gray-400">
                            <CalendarCheck className="mx-auto mb-2 size-8 opacity-25" />
                            <p className="text-xs font-medium">
                                No tasks scheduled
                            </p>
                            <p className="mt-0.5 text-xs text-gray-300">
                                Press &quot;Add Task&quot; to get started
                            </p>
                        </div>
                    ) : (
                        (
                            Object.entries(grouped) as [
                                Status,
                                CalendarEvent[],
                            ][]
                        ).map(([key, evts]) => {
                            if (!evts.length) return null;

                            const cfg: StatusConfig = STATUS_CONFIG[key];
                            const Icon = cfg.icon;

                            return (
                                <div key={key}>
                                    <div
                                        className={`mb-2 flex items-center gap-1.5 ${cfg.color}`}
                                    >
                                        <Icon className="size-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            {cfg.label}
                                        </span>
                                        <span className="ml-1 text-[10px] text-gray-300">
                                            ({evts.length})
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {evts.map((ev) => (
                                            <SidebarEventCard
                                                key={ev.id}
                                                event={ev}
                                                // onUpdate={onUpdateEvent}
                                                onOpen={() =>
                                                    setOpenDetails(true)
                                                }
                                                // onDelete={onDeleteEvent}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
            {/* <AddEventDialog
                dateStr={dateStr}
                open={addOpen}
                onOpenChange={setAddOpen}
                onSave={(ev: CalendarEvent) => {
                    onAddEvent(ev);
                    setAddOpen(false);
                }}
            /> */}
            <CreateTaskModal
                open={addOpen}
                onOpenChange={() => setAddOpen(!addOpen)}
                onSubmit={(data) => console.log(data)}
            />
            <TaskDetailsSheet
                open={openDetails}
                onOpenChange={() => setOpenDetails(false)}
                onSave={(updated) => console.log(updated)}
            />
        </div>
    );
}

interface GridCell {
    day: number;
    dateStr: string;
    isOtherMonth: boolean;
}

export default function Calendar() {
    const now = new Date();
    const [year, setYear] = useState<number>(now.getFullYear());
    const [month, setMonth] = useState<number>(now.getMonth());
    const [selectedDate, setSelected] = useState<string>(todayStr());
    const [events, setEvents] = useState<CalendarEvent[]>(seedEvents);
    const [filterProject, setFP] = useState<ProjectName | "all">("all");
    // const [filterAssignee, setFA] = useState<TeamMember | "all">("all");
    const [addOpen, setAddOpen] = useState<boolean>(false);

    const prevMonth = (): void => {
        if (month === 0) {
            setMonth(11);
            setYear((y) => y - 1);
        } else {
            setMonth((m) => m - 1);
        }
    };

    const nextMonth = (): void => {
        if (month === 11) {
            setMonth(0);
            setYear((y) => y + 1);
        } else {
            setMonth((m) => m + 1);
        }
    };

    const goToday = (): void => {
        setYear(now.getFullYear());
        setMonth(now.getMonth());
        setSelected(todayStr());
    };

    const filtered: CalendarEvent[] = useMemo(
        () =>
            events.filter((e) => {
                if (filterProject !== "all" && e.project !== filterProject)
                    return false;
                // if (filterAssignee !== "all" && e.assignee !== filterAssignee)
                //     return false;
                return true;
            }),
        [
            events,
            filterProject,
            // filterAssignee
        ],
    );

    const eventsByDate: Record<string, CalendarEvent[]> = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {};
        filtered.forEach((e) => {
            if (!map[e.date]) map[e.date] = [];
            map[e.date].push(e);
        });
        Object.values(map).forEach((arr) =>
            arr.sort((a, b) => a.time.localeCompare(b.time)),
        );
        return map;
    }, [filtered]);

    const eventDates: Set<string> = useMemo(
        () => new Set(filtered.map((e) => e.date)),
        [filtered],
    );

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);

    const cells: GridCell[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
        const d = prevMonthDays - i;
        const m2 = month === 0 ? 11 : month - 1;
        const y2 = month === 0 ? year - 1 : year;
        cells.push({
            day: d,
            dateStr: toDateStr(y2, m2, d),
            isOtherMonth: true,
        });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({
            day: d,
            dateStr: toDateStr(year, month, d),
            isOtherMonth: false,
        });
    }
    for (let d = 1; cells.length < 42; d++) {
        const m2 = month === 11 ? 0 : month + 1;
        const y2 = month === 11 ? year + 1 : year;
        cells.push({
            day: d,
            dateStr: toDateStr(y2, m2, d),
            isOtherMonth: true,
        });
    }

    const addEvent = (ev: CalendarEvent): void => setEvents((p) => [...p, ev]);

    const updateEvent = (updated: CalendarEvent): void =>
        setEvents((p) => p.map((e) => (e.id === updated.id ? updated : e)));

    const deleteEvent = (id: number): void =>
        setEvents((p) => p.filter((e) => e.id !== id));

    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthEvts = events.filter((e) => e.date.startsWith(monthStr));
    const doneCnt = monthEvts.filter((e) => e.status === "done").length;
    const progress = monthEvts.length
        ? Math.round((doneCnt / monthEvts.length) * 100)
        : 0;

    interface StatRow {
        label: string;
        value: number;
        color: string;
    }

    const statRows: StatRow[] = [
        {
            label: "Total tasks",
            value: monthEvts.length,
            color: "text-gray-700",
        },
        { label: "Completed", value: doneCnt, color: "text-emerald-600" },
        {
            label: "Remaining",
            value: monthEvts.length - doneCnt,
            color: "text-bright-blue",
        },
    ];

    return (
        <>
            <div className="flex h-screen overflow-hidden">
                <div className="flex w-56 flex-shrink-0 flex-col overflow-y-auto border-r bg-white">
                    <MiniCalendar
                        viewYear={year}
                        viewMonth={month}
                        selectedDate={selectedDate}
                        onSelectDate={setSelected}
                        eventDates={eventDates}
                    />
                    <Separator />
                    <div className="space-y-3 px-4 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            This Month
                        </p>
                        <div className="space-y-2">
                            {statRows.map(({ label, value, color }) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-xs text-gray-500">
                                        {label}
                                    </span>
                                    <span
                                        className={`text-xs font-bold ${color}`}
                                    >
                                        {value}
                                    </span>
                                </div>
                            ))}
                            {monthEvts.length > 0 && (
                                <div className="pt-0.5">
                                    <div className="mb-1 flex justify-between text-[10px] text-gray-400">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <Separator />
                    <div className="flex-1 px-4 py-4">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Projects
                        </p>
                        <div className="space-y-0.5">
                            <button
                                onClick={() => setFP("all")}
                                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${filterProject === "all" ? "bg-gray-100 font-semibold text-gray-700" : "text-gray-500 hover:bg-gray-50"}`}
                            >
                                <span className="size-2 rounded-full bg-gray-300" />{" "}
                                All projects
                            </button>
                            {(
                                Object.entries(PROJECT_CONFIG) as [
                                    ProjectName,
                                    ProjectConfig,
                                ][]
                            ).map(([name, cfg]) => (
                                <button
                                    key={name}
                                    onClick={() =>
                                        setFP(
                                            filterProject === name
                                                ? "all"
                                                : name,
                                        )
                                    }
                                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${filterProject === name ? "bg-gray-100 font-semibold text-gray-700" : "text-gray-500 hover:bg-gray-50"}`}
                                >
                                    <span
                                        className="size-2 flex-shrink-0 rounded-full"
                                        style={{ background: cfg.color }}
                                    />
                                    <span className="truncate">{name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <div className="flex flex-shrink-0 items-center gap-3 border-b bg-white px-5 py-3">
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={prevMonth}
                                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                        <h2 className="min-w-0 text-base font-black tracking-tight text-gray-800">
                            {MONTHS[month]}{" "}
                            <span className="font-normal text-gray-400">
                                {year}
                            </span>
                        </h2>
                        <button
                            onClick={goToday}
                            className="rounded-md border bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            Today
                        </button>
                        <div className="ml-auto flex items-center gap-3">
                            {/* <div className="flex items-center gap-1">
                                {(
                                    Object.entries(TEAM_COLORS) as [
                                        TeamMember,
                                        TeamColorConfig,
                                    ][]
                                ).map(([m, cfg]) => (
                                    <Tooltip key={m}>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() =>
                                                    setFA(
                                                        filterAssignee === m
                                                            ? "all"
                                                            : m,
                                                    )
                                                }
                                                className={`transition-all ${filterAssignee === m ? "scale-110" : "opacity-45 hover:opacity-75"}`}
                                            >
                                                <Avatar className="size-6">
                                                    <AvatarFallback
                                                        className={`text-[9px] font-bold text-white ${cfg.bg}`}
                                                    >
                                                        {m}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>{m}</TooltipContent>
                                    </Tooltip>
                                ))}
                            </div> */}
                            <Button
                                onClick={() => setAddOpen(true)}
                                size="sm"
                                className="h-8 gap-1.5 bg-bright-blue px-3 text-xs hover:bg-blue-600"
                            >
                                <Plus className="size-3.5" /> Add Task
                            </Button>
                        </div>
                    </div>
                    <div className="flex min-h-0 flex-1 overflow-hidden">
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <div className="grid flex-shrink-0 grid-cols-7 border-b bg-white">
                                {WEEKDAYS.map((d, i) => (
                                    <div
                                        key={d}
                                        className={`border-r py-2.5 text-center text-xs font-bold uppercase tracking-wider last:border-r-0 ${i === 0 || i === 6 ? "text-gray-300" : "text-gray-500"}`}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <div className="grid grid-cols-7">
                                    {cells.map((cell) => (
                                        <DayCell
                                            key={cell.dateStr}
                                            day={cell.day}
                                            dateStr={cell.dateStr}
                                            events={
                                                eventsByDate[cell.dateStr] ?? []
                                            }
                                            isToday={
                                                cell.dateStr === todayStr()
                                            }
                                            isSelected={
                                                cell.dateStr === selectedDate
                                            }
                                            isOtherMonth={cell.isOtherMonth}
                                            onClick={setSelected}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DaySidebar
                            dateStr={selectedDate}
                            events={eventsByDate[selectedDate] ?? []}
                            onAddEvent={addEvent}
                            onUpdateEvent={updateEvent}
                            onDeleteEvent={deleteEvent}
                        />
                    </div>
                </div>
            </div>
            {/* <AddEventDialog
                dateStr={selectedDate}
                open={addOpen}
                onOpenChange={setAddOpen}
                onSave={(ev: CalendarEvent) => {
                    addEvent(ev);
                    setAddOpen(false);
                }}
            /> */}
            <CreateTaskModal
                open={addOpen}
                onOpenChange={() => setAddOpen(!addOpen)}
                onSubmit={(data) => console.log(data)}
            />
        </>
    );
}

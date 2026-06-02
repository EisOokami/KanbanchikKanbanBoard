"use client";

import { useState } from "react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    RadialBarChart,
    RadialBar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Button } from "@/components/ui/shadcn/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/shadcn/card";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/shadcn/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/shadcn/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/shadcn/table";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    CheckCircle2,
    AlertTriangle,
    Flame,
    Target,
    Zap,
    RefreshCw,
    KanbanIcon,
    LucideIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TrendDirection = "up" | "down" | "flat";

type HealthStatus = "good" | "at-risk" | "hold";

type RangeOption = "4w" | "8w" | "3m";

type TabOption = "overview" | "velocity" | "team" | "projects";

type MemberInitials = "AK" | "JS" | "MO" | "KL" | "NP";

interface PaletteColors {
    indigo: string;
    sky: string;
    emerald: string;
    amber: string;
    rose: string;
    violet: string;
    slate: string;
    teal: string;
}

interface VelocityDataPoint {
    week: string;
    planned: number;
    completed: number;
    carried: number;
}

interface BurndownDataPoint {
    day: string;
    remaining: number;
    ideal: number;
}

interface CycleTimeDataPoint {
    stage: string;
    avg: number;
    p90: number;
}

interface TaskFlowDataPoint {
    week: string;
    created: number;
    resolved: number;
    backlog: number;
}

interface ProjectStatusItem {
    name: string;
    done: number;
    inprog: number;
    todo: number;
    total: number;
    health: HealthStatus;
}

interface MemberDataItem {
    name: MemberInitials;
    tasks: number;
    done: number;
    onTime: number;
    velocity: string;
    projects: number;
    streak: number;
}

interface PriorityDistItem {
    name: string;
    value: number;
    color: string;
}

interface RadialTeamItem {
    name: MemberInitials;
    value: number;
    fill: string;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const C: PaletteColors = {
    indigo: "#6366f1",
    sky: "#38bdf8",
    emerald: "#34d399",
    amber: "#fbbf24",
    rose: "#fb7185",
    violet: "#a78bfa",
    slate: "#94a3b8",
    teal: "#2dd4bf",
};

const PROJECT_COLORS: Record<string, string> = {
    "Design System": C.indigo,
    "Marketing Q2": C.amber,
    "Backend API": C.emerald,
    "Mobile App": C.rose,
    "Analytics Dash": C.sky,
};

const MEMBER_BG: Record<MemberInitials, string> = {
    AK: "bg-blue-500",
    JS: "bg-rose-500",
    MO: "bg-amber-500",
    KL: "bg-teal-500",
    NP: "bg-violet-500",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const velocityData: VelocityDataPoint[] = [
    { week: "W1", planned: 24, completed: 18, carried: 6 },
    { week: "W2", planned: 28, completed: 25, carried: 3 },
    { week: "W3", planned: 22, completed: 22, carried: 0 },
    { week: "W4", planned: 30, completed: 27, carried: 3 },
    { week: "W5", planned: 26, completed: 20, carried: 6 },
    { week: "W6", planned: 32, completed: 31, carried: 1 },
    { week: "W7", planned: 28, completed: 28, carried: 0 },
    { week: "W8", planned: 34, completed: 29, carried: 5 },
];

const burndownData: BurndownDataPoint[] = [
    { day: "Mon", remaining: 82, ideal: 82 },
    { day: "Tue", remaining: 74, ideal: 68 },
    { day: "Wed", remaining: 63, ideal: 54 },
    { day: "Thu", remaining: 55, ideal: 40 },
    { day: "Fri", remaining: 44, ideal: 26 },
    { day: "Mon", remaining: 40, ideal: 18 },
    { day: "Tue", remaining: 31, ideal: 9 },
    { day: "Wed", remaining: 22, ideal: 0 },
];

const cycleTimeData: CycleTimeDataPoint[] = [
    { stage: "Backlog→Todo", avg: 1.2, p90: 2.1 },
    { stage: "Todo→InProg", avg: 0.5, p90: 1.4 },
    { stage: "InProg→Review", avg: 2.8, p90: 5.2 },
    { stage: "Review→Done", avg: 1.1, p90: 2.3 },
];

const taskFlowWeekly: TaskFlowDataPoint[] = [
    { week: "W1", created: 31, resolved: 24, backlog: 14 },
    { week: "W2", created: 27, resolved: 29, backlog: 12 },
    { week: "W3", created: 35, resolved: 31, backlog: 16 },
    { week: "W4", created: 22, resolved: 26, backlog: 12 },
    { week: "W5", created: 40, resolved: 34, backlog: 18 },
    { week: "W6", created: 29, resolved: 37, backlog: 10 },
    { week: "W7", created: 33, resolved: 30, backlog: 13 },
    { week: "W8", created: 38, resolved: 35, backlog: 16 },
];

const projectStatusData: ProjectStatusItem[] = [
    {
        name: "Design System",
        done: 57,
        inprog: 14,
        todo: 13,
        total: 84,
        health: "good",
    },
    {
        name: "Marketing Q2",
        done: 23,
        inprog: 8,
        todo: 25,
        total: 56,
        health: "good",
    },
    {
        name: "Backend API",
        done: 30,
        inprog: 22,
        todo: 51,
        total: 103,
        health: "at-risk",
    },
    {
        name: "Mobile App",
        done: 34,
        inprog: 0,
        todo: 28,
        total: 62,
        health: "hold",
    },
    {
        name: "Analytics Dash",
        done: 36,
        inprog: 6,
        todo: 2,
        total: 44,
        health: "good",
    },
];

const memberData: MemberDataItem[] = [
    {
        name: "AK",
        tasks: 38,
        done: 30,
        onTime: 91,
        velocity: "+12%",
        projects: 4,
        streak: 7,
    },
    {
        name: "JS",
        tasks: 44,
        done: 36,
        onTime: 86,
        velocity: "+8%",
        projects: 3,
        streak: 5,
    },
    {
        name: "MO",
        tasks: 29,
        done: 22,
        onTime: 94,
        velocity: "+5%",
        projects: 3,
        streak: 12,
    },
    {
        name: "KL",
        tasks: 33,
        done: 28,
        onTime: 88,
        velocity: "-3%",
        projects: 2,
        streak: 3,
    },
    {
        name: "NP",
        tasks: 26,
        done: 19,
        onTime: 79,
        velocity: "+2%",
        projects: 3,
        streak: 2,
    },
];

const priorityDist: PriorityDistItem[] = [
    { name: "Critical", value: 18, color: C.rose },
    { name: "High", value: 35, color: C.amber },
    { name: "Medium", value: 72, color: C.indigo },
    { name: "Low", value: 45, color: C.slate },
];

const radialTeam: RadialTeamItem[] = memberData.map((m, index) => ({
    name: m.name,
    value: Math.round((m.done / m.tasks) * 100),
    fill: Object.values(C)[index % Object.values(C).length],
}));

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
    label: string;
    value: number | string;
    sub?: string;
    trend: TrendDirection;
    trendVal: string;
    icon: LucideIcon;
    accent: string;
    suffix?: string;
}

function KpiCard({
    label,
    value,
    sub,
    trend,
    trendVal,
    icon: Icon,
    accent,
    suffix = "",
}: KpiCardProps) {
    const isUp = trend === "up";
    const isDown = trend === "down";
    const TIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
    const tColor = isUp
        ? "text-emerald-600"
        : isDown
          ? "text-rose-500"
          : "text-slate-500";

    return (
        <Card className="border-slate-200 bg-white shadow-lg transition-colors hover:border-blue-300/60">
            <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between">
                    <div
                        className="rounded-xl p-2"
                        style={{ background: `${accent}22` }}
                    >
                        <Icon className="size-4" style={{ color: accent }} />
                    </div>
                    <div
                        className={`flex items-center gap-1 text-[11px] font-semibold ${tColor}`}
                    >
                        <TIcon className="size-3" />
                        {trendVal}
                    </div>
                </div>
                <div className="mb-0.5 text-2xl font-bold tracking-tight text-slate-900">
                    {value}
                    {suffix}
                </div>
                <div className="text-xs font-medium text-slate-400">
                    {label}
                </div>
                {sub && (
                    <div className="mt-1 text-[11px] text-slate-400">{sub}</div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string | number;
    payload?: Record<string, unknown> & { name?: string };
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: readonly TooltipPayloadEntry[];
    label?: string;
    unit?: string;
}

function ChartTooltip({
    active,
    payload,
    label,
    unit = "",
}: ChartTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 shadow-xl">
            <p className="mb-1.5 text-xs font-bold text-slate-600">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                    <span
                        className="size-2 rounded-full"
                        style={{ background: p.color }}
                    />
                    <span className="text-slate-500">{p.name}:</span>
                    <span className="font-semibold text-slate-900">
                        {p.value}
                        {unit}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

interface SectionProps {
    children: React.ReactNode;
    className?: string;
}

function Section({ children, className = "" }: SectionProps) {
    return (
        <Card className={`border-slate-200 bg-white shadow-lg ${className}`}>
            {children}
        </Card>
    );
}

interface SectionHeaderProps {
    title: string;
    desc?: string;
    action?: React.ReactNode;
}

function SectionHeader({ title, desc, action }: SectionHeaderProps) {
    return (
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                        {title}
                    </CardTitle>
                    {desc && (
                        <CardDescription className="mt-0.5 text-xs text-slate-400">
                            {desc}
                        </CardDescription>
                    )}
                </div>
                {action}
            </div>
        </CardHeader>
    );
}

// ─── Health Badge ─────────────────────────────────────────────────────────────

interface HealthBadgeConfig {
    label: string;
    cls: string;
}

interface HealthBadgeProps {
    health: HealthStatus;
}

function HealthBadge({ health }: HealthBadgeProps) {
    const map: Record<HealthStatus, HealthBadgeConfig> = {
        good: {
            label: "On Track",
            cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
        "at-risk": {
            label: "At Risk",
            cls: "bg-rose-50 text-rose-600 border-rose-200",
        },
        hold: {
            label: "On Hold",
            cls: "bg-amber-50 text-amber-600 border-amber-200",
        },
    };
    const cfg = map[health] ?? map.good;
    return (
        <span
            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${cfg.cls}`}
        >
            {cfg.label}
        </span>
    );
}

// ─── Spark Bar ────────────────────────────────────────────────────────────────

// interface SparkBarProps {
//     value: number[];
//     max: number;
//     color: string;
// }

// function SparkBar({ value, max, color }: SparkBarProps) {
//     return (
//         <div className="flex h-5 items-end gap-[2px]">
//             {value.map((v, i) => (
//                 <div
//                     key={i}
//                     className="w-[4px] rounded-t-sm transition-all"
//                     style={{
//                         height: `${(v / max) * 100}%`,
//                         background: color,
//                         opacity: 0.4 + (i / value.length) * 0.6,
//                     }}
//                 />
//             ))}
//         </div>
//     );
// }

// ─── Main Page ────────────────────────────────────────────────────────────────

interface VelocityMiniCardItem {
    label: string;
    value: string;
    icon: LucideIcon;
    accent: string;
}

interface TabItem {
    v: TabOption;
    label: string;
}

export default function Analytics() {
    const [range, setRange] = useState<RangeOption>("8w");
    const [tab, setTab] = useState<TabOption>("overview");

    const totalTasks = projectStatusData.reduce((s, p) => s + p.total, 0);
    const totalDone = projectStatusData.reduce((s, p) => s + p.done, 0);
    // const totalInProg = projectStatusData.reduce((s, p) => s + p.inprog, 0);
    // const overallPct = Math.round((totalDone / totalTasks) * 100);
    const avgVelocity = Math.round(
        velocityData.reduce((s, d) => s + d.completed, 0) / velocityData.length,
    );
    const atRisk = projectStatusData.filter(
        (p) => p.health === "at-risk",
    ).length;

    const velocityMiniCards: VelocityMiniCardItem[] = [
        { label: "Best Sprint", value: "34 pts", icon: Zap, accent: C.emerald },
        {
            label: "Avg Completion",
            value: "87%",
            icon: Target,
            accent: C.indigo,
        },
        {
            label: "Carry-over",
            value: "3.5 pts",
            icon: RefreshCw,
            accent: C.amber,
        },
    ];

    const tabs: TabItem[] = [
        { v: "overview", label: "Overview" },
        { v: "velocity", label: "Velocity" },
        { v: "team", label: "Team" },
        { v: "projects", label: "Projects" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* ── Header ── */}
            <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-slate-200 bg-slate-50/90 px-6 py-3.5 backdrop-blur">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
                        <KanbanIcon className="size-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-none text-slate-900">
                            Analytics
                        </h1>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                            KanbanBoard · Sprint Intelligence
                        </p>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <Select
                        value={range}
                        onValueChange={(val) => setRange(val as RangeOption)}
                    >
                        <SelectTrigger className="h-7 w-32 border-slate-200 bg-white text-xs text-slate-600">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-slate-200 bg-white text-slate-600">
                            <SelectItem value="4w">Last 4 weeks</SelectItem>
                            <SelectItem value="8w">Last 8 weeks</SelectItem>
                            <SelectItem value="3m">Last 3 months</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 px-3 text-xs text-slate-500 hover:text-slate-900"
                    >
                        <RefreshCw className="size-3" /> Refresh
                    </Button>
                </div>
            </header>

            <div className="mx-auto max-w-[1400px] space-y-6 px-6 py-6">
                {/* ── KPI Row ── */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <KpiCard
                        label="Tasks Completed"
                        value={totalDone}
                        sub={`of ${totalTasks} total`}
                        trend="up"
                        trendVal="+14% vs prev"
                        icon={CheckCircle2}
                        accent={C.emerald}
                    />
                    <KpiCard
                        label="Avg Sprint Velocity"
                        value={avgVelocity}
                        suffix=" pts"
                        sub="per sprint"
                        trend="up"
                        trendVal="+5 pts"
                        icon={Zap}
                        accent={C.indigo}
                    />
                    <KpiCard
                        label="On-Time Delivery"
                        value={88}
                        suffix="%"
                        sub="across all sprints"
                        trend="down"
                        trendVal="-2% this sprint"
                        icon={Target}
                        accent={C.amber}
                    />
                    <KpiCard
                        label="At-Risk Projects"
                        value={atRisk}
                        sub="need immediate attention"
                        trend="down"
                        trendVal="1 new"
                        icon={AlertTriangle}
                        accent={C.rose}
                    />
                </div>

                {/* ── Tabs ── */}
                <Tabs
                    value={tab}
                    onValueChange={(val) => setTab(val as TabOption)}
                >
                    <TabsList className="h-8 border border-slate-200 bg-white">
                        {tabs.map(({ v, label }) => (
                            <TabsTrigger
                                key={v}
                                value={v}
                                className="h-7 text-xs text-slate-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                            >
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* ── OVERVIEW TAB ── */}
                    <TabsContent value="overview" className="mt-5 space-y-5">
                        {/* Row 1: task flow + priority dist */}
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            {/* Task Flow */}
                            <Section className="lg:col-span-2">
                                <SectionHeader
                                    title="Task Flow"
                                    desc="Created vs resolved per week"
                                />
                                <CardContent className="pb-5">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={220}
                                    >
                                        <AreaChart
                                            data={taskFlowWeekly}
                                            margin={{
                                                top: 5,
                                                right: 10,
                                                left: -20,
                                                bottom: 0,
                                            }}
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="gCreated"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor={C.indigo}
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor={C.indigo}
                                                        stopOpacity={0.02}
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="gResolved"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor={C.emerald}
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor={C.emerald}
                                                        stopOpacity={0.02}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e2e8f0"
                                            />
                                            <XAxis
                                                dataKey="week"
                                                tick={{
                                                    fill: "#94a3b8",
                                                    fontSize: 11,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{
                                                    fill: "#94a3b8",
                                                    fontSize: 11,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <ReTooltip
                                                content={<ChartTooltip />}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="created"
                                                name="Created"
                                                stroke={C.indigo}
                                                strokeWidth={2}
                                                fill="url(#gCreated)"
                                                dot={false}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="resolved"
                                                name="Resolved"
                                                stroke={C.emerald}
                                                strokeWidth={2}
                                                fill="url(#gResolved)"
                                                dot={false}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    fontSize: 11,
                                                    color: "#94a3b8",
                                                    paddingTop: 8,
                                                }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Section>

                            {/* Priority distribution */}
                            <Section>
                                <SectionHeader
                                    title="Priority Distribution"
                                    desc="All active tasks"
                                />
                                <CardContent className="pb-5">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={160}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={priorityDist}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={42}
                                                outerRadius={68}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {priorityDist.map((e, i) => (
                                                    <Cell
                                                        key={i}
                                                        fill={e.color}
                                                        stroke="transparent"
                                                    />
                                                ))}
                                            </Pie>
                                            <ReTooltip
                                                content={<ChartTooltip />}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="mt-1 space-y-2">
                                        {priorityDist.map((p) => (
                                            <div
                                                key={p.name}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="size-2 rounded-full"
                                                        style={{
                                                            background: p.color,
                                                        }}
                                                    />
                                                    <span className="text-xs text-slate-500">
                                                        {p.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1 w-20 overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${(p.value / priorityDist.reduce((s, x) => s + x.value, 0)) * 100}%`,
                                                                background:
                                                                    p.color,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="w-5 text-right text-xs font-bold text-slate-900">
                                                        {p.value}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Section>
                        </div>

                        {/* Row 2: burndown + cycle time */}
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {/* Burndown */}
                            <Section>
                                <SectionHeader
                                    title="Sprint Burndown"
                                    desc="Remaining tasks vs ideal trend"
                                />
                                <CardContent className="pb-5">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={200}
                                    >
                                        <LineChart
                                            data={burndownData}
                                            margin={{
                                                top: 5,
                                                right: 10,
                                                left: -20,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e2e8f0"
                                            />
                                            <XAxis
                                                dataKey="day"
                                                tick={{
                                                    fill: "#94a3b8",
                                                    fontSize: 11,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{
                                                    fill: "#94a3b8",
                                                    fontSize: 11,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <ReTooltip
                                                content={
                                                    <ChartTooltip unit=" tasks" />
                                                }
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="ideal"
                                                name="Ideal"
                                                stroke={C.slate}
                                                strokeWidth={1.5}
                                                strokeDasharray="5 3"
                                                dot={false}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="remaining"
                                                name="Remaining"
                                                stroke={C.rose}
                                                strokeWidth={2.5}
                                                dot={{ fill: C.rose, r: 3 }}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    fontSize: 11,
                                                    color: "#94a3b8",
                                                    paddingTop: 8,
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Section>

                            {/* Cycle time per stage */}
                            <Section>
                                <SectionHeader
                                    title="Cycle Time by Stage"
                                    desc="Average days per transition"
                                />
                                <CardContent className="pb-5">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={200}
                                    >
                                        <BarChart
                                            data={cycleTimeData}
                                            layout="vertical"
                                            margin={{
                                                top: 5,
                                                right: 20,
                                                left: 20,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e2e8f0"
                                                horizontal={false}
                                            />
                                            <XAxis
                                                type="number"
                                                tick={{
                                                    fill: "#94a3b8",
                                                    fontSize: 11,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                                unit="d"
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="stage"
                                                tick={{
                                                    fill: "#94a3b8",
                                                    fontSize: 10,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                                width={100}
                                            />
                                            <ReTooltip
                                                content={
                                                    <ChartTooltip unit=" days" />
                                                }
                                            />
                                            <Bar
                                                dataKey="avg"
                                                name="Avg"
                                                fill={C.indigo}
                                                radius={[0, 4, 4, 0]}
                                                barSize={10}
                                            />
                                            <Bar
                                                dataKey="p90"
                                                name="P90"
                                                fill={C.violet}
                                                radius={[0, 4, 4, 0]}
                                                barSize={10}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    fontSize: 11,
                                                    color: "#94a3b8",
                                                    paddingTop: 8,
                                                }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Section>
                        </div>
                    </TabsContent>

                    {/* ── VELOCITY TAB ── */}
                    <TabsContent value="velocity" className="mt-5 space-y-5">
                        <div className="mb-1 grid grid-cols-3 gap-4">
                            {velocityMiniCards.map((m) => (
                                <Card
                                    key={m.label}
                                    className="border-slate-200 bg-white"
                                >
                                    <CardContent className="flex items-center gap-3 p-4">
                                        <div
                                            className="rounded-xl p-2"
                                            style={{
                                                background: `${m.accent}22`,
                                            }}
                                        >
                                            <m.icon
                                                className="size-4"
                                                style={{ color: m.accent }}
                                            />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-slate-900">
                                                {m.value}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {m.label}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Section>
                            <SectionHeader
                                title="Sprint Velocity"
                                desc="Planned vs completed story points over 8 sprints"
                            />
                            <CardContent className="pb-6">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={velocityData}
                                        margin={{
                                            top: 5,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                        barGap={4}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e2e8f0"
                                        />
                                        <XAxis
                                            dataKey="week"
                                            tick={{
                                                fill: "#94a3b8",
                                                fontSize: 11,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{
                                                fill: "#94a3b8",
                                                fontSize: 11,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <ReTooltip
                                            content={
                                                <ChartTooltip unit=" pts" />
                                            }
                                        />
                                        <Bar
                                            dataKey="planned"
                                            name="Planned"
                                            fill={`${C.slate}55`}
                                            radius={[4, 4, 0, 0]}
                                            barSize={18}
                                        />
                                        <Bar
                                            dataKey="completed"
                                            name="Completed"
                                            fill={C.indigo}
                                            radius={[4, 4, 0, 0]}
                                            barSize={18}
                                        />
                                        <Bar
                                            dataKey="carried"
                                            name="Carried"
                                            fill={C.rose}
                                            radius={[4, 4, 0, 0]}
                                            barSize={18}
                                        />
                                        <Legend
                                            wrapperStyle={{
                                                fontSize: 11,
                                                color: "#94a3b8",
                                                paddingTop: 12,
                                            }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Section>

                        {/* Velocity trend line */}
                        <Section>
                            <SectionHeader
                                title="Completion Rate Trend"
                                desc="% of planned work completed per sprint"
                            />
                            <CardContent className="pb-6">
                                <ResponsiveContainer width="100%" height={180}>
                                    <AreaChart
                                        data={velocityData.map((d) => ({
                                            ...d,
                                            rate: Math.round(
                                                (d.completed / d.planned) * 100,
                                            ),
                                        }))}
                                        margin={{
                                            top: 5,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="gRate"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor={C.teal}
                                                    stopOpacity={0.35}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor={C.teal}
                                                    stopOpacity={0.02}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e2e8f0"
                                        />
                                        <XAxis
                                            dataKey="week"
                                            tick={{
                                                fill: "#94a3b8",
                                                fontSize: 11,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[60, 105]}
                                            tick={{
                                                fill: "#94a3b8",
                                                fontSize: 11,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            unit="%"
                                        />
                                        <ReTooltip
                                            content={<ChartTooltip unit="%" />}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="rate"
                                            name="Completion"
                                            stroke={C.teal}
                                            strokeWidth={2.5}
                                            fill="url(#gRate)"
                                            dot={{ fill: C.teal, r: 3 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Section>
                    </TabsContent>

                    {/* ── TEAM TAB ── */}
                    <TabsContent value="team" className="mt-5 space-y-5">
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            {/* Completion radial */}
                            <Section>
                                <SectionHeader
                                    title="Completion Rate"
                                    desc="Tasks done / assigned"
                                />
                                <CardContent className="pb-4">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={200}
                                    >
                                        <RadialBarChart
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="20%"
                                            outerRadius="90%"
                                            data={radialTeam}
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            <RadialBar
                                                background={{
                                                    fill: "#f1f5f9",
                                                }}
                                                dataKey="value"
                                                cornerRadius={6}
                                                label={{
                                                    position: "insideStart",
                                                    fill: "#fff",
                                                    fontSize: 9,
                                                    fontWeight: "bold",
                                                }}
                                            />
                                            <ReTooltip
                                                content={({
                                                    active,
                                                    payload,
                                                }: {
                                                    active?: boolean;
                                                    payload?: readonly TooltipPayloadEntry[];
                                                }) =>
                                                    active && payload?.[0] ? (
                                                        <div className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-2 text-xs">
                                                            <span className="font-bold text-slate-600">
                                                                {
                                                                    payload[0]
                                                                        .payload
                                                                        ?.name
                                                                }
                                                            </span>
                                                            <span className="ml-2 text-slate-900">
                                                                {
                                                                    payload[0]
                                                                        .value
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                    ) : null
                                                }
                                            />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div className="mt-1 flex flex-wrap justify-center gap-3">
                                        {radialTeam.map((m) => (
                                            <div
                                                key={m.name}
                                                className="flex items-center gap-1.5"
                                            >
                                                <span
                                                    className="size-2 rounded-full"
                                                    style={{
                                                        background: m.fill,
                                                    }}
                                                />
                                                <span className="text-[10px] text-slate-500">
                                                    {m.name} {m.value}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Section>

                            {/* Member table */}
                            <Section className="lg:col-span-2">
                                <SectionHeader
                                    title="Team Performance"
                                    desc="Individual metrics this sprint"
                                />
                                <CardContent className="pb-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-200 hover:bg-transparent">
                                                {[
                                                    "Member",
                                                    "Tasks",
                                                    "Done",
                                                    "On-Time",
                                                    "Velocity",
                                                    "Streak",
                                                ].map((h) => (
                                                    <TableHead
                                                        key={h}
                                                        className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400"
                                                    >
                                                        {h}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {memberData.map((m) => {
                                                const isPos =
                                                    m.velocity.startsWith("+");
                                                return (
                                                    <TableRow
                                                        key={m.name}
                                                        className="border-slate-200 transition-colors hover:bg-slate-100/50"
                                                    >
                                                        <TableCell className="px-3 py-2.5">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="size-7">
                                                                    <AvatarFallback
                                                                        className={`text-[10px] font-bold text-slate-900 ${MEMBER_BG[m.name]}`}
                                                                    >
                                                                        {m.name}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-sm font-semibold text-slate-900">
                                                                    {m.name}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2.5 text-sm text-slate-600">
                                                            {m.tasks}
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2.5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
                                                                    <div
                                                                        className="h-full rounded-full bg-emerald-500"
                                                                        style={{
                                                                            width: `${(m.done / m.tasks) * 100}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs font-semibold text-slate-600">
                                                                    {m.done}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2.5">
                                                            <span
                                                                className={`text-xs font-bold ${m.onTime >= 90 ? "text-emerald-600" : m.onTime >= 80 ? "text-amber-600" : "text-rose-500"}`}
                                                            >
                                                                {m.onTime}%
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2.5">
                                                            <span
                                                                className={`flex items-center gap-1 text-xs font-semibold ${isPos ? "text-emerald-600" : "text-rose-500"}`}
                                                            >
                                                                {isPos ? (
                                                                    <TrendingUp className="size-3" />
                                                                ) : (
                                                                    <TrendingDown className="size-3" />
                                                                )}
                                                                {m.velocity}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2.5">
                                                            <div className="flex items-center gap-1">
                                                                <Flame className="size-3 text-orange-500" />
                                                                <span className="text-xs font-bold text-slate-900">
                                                                    {m.streak}d
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Section>
                        </div>
                    </TabsContent>

                    {/* ── PROJECTS TAB ── */}
                    <TabsContent value="projects" className="mt-5 space-y-5">
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {/* Project progress bars */}
                            <Section>
                                <SectionHeader
                                    title="Project Progress"
                                    desc="Done / In Progress / Todo breakdown"
                                />
                                <CardContent className="space-y-4 pb-5">
                                    {projectStatusData.map((p) => {
                                        const color = PROJECT_COLORS[p.name];
                                        const donePct = Math.round(
                                            (p.done / p.total) * 100,
                                        );
                                        const inProgPct = Math.round(
                                            (p.inprog / p.total) * 100,
                                        );
                                        return (
                                            <div key={p.name}>
                                                <div className="mb-1.5 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="size-2 rounded-full"
                                                            style={{
                                                                background:
                                                                    color,
                                                            }}
                                                        />
                                                        <span className="text-xs font-semibold text-slate-600">
                                                            {p.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <HealthBadge
                                                            health={p.health}
                                                        />
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {donePct}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full transition-all"
                                                        style={{
                                                            width: `${donePct}%`,
                                                            background: color,
                                                        }}
                                                    />
                                                    <div
                                                        className="h-full transition-all"
                                                        style={{
                                                            width: `${inProgPct}%`,
                                                            background: `${color}70`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="mt-1 flex gap-3">
                                                    <span className="text-[10px] text-slate-400">
                                                        ✓ {p.done} done
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        ⟳ {p.inprog} in prog
                                                    </span>
                                                    <span className="text-[10px] text-slate-300">
                                                        ○ {p.todo} todo
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Section>

                            {/* Comparative bar */}
                            <Section>
                                <SectionHeader
                                    title="Task Volume by Project"
                                    desc="Total tasks allocated"
                                />
                                <CardContent className="pb-5">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={260}
                                    >
                                        <BarChart
                                            data={projectStatusData.map(
                                                (p) => ({
                                                    name: p.name.split(" ")[0],
                                                    done: p.done,
                                                    inprog: p.inprog,
                                                    todo: p.todo,
                                                }),
                                            )}
                                            margin={{
                                                top: 5,
                                                right: 10,
                                                left: -20,
                                                bottom: 0,
                                            }}
                                            barSize={20}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e2e8f0"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                tick={{
                                                    fill: "#94a3b8",
                                                    fontSize: 11,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{
                                                    fill: "#94a3b8",
                                                    fontSize: 11,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <ReTooltip
                                                content={<ChartTooltip />}
                                            />
                                            <Bar
                                                dataKey="done"
                                                name="Done"
                                                stackId="a"
                                                fill={C.emerald}
                                                radius={[0, 0, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="inprog"
                                                name="In Progress"
                                                stackId="a"
                                                fill={C.indigo}
                                                radius={[0, 0, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="todo"
                                                name="To Do"
                                                stackId="a"
                                                fill={`${C.slate}40`}
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    fontSize: 11,
                                                    color: "#94a3b8",
                                                    paddingTop: 10,
                                                }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Section>
                        </div>

                        {/* Project table */}
                        <Section>
                            <SectionHeader
                                title="Project Summary Table"
                                desc="Detailed breakdown across all active projects"
                            />
                            <CardContent className="pb-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-200 hover:bg-transparent">
                                            {[
                                                "Project",
                                                "Total",
                                                "Done",
                                                "In Prog",
                                                "Todo",
                                                "Progress",
                                                "Health",
                                            ].map((h) => (
                                                <TableHead
                                                    key={h}
                                                    className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400"
                                                >
                                                    {h}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {projectStatusData.map((p) => {
                                            const color =
                                                PROJECT_COLORS[p.name];
                                            const pct = Math.round(
                                                (p.done / p.total) * 100,
                                            );
                                            return (
                                                <TableRow
                                                    key={p.name}
                                                    className="border-slate-200 transition-colors hover:bg-slate-100/50"
                                                >
                                                    <TableCell className="px-3 py-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="size-2.5 rounded-full"
                                                                style={{
                                                                    background:
                                                                        color,
                                                                }}
                                                            />
                                                            <span className="text-sm font-semibold text-slate-900">
                                                                {p.name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2.5 text-sm text-slate-500">
                                                        {p.total}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2.5 text-sm font-semibold text-emerald-600">
                                                        {p.done}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2.5 text-sm text-blue-500">
                                                        {p.inprog}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2.5 text-sm text-slate-400">
                                                        {p.todo}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                                                                <div
                                                                    className="h-full rounded-full"
                                                                    style={{
                                                                        width: `${pct}%`,
                                                                        background:
                                                                            color,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-900">
                                                                {pct}%
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2.5">
                                                        <HealthBadge
                                                            health={p.health}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Section>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

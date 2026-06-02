"use client";

import { useState } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import { Plus, Search, LayoutGrid, List, Star } from "lucide-react";
import ProjectCard from "@/components/ui/projectCard/ProjectCard";
import NewProjectModal from "@/components/ui/newProjectModal/NewProjectModal";

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

const INITIAL_PROJECTS: Project[] = [
    {
        id: "1",
        name: "Website Redesign",
        icon: "🔥",
        description:
            "Complete overhaul of the corporate site with new branding and UX improvements.",
        status: "active",
        priority: "high",
        progress: 68,
        tasksTotal: 47,
        tasksDone: 32,
        members: [
            { id: "u1", name: "Anna K.", avatar: "" },
            { id: "u2", name: "Dmytro P.", avatar: "" },
            { id: "u3", name: "Olena M.", avatar: "" },
        ],
        dueDate: "2025-03-15",
        color: "#6366f1",
        starred: true,
    },
    {
        id: "2",
        name: "Mobile App v2",
        icon: "⚠️",
        description:
            "New feature set for iOS & Android: push notifications, dark mode, offline sync.",
        status: "active",
        priority: "critical",
        progress: 34,
        tasksTotal: 93,
        tasksDone: 31,
        members: [
            { id: "u4", name: "Ivan S.", avatar: "" },
            { id: "u5", name: "Maria T.", avatar: "" },
        ],
        dueDate: "2025-04-30",
        color: "#ec4899",
        starred: false,
    },
    {
        id: "3",
        name: "Data Pipeline",
        icon: "⚙️",
        description:
            "ETL pipeline refactoring and migration to cloud-native architecture.",
        status: "paused",
        priority: "medium",
        progress: 55,
        tasksTotal: 28,
        tasksDone: 15,
        members: [{ id: "u6", name: "Serhii L.", avatar: "" }],
        dueDate: "2025-05-10",
        color: "#f59e0b",
        starred: false,
    },
    {
        id: "4",
        name: "Design System",
        icon: "🗿",
        description:
            "Build a unified component library with Storybook docs for all product teams.",
        status: "active",
        priority: "high",
        progress: 82,
        tasksTotal: 64,
        tasksDone: 52,
        members: [
            { id: "u1", name: "Anna K.", avatar: "" },
            { id: "u7", name: "Yulia B.", avatar: "" },
            { id: "u8", name: "Kostya V.", avatar: "" },
            { id: "u9", name: "Natasha R.", avatar: "" },
        ],
        dueDate: "2025-02-28",
        color: "#10b981",
        starred: true,
    },
    {
        id: "5",
        name: "Auth Service",
        icon: "💡",
        description:
            "OAuth 2.0 + SSO integration, MFA support and session management.",
        status: "completed",
        priority: "low",
        progress: 100,
        tasksTotal: 19,
        tasksDone: 19,
        members: [
            { id: "u4", name: "Ivan S.", avatar: "" },
            { id: "u6", name: "Serhii L.", avatar: "" },
        ],
        dueDate: "2025-01-20",
        color: "#3b82f6",
        starred: false,
    },
    {
        id: "6",
        name: "Analytics Dashboard",
        icon: "🗓️",
        description:
            "Real-time metrics and reporting dashboard for product and marketing teams.",
        status: "active",
        priority: "medium",
        progress: 21,
        tasksTotal: 38,
        tasksDone: 8,
        members: [
            { id: "u2", name: "Dmytro P.", avatar: "" },
            { id: "u5", name: "Maria T.", avatar: "" },
        ],
        dueDate: "2025-06-01",
        color: "#8b5cf6",
        starred: false,
    },
];

const STATUS_CONFIG: Record<Status, { label: string; dot: string }> = {
    active: { label: "Active", dot: "bg-emerald-500" },
    paused: { label: "Paused", dot: "bg-amber-400" },
    completed: { label: "Completed", dot: "bg-blue-400" },
    archived: { label: "Archived", dot: "bg-slate-400" },
};

type ViewMode = "grid" | "list";
type FilterStatus = "all" | Status;

export default function ProjectsOverview() {
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [search, setSearch] = useState("");
    const [view, setView] = useState<ViewMode>("grid");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [showNewProjectModal, setShowNewProjectModal] =
        useState<boolean>(false);

    const handleStar = (id: string) =>
        setProjects((prev) =>
            prev.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p)),
        );

    const handleDelete = (id: string) =>
        setProjects((prev) => prev.filter((p) => p.id !== id));

    const filtered = projects.filter((p) => {
        const matchSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleShowNewProjectModal = () => {
        setShowNewProjectModal(!showNewProjectModal);
    };

    const starredProjects = filtered.filter((p) => p.starred);
    const otherProjects = filtered.filter((p) => !p.starred);

    const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
        { value: "paused", label: "Paused" },
        { value: "completed", label: "Completed" },
        { value: "archived", label: "Archived" },
    ];

    return (
        <div className="min-h-screen bg-background font-sans">
            <header className="sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur">
                <div className="flex items-center justify-between gap-4 px-8 py-4">
                    <div>
                        <h1 className="text-xl font-semibold">Projects</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Manage and track all your work
                        </p>
                    </div>
                    <Button
                        className="gap-1.5 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-5"
                        onClick={handleShowNewProjectModal}
                    >
                        <Plus />
                        New project
                    </Button>
                </div>
            </header>
            <main className="space-y-8 px-8 py-4">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 text-muted-foreground" />
                        <Input
                            placeholder="Search projects…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 pl-9 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 rounded-md bg-muted/60 p-1">
                            {FILTER_OPTIONS.map((o) => (
                                <button
                                    key={o.value}
                                    onClick={() => setFilterStatus(o.value)}
                                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                        filterStatus === o.value
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {o.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-0.5 rounded-md bg-muted/60 p-1">
                            {(["grid", "list"] as ViewMode[]).map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`rounded-md p-1.5 transition-colors ${
                                        view === v
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {v === "grid" ? (
                                        <LayoutGrid className="h-4 w-4" />
                                    ) : (
                                        <List className="h-4 w-4" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                {starredProjects.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            Starred
                        </h2>
                        <div
                            className={
                                view === "grid"
                                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                                    : "flex flex-col gap-3"
                            }
                        >
                            {starredProjects.map((p) => (
                                <ProjectCard
                                    key={p.id}
                                    project={p}
                                    onStar={handleStar}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </section>
                )}
                <section className="space-y-3">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {filterStatus === "all"
                            ? "All Projects"
                            : STATUS_CONFIG[filterStatus as Status]?.label}
                        <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground/60">
                            ({otherProjects.length})
                        </span>
                    </h2>
                    {otherProjects.length === 0 ? (
                        <Card className="border-dashed border-border/60">
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                                    <LayoutGrid className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        No projects found
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Try changing filters or create a new
                                        project.
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-1 gap-1.5"
                                    onClick={handleShowNewProjectModal}
                                >
                                    <Plus className="h-4 w-4" /> New project
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div
                            className={
                                view === "grid"
                                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                                    : "flex flex-col gap-3"
                            }
                        >
                            {otherProjects.map((p) => (
                                <ProjectCard
                                    key={p.id}
                                    project={p}
                                    onStar={handleStar}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <NewProjectModal
                open={showNewProjectModal}
                onClose={handleShowNewProjectModal}
                onSubmit={(data) => console.log(data)}
            />
        </div>
    );
}

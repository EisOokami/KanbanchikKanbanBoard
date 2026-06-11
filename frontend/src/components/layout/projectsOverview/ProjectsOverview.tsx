"use client";

import { useState } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import ProjectCard from "@/components/ui/projectCard/ProjectCard";
import NewProjectModal from "@/components/ui/newProjectModal/NewProjectModal";
import { FilterStatus, ViewMode } from "@/types/projectsOverview";
import { FILTER_OPTIONS } from "@/constants/projectsOverview";
import { Project } from "@/types/types";
import { STATUS_CONFIG } from "@/constants/constants";
import {
    GridFourIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    RowsIcon,
} from "@phosphor-icons/react";

interface ProjectsOverviewProps {
    projectsData: Project[];
}

export default function ProjectsOverview({
    projectsData,
}: Readonly<ProjectsOverviewProps>) {
    const [projects, setProjects] = useState<Project[]>(projectsData);
    const [search, setSearch] = useState<string>("");
    const [view, setView] = useState<ViewMode>("grid");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [showNewProjectModal, setShowNewProjectModal] =
        useState<boolean>(false);

    const handleDelete = (id: number) =>
        setProjects((prevState) => prevState.filter((p) => p.id !== id));

    const handleShowNewProjectModal = () => {
        setShowNewProjectModal(!showNewProjectModal);
    };

    // const filtered = projects.filter((p) => {
    //     const matchSearch =
    //         p.name.toLowerCase().includes(search.toLowerCase()) ||
    //         p.description.toLowerCase().includes(search.toLowerCase());
    //     const matchStatus = filterStatus === "all" || p.status === filterStatus;

    //     return matchSearch && matchStatus;
    // });

    // const otherProjects = filtered.filter((p) => !p.starred);

    return (
        <div className="h-full overflow-y-auto rounded-xl bg-white">
            <header className="sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur">
                <div className="flex items-center justify-between gap-4 px-8 py-4">
                    <h1 className="text-xl font-semibold">Projects</h1>
                    <Button
                        className="gap-1.5 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-5"
                        onClick={handleShowNewProjectModal}
                    >
                        <PlusIcon weight="duotone" />
                        New project
                    </Button>
                </div>
            </header>
            <main className="space-y-5 px-8 py-4">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-72">
                        <MagnifyingGlassIcon
                            weight="duotone"
                            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 text-muted-foreground"
                        />
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
                                    className={`h-7 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
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
                                    className={`rounded-md p-1 transition-colors ${
                                        view === v
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {v === "grid" ? (
                                        <GridFourIcon
                                            weight="duotone"
                                            className="size-5"
                                        />
                                    ) : (
                                        <RowsIcon
                                            weight="duotone"
                                            className="size-5"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <section className="space-y-3">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {filterStatus === "all"
                            ? "All Projects"
                            : STATUS_CONFIG[filterStatus].label}
                        <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground/60">
                            {/* ({otherProjects.length}) */}({projects.length})
                        </span>
                    </h2>
                    {/* {otherProjects.length === 0 ? ( */}
                    {projects.length === 0 ? (
                        <Card className="border-dashed border-border/60">
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <div className="flex size-12 items-center justify-center rounded-md bg-muted">
                                    <GridFourIcon
                                        weight="duotone"
                                        className="size-6 text-muted-foreground"
                                    />
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
                                    <PlusIcon
                                        weight="duotone"
                                        className="size-4"
                                    />{" "}
                                    New project
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
                            {/* {otherProjects.map((p) => ( */}
                            {projects.map((p) => (
                                <ProjectCard
                                    key={p.id}
                                    project={p}
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

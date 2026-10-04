"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import ProjectCard from "@/components/ui/projectCard/ProjectCard";
import NewProjectModal from "@/components/ui/newProjectModal/NewProjectModal";
import { FilterSortOptions } from "@/types/projectsOverview";
import { Project, User } from "@/types/types";
import {
    FunnelIcon,
    GridFourIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    RowsIcon,
} from "@phosphor-icons/react";
import { deleteProjectAction } from "@/data/actions";
import { Badge } from "@/components/ui/shadcn/badge";
import ProjectFilterSheet from "@/components/ui/projectFilterSheet/ProjectFilterSheet";
import {
    applyFiltersAndSort,
    countActiveFilters,
} from "@/libs/projectOverview";
import { cn } from "@/libs/utils";
import { useDebounce } from "use-debounce";

interface ProjectsOverviewProps {
    projectsData: Project[];
    userData: User;
}

const DEFAULT_FILTER_SORT: FilterSortOptions = {
    sortField: "name",
    sortDirection: "asc",
    statuses: [],
    memberIds: [],
    categoryIds: [],
};

export default function ProjectsOverview({
    projectsData,
    userData,
}: Readonly<ProjectsOverviewProps>) {
    const [search, setSearch] = useState<string>("");
    const [searchValue] = useDebounce(search, 1000);
    const [view, setView] = useState<"grid" | "list">("grid");
    const [showNewProjectModal, setShowNewProjectModal] =
        useState<boolean>(false);
    const [showFilterSheet, setShowFilterSheet] = useState(false);
    const [filterOpts, setFilterOpts] =
        useState<FilterSortOptions>(DEFAULT_FILTER_SORT);
    const filtered = useMemo(
        () => applyFiltersAndSort(projectsData, searchValue, filterOpts),
        [projectsData, searchValue, filterOpts],
    );

    const activeFilterCount = countActiveFilters(filterOpts);

    const handleDelete = useCallback(async (slug: string) => {
        await deleteProjectAction(slug);
    }, []);

    const handleShowNewProjectModal = () => {
        setShowNewProjectModal(!showNewProjectModal);
    };

    return (
        <div className="h-full overflow-y-auto rounded-xl bg-background-secondary">
            <header className="sticky top-0 z-10 border-b border-border backdrop-blur">
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
                            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-control-text"
                        />
                        <Input
                            placeholder="Search projects..."
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 bg-control pl-9 text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="relative h-9 gap-1.5 border-border bg-control text-sm text-control-text hover:bg-control-active"
                            onClick={() => setShowFilterSheet(true)}
                        >
                            <FunnelIcon weight="duotone" className="size-4" />
                            Filter & Sort
                            {activeFilterCount > 0 && (
                                <Badge className="ml-0.5 h-4 min-w-4 rounded-full bg-bright-blue px-1 text-[10px] text-white">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                        <div className="flex gap-0.5 rounded-md border border-border bg-control p-1">
                            {(["grid", "list"] as ("grid" | "list")[]).map(
                                (value) => (
                                    <button
                                        key={value}
                                        onClick={() => setView(value)}
                                        className={cn(
                                            "rounded-md p-1 transition-colors",
                                            view === value
                                                ? "bg-control-active text-foreground"
                                                : "text-muted-foreground hover:text-foreground",
                                        )}
                                    >
                                        {value === "grid" ? (
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
                                ),
                            )}
                        </div>
                    </div>
                </div>
                <section className="space-y-3">
                    <h2 className="items- inline-flex text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        All Projects
                        <span className="ml-2 font-normal normal-case text-muted-foreground/60">
                            ({filtered.length})
                        </span>
                    </h2>
                    {filtered.length === 0 ? (
                        <Card className="border-dashed border-border">
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <div className="flex size-12 items-center justify-center rounded-md bg-muted">
                                    <GridFourIcon
                                        weight="duotone"
                                        className="size-6 text-muted-foreground"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
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
                                    className="mt-1 gap-1.5 bg-bright-blue px-4 py-2 text-sm text-white hover:bg-blue-600"
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
                            {filtered.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    projectData={project}
                                    userData={userData}
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
            />
            <ProjectFilterSheet
                open={showFilterSheet}
                onClose={() => setShowFilterSheet(false)}
                projects={projectsData}
                options={filterOpts}
                onChange={setFilterOpts}
                onReset={() => setFilterOpts(DEFAULT_FILTER_SORT)}
            />
        </div>
    );
}

"use client";

import { BaseAction } from "@/types/actions";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../shadcn/select";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { Project } from "@/types/types";

interface ProjectSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    selectedProject: Project;
    onValueChange: (id: string) => void;
    projectsData: Project[];
}

export default function ProjectSection({
    formState,
    isPending,
    selectedProject,
    onValueChange,
    projectsData,
}: Readonly<ProjectSectionProps>) {
    return (
        <div className="flex-1 space-y-8 px-6 py-5 shadow-sm">
            <div className="space-y-1">
                <label className="font-semibold" htmlFor="project">
                    Project <span className="text-red-500">*</span>
                </label>
                <Select
                    value={selectedProject.id.toString()}
                    onValueChange={onValueChange}
                    disabled={isPending}
                >
                    <SelectTrigger
                        id="project"
                        className="bg-control transition-colors placeholder:text-control-text hover:bg-control-active focus:ring-1 focus:ring-bright-blue"
                    >
                        <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-control">
                        {projectsData.map((project) => (
                            <SelectItem
                                key={project.id}
                                value={project.id.toString()}
                                className="rounded-md text-sm font-medium capitalize hover:!bg-control-active"
                            >
                                <span>{project.name}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {formState?.zodErrors?.projectId && (
                <div>
                    <ZodErrors error={formState?.zodErrors?.projectId} />
                </div>
            )}
        </div>
    );
}

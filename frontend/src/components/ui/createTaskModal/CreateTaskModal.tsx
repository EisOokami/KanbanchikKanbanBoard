"use client";

import { useState, useEffect, useActionState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { format } from "date-fns";
import { PRIORITY_CONFIG } from "@/constants/constants";
import { CreateTaskFormData, Project, Task, User } from "@/types/types";
import { InfoIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { getProjectsData, getTaskData } from "@/data/loaders";
import { BaseAction } from "@/types/actions";
import { createTaskAction } from "@/data/actions";
import ProjectSection from "./projectSection/ProjectSection";
import ColumnSection from "./columnSection/ColumnSection";
import TitleSection from "./titleSection/TitleSection";
import DescriptionSection from "./descriptionSection/DescriptionSection";
import DateSection from "./dateSection/DateSection";
import PrioritySection from "./prioritySection/PrioritySection";
import MembersSection from "./membersSection/MembersSection";
import CategoriesSection from "./categoriesSection/CategoriesSection";
import LabelsSection from "./labelsSection/LabelsSection";
import SubtasksSection from "./subtasksSection/SubtasksSection";
import AttachmentsSection from "./attachmentsSection/AttachmentsSection";
import { cn } from "@/libs/utils";
import { DetailsErrors } from "../detailsErrors/DetailsErrors";

interface CreateTaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean, data?: Task) => void;
    projectData?: Project;
    showProjectSelect?: boolean;
    columnId?: number;
    currentPath?: string;
    date?: string;
}

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

export default function CreateTaskModal({
    open,
    onOpenChange,
    projectData,
    showProjectSelect = false,
    columnId,
    currentPath,
    date,
}: Readonly<CreateTaskModalProps>) {
    const [projectsData, setProjectsData] = useState<Project[] | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | undefined>(
        projectData,
    );
    const [selectedColumnId, setSelectedColumnId] = useState<
        number | undefined
    >(columnId);
    const [startDateOpen, setStartDateOpen] = useState<boolean>(false);
    const [dueDateOpen, setDueDateOpen] = useState<boolean>(false);
    const [priority, setPriority] = useState<string>(
        Object.keys(PRIORITY_CONFIG)[0],
    );
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [progressShow, setProgressShow] = useState<boolean>(false);
    const [formData, setFormData] = useState<CreateTaskFormData>({
        categories: [],
        newCategories: [],
        members: [],
        subtasks: [],
        attachments: [],
        labels: [],
        newLabels: [],
    });
    const [formState, formAction, isPending] = useActionState(
        createTaskAction.bind(null, formData, currentPath),
        INITIAL_STATE,
    );

    useEffect(() => {
        if (date) {
            const parsedDate = new Date(date);

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStartDate(parsedDate);
            setDueDate(parsedDate);
        }
    }, [date]);

    useEffect(() => {
        if (columnId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedColumnId(columnId);
        }
    }, [columnId]);

    useEffect(() => {
        if (!showProjectSelect) {
            return;
        }

        (async () => {
            const fetchProjects = await getProjectsData();

            setProjectsData(fetchProjects);
            setSelectedProject(fetchProjects[0]);
        })();
    }, [showProjectSelect]);

    useEffect(() => {
        (async () => {
            if (!open) {
                return;
            }

            if (formState && formState.status === "success" && formState.data) {
                const result = await getTaskData(formState.data.id);

                onOpenChange(false, result);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState]);

    useEffect(() => {
        if (!open) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
            categories: [],
            newCategories: [],
            members: [],
            subtasks: [],
            attachments: [],
            labels: [],
            newLabels: [],
        });
        setPriority(Object.keys(PRIORITY_CONFIG)[0]);
        setStartDate(date ? new Date(date) : undefined);
        setDueDate(date ? new Date(date) : undefined);
        setSelectedColumnId(columnId);
        setProgressShow(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const toggleMember = (memberValue: Omit<User, "email">) => {
        setFormData((prevState) => ({
            ...prevState,
            members: prevState.members.some(
                (member) => member.id === memberValue.id,
            )
                ? prevState.members.filter(
                      (member) => member.id !== memberValue.id,
                  )
                : [...prevState.members, memberValue],
        }));
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    const handleChangeProject = (id: string) => {
        if (!projectsData) {
            return;
        }

        const project = projectsData.find(
            (project) => project.id.toString() === id,
        );

        if (project) {
            setSelectedProject(project);
        }
    };

    const handleChangeColumn = (id: string) => {
        if (!selectedProject) {
            return;
        }

        const column = selectedProject.columns.find(
            (column) => column.id.toString() === id,
        );

        if (column) {
            setSelectedColumnId(column.id);
        }
    };

    const selectedMembers = selectedProject
        ? selectedProject.members.filter((member) =>
              formData.members.some(
                  (formDataMember) => member.id === formDataMember.id,
              ),
          )
        : [];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="flex max-h-[92vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-md border border-border bg-background-secondary p-0 shadow-2xl [&>button:first-of-type]:hidden"
                aria-describedby={undefined}
            >
                <form
                    action={formAction}
                    noValidate
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <DialogHeader className="flex-shrink-0 border-b border-border px-6 pb-4 pt-6">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <DialogTitle className="mb-0.5 text-base font-semibold">
                                    New Task
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground">
                                    Configure your task details
                                </p>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="size-6 text-control-text hover:bg-control-active [&_svg]:size-4"
                                disabled={isPending}
                            >
                                <XIcon weight="duotone" />
                            </Button>
                        </div>
                    </DialogHeader>
                    {showProjectSelect && projectsData && selectedProject && (
                        <ProjectSection
                            formState={formState}
                            onValueChange={handleChangeProject}
                            isPending={isPending}
                            selectedProject={selectedProject}
                            projectsData={projectsData}
                        />
                    )}
                    {selectedProject && (
                        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-5">
                            <ColumnSection
                                formState={formState}
                                isPending={isPending}
                                selectedProject={selectedProject}
                                selectedColumnId={selectedColumnId}
                                onValueChange={handleChangeColumn}
                            />
                            <TitleSection
                                formState={formState}
                                isPending={isPending}
                            />
                            <DescriptionSection
                                formState={formState}
                                isPending={isPending}
                            />
                            <DateSection
                                formState={formState}
                                isPending={isPending}
                                startDate={startDate}
                                dueDate={dueDate}
                                startDateOpen={startDateOpen}
                                dueDateOpen={dueDateOpen}
                                onOpenStartDateChange={setStartDateOpen}
                                onOpenDueDateChange={setDueDateOpen}
                                onStartDateChange={setStartDate}
                                onDueDateChange={setDueDate}
                            />
                            <PrioritySection
                                formState={formState}
                                isPending={isPending}
                                priority={priority}
                                showPriorityEmoji={
                                    selectedProject.show_priority_emoji
                                }
                                onPriorityChange={setPriority}
                            />
                            <MembersSection
                                formState={formState}
                                isPending={isPending}
                                formData={formData}
                                selectedMembers={selectedMembers}
                                selectedProject={selectedProject}
                                onMemberChange={toggleMember}
                            />
                            <CategoriesSection
                                formState={formState}
                                isPending={isPending}
                                formData={formData}
                                selectedProject={selectedProject}
                                onFormDataChange={setFormData}
                            />
                            <LabelsSection
                                formState={formState}
                                isPending={isPending}
                                formData={formData}
                                selectedProject={selectedProject}
                                onFormDataChange={setFormData}
                            />
                            <SubtasksSection
                                formState={formState}
                                isPending={isPending}
                                formData={formData}
                                progressShow={progressShow}
                                onShowProgress={setProgressShow}
                                onFormDataChange={setFormData}
                            />
                            <AttachmentsSection
                                formState={formState}
                                isPending={isPending}
                                formData={formData}
                                onFormDataChange={setFormData}
                            />
                        </div>
                    )}
                    <DialogFooter className="flex items-center !justify-between gap-3 border-t border-border px-6 py-4">
                        <div>
                            {formState?.status !== "success" &&
                                formState?.message && (
                                    <div
                                        className={cn(
                                            "flex items-center gap-2 rounded-md text-sm",
                                            formState?.status === "error"
                                                ? "text-red-500"
                                                : "text-yellow-300",
                                        )}
                                    >
                                        <InfoIcon
                                            weight="duotone"
                                            className="size-4"
                                        />
                                        <p>{formState?.message}</p>
                                    </div>
                                )}
                            {formState?.details &&
                                formState?.details?.length &&
                                formState.details.map((error) => (
                                    <DetailsErrors
                                        key={error.message + error.field}
                                        error={error}
                                    />
                                ))}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClose}
                                className="h-9 bg-control text-control-text hover:bg-control-active"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="h-9 gap-1.5 bg-bright-blue text-white hover:bg-blue-600"
                            >
                                <PlusIcon weight="duotone" className="size-4" />{" "}
                                Create Task
                            </Button>
                        </div>
                    </DialogFooter>
                    <input
                        type="hidden"
                        name="slug"
                        value={selectedProject ? selectedProject.slug : ""}
                    />
                    <input
                        type="hidden"
                        name="column-id"
                        value={selectedColumnId ? selectedColumnId : -1}
                    />
                    <input
                        type="hidden"
                        name="start-date"
                        value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                    />
                    <input
                        type="hidden"
                        name="due-date"
                        value={dueDate ? format(dueDate, "yyyy-MM-dd") : ""}
                    />
                    <input type="hidden" name="priority" value={priority} />
                    <input
                        type="hidden"
                        name="show-progress"
                        value={String(!!progressShow)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}

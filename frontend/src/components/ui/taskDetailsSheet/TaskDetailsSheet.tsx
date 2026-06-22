"use client";

import { useState, useEffect, useActionState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/shadcn/sheet";
import { Button } from "@/components/ui/shadcn/button";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import { formatDistanceToNow } from "date-fns";
import { toDate } from "@/libs/utils";
import { commentsToActivity } from "@/libs/taskDetailsSheet";
import FieldRow from "../fieldRow/FieldRow";
import { User, Task, Project, UpdateTaskFormData } from "@/types/types";
import { ActivityEntry } from "@/types/taskDetailsSheet";
import { CheckIcon, ClockIcon } from "@phosphor-icons/react";
import { BaseAction } from "@/types/actions";
import { updateTaskAction } from "@/data/actions";
import TitleSection from "./titleSection/TitleSection";
import DateSection from "./dateSection/DateSection";
import MembersSection from "./membersSection/MembersSection";
import LabelsSection from "./labelsSection/LabelsSection";
import DescriptionSection from "./descriptionSection/DescriptionSection";
import SubtasksSection from "./subtasksSection/SubtasksSection";
import AttachmentSection from "./attachmentSection/AttachmentSection";
import ActivitySection from "./activitySection/ActivitySection";
import CommentsSection from "./commentsSection/CommentsSection";
import Header from "./header/Header";
import CategoriesSection from "./categoriesSection/CategoriesSection";
import { ZodErrors } from "../zodErrors/ZodErrors";
import { getTaskData } from "@/data/loaders";

interface TaskDetailsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean, data?: Task) => void;
    selectedTask: Task;
    userData: Omit<User, "email">;
    projectData: Project;
    currentPath?: string;
}

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

export function TaskDetailsSheet({
    open,
    onOpenChange,
    selectedTask,
    userData,
    projectData,
    currentPath,
}: Readonly<TaskDetailsSheetProps>) {
    const [task, setTask] = useState<Task>(selectedTask);
    const [activity, setActivity] = useState<ActivityEntry[]>(() =>
        commentsToActivity(selectedTask.comments),
    );
    const [formData, setFormData] = useState<UpdateTaskFormData>({
        categories: task.categories,
        members: task.members,
        subtasks: task.subtasks,
        newSubtasks: [],
        attachments: task.attachments,
        newAttachments: [],
        labels: task.labels,
        comments: task.comments,
        newComments: [],
    });
    const [formState, formAction, isPending] = useActionState(
        updateTaskAction.bind(null, formData, currentPath),
        INITIAL_STATE,
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTask(selectedTask);
    }, [selectedTask]);

    useEffect(() => {
        (async () => {
            if (formState && formState.status === "success" && formState.data) {
                const result = await getTaskData(formState.data.id);

                onOpenChange(false, result);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState]);

    const createdAt = toDate(task.created_at) ?? new Date();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex min-w-[620px] max-w-[100vw] flex-col gap-0 bg-white p-0 outline-none [&>button:first-of-type]:hidden"
            >
                <form
                    action={formAction}
                    noValidate
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <SheetTitle className="hidden"></SheetTitle>
                    <SheetHeader className="shrink-0 px-6 py-3">
                        <Header
                            isPending={isPending}
                            task={task}
                            projectData={projectData}
                            onOpenChange={onOpenChange}
                        />
                        <ZodErrors error={formState?.zodErrors?.columnId} />
                        <ZodErrors error={formState?.zodErrors?.priority} />
                    </SheetHeader>
                    <ScrollArea className="flex-1">
                        <div className="space-y-5 px-6 pb-6 pt-4">
                            <div className="space-y-2">
                                <TitleSection
                                    formState={formState}
                                    isPending={isPending}
                                    task={task}
                                />
                                <div className="mb-5">
                                    <CategoriesSection
                                        formState={formState}
                                        isPending={isPending}
                                        formData={formData}
                                        projectData={projectData}
                                        onFormDataChange={setFormData}
                                    />
                                    <LabelsSection
                                        formState={formState}
                                        isPending={isPending}
                                        formData={formData}
                                        projectData={projectData}
                                        onFormDataChange={setFormData}
                                    />
                                    <DateSection
                                        task={task}
                                        formState={formState}
                                        isPending={isPending}
                                    />
                                    <MembersSection
                                        projectData={projectData}
                                        formState={formState}
                                        isPending={isPending}
                                        formData={formData}
                                        onFormDataChange={setFormData}
                                    />
                                    <FieldRow
                                        icon={
                                            <ClockIcon
                                                weight="duotone"
                                                size={16}
                                            />
                                        }
                                        label="Created"
                                    >
                                        <span className="text-sm text-gray-500">
                                            {formatDistanceToNow(createdAt, {
                                                addSuffix: true,
                                            })}
                                        </span>
                                    </FieldRow>
                                </div>
                            </div>
                            <Separator />
                            <DescriptionSection
                                task={task}
                                formState={formState}
                                isPending={isPending}
                            />
                            <Separator />
                            <SubtasksSection
                                formState={formState}
                                isPending={isPending}
                                formData={formData}
                                task={task}
                                onFormDataChange={setFormData}
                            />
                            <Separator />
                            <AttachmentSection
                                userData={userData}
                                formState={formState}
                                isPending={isPending}
                                formData={formData}
                                onFormDataChange={setFormData}
                            />
                            <Separator />
                            <ActivitySection activity={activity} />
                            <Separator />
                            <CommentsSection
                                formState={formState}
                                isPending={isPending}
                                formData={formData}
                                userData={userData}
                                activity={activity}
                                onActivityChange={setActivity}
                                onFormDataChange={setFormData}
                            />
                        </div>
                    </ScrollArea>
                    <div className="flex shrink-0 items-center justify-end gap-2 border-t px-6 py-3.5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-8 rounded-md px-4 text-sm hover:bg-gray-200"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={!task.title.trim()}
                            className="h-8 gap-1.5 rounded-md bg-bright-blue px-4 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-40 [&_svg]:size-4"
                        >
                            <CheckIcon weight="duotone" size={16} />
                            Save
                        </Button>
                    </div>
                    <input type="hidden" name="task-id" value={task.id} />
                </form>
            </SheetContent>
        </Sheet>
    );
}

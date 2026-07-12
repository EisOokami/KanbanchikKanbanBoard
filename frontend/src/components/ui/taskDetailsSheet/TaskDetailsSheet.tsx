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
import { cn, toDate } from "@/libs/utils";
import { commentsToActivity } from "@/libs/taskDetailsSheet";
import FieldRow from "../fieldRow/FieldRow";
import {
    User,
    Task,
    Project,
    UpdateTaskFormData,
    Column,
    Priority,
} from "@/types/types";
import { ActivityEntry } from "@/types/taskDetailsSheet";
import { CheckIcon, ClockIcon, InfoIcon } from "@phosphor-icons/react";
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
import { DetailsErrors } from "../detailsErrors/DetailsErrors";

interface TaskDetailsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean, data?: Task) => void;
    selectedTask: Task;
    userData: User;
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

export default function TaskDetailsSheet({
    open,
    onOpenChange,
    selectedTask,
    userData,
    projectData,
    currentPath,
}: Readonly<TaskDetailsSheetProps>) {
    const [task, setTask] = useState<Task>(selectedTask);
    const [column, setColumn] = useState<Column>(task.column);
    const [priority, setPriority] = useState<Priority>(task.priority);
    const [title, setTitle] = useState<string>(task.title);
    const [startDate, setStartDate] = useState<Date | undefined>(
        task.start_date ? new Date(task.start_date) : undefined,
    );
    const [dueDate, setDueDate] = useState<Date | undefined>(
        task.due_date ? new Date(task.due_date) : undefined,
    );
    const [description, setDescription] = useState<string>(
        task.description ?? "",
    );
    const [activity, setActivity] = useState<ActivityEntry[]>(() =>
        commentsToActivity(selectedTask.comments),
    );
    const [showProgress, setShowProgress] = useState<boolean>(
        !!task.show_progress,
    );
    const [isChanged, setIsChanged] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState(() => ({
        column: task.column,
        priority: task.priority,
        title: task.title,
        startDate: task.start_date ? new Date(task.start_date) : undefined,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        description: task.description ?? "",
        showProgress: !!task.show_progress,
    }));
    const [initialFormData, setInitialFormData] = useState<UpdateTaskFormData>(
        () => ({
            categories: task.categories,
            members: task.members,
            subtasks: task.subtasks,
            newSubtasks: [],
            attachments: task.attachments,
            newAttachments: [],
            labels: task.labels,
            comments: task.comments,
            newComments: [],
        }),
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
        setShowProgress(!!task.show_progress);
        setInitialValues({
            ...initialValues,
            showProgress: !!task.show_progress,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task.show_progress]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTask(selectedTask);
        setIsChanged(false);
    }, [selectedTask]);

    useEffect(() => {
        if (!open) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setColumn(task.column);
        setPriority(task.priority);
        setTitle(task.title);
        setStartDate(task.start_date ? new Date(task.start_date) : undefined);
        setDueDate(task.due_date ? new Date(task.due_date) : undefined);
        setDescription(task.description ?? "");
        setShowProgress(!!task.show_progress);
        setInitialValues({
            column: task.column,
            priority: task.priority,
            title: task.title,
            startDate: task.start_date ? new Date(task.start_date) : undefined,
            dueDate: task.due_date ? new Date(task.due_date) : undefined,
            description: task.description ?? "",
            showProgress: !!task.show_progress,
        });
        setInitialFormData({
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        const hasInitialValuesChanged =
            title.trim() !== initialValues.title ||
            startDate !== initialValues.startDate ||
            dueDate !== initialValues.dueDate ||
            description !== initialValues.description ||
            priority !== initialValues.priority ||
            column.id !== initialValues.column.id ||
            showProgress !== initialValues.showProgress;

        const hasFormDataChanged =
            formData.newSubtasks.length > 0 ||
            formData.newAttachments.length > 0 ||
            formData.newComments.length > 0 ||
            formData.categories.length !== initialFormData.categories.length ||
            formData.members.length !== initialFormData.members.length ||
            formData.labels.length !== initialFormData.labels.length ||
            formData.subtasks.some((subtask, i) => {
                const orig = initialFormData.subtasks[i];

                return (
                    !orig ||
                    subtask.title !== orig.title ||
                    subtask.is_done !== orig.is_done
                );
            });

        if (hasFormDataChanged || hasInitialValuesChanged) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsChanged(true);
        } else {
            setIsChanged(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        title,
        startDate,
        dueDate,
        description,
        priority,
        column,
        formData,
        showProgress,
    ]);

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
    const hasPermission = !(
        userData.role === "viewer" ||
        (userData.role === "member" &&
            userData.id !== task.creator_id &&
            !task.members.some((member) => member.id === userData.id))
    );

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
                            column={column}
                            priority={priority}
                            hasPermission={hasPermission}
                            onOpenChange={onOpenChange}
                            onColumnChange={setColumn}
                            onPriorityChange={setPriority}
                        />
                        <div>
                            <ZodErrors error={formState?.zodErrors?.columnId} />
                            <ZodErrors error={formState?.zodErrors?.priority} />
                        </div>
                    </SheetHeader>
                    <ScrollArea className="flex-1">
                        <div className="space-y-5 px-6 pb-6 pt-4">
                            <div className="space-y-2">
                                <TitleSection
                                    formState={formState}
                                    isPending={isPending}
                                    title={title}
                                    hasPermission={hasPermission}
                                    onTitleChange={setTitle}
                                />
                                <div className="mb-5">
                                    <CategoriesSection
                                        isPending={isPending}
                                        formData={formData}
                                        projectData={projectData}
                                        hasPermission={hasPermission}
                                        onFormDataChange={setFormData}
                                    />
                                    <LabelsSection
                                        isPending={isPending}
                                        formData={formData}
                                        projectData={projectData}
                                        hasPermission={hasPermission}
                                        onFormDataChange={setFormData}
                                    />
                                    <DateSection
                                        isPending={isPending}
                                        startDate={startDate}
                                        dueDate={dueDate}
                                        hasPermission={hasPermission}
                                        onStartDateChange={setStartDate}
                                        onDueDateChange={setDueDate}
                                    />
                                    <MembersSection
                                        projectData={projectData}
                                        isPending={isPending}
                                        formData={formData}
                                        hasPermission={hasPermission}
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
                                    <ZodErrors
                                        error={formState?.zodErrors?.categories}
                                    />
                                    <ZodErrors
                                        error={formState?.zodErrors?.labels}
                                    />
                                    <ZodErrors
                                        error={formState?.zodErrors?.startDate}
                                    />
                                    <ZodErrors
                                        error={formState?.zodErrors?.dueDate}
                                    />
                                    <ZodErrors
                                        error={formState?.zodErrors?.members}
                                    />
                                </div>
                            </div>
                            <Separator />
                            <DescriptionSection
                                formState={formState}
                                isPending={isPending}
                                description={description}
                                hasPermission={hasPermission}
                                onDescriptionChange={setDescription}
                            />
                            <Separator />
                            {(!hasPermission && task.show_progress) ||
                            hasPermission ? (
                                <>
                                    <SubtasksSection
                                        formState={formState}
                                        isPending={isPending}
                                        formData={formData}
                                        showProgress={showProgress}
                                        hasPermission={hasPermission}
                                        onFormDataChange={setFormData}
                                        onShowProgressChange={setShowProgress}
                                    />
                                    <Separator />
                                </>
                            ) : null}
                            {(!hasPermission && formData.attachments.length) ||
                            hasPermission ? (
                                <>
                                    <AttachmentSection
                                        userData={userData}
                                        formState={formState}
                                        isPending={isPending}
                                        formData={formData}
                                        hasPermission={hasPermission}
                                        onFormDataChange={setFormData}
                                    />
                                    <Separator />
                                </>
                            ) : null}
                            <ActivitySection activity={activity} />
                            {hasPermission && (
                                <>
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
                                </>
                            )}
                        </div>
                    </ScrollArea>
                    {hasPermission && (
                        <div
                            className={cn(
                                "flex border-t px-6 py-3.5",
                                formState?.status === "error" ||
                                    formState?.status === "success" ||
                                    (formState?.details &&
                                        formState?.details?.length)
                                    ? "justify-between gap-3"
                                    : "justify-end",
                            )}
                        >
                            <div>
                                {formState?.status !== "success" &&
                                    formState?.message && (
                                        <div
                                            className={cn(
                                                "flex items-center gap-1 rounded-md text-sm",
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
                            <div className="flex shrink-0 items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isPending}
                                    onClick={() => onOpenChange(false)}
                                    className="h-8 rounded-md px-4 text-sm hover:bg-gray-200"
                                >
                                    Discard
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!isChanged || isPending}
                                    className={cn(
                                        "h-8 gap-1.5 rounded-md bg-bright-blue px-4 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-40 [&_svg]:size-4",
                                        !isChanged &&
                                            "cursor-not-allowed opacity-50",
                                    )}
                                >
                                    <CheckIcon weight="duotone" size={16} />
                                    Save
                                </Button>
                            </div>
                        </div>
                    )}
                    <input type="hidden" name="task-id" value={task.id} />
                </form>
            </SheetContent>
        </Sheet>
    );
}

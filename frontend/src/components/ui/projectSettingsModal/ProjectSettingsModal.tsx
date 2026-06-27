"use client";

import { useActionState, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { cn } from "@/libs/utils";
import { NavSection } from "@/types/projectSettingsDialog";
import { NAV_ITEMS } from "@/constants/projectSettingsDialog";
import {
    Project,
    Column,
    Status,
    ProjectSettingsFormData,
} from "@/types/types";
import { CaretRightIcon, CheckIcon, InfoIcon } from "@phosphor-icons/react";
import GeneralSection from "./generalSection/GeneralSection";
import ColumnsSection from "./columnsSection/ColumnsSection";
import CategoriesSection from "./categoriesSection/CategoriesSection";
import LabelsSection from "./labelsSection/LabelsSection";
import MembersSection from "./membersSection/MembersSection";
import DangerSection from "./dangerSection/DangerSection";
import { updateProjectAction } from "@/data/actions";
import { BaseAction } from "@/types/actions";
import { PALETTE } from "@/constants/constants";
import { usePathname } from "next/navigation";
import { getProjectData } from "@/data/loaders";
import { DetailsErrors } from "../detailsErrors/DetailsErrors";

interface ProjectSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean, data?: Project) => void;
    columnsData: Column[];
    projectData: Project;
}

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

export default function ProjectSettingsModal({
    open,
    onOpenChange,
    columnsData,
    projectData,
}: Readonly<ProjectSettingsModalProps>) {
    const [activeSection, setActiveSection] = useState<NavSection>("general");
    const [name, setName] = useState<string>(projectData.name);
    const [icon, setIcon] = useState<string>(projectData.icon);
    const [color, setColor] = useState<string>(projectData.color);
    const [description, setDescription] = useState<string>(
        projectData.description,
    );
    const [newColumnName, setNewColumnName] = useState<string>("");
    const [categoryInputValues, setCategoryInputValues] = useState<{
        name: string;
        color: string;
    }>({
        name: "",
        color: PALETTE[0],
    });
    const [labelInputValues, setLabelInputValues] = useState<{
        name: string;
        color: string;
    }>({
        name: "",
        color: PALETTE[0],
    });
    const [status, setStatus] = useState<Status>(projectData.status);
    const [showPriorityEmoji, setShowPriorityEmoji] = useState<boolean>(
        projectData.show_priority_emoji,
    );
    const pathname = usePathname();
    const [formData, setFormData] = useState<ProjectSettingsFormData>({
        categories: projectData.categories,
        newCategories: [],
        deletedCategoryIds: [],
        columns: columnsData,
        newColumns: [],
        deletedColumnIds: [],
        labels: projectData.labels,
        newLabels: [],
        deletedLabelIds: [],
        members: projectData.members,
        emails: [],
    });
    const [formState, formAction, isPending] = useActionState(
        updateProjectAction.bind(null, formData, pathname),
        INITIAL_STATE,
    );

    useEffect(() => {
        (async () => {
            if (formState && formState.status === "success") {
                const result = await getProjectData(projectData.slug);

                onOpenChange(false, result);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[88vh] max-h-[680px] w-[95vw] max-w-[780px] flex-col gap-0 overflow-hidden rounded-md border bg-white p-0 shadow-xl [&>button:last-child]:hidden">
                <form
                    action={formAction}
                    noValidate
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <DialogTitle className="hidden"></DialogTitle>
                    <div className="flex flex-1 overflow-hidden">
                        <nav className="flex w-48 shrink-0 flex-col gap-0.5 border-r px-2 py-3">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() =>
                                            setActiveSection(item.id)
                                        }
                                        className={cn(
                                            "flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm font-medium transition-all",
                                            activeSection === item.id
                                                ? "bg-white text-bright-blue shadow-sm"
                                                : "border-transparent text-gray-500 hover:bg-white/80",
                                        )}
                                        disabled={isPending}
                                    >
                                        <span
                                            className={
                                                activeSection === item.id
                                                    ? "text-bright-blue"
                                                    : "text-gray-500"
                                            }
                                        >
                                            <Icon weight="duotone" size={18} />
                                        </span>
                                        {item.label}
                                        {activeSection === item.id && (
                                            <CaretRightIcon
                                                weight="duotone"
                                                size={12}
                                                className="ml-auto text-bright-blue"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                {activeSection === "general" && (
                                    <GeneralSection
                                        icon={icon}
                                        color={color}
                                        name={name}
                                        description={description}
                                        status={status}
                                        showPriorityEmoji={showPriorityEmoji}
                                        formState={formState}
                                        isPending={isPending}
                                        onIconChange={setIcon}
                                        onColorChange={setColor}
                                        onNameChange={setName}
                                        onDescriptionChange={setDescription}
                                        onStatusChange={setStatus}
                                        onShowPriorityEmojiChange={
                                            setShowPriorityEmoji
                                        }
                                    />
                                )}
                                {activeSection === "columns" && (
                                    <ColumnsSection
                                        formData={formData}
                                        newColumnName={newColumnName}
                                        formState={formState}
                                        isPending={isPending}
                                        onColumnNameChange={setNewColumnName}
                                        onFormDataChange={setFormData}
                                    />
                                )}
                                {activeSection === "categories" && (
                                    <CategoriesSection
                                        formData={formData}
                                        categoryInputValues={
                                            categoryInputValues
                                        }
                                        formState={formState}
                                        isPending={isPending}
                                        onCategoryInputValuesChange={
                                            setCategoryInputValues
                                        }
                                        onFormDataChange={setFormData}
                                    />
                                )}
                                {activeSection === "labels" && (
                                    <LabelsSection
                                        formData={formData}
                                        labelInputValues={labelInputValues}
                                        formState={formState}
                                        isPending={isPending}
                                        onLabelInputValuesChange={
                                            setLabelInputValues
                                        }
                                        onFormDataChange={setFormData}
                                    />
                                )}
                                {activeSection === "members" && (
                                    <MembersSection
                                        formData={formData}
                                        formState={formState}
                                        isPending={isPending}
                                        onFormDataChange={setFormData}
                                    />
                                )}
                                {activeSection === "danger" && (
                                    <DangerSection
                                        name={name}
                                        slug={projectData.slug}
                                        isPending={isPending}
                                        onOpenChange={onOpenChange}
                                        onSectionChange={setActiveSection}
                                    />
                                )}
                            </div>
                        </ScrollArea>
                    </div>
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
                        <div className="flex shrink-0 items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="h-9 rounded-md px-4 text-sm hover:bg-gray-100"
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!name.trim() || isPending}
                                className="h-9 rounded-md bg-bright-blue text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40"
                            >
                                <CheckIcon weight="duotone" size={14} />
                                Save changes
                            </Button>
                        </div>
                    </div>
                    <input type="hidden" name="slug" value={projectData.slug} />
                    <input type="hidden" name="icon" value={icon} />
                    <input type="hidden" name="color" value={color} />
                    <input type="hidden" name="name" value={name} />
                    <input type="hidden" name="status" value={status} />
                    <input
                        type="hidden"
                        name="show-priority-emoji"
                        value={String(!!showPriorityEmoji)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}

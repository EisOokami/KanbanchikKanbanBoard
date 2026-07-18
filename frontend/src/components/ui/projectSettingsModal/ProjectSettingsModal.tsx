"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { cn } from "@/libs/utils";
import { NAV_ITEMS } from "@/constants/projectSettingsDialog";
import {
    Project,
    Column,
    Status,
    ProjectSettingsFormData,
    NavSection,
    User,
} from "@/types/types";
import { CaretRightIcon } from "@phosphor-icons/react";
import GeneralSection from "./generalSection/GeneralSection";
import ColumnsSection from "./columnsSection/ColumnsSection";
import CategoriesSection from "./categoriesSection/CategoriesSection";
import LabelsSection from "./labelsSection/LabelsSection";
import MembersSection from "./membersSection/MembersSection";
import DangerSection from "./dangerSection/DangerSection";
import { updateProjectAction } from "@/data/actions";
import { BaseAction } from "@/types/actions";
import { usePathname } from "next/navigation";
import { getProjectData } from "@/data/loaders";
import SaveBar from "./saveBar/SaveBar";

interface ProjectSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean, data?: Project) => void;
    columnsData: Column[];
    projectData: Project;
    userData: User;
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
    userData,
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
        color: "#000000",
    });
    const [labelInputValues, setLabelInputValues] = useState<{
        name: string;
        color: string;
    }>({
        name: "",
        color: "#000000",
    });
    const [status, setStatus] = useState<Status>(projectData.status);
    const [showPriorityEmoji, setShowPriorityEmoji] = useState<boolean>(
        !!projectData.show_priority_emoji,
    );
    const pathname = usePathname();
    const [initialValues, setInitialValues] = useState(() => ({
        name: projectData.name,
        icon: projectData.icon,
        color: projectData.color,
        description: projectData.description,
        status: projectData.status,
        showPriorityEmoji: !!projectData.show_priority_emoji,
    }));
    const [initialFormData, setInitialFormData] =
        useState<ProjectSettingsFormData>(() => ({
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
        }));
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
        if (!open) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setName(projectData.name);
        setIcon(projectData.icon);
        setColor(projectData.color);
        setDescription(projectData.description);
        setStatus(projectData.status);
        setShowPriorityEmoji(!!projectData.show_priority_emoji);
        setFormData({
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
        setInitialValues({
            name: projectData.name,
            icon: projectData.icon,
            color: projectData.color,
            description: projectData.description,
            status: projectData.status,
            showPriorityEmoji: !!projectData.show_priority_emoji,
        });
        setInitialFormData({
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        (async () => {
            if (formState && formState.status === "success") {
                const result = await getProjectData(projectData.slug);

                onOpenChange(false, result);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState]);

    const hasChanges = useMemo(() => {
        const simpleChanged =
            name !== initialValues.name ||
            icon !== initialValues.icon ||
            color !== initialValues.color ||
            description !== initialValues.description ||
            status !== initialValues.status ||
            showPriorityEmoji !== initialValues.showPriorityEmoji;

        const formChanged =
            formData.newColumns.length > 0 ||
            formData.deletedColumnIds.length > 0 ||
            formData.newCategories.length > 0 ||
            formData.deletedCategoryIds.length > 0 ||
            formData.newLabels.length > 0 ||
            formData.deletedLabelIds.length > 0 ||
            formData.emails.length > 0 ||
            formData.members.length !== initialFormData.members.length ||
            formData.members.some((member) => {
                const original = initialFormData.members.find(
                    (initialFormDataMember) =>
                        initialFormDataMember.id === member.id,
                );

                return !original || original.role !== member.role;
            }) ||
            formData.columns.some((column) => {
                const original = initialFormData.columns.find(
                    (initialFormDataColumn) =>
                        initialFormDataColumn.id === column.id,
                );

                return (
                    !original ||
                    column.name !== original.name ||
                    column.position !== original.position ||
                    column.wip_limit !== original.wip_limit
                );
            }) ||
            formData.categories.some((category) => {
                const original = initialFormData.categories.find(
                    (initialFormDataCategory) =>
                        initialFormDataCategory.id === category.id,
                );

                return (
                    !original ||
                    category.name !== original.name ||
                    category.color !== original.color
                );
            }) ||
            formData.labels.some((label) => {
                const original = initialFormData.labels.find(
                    (initialFormDataLabel) =>
                        initialFormDataLabel.id === label.id,
                );

                return (
                    !original ||
                    label.name !== original.name ||
                    label.color !== original.color
                );
            });

        return simpleChanged || formChanged;
    }, [
        name,
        initialValues.name,
        initialValues.icon,
        initialValues.color,
        initialValues.description,
        initialValues.status,
        initialValues.showPriorityEmoji,
        icon,
        color,
        description,
        status,
        showPriorityEmoji,
        formData.newColumns.length,
        formData.deletedColumnIds.length,
        formData.newCategories.length,
        formData.deletedCategoryIds.length,
        formData.newLabels.length,
        formData.deletedLabelIds.length,
        formData.emails.length,
        formData.members,
        formData.columns,
        formData.categories,
        formData.labels,
        initialFormData.members,
        initialFormData.columns,
        initialFormData.categories,
        initialFormData.labels,
    ]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="flex h-[88vh] max-h-[680px] w-[95vw] max-w-[780px] flex-col gap-0 overflow-hidden rounded-md border border-border bg-background-secondary p-0 shadow-xl [&>button:last-child]:hidden"
                aria-describedby={undefined}
            >
                <form
                    action={formAction}
                    noValidate
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <DialogTitle className="hidden"></DialogTitle>
                    <div className="flex flex-1 overflow-hidden">
                        <nav className="flex w-48 shrink-0 flex-col gap-0.5 border-r  border-border px-2 py-3">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;

                                if (
                                    item.id === "danger" &&
                                    userData.role !== "owner"
                                ) {
                                    return null;
                                }

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
                                                ? "border-border bg-control-active"
                                                : "border-transparent text-gray-500 hover:bg-control",
                                        )}
                                        disabled={isPending}
                                    >
                                        <span
                                            className={
                                                activeSection === item.id
                                                    ? ""
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
                                                className="ml-auto"
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
                                {activeSection === "danger" &&
                                    userData.role === "owner" && (
                                        <DangerSection
                                            name={name}
                                            slug={projectData.slug}
                                            members={projectData.members}
                                            isPending={isPending}
                                            onOpenChange={onOpenChange}
                                            onSectionChange={setActiveSection}
                                        />
                                    )}
                            </div>
                        </ScrollArea>
                    </div>
                    <SaveBar
                        formState={formState}
                        isPending={isPending}
                        hasChanges={hasChanges}
                        onOpenChange={onOpenChange}
                    />
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

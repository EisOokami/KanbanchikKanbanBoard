"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { Switch } from "@/components/ui/shadcn/switch";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/shadcn/alert-dialog";
import { cn, getInitials } from "@/libs/utils";
import { NavSection } from "@/types/projectSettingsDialog";
import { NAV_ITEMS } from "@/constants/projectSettingsDialog";
import { Category, Label, User, Project, Column } from "@/types/types";
import {
    LABEL_PALETTE,
    PROJECT_COLORS,
    PROJECT_ICONS,
    ROLE_META,
} from "@/constants/constants";
import {
    ArchiveIcon,
    CaretRightIcon,
    CheckIcon,
    DotsSixVerticalIcon,
    HashIcon,
    PencilSimpleIcon,
    PlusIcon,
    TrashSimpleIcon,
    UserPlusIcon,
    XIcon,
} from "@phosphor-icons/react";

interface ProjectSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (data: Project) => void;
    columnsData: Column[];
    projectData: Project;
}

export function ProjectSettingsDialog({
    open,
    onOpenChange,
    onSave,
    columnsData,
    projectData,
}: ProjectSettingsDialogProps) {
    const [activeSection, setActiveSection] = useState<NavSection>("general");
    const [title, setTitle] = useState<string>(projectData.name);
    const [description, setDescription] = useState<string>(
        projectData.description,
    );
    const [projectIcon, setProjectIcon] = useState<string>(projectData.icon);
    const [projectColor, setProjectColor] = useState<string>(projectData.color);
    const [isArchived, setIsArchived] = useState<boolean>(
        projectData.status === "archived",
    );
    const [iconPickerOpen, setIconPickerOpen] = useState<boolean>(false);
    const [colorPickerOpen, setColorPickerOpen] = useState<boolean>(false);
    const [columns, setColumns] = useState<Column[]>(columnsData);
    const [newColumnName, setNewColumnName] = useState<string>("");
    // const [newColColor, setNewColColor] = useState(COLUMN_COLORS[0]);
    const [editingColumn, setEditingColumn] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>(
        projectData.categories,
    );
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [labels, setLabels] = useState<Label[]>(projectData.labels);
    const [newLabel, setNewLabel] = useState({
        name: "",
        color: LABEL_PALETTE[0],
    });
    const [editingLabel, setEditingLabel] = useState<number | null>(null);
    const [members, setMembers] = useState<Omit<User, "email">[]>(
        projectData.members,
    );
    const [inviteEmail, setInviteEmail] = useState<string>("");
    const [inviteRole, setInviteRole] = useState<User["role"]>("member");

    const addColumn = () => {
        if (!newColumnName.trim()) return;
        // setColumns((column) => [
        //     ...column,
        //     {
        //         id: columns.length + 1,
        //         dot: `bg-[${newColColor}]/50`,
        //         label: newColumnName.trim(),
        //         pill: `bg-[${newColColor}]/5 text-[${newColColor}]/50 border-[${newColColor}]/20`,
        //         order: columns.length + 1,
        //     },
        // ]);
        setNewColumnName("");
        // setNewColColor(COLUMN_COLORS[0]);
    };

    const updateColumn = (id: number, patch: Partial<Column>) =>
        setColumns((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)));

    const removeColumn = (id: number) =>
        setColumns((c) => c.filter((x) => x.id !== id));

    const addCategory = () => {
        if (!newCategoryName.trim()) return;
        setCategories((category) => [
            ...category,
            {
                id: categories.length + 1,
                name: newCategoryName.trim(),
                description: "",
                color: "",
                created_at: new Date(),
                updated_at: null,
                pill: "",
            },
        ]);
        setNewCategoryName("");
    };

    const removeCategory = (id: number) =>
        setCategories((c) => c.filter((x) => x.id !== id));

    const addLabel = () => {
        if (!newLabel.name.trim()) return;
        setLabels((label) => [
            ...label,
            {
                id: labels.length + 1,
                ...newLabel,
                name: newLabel.name.trim(),
            },
        ]);
        setNewLabel({ name: "", color: LABEL_PALETTE[0] });
    };

    const updateLabel = (id: number, patch: Partial<Label>) =>
        setLabels((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));

    const removeLabel = (id: number) =>
        setLabels((l) => l.filter((x) => x.id !== id));

    const updateMemberRole = (id: number, role: User["role"]) =>
        setMembers((m) => m.map((x) => (x.id === id ? { ...x, role } : x)));

    const removeMember = (id: number) =>
        setMembers((m) => m.filter((x) => x.id !== id));

    const handleInvite = () => {
        if (!inviteEmail.trim()) return;
        setInviteEmail("");
    };

    const handleSave = () => {
        // onSave?.({
        //     id: new Date().getTime(),
        //     name: title,
        //     description,
        //     icon,
        //     members,
        //     color: projectColor,
        //     created_at: new Date(),
        //     owner: { name: "", avatar_url: "" },
        //     status: "active",
        //     columns: [],
        //     updated_at: null,
        // });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[88vh] max-h-[680px] w-[95vw] max-w-[780px] flex-col gap-0 overflow-hidden rounded-md border bg-white p-0 shadow-xl [&>button:last-child]:hidden">
                <DialogTitle className="hidden"></DialogTitle>
                <div className="flex flex-1 overflow-hidden">
                    <nav className="flex w-48 shrink-0 flex-col gap-0.5 border-r px-2 py-3">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={cn(
                                        "flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm font-medium transition-all",
                                        activeSection === item.id
                                            ? "bg-white text-bright-blue shadow-sm"
                                            : "border-transparent text-gray-500 hover:bg-white/80",
                                    )}
                                >
                                    <span
                                        className={`${activeSection === item.id ? "text-bright-blue" : "text-gray-500"}`}
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
                                <div className="space-y-5">
                                    <div className="flex items-start gap-6">
                                        <div className="space-y-2">
                                            <h3 className="font-semibold">
                                                Project Icon
                                            </h3>
                                            <div className="flex items-start gap-3">
                                                <button
                                                    onClick={() => {
                                                        setIconPickerOpen(
                                                            !iconPickerOpen,
                                                        );
                                                        setColorPickerOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="relative flex size-14 items-center justify-center rounded-md border text-2xl transition-all hover:brightness-95"
                                                    style={{
                                                        background: `${projectColor}15`,
                                                        borderColor: `${projectColor}30`,
                                                    }}
                                                >
                                                    {projectIcon}
                                                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-bright-blue">
                                                        <PencilSimpleIcon
                                                            weight="duotone"
                                                            size={9}
                                                            className="text-white"
                                                        />
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setColorPickerOpen(
                                                            !colorPickerOpen,
                                                        );
                                                        setIconPickerOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="relative flex size-14 items-center justify-center rounded-md border transition-all hover:brightness-95"
                                                    style={{
                                                        background: `${projectColor}20`,
                                                        borderColor: `${projectColor}40`,
                                                    }}
                                                >
                                                    <div
                                                        className="size-6 rounded-full shadow-sm"
                                                        style={{
                                                            background:
                                                                projectColor,
                                                        }}
                                                    />
                                                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-bright-blue">
                                                        <PencilSimpleIcon
                                                            weight="duotone"
                                                            size={9}
                                                            className="text-white"
                                                        />
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {iconPickerOpen && (
                                        <div className="flex flex-wrap gap-1.5 rounded-md border bg-gray-50 p-3">
                                            {PROJECT_ICONS.map((icon) => (
                                                <button
                                                    key={icon}
                                                    onClick={() => {
                                                        setProjectIcon(icon);
                                                        setIconPickerOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className={cn(
                                                        "flex size-9 items-center justify-center rounded-md text-xl transition-all hover:bg-white",
                                                        icon === projectIcon
                                                            ? "bg-white ring-2 ring-bright-blue"
                                                            : "",
                                                    )}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {colorPickerOpen && (
                                        <div className="rounded-md border bg-gray-50 p-3">
                                            <p className="mb-2.5 text-xs font-medium text-gray-500">
                                                Select color
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {PROJECT_COLORS.map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() => {
                                                            setProjectColor(
                                                                color,
                                                            );
                                                            setColorPickerOpen(
                                                                false,
                                                            );
                                                        }}
                                                        className={cn(
                                                            "flex size-8 items-center justify-center rounded-full transition-all hover:brightness-90",
                                                            projectColor ===
                                                                color
                                                                ? "ring-2 ring-offset-2"
                                                                : "",
                                                        )}
                                                        style={{
                                                            background: color,
                                                            ...(projectColor ===
                                                            color
                                                                ? {
                                                                      ringColor:
                                                                          color,
                                                                  }
                                                                : {}),
                                                            outline:
                                                                projectColor ===
                                                                color
                                                                    ? `2px solid ${color}`
                                                                    : "none",
                                                            outlineOffset:
                                                                projectColor ===
                                                                color
                                                                    ? "2px"
                                                                    : "0",
                                                        }}
                                                    >
                                                        {projectColor ===
                                                            color && (
                                                            <CheckIcon
                                                                weight="duotone"
                                                                size={13}
                                                                className="text-white"
                                                            />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">Title</h3>
                                        <Input
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                            className="h-10 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">
                                            Description
                                        </h3>
                                        <Textarea
                                            value={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                            rows={4}
                                            className="resize-none rounded-md text-xs placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {description.length}/500
                                        </p>
                                    </div>
                                    <div
                                        className="flex items-center justify-between rounded-md border p-4 transition-colors"
                                        style={{
                                            background: isArchived
                                                ? "#FEF4EC"
                                                : "",
                                            border: `1px solid ${isArchived ? "#FCD9B5" : "#E5E7EB"}`,
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex size-8 items-center justify-center rounded-md"
                                                style={{
                                                    background: isArchived
                                                        ? "#FCD9B5"
                                                        : "#F3F4F6",
                                                }}
                                            >
                                                <ArchiveIcon
                                                    weight="duotone"
                                                    size={14}
                                                    className="transition-colors"
                                                    style={{
                                                        color: isArchived
                                                            ? "#C9620A"
                                                            : "#6b7280",
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <p
                                                    className="text-sm font-medium"
                                                    style={{
                                                        color: isArchived
                                                            ? "#C9620A"
                                                            : "#374151",
                                                    }}
                                                >
                                                    Archive project
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Archived projects are hidden
                                                    from the main board
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={isArchived}
                                            onCheckedChange={setIsArchived}
                                            className="data-[state=checked]:bg-[#C9620A]"
                                        />
                                    </div>
                                </div>
                            )}
                            {activeSection === "columns" && (
                                <div className="space-y-1">
                                    <h3 className="font-semibold">Columns</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            {columns.map((column) => (
                                                <div
                                                    key={column.id}
                                                    className="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-gray-50"
                                                >
                                                    <DotsSixVerticalIcon
                                                        weight="duotone"
                                                        size={14}
                                                        className="cursor-grab text-gray-500"
                                                    />
                                                    {editingColumn ===
                                                    column.id ? (
                                                        <Input
                                                            autoFocus
                                                            value={column.name}
                                                            onChange={(e) =>
                                                                updateColumn(
                                                                    column.id,
                                                                    {
                                                                        name: e
                                                                            .target
                                                                            .value,
                                                                    },
                                                                )
                                                            }
                                                            onBlur={() =>
                                                                setEditingColumn(
                                                                    null,
                                                                )
                                                            }
                                                            onKeyDown={(e) =>
                                                                e.key ===
                                                                    "Enter" &&
                                                                setEditingColumn(
                                                                    null,
                                                                )
                                                            }
                                                            className="h-7 flex-1 rounded-md px-2 text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                                        />
                                                    ) : (
                                                        <span className="flex-1 text-sm font-medium">
                                                            {column.name}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        {/* {COLUMN_COLORS.slice(
                                                            0,
                                                            4,
                                                        ).map((c) => (
                                                            <button
                                                                key={c}
                                                                onClick={() =>
                                                                    updateColumn(
                                                                        col.id,
                                                                        {
                                                                            color: c,
                                                                        },
                                                                    )
                                                                }
                                                                className={cn(
                                                                    "size-4 rounded-full transition-transform hover:scale-110",
                                                                    col.color ===
                                                                        c
                                                                        ? "ring-2 ring-gray-400 ring-offset-1"
                                                                        : "",
                                                                )}
                                                                style={{
                                                                    background:
                                                                        c,
                                                                }}
                                                            />
                                                        ))} */}
                                                        <button
                                                            onClick={() =>
                                                                setEditingColumn(
                                                                    column.id,
                                                                )
                                                            }
                                                            className="ml-1 flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100"
                                                        >
                                                            <PencilSimpleIcon
                                                                weight="duotone"
                                                                size={16}
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                removeColumn(
                                                                    column.id,
                                                                )
                                                            }
                                                            className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-400"
                                                        >
                                                            <TrashSimpleIcon
                                                                weight="duotone"
                                                                size={16}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 rounded-md border p-3">
                                            {/* <div className="flex gap-1.5">
                                                {COLUMN_COLORS.map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() =>
                                                            setNewColColor(c)
                                                        }
                                                        className={cn(
                                                            "size-5 rounded-full transition-transform hover:scale-110",
                                                            newColColor === c
                                                                ? "ring-2 ring-bright-blue ring-offset-1"
                                                                : "",
                                                        )}
                                                        style={{
                                                            background: c,
                                                        }}
                                                    />
                                                ))}
                                            </div> */}
                                            <Input
                                                placeholder="Column name…"
                                                value={newColumnName}
                                                onChange={(e) =>
                                                    setNewColumnName(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" &&
                                                    addColumn()
                                                }
                                                className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={addColumn}
                                                disabled={!newColumnName.trim()}
                                                className="h-8 rounded-md bg-bright-blue px-3 text-[12px] text-white hover:bg-blue-600 disabled:opacity-40"
                                            >
                                                <PlusIcon
                                                    weight="duotone"
                                                    size={13}
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeSection === "categories" && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">
                                        Categories
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium"
                                                >
                                                    <HashIcon
                                                        weight="duotone"
                                                        size={11}
                                                    />
                                                    {cat.name}
                                                    <button
                                                        onClick={() =>
                                                            removeCategory(
                                                                cat.id,
                                                            )
                                                        }
                                                        className="ml-0.5 text-gray-500 transition-all hover:text-red-500"
                                                    >
                                                        <XIcon
                                                            weight="duotone"
                                                            size={11}
                                                        />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 rounded-md border px-3 py-2.5">
                                            <HashIcon
                                                weight="duotone"
                                                size={13}
                                            />
                                            <Input
                                                placeholder="New category…"
                                                value={newCategoryName}
                                                onChange={(e) =>
                                                    setNewCategoryName(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" &&
                                                    addCategory()
                                                }
                                                className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={addCategory}
                                                disabled={
                                                    !newCategoryName.trim()
                                                }
                                                className="h-8 rounded-md bg-bright-blue px-3 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
                                            >
                                                <PlusIcon
                                                    weight="duotone"
                                                    size={13}
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeSection === "labels" && (
                                <div className="space-y-1">
                                    <h3 className="font-semibold">Labels</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            {labels.map((lbl) => (
                                                <div
                                                    key={lbl.id}
                                                    className="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-gray-50"
                                                >
                                                    <div
                                                        className="size-5 shrink-0 rounded-full border-2 border-white shadow-sm"
                                                        style={{
                                                            background:
                                                                lbl.color,
                                                        }}
                                                    />
                                                    {editingLabel === lbl.id ? (
                                                        <Input
                                                            autoFocus
                                                            value={lbl.name}
                                                            onChange={(e) =>
                                                                updateLabel(
                                                                    lbl.id,
                                                                    {
                                                                        name: e
                                                                            .target
                                                                            .value,
                                                                    },
                                                                )
                                                            }
                                                            onBlur={() =>
                                                                setEditingLabel(
                                                                    null,
                                                                )
                                                            }
                                                            onKeyDown={(e) =>
                                                                e.key ===
                                                                    "Enter" &&
                                                                setEditingLabel(
                                                                    null,
                                                                )
                                                            }
                                                            className="h-7 flex-1 rounded-md px-2 text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                                        />
                                                    ) : (
                                                        <span className="flex-1 text-sm font-medium">
                                                            {lbl.name}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        {LABEL_PALETTE.map(
                                                            (c) => (
                                                                <button
                                                                    key={c}
                                                                    onClick={() =>
                                                                        updateLabel(
                                                                            lbl.id,
                                                                            {
                                                                                color: c,
                                                                            },
                                                                        )
                                                                    }
                                                                    className={cn(
                                                                        "size-4 rounded-full transition-transform hover:scale-110",
                                                                        lbl.color ===
                                                                            c
                                                                            ? "ring-2 ring-gray-400 ring-offset-1"
                                                                            : "",
                                                                    )}
                                                                    style={{
                                                                        background:
                                                                            c,
                                                                    }}
                                                                />
                                                            ),
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                setEditingLabel(
                                                                    lbl.id,
                                                                )
                                                            }
                                                            className="ml-1 flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                                                        >
                                                            <PencilSimpleIcon
                                                                weight="duotone"
                                                                size={11}
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                removeLabel(
                                                                    lbl.id,
                                                                )
                                                            }
                                                            className="flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-red-50 hover:text-red-400"
                                                        >
                                                            <TrashSimpleIcon
                                                                weight="duotone"
                                                                size={11}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-2 rounded-md border p-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {LABEL_PALETTE.map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() =>
                                                            setNewLabel(
                                                                (l) => ({
                                                                    ...l,
                                                                    color: c,
                                                                }),
                                                            )
                                                        }
                                                        className={cn(
                                                            "size-5 rounded-full transition-transform hover:scale-110",
                                                            newLabel.color === c
                                                                ? "ring-2 ring-bright-blue ring-offset-1"
                                                                : "",
                                                        )}
                                                        style={{
                                                            background: c,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <div
                                                    className="size-5 shrink-0 self-center rounded-full border-2 border-white shadow"
                                                    style={{
                                                        background:
                                                            newLabel.color,
                                                    }}
                                                />
                                                <Input
                                                    placeholder="Label name…"
                                                    value={newLabel.name}
                                                    onChange={(e) =>
                                                        setNewLabel((l) => ({
                                                            ...l,
                                                            name: e.target
                                                                .value,
                                                        }))
                                                    }
                                                    onKeyDown={(e) =>
                                                        e.key === "Enter" &&
                                                        addLabel()
                                                    }
                                                    className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={addLabel}
                                                    disabled={
                                                        !newLabel.name.trim()
                                                    }
                                                    className="h-8 rounded-md bg-bright-blue px-3 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
                                                >
                                                    <PlusIcon
                                                        weight="duotone"
                                                        size={13}
                                                    />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeSection === "members" && (
                                <div className="space-y-1">
                                    <h3 className="font-semibold">
                                        Members ({members.length})
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 rounded-md border px-3 py-2.5">
                                            <UserPlusIcon
                                                weight="duotone"
                                                size={18}
                                            />
                                            <Input
                                                type="email"
                                                placeholder="Invite by email…"
                                                value={inviteEmail}
                                                onChange={(e) =>
                                                    setInviteEmail(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" &&
                                                    handleInvite()
                                                }
                                                className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                            />
                                            <div className="flex gap-1">
                                                {(
                                                    [
                                                        "admin",
                                                        "member",
                                                        "viewer",
                                                    ] as const
                                                ).map((role) => (
                                                    <button
                                                        key={role}
                                                        onClick={() =>
                                                            setInviteRole(role)
                                                        }
                                                        className="rounded-md border px-2 py-1 text-xs font-medium transition-all"
                                                        style={
                                                            inviteRole === role
                                                                ? {
                                                                      background:
                                                                          ROLE_META[
                                                                              role
                                                                          ].bg,
                                                                      color: ROLE_META[
                                                                          role
                                                                      ].color,
                                                                      border: `1px solid ${ROLE_META[role].border}`,
                                                                  }
                                                                : {
                                                                      background:
                                                                          "#F3F4F6",
                                                                      color: "#6B7280",
                                                                      border: "1px solid #E5E7EB",
                                                                  }
                                                        }
                                                    >
                                                        {ROLE_META[role].label}
                                                    </button>
                                                ))}
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={handleInvite}
                                                disabled={!inviteEmail.trim()}
                                                className="h-8 shrink-0 rounded-md bg-bright-blue px-3 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
                                            >
                                                Invite
                                            </Button>
                                        </div>
                                        <div className="space-y-1.5">
                                            {members.map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-gray-50"
                                                >
                                                    <Avatar className="size-8 shrink-0">
                                                        <AvatarFallback
                                                            className="text-xs font-bold text-white"
                                                            style={{
                                                                backgroundColor:
                                                                    member.color,
                                                            }}
                                                        >
                                                            {getInitials(
                                                                member.name,
                                                                member.surname,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">
                                                            {member.name}
                                                        </p>
                                                    </div>
                                                    <div className="flex shrink-0 gap-1">
                                                        {(
                                                            [
                                                                "owner",
                                                                "admin",
                                                                "member",
                                                                "viewer",
                                                            ] as const
                                                        ).map((role) => {
                                                            if (
                                                                role ===
                                                                    "owner" &&
                                                                member.role !==
                                                                    "owner"
                                                            )
                                                                return null;
                                                            return (
                                                                <button
                                                                    key={role}
                                                                    onClick={() =>
                                                                        member.role !==
                                                                            "owner" &&
                                                                        updateMemberRole(
                                                                            member.id,
                                                                            role,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        member.role ===
                                                                        "owner"
                                                                    }
                                                                    className={cn(
                                                                        "rounded-md border px-2 py-0.5 text-xs font-medium transition-all",
                                                                        member.role ===
                                                                            role
                                                                            ? ""
                                                                            : "bg-gray-100",
                                                                    )}
                                                                    style={
                                                                        member.role ===
                                                                        role
                                                                            ? {
                                                                                  background:
                                                                                      ROLE_META[
                                                                                          role
                                                                                      ]
                                                                                          .bg,
                                                                                  color: ROLE_META[
                                                                                      role
                                                                                  ]
                                                                                      .color,
                                                                                  border: `1px solid ${ROLE_META[role].border}`,
                                                                              }
                                                                            : {
                                                                                  background:
                                                                                      "transparent",
                                                                                  color: "#6B7280",
                                                                                  border: "1px solid transparent",
                                                                              }
                                                                    }
                                                                >
                                                                    {
                                                                        ROLE_META[
                                                                            role
                                                                        ].label
                                                                    }
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {member.role !==
                                                        "owner" && (
                                                        <button
                                                            onClick={() =>
                                                                removeMember(
                                                                    member.id,
                                                                )
                                                            }
                                                            className="flex size-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition-all hover:bg-red-100 hover:text-red-500"
                                                        >
                                                            <XIcon
                                                                weight="duotone"
                                                                size={13}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeSection === "danger" && (
                                <div className="space-y-1">
                                    <h3 className="font-semibold">
                                        Danger Zone
                                    </h3>
                                    <div className="space-y-4">
                                        <div
                                            className="flex items-center justify-between rounded-md border p-4"
                                            style={{
                                                background: "#FEF4EC",
                                                border: "1px solid #FCD9B5",
                                            }}
                                        >
                                            <div>
                                                <p
                                                    className="text-sm font-semibold"
                                                    style={{ color: "#C9620A" }}
                                                >
                                                    Archive project
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    Hide this project from the
                                                    board. You can restore it
                                                    anytime.
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setIsArchived(true);
                                                    setActiveSection("general");
                                                }}
                                                className="h-8 shrink-0 rounded-md px-3 text-xs font-medium"
                                                style={{
                                                    border: "1px solid #FCD9B5",
                                                    color: "#C9620A",
                                                    background: "#FFF",
                                                }}
                                            >
                                                <ArchiveIcon
                                                    weight="duotone"
                                                    size={13}
                                                />
                                                Archive
                                            </Button>
                                        </div>
                                        <div
                                            className="flex items-center justify-between rounded-md border p-4"
                                            style={{
                                                background: "#FEF0EF",
                                                border: "1px solid #FACACB",
                                            }}
                                        >
                                            <div>
                                                <p
                                                    className="text-sm font-semibold"
                                                    style={{ color: "#D93025" }}
                                                >
                                                    Delete project
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    Permanently delete this
                                                    project and all its tasks.
                                                    This cannot be undone.
                                                </p>
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 shrink-0 rounded-md px-3 text-xs font-medium"
                                                        style={{
                                                            border: "1px solid #FACACB",
                                                            color: "#D93025",
                                                            background: "#FFF",
                                                        }}
                                                    >
                                                        <TrashSimpleIcon
                                                            weight="duotone"
                                                            size={13}
                                                        />
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Delete &quot;{title}
                                                            &quot;?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will
                                                            permanently delete
                                                            the project, all
                                                            tasks, and all
                                                            related data. This
                                                            action cannot be
                                                            undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-md">
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="rounded-md bg-red-500 font-semibold text-white hover:bg-red-600"
                                                            onClick={() =>
                                                                onOpenChange(
                                                                    false,
                                                                )
                                                            }
                                                        >
                                                            Delete project
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                <div className="flex shrink-0 items-center justify-end gap-2 border-t px-6 py-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-9 rounded-md px-4 text-sm hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!title.trim()}
                        className="h-9 rounded-md bg-bright-blue text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40"
                    >
                        <CheckIcon weight="duotone" size={14} />
                        Save changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

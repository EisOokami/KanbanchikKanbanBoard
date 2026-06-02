"use client";

import * as React from "react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
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
import {
    Archive,
    Check,
    ChevronRight,
    Edit2,
    FolderOpen,
    GripVertical,
    Hash,
    LayoutGrid,
    Plus,
    Settings,
    Tag,
    Trash2,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import { cn } from "@/libs/utils";

interface Column {
    id: string;
    name: string;
    color: string;
    taskCount: number;
}

interface Category {
    id: string;
    name: string;
}

interface Label {
    id: string;
    name: string;
    color: string;
}

interface Member {
    id: string;
    name: string;
    email: string;
    initials: string;
    color: string;
    role: "owner" | "editor" | "viewer";
}

const PROJECT_ICONS = [
    "🚀",
    "💡",
    "🎯",
    "⚡",
    "🔥",
    "🌊",
    "🎨",
    "🛠",
    "📦",
    "🧩",
    "🌿",
    "💎",
];

const LABEL_PALETTE = [
    "#D93025",
    "#C9620A",
    "#1A6BBF",
    "#1E7E3A",
    "#7C5CBF",
    "#2A9D8F",
    "#E76F51",
    "#264653",
    "#C09A3A",
    "#9B2C9B",
    "#1A7A6E",
    "#B5451B",
];

const COLUMN_COLORS = [
    "#E5E7EB",
    "#BDD5F5",
    "#AEDFC0",
    "#FACACB",
    "#FCD9B5",
    "#D3CBF8",
    "#A7F3D0",
    "#FDE68A",
];

const ROLE_META: Record<
    Member["role"],
    { label: string; color: string; bg: string; border: string }
> = {
    owner: {
        label: "Owner",
        color: "#7C5CBF",
        bg: "#EDE9FD",
        border: "#D3CBF8",
    },
    editor: {
        label: "Editor",
        color: "#1A6BBF",
        bg: "#EEF4FD",
        border: "#BDD5F5",
    },
    viewer: {
        label: "Viewer",
        color: "#1E7E3A",
        bg: "#EEFAF2",
        border: "#AEDFC0",
    },
};

const INIT_COLUMNS: Column[] = [
    { id: "c1", name: "To Do", color: "#E5E7EB", taskCount: 8 },
    { id: "c2", name: "In Progress", color: "#BDD5F5", taskCount: 5 },
    { id: "c3", name: "In Review", color: "#FCD9B5", taskCount: 3 },
    { id: "c4", name: "Done", color: "#AEDFC0", taskCount: 14 },
];

const INIT_CATEGORIES: Category[] = [
    { id: "cat1", name: "Design" },
    { id: "cat2", name: "Engineering" },
    { id: "cat3", name: "Research" },
    { id: "cat4", name: "QA" },
];

const INIT_LABELS: Label[] = [
    { id: "l1", name: "Bug", color: "#D93025" },
    { id: "l2", name: "Feature", color: "#1A6BBF" },
    { id: "l3", name: "Urgent", color: "#C9620A" },
    { id: "l4", name: "Backlog", color: "#6B7280" },
];

const INIT_MEMBERS: Member[] = [
    {
        id: "m1",
        name: "Sofia Marchetti",
        email: "sofia@studio.io",
        initials: "SM",
        color: "#7C5CBF",
        role: "owner",
    },
    {
        id: "m2",
        name: "Luca Ferrara",
        email: "luca@studio.io",
        initials: "LF",
        color: "#2A9D8F",
        role: "editor",
    },
    {
        id: "m3",
        name: "Anna Kowalski",
        email: "anna@studio.io",
        initials: "AK",
        color: "#E76F51",
        role: "editor",
    },
    {
        id: "m4",
        name: "James Okafor",
        email: "james@studio.io",
        initials: "JO",
        color: "#264653",
        role: "viewer",
    },
];

type NavSection =
    | "general"
    | "columns"
    | "categories"
    | "labels"
    | "members"
    | "danger";

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Settings size={14} /> },
    { id: "columns", label: "Columns", icon: <LayoutGrid size={14} /> },
    { id: "categories", label: "Categories", icon: <FolderOpen size={14} /> },
    { id: "labels", label: "Labels", icon: <Tag size={14} /> },
    { id: "members", label: "Members", icon: <Users size={14} /> },
    { id: "danger", label: "Danger zone", icon: <Archive size={14} /> },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3
            className="mb-4 text-[13px] font-semibold"
            style={{ color: "#111827" }}
        >
            {children}
        </h3>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: "#6b7280" }}
        >
            {children}
        </label>
    );
}

interface ProjectSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (data: ProjectData) => void;
}

interface ProjectData {
    title: string;
    description: string;
    icon: string;
    isArchived: boolean;
    columns: Column[];
    categories: Category[];
    labels: Label[];
    members: Member[];
}

export function ProjectSettingsDialog({
    open,
    onOpenChange,
    onSave,
}: ProjectSettingsDialogProps) {
    const [activeSection, setActiveSection] = useState<NavSection>("general");
    const [title, setTitle] = useState("Product Redesign");
    const [description, setDescription] = useState(
        "Redesigning the core product experience for Q3 launch. Covers UX research, visual design, and front-end implementation.",
    );
    const [icon, setIcon] = useState("🚀");
    const [isArchived, setIsArchived] = useState(false);
    const [iconPickerOpen, setIconPickerOpen] = useState(false);
    const [columns, setColumns] = useState<Column[]>(INIT_COLUMNS);
    const [newColName, setNewColName] = useState("");
    const [newColColor, setNewColColor] = useState(COLUMN_COLORS[0]);
    const [editingCol, setEditingCol] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>(INIT_CATEGORIES);
    const [newCatName, setNewCatName] = useState("");
    const [labels, setLabels] = useState<Label[]>(INIT_LABELS);
    const [newLabel, setNewLabel] = useState({
        name: "",
        color: LABEL_PALETTE[0],
    });
    const [editingLabel, setEditingLabel] = useState<string | null>(null);
    const [members, setMembers] = useState<Member[]>(INIT_MEMBERS);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<Member["role"]>("editor");

    const addColumn = () => {
        if (!newColName.trim()) return;
        setColumns((c) => [
            ...c,
            {
                id: crypto.randomUUID(),
                name: newColName.trim(),
                color: newColColor,
                taskCount: 0,
            },
        ]);
        setNewColName("");
        setNewColColor(COLUMN_COLORS[0]);
    };

    const updateColumn = (id: string, patch: Partial<Column>) =>
        setColumns((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)));

    const removeColumn = (id: string) =>
        setColumns((c) => c.filter((x) => x.id !== id));

    const addCategory = () => {
        if (!newCatName.trim()) return;
        setCategories((c) => [
            ...c,
            { id: crypto.randomUUID(), name: newCatName.trim() },
        ]);
        setNewCatName("");
    };

    const removeCategory = (id: string) =>
        setCategories((c) => c.filter((x) => x.id !== id));

    const addLabel = () => {
        if (!newLabel.name.trim()) return;
        setLabels((l) => [
            ...l,
            {
                id: crypto.randomUUID(),
                ...newLabel,
                name: newLabel.name.trim(),
            },
        ]);
        setNewLabel({ name: "", color: LABEL_PALETTE[0] });
    };

    const updateLabel = (id: string, patch: Partial<Label>) =>
        setLabels((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));

    const removeLabel = (id: string) =>
        setLabels((l) => l.filter((x) => x.id !== id));

    const updateMemberRole = (id: string, role: Member["role"]) =>
        setMembers((m) => m.map((x) => (x.id === id ? { ...x, role } : x)));

    const removeMember = (id: string) =>
        setMembers((m) => m.filter((x) => x.id !== id));

    const handleInvite = () => {
        if (!inviteEmail.trim()) return;
        setInviteEmail("");
    };

    const handleSave = () => {
        onSave?.({
            title,
            description,
            icon,
            isArchived,
            columns,
            categories,
            labels,
            members,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[88vh] max-h-[680px] w-[95vw] max-w-[780px] flex-col gap-0 overflow-hidden rounded-md border bg-white p-0 shadow-xl [&>button:last-child]:hidden">
                <DialogHeader className="shrink-0 border-b px-6 pb-4 pt-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-gray-100 text-lg">
                                {icon}
                            </div>
                            <div>
                                <DialogTitle className="text-base font-semibold">
                                    Project Settings
                                </DialogTitle>
                                <p className="text-xs text-gray-500">{title}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="rounded-md p-1.5 transition-colors hover:bg-gray-100"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </DialogHeader>
                <div className="flex flex-1 overflow-hidden">
                    <nav className="flex w-48 shrink-0 flex-col gap-0.5 border-r bg-gray-50 px-2 py-3">
                        {NAV_ITEMS.map((item) => (
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
                                    {item.icon}
                                </span>
                                {item.label}
                                {activeSection === item.id && (
                                    <ChevronRight
                                        size={12}
                                        className="ml-auto text-bright-blue"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>
                    <ScrollArea className="flex-1">
                        <div className="p-6">
                            {activeSection === "general" && (
                                <div className="space-y-5">
                                    <SectionTitle>General</SectionTitle>
                                    <div>
                                        <FieldLabel>Project Icon</FieldLabel>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() =>
                                                    setIconPickerOpen(
                                                        !iconPickerOpen,
                                                    )
                                                }
                                                className="relative flex size-14 items-center justify-center rounded-md border text-2xl transition-all hover:brightness-95"
                                            >
                                                {icon}
                                                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-bright-blue">
                                                    <Edit2
                                                        size={9}
                                                        className="text-white"
                                                    />
                                                </span>
                                            </button>
                                            {iconPickerOpen && (
                                                <div className="flex flex-wrap gap-1.5 rounded-md border bg-gray-50 p-3">
                                                    {PROJECT_ICONS.map((ic) => (
                                                        <button
                                                            key={ic}
                                                            onClick={() => {
                                                                setIcon(ic);
                                                                setIconPickerOpen(
                                                                    false,
                                                                );
                                                            }}
                                                            className={cn(
                                                                "flex size-9 items-center justify-center rounded-md text-xl transition-all hover:bg-white",
                                                                icon === ic
                                                                    ? "bg-white ring-2 ring-bright-blue"
                                                                    : "",
                                                            )}
                                                        >
                                                            {ic}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <FieldLabel>Title</FieldLabel>
                                        <Input
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                            className="h-10 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Description</FieldLabel>
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
                                                <Archive
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
                                <div className="space-y-4">
                                    <SectionTitle>Columns</SectionTitle>
                                    <div className="space-y-2">
                                        {columns.map((col) => (
                                            <div
                                                key={col.id}
                                                className="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-gray-50"
                                            >
                                                <GripVertical
                                                    size={14}
                                                    className="cursor-grab text-gray-500"
                                                />
                                                <div
                                                    className="h-3 w-3 shrink-0 rounded-full"
                                                    style={{
                                                        background: col.color,
                                                    }}
                                                />
                                                {editingCol === col.id ? (
                                                    <Input
                                                        autoFocus
                                                        value={col.name}
                                                        onChange={(e) =>
                                                            updateColumn(
                                                                col.id,
                                                                {
                                                                    name: e
                                                                        .target
                                                                        .value,
                                                                },
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            setEditingCol(null)
                                                        }
                                                        onKeyDown={(e) =>
                                                            e.key === "Enter" &&
                                                            setEditingCol(null)
                                                        }
                                                        className="h-7 flex-1 rounded-md px-2 text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                                    />
                                                ) : (
                                                    <span className="flex-1 text-sm font-medium">
                                                        {col.name}
                                                    </span>
                                                )}
                                                <span className="shrink-0 text-xs text-gray-500">
                                                    {col.taskCount} task
                                                    {col.taskCount !== 1
                                                        ? "s"
                                                        : ""}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {COLUMN_COLORS.slice(
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
                                                                col.color === c
                                                                    ? "ring-2 ring-gray-400 ring-offset-1"
                                                                    : "",
                                                            )}
                                                            style={{
                                                                background: c,
                                                            }}
                                                        />
                                                    ))}
                                                    <button
                                                        onClick={() =>
                                                            setEditingCol(
                                                                col.id,
                                                            )
                                                        }
                                                        className="ml-1 flex size-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100"
                                                    >
                                                        <Edit2 size={11} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            removeColumn(col.id)
                                                        }
                                                        className="flex size-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-400"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 rounded-md border p-3">
                                        <div className="flex gap-1.5">
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
                                                    style={{ background: c }}
                                                />
                                            ))}
                                        </div>
                                        <Input
                                            placeholder="Column name…"
                                            value={newColName}
                                            onChange={(e) =>
                                                setNewColName(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" && addColumn()
                                            }
                                            className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={addColumn}
                                            disabled={!newColName.trim()}
                                            className="h-8 rounded-md bg-bright-blue px-3 text-[12px] text-white hover:bg-blue-600 disabled:opacity-40"
                                        >
                                            <Plus size={13} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {activeSection === "categories" && (
                                <div className="space-y-4">
                                    <SectionTitle>Categories</SectionTitle>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <div
                                                key={cat.id}
                                                className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium"
                                            >
                                                <Hash size={11} />
                                                {cat.name}
                                                <button
                                                    onClick={() =>
                                                        removeCategory(cat.id)
                                                    }
                                                    className="ml-0.5 text-gray-500 transition-all hover:text-red-500"
                                                >
                                                    <X size={11} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 rounded-md border px-3 py-2.5">
                                        <Hash size={13} />
                                        <Input
                                            placeholder="New category…"
                                            value={newCatName}
                                            onChange={(e) =>
                                                setNewCatName(e.target.value)
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
                                            disabled={!newCatName.trim()}
                                            className="h-8 rounded-md bg-bright-blue px-3 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
                                        >
                                            <Plus size={13} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {activeSection === "labels" && (
                                <div className="space-y-4">
                                    <SectionTitle>Labels</SectionTitle>
                                    <div className="space-y-2">
                                        {labels.map((lbl) => (
                                            <div
                                                key={lbl.id}
                                                className="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-gray-50"
                                            >
                                                <div
                                                    className="size-5 shrink-0 rounded-full border-2 border-white shadow-sm"
                                                    style={{
                                                        background: lbl.color,
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
                                                            e.key === "Enter" &&
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
                                                    {LABEL_PALETTE.map((c) => (
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
                                                                lbl.color === c
                                                                    ? "ring-2 ring-gray-400 ring-offset-1"
                                                                    : "",
                                                            )}
                                                            style={{
                                                                background: c,
                                                            }}
                                                        />
                                                    ))}
                                                    <button
                                                        onClick={() =>
                                                            setEditingLabel(
                                                                lbl.id,
                                                            )
                                                        }
                                                        className="ml-1 flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                                                    >
                                                        <Edit2 size={11} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            removeLabel(lbl.id)
                                                        }
                                                        className="flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-red-50 hover:text-red-400"
                                                    >
                                                        <Trash2 size={11} />
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
                                                        setNewLabel((l) => ({
                                                            ...l,
                                                            color: c,
                                                        }))
                                                    }
                                                    className={cn(
                                                        "size-5 rounded-full transition-transform hover:scale-110",
                                                        newLabel.color === c
                                                            ? "ring-2 ring-bright-blue ring-offset-1"
                                                            : "",
                                                    )}
                                                    style={{ background: c }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <div
                                                className="size-5 shrink-0 self-center rounded-full border-2 border-white shadow"
                                                style={{
                                                    background: newLabel.color,
                                                }}
                                            />
                                            <Input
                                                placeholder="Label name…"
                                                value={newLabel.name}
                                                onChange={(e) =>
                                                    setNewLabel((l) => ({
                                                        ...l,
                                                        name: e.target.value,
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
                                                disabled={!newLabel.name.trim()}
                                                className="h-8 rounded-md bg-bright-blue px-3 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
                                            >
                                                <Plus size={13} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeSection === "members" && (
                                <div className="space-y-4">
                                    <SectionTitle>
                                        Members ({members.length})
                                    </SectionTitle>
                                    <div className="flex items-center gap-3 rounded-md border px-3 py-2.5">
                                        <UserPlus size={14} />
                                        <Input
                                            type="email"
                                            placeholder="Invite by email…"
                                            value={inviteEmail}
                                            onChange={(e) =>
                                                setInviteEmail(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                handleInvite()
                                            }
                                            className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                        />
                                        <div className="flex gap-1">
                                            {(
                                                ["editor", "viewer"] as const
                                            ).map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() =>
                                                        setInviteRole(r)
                                                    }
                                                    className="rounded-md border px-2 py-1 text-xs font-medium transition-all"
                                                    style={
                                                        inviteRole === r
                                                            ? {
                                                                  background:
                                                                      ROLE_META[
                                                                          r
                                                                      ].bg,
                                                                  color: ROLE_META[
                                                                      r
                                                                  ].color,
                                                                  border: `1px solid ${ROLE_META[r].border}`,
                                                              }
                                                            : {
                                                                  background:
                                                                      "#F3F4F6",
                                                                  color: "#6B7280",
                                                                  border: "1px solid #E5E7EB",
                                                              }
                                                    }
                                                >
                                                    {ROLE_META[r].label}
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
                                        {members.map((m) => (
                                            <div
                                                key={m.id}
                                                className="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-gray-50"
                                            >
                                                <Avatar className="size-8 shrink-0 ring-2 ring-white">
                                                    <AvatarFallback
                                                        className="text-xs font-bold text-white"
                                                        style={{
                                                            background: m.color,
                                                        }}
                                                    >
                                                        {m.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {m.name}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-500">
                                                        {m.email}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 gap-1">
                                                    {(
                                                        [
                                                            "owner",
                                                            "editor",
                                                            "viewer",
                                                        ] as const
                                                    ).map((r) => {
                                                        if (
                                                            r === "owner" &&
                                                            m.role !== "owner"
                                                        )
                                                            return null;
                                                        return (
                                                            <button
                                                                key={r}
                                                                onClick={() =>
                                                                    m.role !==
                                                                        "owner" &&
                                                                    updateMemberRole(
                                                                        m.id,
                                                                        r,
                                                                    )
                                                                }
                                                                disabled={
                                                                    m.role ===
                                                                    "owner"
                                                                }
                                                                className={cn(
                                                                    "rounded-md border px-2 py-0.5 text-xs font-medium transition-all",
                                                                    m.role === r
                                                                        ? ""
                                                                        : "bg-gray-100",
                                                                )}
                                                                style={
                                                                    m.role === r
                                                                        ? {
                                                                              background:
                                                                                  ROLE_META[
                                                                                      r
                                                                                  ]
                                                                                      .bg,
                                                                              color: ROLE_META[
                                                                                  r
                                                                              ]
                                                                                  .color,
                                                                              border: `1px solid ${ROLE_META[r].border}`,
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
                                                                    ROLE_META[r]
                                                                        .label
                                                                }
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {m.role !== "owner" && (
                                                    <button
                                                        onClick={() =>
                                                            removeMember(m.id)
                                                        }
                                                        className="text-red-400opacity-100 flex size-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition-all hover:bg-red-100 hover:text-red-500"
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeSection === "danger" && (
                                <div className="space-y-4">
                                    <SectionTitle>Danger Zone</SectionTitle>
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
                                            <Archive size={13} />
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
                                                Permanently delete this project
                                                and all its tasks. This cannot
                                                be undone.
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
                                                    <Trash2 size={13} />
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
                                                        This will permanently
                                                        delete the project, all{" "}
                                                        {columns.reduce(
                                                            (a, c) =>
                                                                a + c.taskCount,
                                                            0,
                                                        )}{" "}
                                                        tasks, and all related
                                                        data. This action cannot
                                                        be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-md">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="rounded-md bg-red-500 font-semibold text-white hover:bg-red-600"
                                                        onClick={() =>
                                                            onOpenChange(false)
                                                        }
                                                    >
                                                        Delete project
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                <div className="flex shrink-0 items-center justify-between border-t px-6 py-4">
                    <p className="text-xs text-gray-500">Last saved just now</p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
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
                            <Check size={14} />
                            Save changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

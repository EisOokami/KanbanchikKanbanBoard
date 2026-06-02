"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { Badge } from "@/components/ui/shadcn/badge";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/shadcn/select";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import {
    Check,
    Copy,
    Link2,
    Mail,
    Plus,
    Search,
    Send,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import { cn } from "@/libs/utils";

type Role = "editor" | "viewer" | "commenter";

interface Member {
    id: string;
    name: string;
    email: string;
    initials: string;
    color: string;
    role: Role;
    status: "active" | "pending";
}

interface Invite {
    email: string;
    role: Role;
}

const EXISTING_MEMBERS: Member[] = [
    {
        id: "1",
        name: "Sofia Marchetti",
        email: "sofia@studio.io",
        initials: "SM",
        color: "#7C5CBF",
        role: "editor",
        status: "active",
    },
    {
        id: "2",
        name: "Luca Ferrara",
        email: "luca@studio.io",
        initials: "LF",
        color: "#2A9D8F",
        role: "editor",
        status: "active",
    },
    {
        id: "3",
        name: "Anna Kowalski",
        email: "anna@studio.io",
        initials: "AK",
        color: "#E76F51",
        role: "commenter",
        status: "active",
    },
    {
        id: "4",
        name: "James Okafor",
        email: "james@studio.io",
        initials: "JO",
        color: "#264653",
        role: "viewer",
        status: "active",
    },
    {
        id: "5",
        name: "Mei Lin",
        email: "mei@studio.io",
        initials: "ML",
        color: "#C09A3A",
        role: "viewer",
        status: "pending",
    },
];

const ROLE_META: Record<
    Role,
    {
        label: string;
        description: string;
        color: string;
        bg: string;
        border: string;
    }
> = {
    editor: {
        label: "Editor",
        description: "Can edit tasks",
        color: "#1A6BBF",
        bg: "#EEF4FD",
        border: "#BDD5F5",
    },
    commenter: {
        label: "Commenter",
        description: "Can comment only",
        color: "#C9620A",
        bg: "#FEF4EC",
        border: "#FCD9B5",
    },
    viewer: {
        label: "Viewer",
        description: "Read-only access",
        color: "#1E7E3A",
        bg: "#EEFAF2",
        border: "#AEDFC0",
    },
};

function RoleSelect({
    value,
    onChange,
    compact = false,
}: {
    value: Role;
    onChange: (r: Role) => void;
    compact?: boolean;
}) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as Role)}>
            <SelectTrigger
                className={cn(
                    "h-8 gap-1 rounded-md border text-xs font-medium focus:ring-1 focus:ring-bright-blue",
                    compact ? "w-[110px]" : "w-[130px]",
                )}
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {(
                    Object.entries(ROLE_META) as [
                        Role,
                        (typeof ROLE_META)[Role],
                    ][]
                ).map(([key, m]) => (
                    <SelectItem
                        key={key}
                        value={key}
                        className="cursor-pointer text-sm font-medium"
                    >
                        <span style={{ color: m.color }}>{m.label}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function MemberRow({
    member,
    onRoleChange,
    onRemove,
}: {
    member: Member;
    onRoleChange: (id: string, role: Role) => void;
    onRemove: (id: string) => void;
}) {
    return (
        <div className="group flex items-center gap-3 rounded-md px-1 py-2.5 transition-colors hover:bg-gray-50">
            <div className="relative">
                <Avatar className="size-9 ring-2 ring-white">
                    <AvatarFallback
                        className="text-xs font-bold text-white"
                        style={{ background: member.color }}
                    >
                        {member.initials}
                    </AvatarFallback>
                </Avatar>
                {member.status === "active" && (
                    <div className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                        {member.name}
                    </p>
                    {member.status === "pending" && (
                        <Badge
                            variant="outline"
                            className="border px-1.5 py-0 text-[10px] font-medium"
                        >
                            Pending
                        </Badge>
                    )}
                </div>
                <p className="truncate text-xs text-gray-500">{member.email}</p>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <RoleSelect
                    value={member.role}
                    onChange={(r) => onRoleChange(member.id, r)}
                    compact
                />
                <button
                    onClick={() => onRemove(member.id)}
                    className="flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                    <X size={14} />
                </button>
            </div>
            <div className="group-hover:hidden">
                <span
                    className="rounded-md border px-2 py-0.5 text-xs font-medium"
                    style={{
                        color: ROLE_META[member.role].color,
                    }}
                >
                    {ROLE_META[member.role].label}
                </span>
            </div>
        </div>
    );
}

interface InviteAssignmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskTitle?: string;
}

export function InviteAssignmentModal({
    open,
    onOpenChange,
}: InviteAssignmentModalProps) {
    const [members, setMembers] = useState<Member[]>(EXISTING_MEMBERS);
    const [invites, setInvites] = useState<Invite[]>([
        { email: "", role: "editor" },
    ]);
    const [search, setSearch] = useState("");
    const [linkCopied, setLinkCopied] = useState(false);
    const [selectedTab, setSelectedTab] = useState<"members" | "invite">(
        "invite",
    );

    const updateRole = (id: string, role: Role) =>
        setMembers((m) => m.map((x) => (x.id === id ? { ...x, role } : x)));

    const removeMember = (id: string) =>
        setMembers((m) => m.filter((x) => x.id !== id));

    const addInviteRow = () =>
        setInvites((i) => [...i, { email: "", role: "editor" }]);

    const removeInviteRow = (idx: number) =>
        setInvites((i) => i.filter((_, n) => n !== idx));

    const updateInvite = (idx: number, patch: Partial<Invite>) =>
        setInvites((i) =>
            i.map((x, n) => (n === idx ? { ...x, ...patch } : x)),
        );

    const handleCopyLink = () => {
        navigator.clipboard
            .writeText("https://app.kanban.io/invite/abc123xyz")
            .catch(() => {});
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleSend = () => {
        const valid = invites.filter((i) => i.email.trim());
        if (!valid.length) return;

        setInvites([{ email: "", role: "editor" }]);
    };

    const filteredMembers = members.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()),
    );

    const hasValidInvite = invites.some((i) => i.email.trim());

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[560px] gap-0 overflow-hidden p-0 shadow-xl [&>button:first-of-type]:hidden">
                <DialogHeader className="gap-3 px-6 pt-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="grid gap-1">
                            <DialogTitle className="font-semibold">
                                Invite to your Project
                            </DialogTitle>
                            <p className="max-w-[300px] text-xs text-gray-500">
                                We&apos;ll email them instructions and a link to
                                join your Project
                            </p>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="rounded-md p-1.5 transition-colors hover:bg-gray-100"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex gap-1.5 rounded-xl bg-gray-100 p-1.5">
                        {(["invite", "members"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={cn(
                                    "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all",
                                    tab === selectedTab
                                        ? "bg-white shadow-sm"
                                        : "text-gray-500 hover:bg-white/60",
                                )}
                            >
                                {tab === "invite" ? (
                                    <UserPlus size={13} />
                                ) : (
                                    <Users size={13} />
                                )}
                                {tab === "invite"
                                    ? "Invite people"
                                    : `Members (${members.length})`}
                            </button>
                        ))}
                    </div>
                </DialogHeader>
                <div className="px-6 py-4">
                    {selectedTab === "invite" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                {invites.map((invite, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="relative flex-1">
                                            <Mail
                                                size={14}
                                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            />
                                            <Input
                                                type="email"
                                                placeholder="colleague@company.com"
                                                value={invite.email}
                                                onChange={(e) =>
                                                    updateInvite(i, {
                                                        email: e.target.value,
                                                    })
                                                }
                                                className="h-8 rounded-md pl-9 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                            />
                                        </div>
                                        <RoleSelect
                                            value={invite.role}
                                            onChange={(r) =>
                                                updateInvite(i, {
                                                    role: r,
                                                })
                                            }
                                        />
                                        {invites.length > 1 && (
                                            <button
                                                onClick={() =>
                                                    removeInviteRow(i)
                                                }
                                                className="flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors hover:bg-red-50 hover:text-red-400"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addInviteRow}
                                className="flex items-center gap-2 text-xs text-gray-500 transition-colors hover:text-gray-700"
                            >
                                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gray-100">
                                    <Plus size={10} />
                                </div>
                                Add another
                            </button>
                            <Separator />
                            <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-200">
                                    <Link2
                                        size={13}
                                        className="text-gray-500"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium">
                                        Invite via link
                                    </p>
                                    <p className="truncate text-xs text-gray-500">
                                        app.kanban.io/invite/abc123xyz
                                    </p>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={handleCopyLink}
                                            className={`flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-all ${linkCopied ? "border-green-300 text-green-500" : "bg-gray-100 text-gray-500"}`}
                                        >
                                            {linkCopied ? (
                                                <Check size={12} />
                                            ) : (
                                                <Copy size={12} />
                                            )}
                                            {linkCopied ? "Copied!" : "Copy"}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Copy invite link
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    )}
                    {selectedTab === "members" && (
                        <div className="space-y-3">
                            <div className="relative">
                                <Search
                                    size={14}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <Input
                                    placeholder="Search members…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-9 rounded-md pl-9 text-xs placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                />
                            </div>
                            <ScrollArea className="max-h-[280px] pr-1">
                                {filteredMembers.length > 0 ? (
                                    <div className="space-y-0.5">
                                        {filteredMembers.map((m) => (
                                            <MemberRow
                                                key={m.id}
                                                member={m}
                                                onRoleChange={updateRole}
                                                onRemove={removeMember}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-10">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                                            <Users
                                                size={18}
                                                className="text-gray-500"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            No members found
                                        </p>
                                    </div>
                                )}
                            </ScrollArea>
                            <div className="flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2 text-xs">
                                <div>
                                    <span className="font-semibold">
                                        {
                                            members.filter(
                                                (m) => m.status === "active",
                                            ).length
                                        }
                                    </span>{" "}
                                    active
                                    {" · "}
                                    <span className="font-semibold">
                                        {
                                            members.filter(
                                                (m) => m.status === "pending",
                                            ).length
                                        }
                                    </span>{" "}
                                    pending
                                </div>
                                <button
                                    onClick={() => setSelectedTab("invite")}
                                    className="flex items-center gap-1 font-medium text-bright-blue transition-colors hover:opacity-80"
                                >
                                    <UserPlus size={12} />
                                    Add more
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between border-t bg-gray-100 px-6 py-3">
                    <p className="text-xs text-gray-500">
                        {selectedTab === "invite"
                            ? "Invites will be sent by email"
                            : `${members.length} member${members.length !== 1 ? "s" : ""} on this task`}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-9 px-4 text-sm text-gray-500 hover:bg-gray-200"
                        >
                            Cancel
                        </Button>
                        {selectedTab === "invite" && (
                            <Button
                                onClick={handleSend}
                                disabled={!hasValidInvite}
                                className="flex h-9 items-center gap-2 bg-bright-blue px-5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40"
                            >
                                <Send size={13} />
                                Send invites
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

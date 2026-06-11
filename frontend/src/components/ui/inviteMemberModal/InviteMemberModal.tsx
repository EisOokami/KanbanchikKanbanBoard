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
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import { cn } from "@/libs/utils";
import { Invite } from "@/types/inviteAssigmentModal";
import RoleSelect from "./roleSelect/RoleSelect";
import MemberRow from "./memberRow/MemberRow";
import { User, Role } from "@/types/types";
import {
    CheckIcon,
    CopyIcon,
    EnvelopeIcon,
    LinkIcon,
    MagnifyingGlassIcon,
    PaperPlaneTiltIcon,
    PlusIcon,
    UserPlusIcon,
    UsersIcon,
    XIcon,
} from "@phosphor-icons/react";

interface InviteMemberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    membersData: Omit<User, "email">[];
}

export function InviteMemberModal({
    open,
    onOpenChange,
    membersData,
}: InviteMemberModalProps) {
    const [members, setMembers] = useState<Omit<User, "email">[]>(membersData);
    const [invites, setInvites] = useState<Invite[]>([
        { email: "", role: "viewer" },
    ]);
    const [search, setSearch] = useState("");
    const [linkCopied, setLinkCopied] = useState(false);
    const [selectedTab, setSelectedTab] = useState<"members" | "invite">(
        "invite",
    );

    const updateRole = (id: number, role: Role) =>
        setMembers((m) => m.map((x) => (x.id === id ? { ...x, role } : x)));

    const removeMember = (id: number) =>
        setMembers((m) => m.filter((x) => x.id !== id));

    const addInviteRow = () =>
        setInvites((i) => [...i, { email: "", role: "viewer" }]);

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

        setInvites([{ email: "", role: "viewer" }]);
    };

    const filteredMembers = members.filter(
        (m) => m.name.toLowerCase().includes(search.toLowerCase()),
        // ||
        //     m.email.toLowerCase().includes(search.toLowerCase()),
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
                            <XIcon weight="duotone" size={16} />
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
                                    <UserPlusIcon weight="duotone" size={13} />
                                ) : (
                                    <UsersIcon weight="duotone" size={13} />
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
                                            <EnvelopeIcon
                                                weight="duotone"
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
                                                <XIcon
                                                    weight="duotone"
                                                    size={14}
                                                />
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
                                    <PlusIcon weight="duotone" size={10} />
                                </div>
                                Add another
                            </button>
                            <Separator />
                            <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-200">
                                    <LinkIcon
                                        weight="duotone"
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
                                                <CheckIcon
                                                    weight="duotone"
                                                    size={12}
                                                />
                                            ) : (
                                                <CopyIcon
                                                    weight="duotone"
                                                    size={12}
                                                />
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
                                <MagnifyingGlassIcon
                                    weight="duotone"
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
                                        {filteredMembers.map((member) => (
                                            <MemberRow
                                                key={member.id}
                                                member={member}
                                                onRoleChange={updateRole}
                                                onRemove={removeMember}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-10">
                                        <div className="flex size-10 items-center justify-center rounded-md bg-gray-100">
                                            <UsersIcon
                                                weight="duotone"
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
                                {/* <div>
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
                                </div> */}
                                <button
                                    onClick={() => setSelectedTab("invite")}
                                    className="flex items-center gap-1 font-medium text-bright-blue transition-colors hover:opacity-80"
                                >
                                    <UserPlusIcon weight="duotone" size={12} />
                                    Add more
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between border-t px-6 py-3">
                    <p className="text-xs text-gray-500">
                        {selectedTab === "invite"
                            ? "Invites will be sent by email"
                            : `${members.length} member${members.length !== 1 ? "s" : ""} on this project`}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-9 px-4 text-sm"
                        >
                            Cancel
                        </Button>
                        {selectedTab === "invite" && (
                            <Button
                                onClick={handleSend}
                                disabled={!hasValidInvite}
                                className="flex h-9 items-center gap-2 bg-bright-blue px-5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40"
                            >
                                <PaperPlaneTiltIcon
                                    weight="duotone"
                                    size={13}
                                />
                                Send invites
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

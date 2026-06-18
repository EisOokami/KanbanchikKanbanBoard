"use client";

import { useActionState, useState } from "react";
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
import MemberRow from "./memberRow/MemberRow";
import { User, Role, Project } from "@/types/types";
import {
    CheckIcon,
    CopyIcon,
    EnvelopeIcon,
    LinkIcon,
    MagnifyingGlassIcon,
    PaperPlaneTiltIcon,
    UserPlusIcon,
    UsersIcon,
    XIcon,
} from "@phosphor-icons/react";
import { generateInviteAction, inviteMemberAction } from "@/data/actions";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../zodErrors/ZodErrors";

interface InviteMemberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
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

export function InviteMemberModal({
    open,
    onOpenChange,
    projectData,
}: InviteMemberModalProps) {
    const [members, setMembers] = useState<Omit<User, "email">[]>(
        projectData.members,
    );
    // const [invites, setInvites] = useState<Invite[]>([]);
    const [invites, setInvites] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [linkCopied, setLinkCopied] = useState(false);
    const [selectedTab, setSelectedTab] = useState<"members" | "invite">(
        "invite",
    );
    const [inviteEmail, setInviteEmail] = useState("");
    // const [inviteRole, setInviteRole] = useState<Role>("viewer");
    const [formState, formAction, isPending] = useActionState(
        inviteMemberAction.bind(null, invites),
        INITIAL_STATE,
    );

    const updateRole = (id: number, role: Role) =>
        setMembers((prevState) =>
            prevState.map((member) =>
                member.id === id ? { ...member, role } : member,
            ),
        );

    const removeMember = (id: number) =>
        setMembers((prevState) =>
            prevState.filter((member) => member.id !== id),
        );

    const handleCopyLink = async () => {
        const result = await generateInviteAction(projectData.id);

        if (!result || !result.ok || !result.inviteUrl) {
            return;
        }

        navigator.clipboard.writeText(result.inviteUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleSend = () => {
        // const valid = invites.filter((invite) => invite.email.trim());
        // const valid = invites.filter((invite) => invite.trim());
        // if (!valid.length) {
        //     return;
        // }
        // setInvites([{ email: "", role: "viewer" }]);
        // setInvites([]);
    };

    const handleAddInvite = () => {
        if (!inviteEmail.trim()) {
            return;
        }

        // setInvites((prevState) => [
        //     ...prevState,
        //     {
        //         email: inviteEmail,
        //         role: inviteRole,
        //     },
        // ]);
        setInvites((prevState) => [...prevState, inviteEmail]);

        setInviteEmail("");
        // setInviteRole("viewer");
    };

    const removeInvite = (email: string) => {
        setInvites((prevState) =>
            // prevState.filter((invite) => invite.email !== email),
            prevState.filter((invite) => invite !== email),
        );
    };

    const filteredMembers = members.filter(
        (member) => member.name.toLowerCase().includes(search.toLowerCase()),
        // ||
        //     member.email.toLowerCase().includes(search.toLowerCase()),
    );

    // const hasValidInvite = invites.some((invite) => invite.email.trim());
    const hasValidInvite = invites.some((invite) => invite.trim());

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[560px] gap-0 overflow-hidden p-0 shadow-xl [&>button:first-of-type]:hidden">
                <form
                    action={formAction}
                    noValidate
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <DialogHeader className="gap-3 px-6 pt-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="grid gap-1">
                                <DialogTitle className="font-semibold">
                                    Invite to your Project
                                </DialogTitle>
                                <p className="max-w-[300px] text-xs text-gray-500">
                                    We&apos;ll email them instructions and a
                                    link to join your Project
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="rounded-md p-1.5 transition-colors hover:bg-gray-100"
                                disabled={isPending}
                            >
                                <XIcon weight="duotone" size={16} />
                            </button>
                        </div>
                        <div className="flex gap-1.5 rounded-xl bg-gray-100 p-1.5">
                            {(["invite", "members"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setSelectedTab(tab)}
                                    className={cn(
                                        "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all",
                                        tab === selectedTab
                                            ? "bg-white shadow-sm"
                                            : "text-gray-500 hover:bg-white/60",
                                    )}
                                    disabled={isPending}
                                >
                                    {tab === "invite" ? (
                                        <UserPlusIcon
                                            weight="duotone"
                                            size={13}
                                        />
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
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <EnvelopeIcon
                                            weight="duotone"
                                            size={14}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                        <Input
                                            type="email"
                                            placeholder="colleague@company.com"
                                            value={inviteEmail}
                                            defaultValue={
                                                formState?.formData
                                                    ?.get("email")
                                                    ?.toString() ?? undefined
                                            }
                                            onChange={(e) =>
                                                setInviteEmail(e.target.value)
                                            }
                                            className="h-8 rounded-md pl-9"
                                            disabled={isPending}
                                        />
                                    </div>
                                    {/* <RoleSelect
                                        value={inviteRole}
                                        onChange={setInviteRole}
                                        isPending={isPending}
                                    /> */}
                                    <Button
                                        type="button"
                                        onClick={handleAddInvite}
                                        disabled={
                                            !inviteEmail.trim() || isPending
                                        }
                                        className="h-8 bg-bright-blue text-white hover:bg-blue-600 disabled:opacity-40"
                                    >
                                        Add
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {/* {invites.map((invite) => (
                                        <div
                                            key={invite.email}
                                            className="flex items-center justify-between rounded-md border p-2"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {invite.email}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {invite.role}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeInvite(invite.email)
                                                }
                                                className="text-red-500"
                                                disabled={isPending}
                                            >
                                                <XIcon
                                                    weight="duotone"
                                                    size={14}
                                                />
                                            </button>
                                        </div>
                                    ))} */}
                                    {invites.map((invite) => (
                                        <div
                                            key={invite}
                                            className="flex items-center justify-between rounded-md border p-2"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {invite}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeInvite(invite)
                                                }
                                                className="text-red-500"
                                                disabled={isPending}
                                            >
                                                <XIcon
                                                    weight="duotone"
                                                    size={14}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <ZodErrors
                                    error={formState?.zodErrors?.projectId}
                                />
                                <ZodErrors
                                    error={formState?.zodErrors?.members}
                                />
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
                                    </div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={handleCopyLink}
                                                className={`flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-all ${linkCopied ? "border-green-300 text-green-500" : "bg-gray-100 text-gray-500"}`}
                                                disabled={isPending}
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
                                                {linkCopied
                                                    ? "Copied!"
                                                    : "Copy"}
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
                                        name="search"
                                        placeholder="Search members…"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        defaultValue={
                                            formState?.formData
                                                ?.get("search")
                                                ?.toString() ?? undefined
                                        }
                                        className="h-9 rounded-md pl-9 text-xs placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                        disabled={isPending}
                                    />
                                </div>
                                <ScrollArea className="max-h-[280px] pr-1">
                                    {filteredMembers.length > 0 ? (
                                        <div className="space-y-0.5">
                                            {filteredMembers.map((member) => (
                                                <MemberRow
                                                    key={member.id}
                                                    member={member}
                                                    isPending={isPending}
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
                                                (member) => member.status === "active",
                                            ).length
                                        }
                                    </span>{" "}
                                    active
                                    {" · "}
                                    <span className="font-semibold">
                                        {
                                            members.filter(
                                                (member) => member.status === "pending",
                                            ).length
                                        }
                                    </span>{" "}
                                    pending
                                </div> */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTab("invite")}
                                        className="flex items-center gap-1 font-medium text-bright-blue transition-colors hover:opacity-80"
                                        disabled={isPending}
                                    >
                                        <UserPlusIcon
                                            weight="duotone"
                                            size={12}
                                        />
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
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="h-9 px-4 text-sm"
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            {selectedTab === "invite" && (
                                <Button
                                    type="submit"
                                    onClick={handleSend}
                                    disabled={!hasValidInvite || isPending}
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
                    <input
                        type="hidden"
                        name="projectId"
                        value={projectData.id}
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}

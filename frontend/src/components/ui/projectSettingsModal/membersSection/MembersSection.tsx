"use client";

import { ROLE_META } from "@/constants/constants";
import { cn, getInitials } from "@/libs/utils";
import { UserPlusIcon, XIcon } from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "../../shadcn/avatar";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { useState } from "react";
import { User } from "@/types/types";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface MembersSectionProps {
    members: Omit<User, "email">[];
    emails: string[];
    formState: BaseAction | undefined;
    isPending: boolean;
    onMembersChange: (members: Omit<User, "email">[]) => void;
    onEmailsChange: (emails: string[]) => void;
}

export default function MembersSection({
    members,
    emails,
    formState,
    isPending,
    onMembersChange,
    onEmailsChange,
}: Readonly<MembersSectionProps>) {
    const [inviteRole, setInviteRole] = useState<User["role"]>("member");
    const [inviteEmail, setInviteEmail] = useState<string>("");

    const updateMemberRole = (id: number, role: User["role"]) =>
        onMembersChange(
            members.map((member) =>
                member.id === id ? { ...member, role } : member,
            ),
        );

    const removeMember = (id: number) =>
        onMembersChange(members.filter((member) => member.id !== id));

    const handleInvite = () => {
        if (!inviteEmail.trim()) {
            return;
        }

        onEmailsChange([...emails, inviteEmail]);

        setInviteEmail("");
    };

    return (
        <div className="space-y-1">
            <h3 className="font-semibold">Members ({members.length})</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-md border px-3 py-2.5">
                    <UserPlusIcon weight="duotone" size={18} />
                    <Input
                        name="email"
                        type="email"
                        placeholder="Invite by email…"
                        value={inviteEmail}
                        defaultValue={
                            formState?.formData?.get("email")?.toString() ??
                            undefined
                        }
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                        className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                        disabled={isPending}
                    />
                    <div className="flex gap-1">
                        {(["admin", "member", "viewer"] as const).map(
                            (role) => (
                                <button
                                    type="button"
                                    key={role}
                                    onClick={() => setInviteRole(role)}
                                    className="rounded-md border px-2 py-1 text-xs font-medium transition-all"
                                    style={
                                        inviteRole === role
                                            ? {
                                                  background:
                                                      ROLE_META[role].bg,
                                                  color: ROLE_META[role].color,
                                                  border: `1px solid ${ROLE_META[role].border}`,
                                              }
                                            : {
                                                  background: "#F3F4F6",
                                                  color: "#6B7280",
                                                  border: "1px solid #E5E7EB",
                                              }
                                    }
                                    disabled={isPending}
                                >
                                    {ROLE_META[role].label}
                                </button>
                            ),
                        )}
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleInvite}
                        disabled={!inviteEmail.trim() || isPending}
                        className="h-8 shrink-0 rounded-md bg-bright-blue px-3 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
                    >
                        Invite
                    </Button>
                </div>
                <div className="space-y-1.5">
                    {emails.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {emails.map((email) => (
                                <div
                                    key={email}
                                    className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5"
                                >
                                    <div className="min-w-0">
                                        <p className="mt-0.5 max-w-[140px] truncate text-[10px] text-muted-foreground">
                                            {email}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onEmailsChange(
                                                emails.filter(
                                                    (value) => value !== email,
                                                ),
                                            )
                                        }
                                        className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
                                        disabled={isPending}
                                    >
                                        <XIcon
                                            weight="duotone"
                                            className="size-4"
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-gray-50"
                        >
                            <Avatar className="size-8 shrink-0">
                                <AvatarFallback
                                    className="text-xs font-bold text-white"
                                    style={{
                                        backgroundColor: member.color,
                                    }}
                                >
                                    {getInitials(member.name, member.surname)}
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
                                        role === "owner" &&
                                        member.role !== "owner"
                                    )
                                        return null;

                                    return (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() =>
                                                member.role !== "owner" &&
                                                updateMemberRole(
                                                    member.id,
                                                    role,
                                                )
                                            }
                                            disabled={
                                                member.role === "owner" ||
                                                isPending
                                            }
                                            className={cn(
                                                "rounded-md border px-2 py-0.5 text-xs font-medium transition-all",
                                                member.role === role
                                                    ? ""
                                                    : "bg-gray-100",
                                            )}
                                            style={
                                                member.role === role
                                                    ? {
                                                          background:
                                                              ROLE_META[role]
                                                                  .bg,
                                                          color: ROLE_META[role]
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
                                            {ROLE_META[role].label}
                                        </button>
                                    );
                                })}
                            </div>
                            {member.role !== "owner" && (
                                <button
                                    type="button"
                                    onClick={() => removeMember(member.id)}
                                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition-all hover:bg-red-100 hover:text-red-500"
                                    disabled={isPending}
                                >
                                    <XIcon weight="duotone" size={13} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <ZodErrors error={formState?.zodErrors?.members} />
            </div>
        </div>
    );
}

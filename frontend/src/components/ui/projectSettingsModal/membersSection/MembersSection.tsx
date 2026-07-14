"use client";

import { ROLE_META } from "@/constants/constants";
import { cn, getInitials } from "@/libs/utils";
import { XIcon } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { useState } from "react";
import { ProjectSettingsFormData, User } from "@/types/types";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface MembersSectionProps {
    formData: ProjectSettingsFormData;
    formState: BaseAction | undefined;
    isPending: boolean;
    onFormDataChange: (formData: ProjectSettingsFormData) => void;
}

export default function MembersSection({
    formData,
    formState,
    isPending,
    onFormDataChange,
}: Readonly<MembersSectionProps>) {
    const [inviteEmail, setInviteEmail] = useState<string>("");

    const updateMemberRole = (id: number, role: User["role"]) => {
        onFormDataChange({
            ...formData,
            members: formData.members.map((member) =>
                member.id === id ? { ...member, role } : member,
            ),
        });
    };

    const removeMember = (id: number) => {
        onFormDataChange({
            ...formData,
            members: formData.members.filter((member) => member.id !== id),
        });
    };

    const handleInvite = () => {
        if (!inviteEmail.trim()) {
            return;
        }

        onFormDataChange({
            ...formData,
            emails: [...formData.emails, inviteEmail],
        });
        setInviteEmail("");
    };

    const handleRemoveEmail = (emailValue: string) => {
        onFormDataChange({
            ...formData,
            emails: formData.emails.filter((email) => email !== emailValue),
        });
    };

    return (
        <div className="space-y-1">
            <h3 className="font-semibold">
                Members ({formData.members.length})
            </h3>
            <div className="space-y-4">
                <div className="flex items-center gap-3">
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
                        className={cn(
                            "h-8 flex-1 rounded-md bg-control text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue",
                            formState?.zodErrors?.members
                                ? "border-red-500"
                                : "",
                        )}
                        disabled={isPending}
                    />
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
                    {formData.emails.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.emails.map((email) => (
                                <div
                                    key={email}
                                    className="flex items-center gap-2 rounded-md border border-border bg-control px-2.5 py-1.5"
                                >
                                    <div className="min-w-0">
                                        <p className="mt-0.5 max-w-[140px] truncate text-[10px] text-muted-foreground">
                                            {email}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveEmail(email)}
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
                    {formData.members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 rounded-md border border-border bg-control px-3 py-2.5 transition-colors hover:bg-control-active"
                        >
                            <Avatar className="size-8 shrink-0">
                                <AvatarImage src={member.avatar_url} />
                                <AvatarFallback
                                    className="text-xs font-semibold text-white"
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
                                        (role === "owner" &&
                                            member.role !== "owner") ||
                                        (member.role === "owner" &&
                                            role !== "owner")
                                    ) {
                                        return null;
                                    }

                                    const isActive = member.role === role;

                                    return (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() =>
                                                member.role &&
                                                !member.role.includes(
                                                    "owner",
                                                ) &&
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
                                                "rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
                                                isActive
                                                    ? ROLE_META[role]
                                                          .activeClass
                                                    : "border-transparent text-muted-foreground hover:border-border hover:bg-muted",
                                            )}
                                        >
                                            {ROLE_META[role].label}
                                        </button>
                                    );
                                })}
                            </div>
                            {member.role !== "owner" && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeMember(member.id)}
                                    className="size-7 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950  dark:hover:text-red-600"
                                    disabled={isPending}
                                >
                                    <XIcon weight="duotone" size={16} />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
                <div>
                    <ZodErrors error={formState?.zodErrors?.members} />
                </div>
            </div>
        </div>
    );
}

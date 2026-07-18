"use client";

import { getInitials } from "@/libs/utils";
import { CreateTaskFormData, Project, User } from "@/types/types";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { BaseAction } from "@/types/actions";
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import { Button } from "../../shadcn/button";

interface MembersSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    formData: CreateTaskFormData;
    selectedMembers: Omit<User, "email">[];
    selectedProject: Project;
    onMemberChange: (member: Omit<User, "email">) => void;
}

export default function MembersSection({
    formState,
    isPending,
    formData,
    selectedMembers,
    selectedProject,
    onMemberChange,
}: Readonly<MembersSectionProps>) {
    return (
        <div className="space-y-1">
            <h3 className="font-semibold">
                Members <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-3">
                {selectedMembers.length ? (
                    <div className="flex flex-wrap gap-1.5">
                        {selectedMembers.map((member) => (
                            <Button
                                key={member.id}
                                type="button"
                                onClick={() => onMemberChange(member)}
                                className="h-10 border border-border bg-control px-2.5 text-foreground hover:bg-control-active"
                                disabled={isPending}
                            >
                                <Avatar
                                    className="size-6"
                                    style={{
                                        backgroundColor: member.color,
                                    }}
                                >
                                    <AvatarImage src={member.avatar_url} />
                                    <AvatarFallback
                                        className="text-[10px] font-medium text-white"
                                        style={{
                                            background: member.color,
                                        }}
                                    >
                                        {getInitials(
                                            member.name,
                                            member.surname,
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium leading-none">
                                        {member.name} {member.surname}
                                    </p>
                                </div>
                                <XIcon
                                    weight="duotone"
                                    className="size-4 opacity-50"
                                />
                            </Button>
                        ))}
                    </div>
                ) : null}
                <div className="flex flex-wrap gap-1.5">
                    {selectedProject.members
                        .filter(
                            (member) =>
                                !formData.members.some(
                                    (formDataMember) =>
                                        formDataMember.id === member.id,
                                ),
                        )
                        .map((member) => (
                            <Button
                                key={member.id}
                                type="button"
                                onClick={() => onMemberChange(member)}
                                className="h-10 border border-border bg-control px-2.5 text-control-text hover:bg-control-active hover:text-foreground"
                                disabled={isPending}
                            >
                                <Avatar
                                    className="size-6"
                                    style={{
                                        backgroundColor: member.color,
                                    }}
                                >
                                    <AvatarImage src={member.avatar_url} />
                                    <AvatarFallback
                                        className="text-[10px] font-medium text-white"
                                        style={{
                                            background: member.color,
                                        }}
                                    >
                                        {getInitials(
                                            member.name,
                                            member.surname,
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium leading-none">
                                        {member.name} {member.surname}
                                    </p>
                                </div>
                                <PlusIcon
                                    weight="duotone"
                                    className="size-4 opacity-50"
                                />
                            </Button>
                        ))}
                </div>
            </div>
            <div>
                <ZodErrors error={formState?.zodErrors?.members} />
            </div>
        </div>
    );
}

"use client";

import { getInitials } from "@/libs/utils";
import { CreateTaskFormData, Project, User } from "@/types/types";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { BaseAction } from "@/types/actions";

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
                {selectedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5"
                            >
                                <div
                                    className="flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                    style={{
                                        backgroundColor: member.color,
                                    }}
                                >
                                    {getInitials(member.name, member.surname)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium leading-none">
                                        {member.name} {member.surname}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onMemberChange(member)}
                                    className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
                                    disabled={isPending}
                                >
                                    <XIcon
                                        weight="duotone"
                                        className="size-3.5"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
                            <button
                                key={member.id}
                                type="button"
                                onClick={() => onMemberChange(member)}
                                className="flex items-center gap-1.5 rounded-md border border-border/60 bg-white px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                                disabled={isPending}
                            >
                                <div
                                    className="flex size-5 items-center justify-center rounded-full text-[10px] font-medium text-white"
                                    style={{
                                        backgroundColor: member.color,
                                    }}
                                >
                                    {getInitials(member.name, member.surname)}
                                </div>
                                {member.name}
                                <PlusIcon
                                    weight="duotone"
                                    className="size-4 opacity-50"
                                />
                            </button>
                        ))}
                </div>
            </div>
            <ZodErrors error={formState?.zodErrors?.members} />
        </div>
    );
}

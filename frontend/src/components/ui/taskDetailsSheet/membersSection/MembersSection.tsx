"use client";

import {
    CheckIcon,
    PlusIcon,
    UserPlusIcon,
    XIcon,
} from "@phosphor-icons/react";
import FieldRow from "../../fieldRow/FieldRow";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../shadcn/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import { cn, getInitials } from "@/libs/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { Project, UpdateTaskFormData, User } from "@/types/types";
import { useState } from "react";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface MembersSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    formData: UpdateTaskFormData;
    projectData: Project;
    onFormDataChange: (formData: UpdateTaskFormData) => void;
}

export default function MembersSection({
    formState,
    isPending,
    formData,
    projectData,
    onFormDataChange,
}: Readonly<MembersSectionProps>) {
    const [memberOpen, setMemberOpen] = useState<boolean>(false);

    const toggleMember = (memberValue: Omit<User, "email">) => {
        const exists = formData.members.some(
            (member) => member.id === memberValue.id,
        );

        onFormDataChange({
            ...formData,
            members: exists
                ? formData.members.filter(
                      (member) => member.id !== memberValue.id,
                  )
                : [...formData.members, memberValue],
        });
    };

    return (
        <FieldRow
            icon={<UserPlusIcon weight="duotone" size={16} />}
            label="members"
        >
            <div className="flex flex-wrap items-center gap-2">
                {formData.members.map((member) => (
                    <Tooltip key={member.id}>
                        <TooltipTrigger asChild disabled={isPending}>
                            <div className="group/av relative">
                                <Avatar className="size-7 cursor-pointer ring-2 ring-white">
                                    <AvatarImage src={member.avatar_url} />
                                    <AvatarFallback
                                        className="text-[10px] font-bold text-white"
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
                                <button
                                    type="button"
                                    onClick={() => toggleMember(member)}
                                    className="absolute -right-0.5 -top-0.5 hidden size-3.5 items-center justify-center rounded-full bg-red-500 group-hover/av:flex"
                                    disabled={isPending}
                                >
                                    <XIcon
                                        weight="duotone"
                                        size={10}
                                        className="text-white"
                                    />
                                </button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            {member.name} {member.surname}
                        </TooltipContent>
                    </Tooltip>
                ))}
                <Popover open={memberOpen} onOpenChange={setMemberOpen}>
                    <PopoverTrigger asChild disabled={isPending}>
                        <button
                            type="button"
                            className="flex size-7 items-center justify-center rounded-full border border-dashed transition-colors hover:border-bright-blue hover:bg-bright-blue/5"
                            disabled={isPending}
                        >
                            <PlusIcon
                                weight="duotone"
                                size={16}
                                className="text-gray-500"
                            />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-1.5">
                        {projectData.members.map((member) => {
                            const selectedMembers = formData.members.some(
                                (formDataMember) =>
                                    formDataMember.id === member.id,
                            );

                            return (
                                <button
                                    type="button"
                                    key={member.id}
                                    onClick={() => toggleMember(member)}
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                        selectedMembers
                                            ? "bg-gray-50"
                                            : "hover:bg-gray-50",
                                    )}
                                    disabled={isPending}
                                >
                                    <Avatar className="size-6">
                                        <AvatarImage src={member.avatar_url} />
                                        <AvatarFallback
                                            className="text-[10px] font-bold text-white"
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
                                    <span>
                                        {member.name} {member.surname}
                                    </span>
                                    {selectedMembers && (
                                        <CheckIcon
                                            weight="duotone"
                                            size={16}
                                            className="ml-auto text-bright-blue"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </PopoverContent>
                </Popover>
                {formData.members.length === 0 && (
                    <span className="text-sm text-gray-300">No members</span>
                )}
            </div>
            <ZodErrors error={formState?.zodErrors?.members} />
        </FieldRow>
    );
}

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
import { Button } from "../../shadcn/button";

interface MembersSectionProps {
    isPending: boolean;
    formData: UpdateTaskFormData;
    projectData: Project;
    hasPermission: boolean;
    onFormDataChange: (formData: UpdateTaskFormData) => void;
}

export default function MembersSection({
    isPending,
    formData,
    projectData,
    hasPermission,
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
                                <Avatar
                                    className={cn(
                                        "size-7",
                                        hasPermission
                                            ? "cursor-pointer"
                                            : "cursor-default",
                                    )}
                                >
                                    <AvatarImage src={member.avatar_url} />
                                    <AvatarFallback
                                        className="text-[10px] font-semibold text-white"
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
                                {hasPermission && (
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
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            {member.name} {member.surname}
                        </TooltipContent>
                    </Tooltip>
                ))}
                {hasPermission && (
                    <Popover open={memberOpen} onOpenChange={setMemberOpen}>
                        <PopoverTrigger asChild disabled={isPending}>
                            <button
                                type="button"
                                className="flex size-7 items-center justify-center rounded-full border border-dashed border-border transition-colors hover:border-bright-blue hover:bg-bright-blue/5"
                                disabled={isPending}
                            >
                                <PlusIcon
                                    weight="duotone"
                                    size={16}
                                    className="text-gray-500"
                                />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="grid w-52 gap-1 border-border p-1.5">
                            {projectData.members.map((member) => {
                                const selectedMembers = formData.members.some(
                                    (formDataMember) =>
                                        formDataMember.id === member.id,
                                );

                                return (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        key={member.id}
                                        onClick={() => toggleMember(member)}
                                        className={cn(
                                            "h-8 w-full justify-between gap-3 rounded-md px-3 text-sm hover:bg-control-active",
                                        )}
                                        disabled={isPending}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-6">
                                                <AvatarImage
                                                    src={member.avatar_url}
                                                />
                                                <AvatarFallback
                                                    className="text-[9px] font-medium text-white"
                                                    style={{
                                                        background:
                                                            member.color,
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
                                        </div>
                                        {selectedMembers && (
                                            <CheckIcon
                                                weight="duotone"
                                                size={16}
                                                className="ml-auto text-bright-blue"
                                            />
                                        )}
                                    </Button>
                                );
                            })}
                        </PopoverContent>
                    </Popover>
                )}
                {formData.members.length === 0 && (
                    <span className="text-sm text-gray-300 dark:text-gray-700">
                        No members
                    </span>
                )}
            </div>
        </FieldRow>
    );
}

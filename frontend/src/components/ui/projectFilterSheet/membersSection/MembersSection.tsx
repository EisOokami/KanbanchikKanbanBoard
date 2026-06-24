"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import { cn, getInitials } from "@/libs/utils";
import { User } from "@/types/types";
import { FilterSortOptions } from "@/types/projectsOverview";

interface MembersSectionProps {
    members: Omit<User, "email">[];
    options: FilterSortOptions;
    onChange: (options: FilterSortOptions) => void;
    onToggle: <T>(array: T[], value: T) => T[];
}

export default function MembersSection({
    members,
    options,
    onChange,
    onToggle,
}: Readonly<MembersSectionProps>) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Members
            </p>
            <div className="space-y-1">
                {members.map((member) => {
                    const active = options.memberIds.includes(member.id);
                    return (
                        <button
                            key={member.id}
                            onClick={() =>
                                onChange({
                                    ...options,
                                    memberIds: onToggle(
                                        options.memberIds,
                                        member.id,
                                    ),
                                })
                            }
                            className={cn(
                                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                active
                                    ? "bg-bright-blue/10 text-bright-blue"
                                    : "text-foreground hover:bg-muted/60",
                            )}
                        >
                            <Avatar key={member.id} className="size-6">
                                <AvatarImage
                                    src={member.avatar_url}
                                    alt={member.name}
                                />
                                <AvatarFallback
                                    className="text-[10px] font-medium text-white"
                                    style={{
                                        backgroundColor: member.color,
                                    }}
                                >
                                    {getInitials(member.name, member.surname)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="flex-1 truncate text-left font-medium">
                                {member.name} {member.surname}
                            </span>
                            {active && (
                                <CheckIcon
                                    weight="bold"
                                    className="size-3.5 shrink-0"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

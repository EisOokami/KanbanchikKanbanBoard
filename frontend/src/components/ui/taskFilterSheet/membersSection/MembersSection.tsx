"use client";

import { MagnifyingGlassIcon, UsersIcon } from "@phosphor-icons/react";
import FilterSection from "../filterSection/FilterSection";
import { Input } from "../../shadcn/input";
import { Checkbox } from "../../shadcn/checkbox";
import { cn, getInitials } from "@/libs/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import { useState } from "react";
import { FilterState, Project } from "@/types/types";

interface MembersSectionProps {
    filters: FilterState;
    projectData: Project;
    onToggle: <
        T,
        K extends "priorities" | "columns" | "members" | "categories",
    >(
        key: K,
        value: T,
    ) => void;
}

export default function MembersSection({
    filters,
    projectData,
    onToggle,
}: Readonly<MembersSectionProps>) {
    const [memberSearch, setMemberSearch] = useState<string>("");

    const filteredMembers = projectData.members.filter((member) =>
        member.name.toLowerCase().includes(memberSearch.toLowerCase()),
    );

    return (
        <FilterSection
            title="Members"
            icon={<UsersIcon weight="duotone" size={16} />}
            count={filters.members?.length || undefined}
        >
            <div className="space-y-1 pt-1">
                <div className="relative mb-2">
                    <MagnifyingGlassIcon
                        weight="duotone"
                        size={16}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-control-text"
                    />
                    <Input
                        placeholder="Search..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="h-8 rounded-md bg-control pl-8 text-xs placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                    />
                </div>
                {filteredMembers.map((member) => {
                    const active = filters.members?.some(
                        (filterMember) => filterMember.id === member.id,
                    );

                    return (
                        <label
                            key={member.id}
                            className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-md border px-2 py-1.5 text-control-text transition-colors hover:bg-control-active hover:text-foreground",
                                active
                                    ? "border-bright-blue"
                                    : "border-transparent",
                            )}
                        >
                            <Checkbox
                                checked={active}
                                onCheckedChange={() =>
                                    onToggle("members", member)
                                }
                                className="rounded data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                            />
                            <Avatar className="size-6">
                                <AvatarImage
                                    src={member.avatar_url}
                                    alt={member.name}
                                />
                                <AvatarFallback
                                    className="text-[10px] font-medium text-white"
                                    style={{
                                        background: member.color,
                                    }}
                                >
                                    {getInitials(member.name, member.surname)}
                                </AvatarFallback>
                            </Avatar>
                            <span
                                className={cn(
                                    "text-sm",
                                    active && "text-foreground",
                                )}
                            >
                                {member.name} {member.surname}
                            </span>
                        </label>
                    );
                })}
            </div>
        </FilterSection>
    );
}

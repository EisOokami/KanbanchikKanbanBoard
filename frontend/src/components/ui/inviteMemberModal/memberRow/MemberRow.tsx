"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import RoleSelect from "../roleSelect/RoleSelect";
import { User, Role } from "@/types/types";
import { getInitials } from "@/libs/utils";
import { XIcon } from "@phosphor-icons/react";

interface MemberRowProps {
    member: Omit<User, "email">;
    isPending: boolean;
    userData: User;
    onRoleChange: (id: number, role: Role) => void;
    onRemove: (id: number) => void;
}

export default function MemberRow({
    member,
    isPending,
    userData,
    onRoleChange,
    onRemove,
}: Readonly<MemberRowProps>) {
    return (
        <div className="group flex items-center gap-3 rounded-md px-1 py-2.5 transition-colors hover:bg-gray-50">
            <div className="relative">
                <Avatar className="size-9 ring-2 ring-white">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback
                        className="text-xs font-semibold text-white"
                        style={{ background: member.color }}
                    >
                        {getInitials(member.name, member.surname)}
                    </AvatarFallback>
                </Avatar>
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                        {member.name}
                    </p>
                </div>
            </div>
            {member.role !== "owner" || userData.role === "owner" ? (
                <div className="flex items-center gap-1.5">
                    <RoleSelect
                        value={member.role ?? "viewer"}
                        onChange={(role) => onRoleChange(member.id, role)}
                        compact
                        isPending={isPending}
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(member.id)}
                        className="flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500"
                        disabled={isPending}
                    >
                        <XIcon weight="duotone" size={14} />
                    </button>
                </div>
            ) : (
                <span className="rounded-md border px-3 py-1.5 text-xs font-medium capitalize">
                    {member.role}
                </span>
            )}
        </div>
    );
}

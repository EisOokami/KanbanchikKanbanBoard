"use client";

import { Avatar, AvatarFallback } from "../../shadcn/avatar";
import RoleSelect from "../roleSelect/RoleSelect";
import { User, Role } from "@/types/types";
import { getInitials } from "@/libs/utils";
import { XIcon } from "@phosphor-icons/react";

export default function MemberRow({
    member,
    onRoleChange,
    onRemove,
}: {
    member: Omit<User, "email">;
    onRoleChange: (id: number, role: Role) => void;
    onRemove: (id: number) => void;
}) {
    return (
        <div className="group flex items-center gap-3 rounded-md px-1 py-2.5 transition-colors hover:bg-gray-50">
            <div className="relative">
                <Avatar className="size-9 ring-2 ring-white">
                    <AvatarFallback
                        className="text-xs font-bold text-white"
                        style={{ background: member.color }}
                    >
                        {getInitials(member.name, member.surname)}
                    </AvatarFallback>
                </Avatar>
                {/* {member.status === "active" && (
                    <div className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                )} */}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                        {member.name}
                    </p>
                    {/* {member.status === "pending" && (
                        <Badge
                            variant="outline"
                            className="border px-1.5 py-0 text-[10px] font-medium"
                        >
                            Pending
                        </Badge>
                    )} */}
                </div>
                {/* <p className="truncate text-xs text-gray-500">{member.email}</p> */}
            </div>
            {member.role !== "owner" ? (
                <div className="flex items-center gap-1.5">
                    <RoleSelect
                        value={member.role}
                        onChange={(r) => onRoleChange(member.id, r)}
                        compact
                    />
                    <button
                        onClick={() => onRemove(member.id)}
                        className="flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500"
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

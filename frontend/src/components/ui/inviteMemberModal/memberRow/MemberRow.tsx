"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import RoleSelect from "../roleSelect/RoleSelect";
import { User, Role } from "@/types/types";
import { getInitials } from "@/libs/utils";
import { WarningIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "../../shadcn/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../../shadcn/alert-dialog";

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
        <div className="group flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-control-active">
            <div className="relative">
                <Avatar className="size-9">
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
            {member.role !== "owner" && userData.role === "owner" ? (
                <div className="flex items-center gap-1.5">
                    <RoleSelect
                        value={member.role ?? "viewer"}
                        onChange={(role) => onRoleChange(member.id, role)}
                        compact
                        isPending={isPending}
                    />
                    <AlertDialog>
                        <AlertDialogTrigger asChild disabled={isPending}>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-5 text-control-text hover:bg-red-50 hover:text-red-400  dark:hover:bg-red-950 dark:hover:text-red-600 [&_svg]:size-3.5"
                                disabled={isPending}
                            >
                                <XIcon weight="duotone" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-border">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <WarningIcon
                                        weight="duotone"
                                        className="size-5 text-red-500"
                                    />
                                    Delete member?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will permanently remove the
                                    member from the project. The member will no
                                    longer have access to tasks.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel
                                    type="button"
                                    className="text-sm"
                                    disabled={isPending}
                                >
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    type="button"
                                    onClick={() => onRemove(member.id)}
                                    className="bg-red-600 text-sm font-semibold text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                                    disabled={isPending}
                                >
                                    Delete member
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ) : (
                <span className="rounded-md border border-border px-3 py-1.5 text-xs font-medium capitalize">
                    {member.role}
                </span>
            )}
        </div>
    );
}

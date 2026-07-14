"use client";

import Link from "next/link";
import {
    CaretUpDownIcon,
    GearSixIcon,
    SignInIcon,
    SignOutIcon,
    UserPlusIcon,
} from "@phosphor-icons/react";

import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../shadcn/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../../shadcn/sidebar";

import { useAccountSettingsContext } from "@/hooks/useAccountSettingsContext";
import { UserData } from "@/types/types";
import { getInitials } from "@/libs/utils";
import { logoutAction } from "@/data/actions";

interface UserFooterProps {
    userData: UserData;
}

export default function UserFooter({ userData }: Readonly<UserFooterProps>) {
    const { handleShowAccountSettings } = useAccountSettingsContext();

    const isLoggedIn =
        userData && userData.status === "success" && userData.data;

    const user = userData.data;

    if (!isLoggedIn || !user) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar className="size-8">
                                    <AvatarFallback className="bg-zinc-700 text-xs font-semibold text-white">
                                        ?
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-0.5 text-left leading-none">
                                    <span className="text-sm font-semibold">
                                        Guest
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        Not signed in
                                    </span>
                                </div>
                                <CaretUpDownIcon
                                    weight="duotone"
                                    className="ml-auto size-4 text-muted-foreground"
                                />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56"
                            side="top"
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/signIn"
                                    className="cursor-pointer gap-2"
                                >
                                    <SignInIcon
                                        weight="duotone"
                                        className="size-4"
                                    />
                                    Log in
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/signUp"
                                    className="cursor-pointer gap-2"
                                >
                                    <UserPlusIcon
                                        weight="duotone"
                                        className="size-4"
                                    />
                                    Create account
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="transition-colors"
                        >
                            <Avatar className="size-8">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback
                                    className="text-xs font-semibold text-white"
                                    style={{ backgroundColor: user.color }}
                                >
                                    {getInitials(user.name, user.surname)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5 text-left leading-none">
                                <span className="text-sm font-semibold">
                                    {user.name} {user.surname}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {user.email}
                                </span>
                            </div>
                            <CaretUpDownIcon
                                weight="duotone"
                                className="ml-auto size-4 text-muted-foreground"
                            />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56 border-border"
                        side="top"
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onClick={handleShowAccountSettings}
                        >
                            <GearSixIcon weight="duotone" className="size-4" />
                            Account settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer gap-2 text-red-500 focus:text-red-500 dark:text-red-400 dark:focus:text-red-400"
                            onClick={async () => {
                                await logoutAction();
                                window.location.reload();
                            }}
                        >
                            <SignOutIcon weight="duotone" className="size-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

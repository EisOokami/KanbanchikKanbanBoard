"use client";

import { Archive, ChevronsUpDown, LogOut, Settings, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "../shadcn/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../shadcn/sidebar";
import { useAccountSettingsContext } from "@/hooks/useAccountSettingsContext";

export default function UserFooter() {
    const { handleShowAccountSettings } = useAccountSettingsContext();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="size-8 rounded-lg">
                                <AvatarFallback className="rounded-lg bg-blue-500 text-xs font-bold text-white">
                                    AK
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5 text-left leading-none">
                                <span className="text-sm font-semibold">
                                    Alex Kovalenko
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    alex@acme.com
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56 rounded-lg"
                        side="top"
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuItem className="cursor-pointer gap-2">
                            <Star className="size-4" /> Starred boards
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2">
                            <Archive className="size-4" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onClick={handleShowAccountSettings}
                        >
                            <Settings className="size-4" /> Account settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer gap-2 text-red-500 focus:text-red-500">
                            <LogOut className="size-4" /> Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "../shadcn/sidebar";
import { Star } from "lucide-react";
import UserFooter from "../userFooter/UserFooter";
import NavMain from "../navMain/NavMain";
import Image from "next/image";
import AccountSettingsModal from "../accountSettings/AccountSettings";
import { useAccountSettingsContext } from "@/hooks/useAccountSettingsContext";
import Link from "next/link";

// const navSecondary = [
//     { title: "Team", icon: Users, url: "#" },
//     { title: "Notifications", icon: Bell, url: "/notifications", badge: "2" },
//     { title: "Settings", icon: Settings, url: "#" },
// ];

const favorites = [
    { title: "Sprint #14 — Active", color: "#6366f1" },
    { title: "Launch Checklist", color: "#f59e0b" },
];

export default function AppSidebar() {
    const { showAccountSettings, handleShowAccountSettings } =
        useAccountSettingsContext();
    // const pathname = usePathname();

    return (
        <>
            <Sidebar collapsible="icon" variant="sidebar">
                <SidebarHeader className="bg-white">
                    <div className="flex items-center gap-1.5 px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                            <Image
                                src="/logo.png"
                                alt="logo"
                                width={28}
                                height={28}
                                className="object-contain"
                            />
                        </div>
                        <span className="whitespace-nowrap text-lg font-medium tracking-tight text-black group-data-[collapsible=icon]:hidden">
                            Kabanchik
                        </span>
                    </div>
                </SidebarHeader>
                <SidebarContent className="bg-white">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <NavMain />
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarSeparator />
                    <SidebarGroup>
                        <SidebarGroupLabel className="flex items-center justify-between">
                            <span>Favourites</span>
                            <Star className="size-3 text-muted-foreground" />
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {favorites.map((fav) => (
                                    <SidebarMenuItem key={fav.title}>
                                        <SidebarMenuButton asChild size="sm">
                                            <Link
                                                href="/board"
                                                className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                                            >
                                                <span
                                                    className="size-2 flex-shrink-0 rounded-full"
                                                    style={{
                                                        background: fav.color,
                                                    }}
                                                />
                                                <span className="truncate group-data-[collapsible=icon]:hidden">
                                                    {fav.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    {/* <SidebarSeparator /> */}
                    {/* <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navSecondary.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        size="sm"
                                        isActive={item.url === pathname}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                            {item.badge && (
                                                <SidebarMenuBadge>
                                                    {item.badge}
                                                </SidebarMenuBadge>
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup> */}
                </SidebarContent>
                <SidebarFooter className="bg-white">
                    <UserFooter />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
            <AccountSettingsModal
                open={showAccountSettings}
                onOpenChange={handleShowAccountSettings}
            />
        </>
    );
}

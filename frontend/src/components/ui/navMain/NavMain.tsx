"use client";

import { useState } from "react";
import {
    Bell,
    Calendar,
    ChevronRight,
    ClipboardList,
    Kanban,
    LayoutDashboard,
} from "lucide-react";
import {
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "../shadcn/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../shadcn/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navMain = [
    {
        title: "Overview",
        icon: LayoutDashboard,
        url: "/overview",
    },
    {
        title: "My Boards",
        icon: Kanban,
        url: "/board",
        badge: "3",
        children: [
            { title: "Design System", url: "/board", color: "#6366f1" },
            { title: "Marketing Q2", url: "/board", color: "#f59e0b" },
            { title: "Backend API", url: "/board", color: "#10b981" },
        ],
    },
    { title: "Tasks", icon: ClipboardList, url: "/tasks", badge: "12" },
    { title: "Calendar", icon: Calendar, url: "/calendar" },
    { title: "Notifications", icon: Bell, url: "/notifications", badge: "2" },
    // { title: "Analytics", icon: BarChart3, url: "/analytics" },
];

export default function NavMain() {
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({
        "My Boards": true,
    });
    const pathname = usePathname();

    const toggle = (title: string) =>
        setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));

    return (
        <SidebarMenu>
            {navMain.map((item) =>
                item.children ? (
                    <Collapsible
                        key={item.title}
                        open={!!openItems[item.title]}
                        onOpenChange={() => toggle(item.title)}
                        asChild
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    className="group"
                                >
                                    <item.icon className="size-4" />
                                    <span>{item.title}</span>
                                    {item.badge && (
                                        <SidebarMenuBadge>
                                            {item.badge}
                                        </SidebarMenuBadge>
                                    )}
                                    <ChevronRight className="ml-auto mr-4 size-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.children.map((child) => (
                                        <SidebarMenuSubItem key={child.title}>
                                            <SidebarMenuSubButton asChild>
                                                <Link
                                                    href={child.url}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span
                                                        className="size-2 flex-shrink-0 rounded-full"
                                                        style={{
                                                            background:
                                                                child.color,
                                                        }}
                                                    />
                                                    {child.title}
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                ) : (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            isActive={item.url === pathname}
                        >
                            <a href={item.url}>
                                <item.icon className="size-4" />
                                <span>{item.title}</span>
                                {item.badge && (
                                    <SidebarMenuBadge>
                                        {item.badge}
                                    </SidebarMenuBadge>
                                )}
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ),
            )}
        </SidebarMenu>
    );
}

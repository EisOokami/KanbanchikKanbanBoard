"use client";

import { useState } from "react";
import {
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "../../shadcn/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../../shadcn/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    CalendarDotsIcon,
    CaretRightIcon,
    ClipboardTextIcon,
    KanbanIcon,
    SquaresFourIcon,
} from "@phosphor-icons/react";

const navMain = [
    {
        title: "Overview",
        icon: SquaresFourIcon,
        url: "/overview",
    },
    {
        title: "My Boards",
        icon: KanbanIcon,
        url: "/board",
        badge: "3",
        children: [
            { title: "Design System", url: "/board", color: "#6366f1" },
            { title: "Marketing Q2", url: "/board", color: "#f59e0b" },
            { title: "Backend API", url: "/board", color: "#10b981" },
        ],
    },
    { title: "Tasks", icon: ClipboardTextIcon, url: "/tasks", badge: "12" },
    { title: "Calendar", icon: CalendarDotsIcon, url: "/calendar" },
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
                                    className="group transition-colors hover:!bg-gray-200 group-data-[collapsible=icon]:!p-1.5 [&>svg]:size-5"
                                >
                                    <item.icon weight="duotone" />
                                    <span>{item.title}</span>
                                    {item.badge && (
                                        <SidebarMenuBadge>
                                            {item.badge}
                                        </SidebarMenuBadge>
                                    )}
                                    <CaretRightIcon
                                        weight="duotone"
                                        className="ml-auto mr-4 size-4 transition-transform duration-200 group-data-[state=open]:rotate-90"
                                    />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.children.map((child) => (
                                        <SidebarMenuSubItem key={child.title}>
                                            <SidebarMenuSubButton
                                                asChild
                                                className="transition-colors hover:bg-gray-200"
                                            >
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
                            className="border border-transparent transition-colors hover:bg-gray-200 hover:text-black data-[active=true]:border-gray-300 data-[active=true]:bg-gray-200 data-[active=true]:text-black group-data-[collapsible=icon]:!p-[5px]"
                        >
                            <Link href={item.url} className="[&>svg]:size-5">
                                <item.icon weight="duotone" />
                                <span>{item.title}</span>
                                {item.badge && (
                                    <SidebarMenuBadge>
                                        {item.badge}
                                    </SidebarMenuBadge>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ),
            )}
        </SidebarMenu>
    );
}

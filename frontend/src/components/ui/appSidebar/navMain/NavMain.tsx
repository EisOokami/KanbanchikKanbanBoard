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
import { Project } from "@/types/types";

const navMain = [
    {
        title: "Overview",
        icon: SquaresFourIcon,
        url: "/overview",
    },
    {
        title: "My Boards",
        icon: KanbanIcon,
        url: "/project",
    },
    { title: "Tasks", icon: ClipboardTextIcon, url: "/tasks" },
    { title: "Calendar", icon: CalendarDotsIcon, url: "/calendar" },
];

interface NavMainProps {
    projectsData: Project[];
}

export default function NavMain({ projectsData }: Readonly<NavMainProps>) {
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({
        "My Boards": true,
    });
    const pathname = usePathname();

    const toggle = (title: string) =>
        setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));

    return (
        <SidebarMenu>
            {navMain.map((item) =>
                item.url === "/project" ? (
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
                                    {projectsData.length && (
                                        <SidebarMenuBadge>
                                            {projectsData.length}
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
                                    {projectsData.map((project) => (
                                        <SidebarMenuSubItem key={project.id}>
                                            <SidebarMenuSubButton
                                                asChild
                                                className="transition-colors hover:bg-gray-200"
                                            >
                                                <Link
                                                    href={`${item.url}/${project.name}?id=${project.id}`}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span
                                                        className="size-2 flex-shrink-0 rounded-full"
                                                        style={{
                                                            background:
                                                                project.color,
                                                        }}
                                                    />
                                                    <span className="line-clamp-1 break-all">
                                                        {project.name}
                                                    </span>
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
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ),
            )}
        </SidebarMenu>
    );
}

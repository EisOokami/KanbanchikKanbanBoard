"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarRail,
} from "../shadcn/sidebar";
import UserFooter from "./userFooter/UserFooter";
import NavMain from "./navMain/NavMain";
import Image from "next/image";
import AccountSettingsModal from "../accountSettings/AccountSettings";
import { useAccountSettingsContext } from "@/hooks/useAccountSettingsContext";
import { Project, UserData } from "@/types/types";

interface AppSidebarProps {
    projectsData: Project[];
    userData: UserData;
}

export default function AppSidebar({
    projectsData,
    userData,
}: Readonly<AppSidebarProps>) {
    const { showAccountSettings, handleShowAccountSettings } =
        useAccountSettingsContext();

    return (
        <>
            <Sidebar
                collapsible="icon"
                variant="sidebar"
                className="z-50 border-transparent"
            >
                <SidebarHeader className="bg-gray-100">
                    <div className="flex items-center gap-1.5 px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                        <div className="flex size-7 shrink-0 items-center justify-center">
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
                <SidebarContent className="bg-gray-100">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <NavMain projectsData={projectsData} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="border-t bg-gray-100">
                    <UserFooter userData={userData} />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
            <AccountSettingsModal
                open={showAccountSettings}
                onOpenChange={handleShowAccountSettings}
                userData={userData}
            />
        </>
    );
}

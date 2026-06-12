import { TooltipProvider } from "@/components/ui/shadcn/tooltip";
import { SidebarProvider } from "@/components/ui/shadcn/sidebar";
import AppSidebar from "@/components/ui/appSidebar/AppSidebar";
import AccountSettingsProvider from "@/context/AccountSettingsProvider";
import { getProjectsData, getUserData } from "@/data/loaders";

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const projectsData = await getProjectsData();
    const userData = await getUserData();

    return (
        <div className="overflow-hidden bg-gray-100">
            <SidebarProvider>
                <AccountSettingsProvider>
                    <AppSidebar
                        projectsData={projectsData}
                        userData={userData}
                    />
                    <TooltipProvider>
                        <div className="my-3 mr-3 max-h-[calc(100svh-1.5rem)] w-full overflow-hidden rounded-xl border">
                            {children}
                        </div>
                    </TooltipProvider>
                </AccountSettingsProvider>
            </SidebarProvider>
        </div>
    );
}

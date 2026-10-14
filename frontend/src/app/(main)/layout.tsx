import { TooltipProvider } from "@/components/ui/shadcn/tooltip";
import { SidebarProvider } from "@/components/ui/shadcn/sidebar";
import AppSidebar from "@/components/ui/appSidebar/AppSidebar";
import AccountSettingsProvider from "@/context/AccountSettingsProvider";
import { getProjectsData, getUserData } from "@/data/loaders";
import { redirect } from "next/navigation";
import { MobileBlock } from "@/components/ui/mobileBlock/MobileBlock";

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const userData = await getUserData();

    if (!userData.data) {
        redirect("/signIn");
    }

    const projectsData = await getProjectsData();

    return (
        <>
            <div className="lg:hidden">
                <MobileBlock />
            </div>
            <div className="hidden overflow-hidden bg-background lg:block">
                <SidebarProvider>
                    <AccountSettingsProvider>
                        <AppSidebar
                            projectsData={projectsData}
                            userData={userData}
                        />
                        <TooltipProvider>
                            <div className="my-3 mr-3 max-h-[calc(100svh-1.5rem)] w-full overflow-hidden rounded-xl border border-border">
                                {children}
                            </div>
                        </TooltipProvider>
                    </AccountSettingsProvider>
                </SidebarProvider>
            </div>
        </>
    );
}

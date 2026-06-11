import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { cn } from "@/libs/utils";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/shadcn/tooltip";
import { SidebarProvider } from "@/components/ui/shadcn/sidebar";
import AppSidebar from "@/components/ui/appSidebar/AppSidebar";
import AccountSettingsProvider from "@/context/AccountSettingsProvider";
import { getProjectsData } from "@/data/loaders";

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Kabanchik",
    description: "",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const projectsData = await getProjectsData();

    return (
        <html lang="en">
            <body
                className={cn(
                    "font-montserrat",
                    `${montserrat.variable} overflow-hidden bg-gray-100 antialiased`,
                )}
            >
                <SidebarProvider>
                    <AccountSettingsProvider>
                        <AppSidebar projectsData={projectsData} />
                        <TooltipProvider>
                            <div className="my-3 mr-3 max-h-[calc(100svh-1.5rem)] w-full rounded-xl border">
                                {children}
                            </div>
                        </TooltipProvider>
                    </AccountSettingsProvider>
                </SidebarProvider>
            </body>
        </html>
    );
}

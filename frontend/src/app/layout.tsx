import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { cn } from "@/libs/utils";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/shadcn/tooltip";
import { SidebarProvider } from "@/components/ui/shadcn/sidebar";
import AppSidebar from "@/components/ui/appSidebar/AppSidebar";
import AccountSettingsProvider from "@/context/AccountSettingsProvider";

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Kabanchik",
    description: "",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={cn(
                    "font-montserrat",
                    `${montserrat.variable} antialiased`,
                )}
            >
                <SidebarProvider>
                    <AccountSettingsProvider>
                        <AppSidebar />
                        <TooltipProvider>
                            <main className="w-full">{children}</main>
                        </TooltipProvider>
                    </AccountSettingsProvider>
                </SidebarProvider>
            </body>
        </html>
    );
}

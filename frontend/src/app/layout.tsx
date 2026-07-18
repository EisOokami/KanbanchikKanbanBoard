import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { cn } from "@/libs/utils";
import "./globals.css";
import "sonner/dist/styles.css";
import { ThemeProvider } from "@/components/ui/themeProvider/ThemeProvider";
import { Toaster } from "@/components/ui/shadcn/sonner";
import { MobileBlock } from "@/components/ui/mobileBlock/MobileBlock";

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
    return (
        <html lang="en" className="h-svh" suppressHydrationWarning>
            <body
                className={cn(
                    "font-montserrat",
                    `${montserrat.variable} overflow-hidden antialiased`,
                )}
            >
                <div className="lg:hidden">
                    <MobileBlock />
                </div>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="hidden lg:block">
                        {children}
                        <Toaster />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}

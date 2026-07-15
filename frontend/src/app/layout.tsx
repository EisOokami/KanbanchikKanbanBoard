import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { cn } from "@/libs/utils";
import "./globals.css";
import "sonner/dist/styles.css";
import { ThemeProvider } from "@/components/ui/themeProvider/ThemeProvider";
import { Toaster } from "@/components/ui/shadcn/sonner";

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
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { cn } from "@/libs/utils";
import "./globals.css";
import { Toaster } from "sonner";

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
        <html lang="en" className="h-svh">
            <body
                className={cn(
                    "font-montserrat",
                    `${montserrat.variable} overflow-hidden antialiased`,
                )}
            >
                {children}
                <Toaster />
            </body>
        </html>
    );
}

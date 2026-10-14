import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "../themeToggle/ThemeToggle";
import { Button } from "@/components/ui/shadcn/button";
import { MobileNav } from "../mobileNav/MobileNav";

const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Founder Story", href: "#founder-story" },
    { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
    return (
        <header className="bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40 w-full border-b backdrop-blur">
            <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-16 lg:px-8">
                <Link href="/" className="shrink-0">
                    <span className="flex items-center gap-2.5">
                        <Image
                            src="/logo.png"
                            alt="logo"
                            width={24}
                            height={24}
                        />
                        <span className="font-medium tracking-tight">
                            Kanbanchik
                        </span>
                    </span>
                </Link>
                <nav className="hidden lg:block">
                    <ul className="flex items-center gap-1">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="relative px-3 py-2 text-sm text-muted-foreground transition-colors duration-200 after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <ThemeToggle />
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="hidden md:inline-flex"
                    >
                        <Link href="/signIn">Sign in</Link>
                    </Button>
                    <Button
                        asChild
                        size="sm"
                        className="hidden bg-bright-blue text-white hover:bg-blue-600 md:inline-flex"
                    >
                        <Link href="/signUp">Get started</Link>
                    </Button>
                    <MobileNav navLinks={navLinks} />
                </div>
            </div>
        </header>
    );
}

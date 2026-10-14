"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/shadcn/sheet";
import { Button } from "@/components/ui/shadcn/button";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import Image from "next/image";

interface MobileNavProps {
    navLinks: {
        label: string;
        href: string;
    }[];
}

export function MobileNav({ navLinks }: Readonly<MobileNavProps>) {
    const [open, setOpen] = useState(false);

    function handleLinkClick(
        event: MouseEvent<HTMLAnchorElement>,
        href: string,
    ) {
        setOpen(false);

        if (!href.startsWith("#")) {
            return;
        }

        event.preventDefault();

        window.setTimeout(() => {
            document.querySelector(href)?.scrollIntoView();
            window.history.replaceState(null, "", href);
        }, 300);
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <ListIcon weight="duotone" className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="grid [&>button:first-of-type]:hidden"
            >
                <div>
                    <SheetHeader>
                        <SheetTitle className="hidden"></SheetTitle>
                        <SheetDescription className="hidden"></SheetDescription>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Image
                                    src="/logo.png"
                                    alt="logo"
                                    width={24}
                                    height={24}
                                />
                                <span className="text-[1.0625rem] font-semibold tracking-tight">
                                    Kanbanchik
                                </span>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="size-7 text-control-text transition-colors hover:bg-control-active [&_svg]:size-4"
                            >
                                <XIcon weight="duotone" />
                            </Button>
                        </div>
                    </SheetHeader>
                    <nav className="mt-4">
                        <ul className="flex flex-col">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={(event) =>
                                            handleLinkClick(event, link.href)
                                        }
                                        className="flex h-14 items-center border-b text-base font-medium text-foreground/90 transition-colors duration-200 hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                <div className="mt-auto flex flex-col gap-3">
                    <SheetClose asChild>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/signIn">Sign in</Link>
                        </Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button
                            asChild
                            size="lg"
                            className="bg-bright-blue text-white hover:bg-blue-600"
                        >
                            <Link href="/signUp">Get started</Link>
                        </Button>
                    </SheetClose>
                </div>
            </SheetContent>
        </Sheet>
    );
}

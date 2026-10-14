import Image from "next/image";
import Link from "next/link";

const footerGroups = [
    {
        title: "Product",
        links: [
            { label: "Features", href: "/#features" },
            // { label: "Changelog", href: "/changelog" },
        ],
    },
    // {
    //     title: "Resources",
    //     links: [
    //         { label: "Documentation", href: "#" },
    //         { label: "Help Center", href: "#" },
    //         { label: "Guides", href: "#" },
    //     ],
    // },
    {
        title: "Legal",
        links: [
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="border-t">
            <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
                <h2 className="sr-only">Footer</h2>
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
                    <div className="flex flex-col items-center text-center lg:col-span-4 lg:block lg:text-start">
                        <Link href="/" className="inline-flex">
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
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                            Kanban project management for teams that want their
                            work in one place.
                        </p>
                    </div>
                    <nav className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-8 lg:grid-cols-[repeat(4,auto)] lg:justify-end lg:gap-x-16">
                        {footerGroups.map((group) => (
                            <div key={group.title}>
                                <h3 className="text-sm font-semibold">
                                    {group.title}
                                </h3>
                                <ul className="mt-3 space-y-1">
                                    {group.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="inline-block py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
                <div className="mt-12 flex items-center justify-center gap-4 border-t pt-6 lg:justify-start">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Kanbanchik. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

"use client";

import { Button } from "@/components/ui/shadcn/button";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
    const { theme } = useTheme();

    return (
        <section className="relative isolate overflow-hidden">
            <div className="bg-grid mask-fade-radial pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem]" />
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pt-14 text-center sm:px-6 sm:pt-20 md:pt-24 lg:px-8 lg:pt-28">
                <p className="flex items-center gap-2.5 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:text-xs">
                    Project management for modern teams
                </p>
                <h1 className="mt-6 max-w-4xl text-balance text-[2rem] font-normal leading-[1.1] tracking-tight min-[400px]:text-4xl sm:text-5xl md:text-[3.25rem] lg:text-6xl xl:text-[4rem]">
                    Plan, organize, and ship work in one place.
                </h1>
                <p className="mt-6 max-w-[40rem] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Manage projects, track tasks, collaborate with your team,
                    and keep every deadline visible from a single workspace.
                </p>
                <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Button
                        asChild
                        size="lg"
                        className="w-full bg-bright-blue text-white hover:bg-blue-600 sm:w-auto"
                    >
                        <Link href="/signUp">
                            Get started
                            <ArrowRightIcon weight="duotone" />
                        </Link>
                    </Button>
                </div>
            </div>
            <div
                id="product"
                className="pb-16 pt-12 md:pb-24 md:pt-16 lg:pb-28"
            >
                <div className="mx-auto w-full max-w-[86rem] px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-xl border bg-secondary/50 p-1.5 shadow-2xl shadow-black/[0.06] before:absolute before:inset-x-16 before:-top-px before:h-px before:bg-gradient-to-r before:from-transparent before:via-bright-blue/60 before:to-transparent dark:shadow-black/60 md:p-2">
                        <div className="flex overflow-hidden rounded-lg border bg-background-secondary">
                            {theme && (
                                <Image
                                    src={
                                        theme === "dark"
                                            ? "/preview-kanban-dark.png"
                                            : "/preview-kanban-light.png"
                                    }
                                    loading="eager"
                                    alt="map"
                                    width={1300}
                                    height={200}
                                    className="pointer-events-none z-10 size-full select-none object-cover object-top"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

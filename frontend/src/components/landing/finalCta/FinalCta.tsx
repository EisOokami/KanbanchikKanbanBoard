import { Button } from "@/components/ui/shadcn/button";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function FinalCta() {
    return (
        <section className="pb-16 md:pb-24 lg:pb-32">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative isolate overflow-hidden rounded-xl border bg-card px-6 py-12 sm:px-10 md:px-14 md:py-16">
                    <div className="bg-grid mask-fade-radial absolute inset-0 -z-10 opacity-70" />
                    <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-bright-blue/60 to-transparent" />
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-xl">
                            <h2
                                id="cta-heading"
                                className="text-balance text-[1.75rem] font-medium leading-[1.15] tracking-tight sm:text-3xl md:text-4xl"
                            >
                                Your next project starts here.
                            </h2>
                            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
                                Bring your tasks, people and deadlines into one
                                organized workspace.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
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
                </div>
            </div>
        </section>
    );
}

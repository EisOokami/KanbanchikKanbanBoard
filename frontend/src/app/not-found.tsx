import { HouseIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Button } from "@/components/ui/shadcn/button";

export default function NotFound() {
    return (
        <main className="flex h-svh flex-col items-center justify-center gap-2 text-center">
            <span className="text-[100px] font-bold leading-none md:text-[140px]">
                404
            </span>
            <h1 className="mt-2 text-xl font-bold md:text-3xl">
                Page not found.
            </h1>
            <p className="max-w-md text-sm text-muted-foreground md:text-base">
                The page you&apos;re looking for doesn&apos;t exist or may have
                been moved.
            </p>
            <div className="mt-4 flex items-center gap-3">
                <Button
                    asChild
                    size="lg"
                    className="gap-2 bg-bright-blue text-xs text-white hover:bg-blue-600"
                >
                    <Link href="/">
                        <HouseIcon weight="duotone" className="size-4" />
                        Go home
                    </Link>
                </Button>
            </div>
        </main>
    );
}

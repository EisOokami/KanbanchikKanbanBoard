import { cn } from "@/libs/utils";

interface SectionHeadingProps {
    id: string;
    title: string;
    description?: string;
    align?: "left" | "center" | "split";
    className?: string;
}

export function SectionHeading({
    id,
    title,
    description,
    align = "left",
    className,
}: Readonly<SectionHeadingProps>) {
    return (
        <div
            className={cn(
                align === "center" && "mx-auto max-w-2xl text-center",
                align === "left" && "max-w-2xl",
                align === "split" &&
                    "grid gap-4 lg:grid-cols-12 lg:items-end lg:gap-8",
                className,
            )}
        >
            <h2
                id={id}
                className={cn(
                    "text-balance text-[1.75rem] font-normal leading-[1.15] tracking-tight sm:text-3xl md:text-4xl",
                    align === "split" && "lg:col-span-7",
                )}
            >
                {title}
            </h2>
            {description ? (
                <p
                    className={cn(
                        "text-pretty text-base leading-relaxed text-muted-foreground",
                        align === "split"
                            ? "lg:col-span-4 lg:col-start-9"
                            : "mt-4",
                    )}
                >
                    {description}
                </p>
            ) : null}
        </div>
    );
}

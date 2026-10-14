import { cn } from "@/libs/utils";
import { CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr";

interface StoryListProps {
    title: string;
    items: string[];
    variant: "problem" | "solution";
}

export default function StoryList({
    title,
    items,
    variant,
}: Readonly<StoryListProps>) {
    const isSolution = variant === "solution";
    const Icon = isSolution ? CheckIcon : XIcon;

    return (
        <div
            className={cn(
                "rounded-lg border p-6",
                isSolution
                    ? "border-bright-blue/30 bg-card"
                    : "bg-secondary/40",
            )}
        >
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            <ul className="mt-4 space-y-3 text-sm">
                {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                        <Icon
                            weight="duotone"
                            className={cn(
                                "mt-0.5 size-4 shrink-0",
                                isSolution
                                    ? "text-bright-blue-ink"
                                    : "text-muted-foreground",
                            )}
                        />
                        <span
                            className={cn(
                                !isSolution && "text-muted-foreground",
                            )}
                        >
                            {item}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

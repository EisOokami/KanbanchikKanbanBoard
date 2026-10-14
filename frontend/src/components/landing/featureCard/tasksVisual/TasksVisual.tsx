import { items } from "@/constants/feature";
import { cn } from "@/libs/utils";
import { CheckSquareIcon, SquareIcon } from "@phosphor-icons/react/dist/ssr";

export default function TasksVisual() {
    return (
        <ul className="h-full space-y-2.5 rounded-md border bg-background-secondary p-3 text-[13px]">
            {items.map((item) => {
                const Icon = item.done ? CheckSquareIcon : SquareIcon;

                return (
                    <li
                        key={item.label}
                        className={cn(
                            "flex items-center gap-2.5",
                            item.done && "text-muted-foreground line-through",
                        )}
                    >
                        <Icon
                            weight="duotone"
                            className={cn(
                                "size-4 shrink-0",
                                item.done
                                    ? "text-bright-blue"
                                    : "text-muted-foreground",
                            )}
                        />
                        {item.label}
                    </li>
                );
            })}
        </ul>
    );
}

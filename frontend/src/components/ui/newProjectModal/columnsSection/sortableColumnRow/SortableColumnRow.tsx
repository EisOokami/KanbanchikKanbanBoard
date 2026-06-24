import { cn } from "@/libs/utils";
import { Column } from "@/types/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVerticalIcon, XIcon } from "@phosphor-icons/react";
import { Input } from "../../../shadcn/input";

interface SortableColumnRowProps {
    column: Omit<Column, "tasks" | "created_at" | "updated_at">;
    isPending: boolean;
    onWipLimitChange: (wipLimit: number | null, id: number) => void;
    onRemove: (id: number) => void;
}

export default function SortableColumnRow({
    column,
    isPending,
    onWipLimitChange,
    onRemove,
}: Readonly<SortableColumnRowProps>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: column.id, disabled: isPending });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-2.5 rounded-md border border-border/50 bg-muted/30 bg-white px-3 py-2 transition-all",
                isDragging ? "cursor-grabbing opacity-40" : "",
            )}
        >
            <DotsSixVerticalIcon
                weight="duotone"
                className="size-3.5 flex-shrink-0 cursor-grab text-muted-foreground/50 active:cursor-grabbing"
                {...attributes}
                {...listeners}
            />
            <span className="flex-1 text-sm font-medium">{column.name}</span>
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground/60">WIP</span>
                <Input
                    name="wip-limit"
                    type="number"
                    min={1}
                    max={999}
                    placeholder="∞"
                    value={column.wip_limit ?? ""}
                    className="h-6 w-12 px-1 py-0 text-center text-sm"
                    onChange={(e) => {
                        const raw = e.target.value;

                        onWipLimitChange(
                            raw === "" ? null : Math.max(1, Number(raw)),
                            column.id,
                        );
                    }}
                    disabled={isPending}
                />
            </div>
            <button
                type="button"
                onClick={() => onRemove(column.id)}
                className="text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                disabled={isPending}
            >
                <XIcon weight="duotone" className="size-4" />
            </button>
        </div>
    );
}

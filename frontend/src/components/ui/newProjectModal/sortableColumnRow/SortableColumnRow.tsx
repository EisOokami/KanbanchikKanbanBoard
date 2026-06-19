import { Column } from "@/types/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVerticalIcon, XIcon } from "@phosphor-icons/react";

interface SortableColumnRowProps {
    column: Omit<Column, "tasks" | "created_at" | "updated_at">;
    isPending: boolean;
    onRemove: (id: number) => void;
}

export default function SortableColumnRow({
    column,
    isPending,
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
            className={`flex items-center gap-2.5 rounded-md border border-border/50 bg-muted/30 bg-white px-3 py-2 transition-all ${
                isDragging ? "cursor-grabbing opacity-40" : ""
            }`}
        >
            <DotsSixVerticalIcon
                weight="duotone"
                className="size-3.5 flex-shrink-0 cursor-grab text-muted-foreground/50 active:cursor-grabbing"
                {...attributes}
                {...listeners}
            />
            <span className="flex-1 text-sm font-medium">{column.name}</span>
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

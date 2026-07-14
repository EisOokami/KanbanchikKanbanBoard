import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { cn } from "@/libs/utils";
import { BaseAction } from "@/types/actions";
import { Column } from "@/types/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    DotsSixVerticalIcon,
    PencilSimpleIcon,
    TrashSimpleIcon,
} from "@phosphor-icons/react";

interface SortableColumnRowProps {
    column:
        | Column
        | {
              id: number;
              name: string;
              position: number;
          };
    editingColumn: number | null;
    isPending: boolean;
    formState: BaseAction | undefined;
    onColumnRemove: (id: number) => void;
    onColumnUpdate: (id: number, patch: Partial<Column>) => void;
    onEditingColumnChange: (value: number | null) => void;
}

export default function SortableColumnRow({
    column,
    editingColumn,
    isPending,
    formState,
    onColumnRemove,
    onColumnUpdate,
    onEditingColumnChange,
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
                "flex items-center gap-3 rounded-md border border-border bg-control px-3 py-2.5 transition-colors hover:bg-control-active",
                isDragging ? "opacity-40" : "",
            )}
        >
            <DotsSixVerticalIcon
                weight="duotone"
                size={14}
                className="cursor-grab text-control-text active:cursor-grabbing"
                {...attributes}
                {...listeners}
            />
            {editingColumn === column.id ? (
                <Input
                    name="editing-column"
                    autoFocus
                    value={column.name}
                    defaultValue={
                        formState?.formData
                            ?.get("editing-column")
                            ?.toString() ?? undefined
                    }
                    onChange={(e) => {
                        onColumnUpdate(column.id, {
                            name: e.target.value,
                        });
                    }}
                    onBlur={() => onEditingColumnChange(null)}
                    onKeyDown={(e) =>
                        e.key === "Enter" && onEditingColumnChange(null)
                    }
                    className="h-7 flex-1 rounded-md px-2 text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                />
            ) : (
                <span className="flex-1 text-sm font-medium">
                    {column.name}
                </span>
            )}
            <div className="flex items-center gap-1.5">
                <label
                    htmlFor={`wip-limit-${column.id}`}
                    className="whitespace-nowrap text-xs text-control-text"
                >
                    WIP
                </label>
                <Input
                    id={`wip-limit-${column.id}`}
                    type="number"
                    min={1}
                    placeholder="∞"
                    disabled={isPending}
                    value={
                        "wip_limit" in column && column.wip_limit != null
                            ? column.wip_limit
                            : ""
                    }
                    onChange={(e) => {
                        const raw = e.target.value;

                        onColumnUpdate(column.id, {
                            wip_limit:
                                raw === "" ? null : Math.max(1, Number(raw)),
                        });
                    }}
                    className="h-7 w-14 rounded-md px-2 text-center text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                />
            </div>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditingColumnChange(column.id)}
                    className="ml-1 size-7 text-control-text hover:bg-control-active"
                    disabled={isPending}
                >
                    <PencilSimpleIcon weight="duotone" size={16} />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onColumnRemove(column.id)}
                    className="size-7 text-control-text hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950  dark:hover:text-red-600"
                    disabled={isPending}
                >
                    <TrashSimpleIcon weight="duotone" size={16} />
                </Button>
            </div>
        </div>
    );
}

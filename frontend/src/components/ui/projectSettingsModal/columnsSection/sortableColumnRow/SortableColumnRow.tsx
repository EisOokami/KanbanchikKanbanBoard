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
                "flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-gray-50",
                isDragging ? "opacity-40" : "",
            )}
        >
            <DotsSixVerticalIcon
                weight="duotone"
                size={14}
                className="cursor-grab text-gray-500 active:cursor-grabbing"
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
                    onChange={(e) =>
                        onColumnUpdate(column.id, {
                            name: e.target.value,
                        })
                    }
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
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onEditingColumnChange(column.id)}
                    className="ml-1 flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100"
                    disabled={isPending}
                >
                    <PencilSimpleIcon weight="duotone" size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => onColumnRemove(column.id)}
                    className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-400"
                    disabled={isPending}
                >
                    <TrashSimpleIcon weight="duotone" size={16} />
                </button>
            </div>
        </div>
    );
}

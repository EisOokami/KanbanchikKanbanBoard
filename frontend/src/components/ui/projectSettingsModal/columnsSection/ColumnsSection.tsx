"use client";

import { Button } from "../../shadcn/button";
import { PlusIcon } from "@phosphor-icons/react";
import { Input } from "../../shadcn/input";
import { Column } from "@/types/types";
import { useState } from "react";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import SortableColumnRow from "./sortableColumnRow/SortableColumnRow";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface ColumnsSectionProps {
    columns: Column[];
    newColumns: Omit<Column, "created_at" | "updated_at" | "tasks">[];
    newColumnName: string;
    formState: BaseAction | undefined;
    isPending: boolean;
    onColumnsChange: (columnsValue: Column[]) => void;
    onColumnNameChange: (nameValue: string) => void;
    onNewColumnsChange: (
        newColumnsValue: Omit<Column, "created_at" | "updated_at" | "tasks">[],
    ) => void;
}

export default function ColumnsSection({
    columns,
    newColumns,
    newColumnName,
    formState,
    isPending,
    onColumnNameChange,
    onColumnsChange,
    onNewColumnsChange,
}: Readonly<ColumnsSectionProps>) {
    const [editingColumn, setEditingColumn] = useState<number | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const allColumns = [...columns, ...newColumns];
        const oldIndex = allColumns.findIndex((c) => c.id === active.id);
        const newIndex = allColumns.findIndex((c) => c.id === over.id);

        const reordered = arrayMove(allColumns, oldIndex, newIndex).map(
            (column, i) => ({ ...column, position: i + 1 }),
        );

        onColumnsChange(
            reordered.filter((value) =>
                columns.some((column) => column.id === value.id),
            ) as Column[],
        );
        onNewColumnsChange(
            reordered.filter((value) =>
                newColumns.some((column) => column.id === value.id),
            ),
        );
    };

    const addColumn = () => {
        if (!newColumnName.trim()) {
            return;
        }

        onNewColumnsChange([
            ...newColumns,
            {
                id: new Date().getTime(),
                name: newColumnName,
                position: columns.length - 1,
            },
        ]);
        onColumnNameChange("");
    };

    const updateColumn = (id: number, patch: Partial<Column>) => {
        onColumnsChange(
            columns.map((value) =>
                value.id === id ? { ...value, ...patch } : value,
            ),
        );
        onNewColumnsChange(
            newColumns.map((value) =>
                value.id === id ? { ...value, ...patch } : value,
            ),
        );
    };

    const removeColumn = (id: number) => {
        onColumnsChange(columns.filter((value) => value.id !== id));
        onNewColumnsChange(newColumns.filter((value) => value.id !== id));
    };

    return (
        <div className="space-y-1">
            <h3 className="font-semibold">Columns</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={[...columns, ...newColumns].map((c) => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {columns.map((column) => (
                                <SortableColumnRow
                                    key={column.id}
                                    column={column}
                                    editingColumn={editingColumn}
                                    formState={formState}
                                    isPending={isPending}
                                    onColumnUpdate={updateColumn}
                                    onEditingColumnChange={setEditingColumn}
                                    onColumnRemove={removeColumn}
                                />
                            ))}
                            {newColumns.map((column) => (
                                <SortableColumnRow
                                    key={column.id}
                                    column={column}
                                    editingColumn={editingColumn}
                                    formState={formState}
                                    isPending={isPending}
                                    onColumnUpdate={updateColumn}
                                    onEditingColumnChange={setEditingColumn}
                                    onColumnRemove={removeColumn}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
                <div className="flex items-center gap-2 rounded-md border p-3">
                    <Input
                        name="column"
                        placeholder="Column name…"
                        value={newColumnName}
                        defaultValue={
                            formState?.formData?.get("column")?.toString() ??
                            undefined
                        }
                        onChange={(e) => onColumnNameChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addColumn()}
                        className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                        disabled={isPending}
                    />
                    <Button
                        type="button"
                        size="sm"
                        onClick={addColumn}
                        disabled={!newColumnName.trim() || isPending}
                        className="h-8 rounded-md bg-bright-blue px-3 text-[12px] text-white hover:bg-blue-600 disabled:opacity-40"
                    >
                        <PlusIcon weight="duotone" size={13} />
                    </Button>
                </div>
                <ZodErrors error={formState?.zodErrors?.columns} />
            </div>
        </div>
    );
}

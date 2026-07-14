"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { Button } from "../../shadcn/button";
import { cn } from "@/libs/utils";
import { Input } from "../../shadcn/input";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableColumnRow from "./sortableColumnRow/SortableColumnRow";
import { useCallback, useState } from "react";
import { NewProjectFormData } from "@/types/types";
import { BaseAction } from "@/types/actions";

interface ColumnsSectionProps {
    formData: NewProjectFormData;
    formState: BaseAction | undefined;
    isPending: boolean;
    onFormDataChange: (formData: NewProjectFormData) => void;
}

export default function ColumnsSection({
    formData,
    formState,
    isPending,
    onFormDataChange,
}: Readonly<ColumnsSectionProps>) {
    const [newColumnName, setNewColumnName] = useState<string>("");
    const sensors = useSensors(useSensor(PointerSensor));

    const addColumn = () => {
        if (!newColumnName.trim()) {
            return;
        }

        onFormDataChange({
            ...formData,
            columns: [
                ...formData.columns,
                {
                    id: Object.keys(formData.columns).length + 1,
                    name: newColumnName.trim(),
                    position: Object.keys(formData.columns).length,
                    wip_limit: null,
                },
            ],
        });
        setNewColumnName("");
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = formData.columns.findIndex(
            (column) => column.id === active.id,
        );
        const newIndex = formData.columns.findIndex(
            (column) => column.id === over.id,
        );

        onFormDataChange({
            ...formData,
            columns: arrayMove(formData.columns, oldIndex, newIndex).map(
                (column, i) => ({
                    ...column,
                    position: i + 1,
                }),
            ),
        });
    };

    const handleChangeWipLimit = useCallback(
        (wipLimit: number | null, id: number) => {
            onFormDataChange({
                ...formData,
                columns: formData.columns.map((column) =>
                    column.id === id
                        ? { ...column, wip_limit: wipLimit }
                        : column,
                ),
            });
        },
        [formData, onFormDataChange],
    );

    const handleRemoveColumn = (id: number) => {
        onFormDataChange({
            ...formData,
            columns: formData.columns.filter(
                (columnsState) => columnsState.id !== id,
            ),
        });
    };

    return (
        <div className="space-y-1">
            <label className="font-semibold" htmlFor="column">
                Project Columns
            </label>
            <div className="space-y-5">
                <div className="space-y-1.5">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={formData.columns.map((column) => column.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {formData.columns.map((column) => (
                                <SortableColumnRow
                                    key={column.id}
                                    column={column}
                                    isPending={isPending}
                                    onWipLimitChange={handleChangeWipLimit}
                                    onRemove={handleRemoveColumn}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
                <div className="space-y-1">
                    <div className="flex gap-2">
                        <Input
                            id="column"
                            name="column"
                            placeholder="Column name…"
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addColumn())
                            }
                            className={cn(
                                "h-8 flex-1 bg-control text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue",
                                formState?.zodErrors?.columns
                                    ? "border-red-500"
                                    : "",
                            )}
                            disabled={isPending}
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={addColumn}
                            className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                            disabled={isPending}
                        >
                            <PlusIcon weight="duotone" className="size-4" /> Add
                        </Button>
                    </div>
                    <div>
                        <ZodErrors error={formState?.zodErrors?.columns} />
                    </div>
                </div>
            </div>
        </div>
    );
}

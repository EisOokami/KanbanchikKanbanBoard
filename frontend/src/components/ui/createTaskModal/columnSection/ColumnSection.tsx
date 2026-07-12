"use client";

import { BaseAction } from "@/types/actions";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../shadcn/select";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { Project } from "@/types/types";

interface ColumnSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    selectedProject: Project;
    selectedColumnId: number | undefined;
    onValueChange: (id: string) => void;
}

export default function ColumnSection({
    formState,
    isPending,
    selectedProject,
    selectedColumnId,
    onValueChange,
}: Readonly<ColumnSectionProps>) {
    return (
        <div className="space-y-1">
            <label className="font-semibold" htmlFor="column">
                Column
                <span className="text-red-500">*</span>
            </label>
            <Select
                value={
                    selectedColumnId ? selectedColumnId.toString() : undefined
                }
                onValueChange={onValueChange}
                disabled={isPending}
            >
                <SelectTrigger
                    id="column"
                    className="focus:ring-1 focus:ring-bright-blue"
                >
                    <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                    {selectedProject.columns
                        .filter(
                            (column) =>
                                !column.wip_limit ||
                                column.wip_limit === 0 ||
                                (column.total_tasks &&
                                    column.total_tasks < column.wip_limit) ||
                                (column.tasks.length &&
                                    column.tasks.length < column.wip_limit),
                        )
                        .map((column) => (
                            <SelectItem
                                key={column.id}
                                value={column.id.toString()}
                                className="rounded-md text-sm font-medium capitalize"
                            >
                                <span>{column.name}</span>
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
            <div>
                <ZodErrors error={formState?.zodErrors?.columnId} />
            </div>
        </div>
    );
}

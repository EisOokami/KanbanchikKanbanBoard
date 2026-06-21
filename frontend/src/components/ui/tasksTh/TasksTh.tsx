"use client";

import { cn } from "@/libs/utils";
import { SortDir, SortField } from "@/types/types";
import { Icon } from "@phosphor-icons/react";
import SortIcon from "../sortIcon/SortIcon";

export default function TasksTh({
    label,
    field,
    className = "",
    sortField,
    sortDir,
    onSort,
    Icon,
}: Readonly<{
    label: string;
    field: SortField;
    className?: string;
    sortField: SortField;
    sortDir: SortDir;
    onSort: (field: SortField) => void;
    Icon?: Icon;
}>) {
    return (
        <th
            className={cn(
                "cursor-pointer select-none whitespace-nowrap py-2.5 pr-4 text-left text-sm font-normal tracking-wider text-gray-400",
                className,
            )}
            onClick={() => onSort(field)}
        >
            <span className="flex items-center gap-1 transition-colors hover:text-gray-600">
                {Icon && <Icon weight="duotone" className="size-4" />}
                {label}
                <SortIcon
                    field={field}
                    sortField={sortField}
                    sortDir={sortDir}
                />
            </span>
        </th>
    );
}

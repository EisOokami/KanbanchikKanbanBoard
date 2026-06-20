import { SortDir, SortField } from "@/types/types";
import {
    CaretDownIcon,
    CaretUpDownIcon,
    CaretUpIcon,
} from "@phosphor-icons/react";

interface SortIconProps {
    field: SortField;
    sortField: SortField;
    sortDir: SortDir;
}

export default function SortIcon({
    field,
    sortField,
    sortDir,
}: Readonly<SortIconProps>) {
    if (field !== sortField) {
        return (
            <CaretUpDownIcon
                weight="duotone"
                className="size-3 text-gray-300"
            />
        );
    }

    return sortDir === "asc" ? (
        <CaretUpIcon weight="duotone" className="size-3 text-blue-500" />
    ) : (
        <CaretDownIcon weight="duotone" className="size-3 text-blue-500" />
    );
}

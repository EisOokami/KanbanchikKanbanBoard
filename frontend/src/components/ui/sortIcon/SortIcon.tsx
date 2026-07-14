import { SortDirection, SortField } from "@/types/types";
import {
    CaretDownIcon,
    CaretUpDownIcon,
    CaretUpIcon,
} from "@phosphor-icons/react";

interface SortIconProps {
    field: SortField;
    sortField: SortField;
    sortDir: SortDirection;
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
                className="size-3 text-muted-foreground"
            />
        );
    }

    return sortDir === "asc" ? (
        <CaretUpIcon weight="duotone" className="size-3 text-foreground" />
    ) : (
        <CaretDownIcon weight="duotone" className="size-3 text-foreground" />
    );
}

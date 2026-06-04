import { SortDir, SortField } from "@/types/types";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

export default function SortIcon({
    field,
    sortField,
    sortDir,
}: {
    field: SortField;
    sortField: SortField;
    sortDir: SortDir;
}) {
    if (field !== sortField)
        return <ChevronsUpDown className="size-3 text-gray-300" />;
    return sortDir === "asc" ? (
        <ChevronUp className="size-3 text-blue-500" />
    ) : (
        <ChevronDown className="size-3 text-blue-500" />
    );
}

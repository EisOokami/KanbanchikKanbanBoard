import { Status } from "./types";

export type ViewMode = "grid" | "list";
export type SortField = "name" | "progress" | "members" | "created_at";
export type SortDirection = "asc" | "desc";

export interface FilterSortOptions {
    sortField: SortField;
    sortDirection: SortDirection;
    statuses: Status[];
    memberIds: number[];
    categoryIds: number[];
}

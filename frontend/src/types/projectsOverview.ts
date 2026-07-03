import { SortDirection, Status } from "./types";

export type SortField = "name" | "progress" | "members" | "created_at";

export interface FilterSortOptions {
    sortField: SortField;
    sortDirection: SortDirection;
    statuses: Status[];
    memberIds: number[];
    categoryIds: number[];
}

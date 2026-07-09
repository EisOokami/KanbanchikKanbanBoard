import { Priority, TasksFilterState } from "@/types/types";

export const TASKS_DEFAULT_FILTER: TasksFilterState = {
    search: "",
    columns: [],
    priorities: [],
    projects: [],
    overdue: false,
};

export const PRIORITY_ORDER: Record<Priority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
};

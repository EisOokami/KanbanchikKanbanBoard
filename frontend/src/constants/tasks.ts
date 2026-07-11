import { TasksFilterState } from "@/types/types";

export const TASKS_DEFAULT_FILTER: TasksFilterState = {
    search: "",
    columns: [],
    priorities: [],
    projects: [],
    overdue: false,
};

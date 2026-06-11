import Tasks from "@/components/layout/tasks/Tasks";
import { getTaskFilterOptionsData, getTasksData } from "@/data/loaders";

export default async function TasksPage() {
    const tasksData = await getTasksData();
    const taskFilterOptionsData = await getTaskFilterOptionsData();

    return (
        <Tasks
            tasksData={tasksData}
            taskFilterOptionsData={taskFilterOptionsData}
        />
    );
}

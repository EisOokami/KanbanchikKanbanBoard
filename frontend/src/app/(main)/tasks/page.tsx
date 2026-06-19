import Tasks from "@/components/layout/tasks/Tasks";
import {
    getTaskFilterOptionsData,
    getTasksData,
    getUserData,
} from "@/data/loaders";
import { redirect } from "next/navigation";

export default async function TasksPage() {
    const tasksData = await getTasksData();
    const taskFilterOptionsData = await getTaskFilterOptionsData();
    const userData = await getUserData();

    if (!userData.data) {
        redirect("/signIn");
    }

    return (
        <Tasks
            tasksData={tasksData}
            taskFilterOptionsData={taskFilterOptionsData}
            userData={userData.data}
        />
    );
}

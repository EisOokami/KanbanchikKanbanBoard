import Calendar from "@/components/layout/calendar/Calendar";
import { getTasksData, getUserData } from "@/data/loaders";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
    const userData = await getUserData();

    if (!userData.data) {
        redirect("/signIn");
    }

    const tasksData = await getTasksData();

    return <Calendar tasksData={tasksData} userData={userData.data} />;
}

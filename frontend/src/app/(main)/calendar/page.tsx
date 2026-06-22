import Calendar from "@/components/layout/calendar/Calendar";
import { getTasksData, getUserData } from "@/data/loaders";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
    const tasksData = await getTasksData();
    const userData = await getUserData();

    if (!userData.data) {
        redirect("/signIn");
    }

    return <Calendar tasksData={tasksData} userData={userData.data} />;
}

import Calendar from "@/components/layout/calendar/Calendar";
import { getTasksData } from "@/data/loaders";

export default async function CalendarPage() {
    const tasksData = await getTasksData();

    return <Calendar tasksData={tasksData} />;
}

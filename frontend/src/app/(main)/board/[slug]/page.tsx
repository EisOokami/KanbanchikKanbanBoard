import { redirect } from "next/navigation";
import KanbanBoard from "@/components/layout/kanbanBoard/KanbanBoard";
import { getProjectData, getUserData } from "@/data/loaders";

interface BoardPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BoardPage({
    searchParams,
}: Readonly<BoardPageProps>) {
    const { id } = await searchParams;

    if (typeof id !== "string") {
        redirect("/overview");
    }

    const userData = await getUserData();

    if (!userData.data) {
        redirect("/signIn");
    }

    const projectData = await getProjectData(id);

    return <KanbanBoard userData={userData.data} projectData={projectData} />;
}

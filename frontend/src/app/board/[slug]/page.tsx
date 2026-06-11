import KanbanBoard from "@/components/layout/kanbanBoard/KanbanBoard";
import { getProjectData } from "@/data/loaders";

interface BoardPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BoardPage({
    searchParams,
}: Readonly<BoardPageProps>) {
    const { id } = await searchParams;

    if (typeof id !== "string") {
        return;
    }

    const projectData = await getProjectData(id);

    return <KanbanBoard projectData={projectData} />;
}

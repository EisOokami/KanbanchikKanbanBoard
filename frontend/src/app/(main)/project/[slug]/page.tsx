import { redirect } from "next/navigation";
import Project from "@/components/layout/project/Project";
import { getProjectData, getUserData } from "@/data/loaders";

interface ProjectPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProjectPage({
    searchParams,
}: Readonly<ProjectPageProps>) {
    const { id } = await searchParams;

    if (typeof id !== "string") {
        redirect("/overview");
    }

    const userData = await getUserData();

    if (!userData.data) {
        redirect("/signIn");
    }

    const projectData = await getProjectData(id);

    return <Project userData={userData.data} projectData={projectData} />;
}

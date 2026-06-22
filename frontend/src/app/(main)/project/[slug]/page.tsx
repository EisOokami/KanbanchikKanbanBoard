import { redirect } from "next/navigation";
import Project from "@/components/layout/project/Project";
import { getProjectData, getUserData } from "@/data/loaders";

interface ProjectPageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProjectPage({
    params,
}: Readonly<ProjectPageProps>) {
    const { slug } = await params;

    if (typeof slug !== "string") {
        redirect("/overview");
    }

    const userData = await getUserData();

    if (!userData.data) {
        redirect("/signIn");
    }

    const projectData = await getProjectData(slug);

    return <Project userData={userData.data} projectData={projectData} />;
}

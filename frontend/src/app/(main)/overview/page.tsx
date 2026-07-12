import ProjectsOverview from "@/components/layout/projectsOverview/ProjectsOverview";
import { getProjectsData, getUserData } from "@/data/loaders";
import { redirect } from "next/navigation";

export default async function OverviewPage() {
    const userData = await getUserData();

    if (!userData.data) {
        redirect("/signIn");
    }

    const projectsData = await getProjectsData();

    return (
        <ProjectsOverview
            projectsData={projectsData}
            userData={userData.data}
        />
    );
}

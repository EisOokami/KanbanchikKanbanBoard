import ProjectsOverview from "@/components/layout/projectsOverview/ProjectsOverview";
import { getProjectsData } from "@/data/loaders";

export default async function OverviewPage() {
    const projectsData = await getProjectsData();

    return <ProjectsOverview projectsData={projectsData} />;
}

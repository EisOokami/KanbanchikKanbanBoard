import { SectionHeading } from "../sectionHeading/SectionHeading";
import {
    CalendarBlankIcon,
    ChartLineUpIcon,
    ChatCircleIcon,
    FoldersIcon,
    KanbanIcon,
    ListChecksIcon,
} from "@phosphor-icons/react/dist/ssr";
import FeatureCard from "../featureCard/FeatureCard";

const features = [
    {
        id: "boards",
        title: "Flexible Kanban boards",
        description:
            "Organize work visually with customizable columns and workflows.",
        icon: KanbanIcon,
        wide: true,
    },
    {
        id: "tasks",
        title: "Tasks and subtasks",
        description:
            "Break complex work into manageable pieces and keep ownership clear.",
        icon: ListChecksIcon,
    },
    {
        id: "progress",
        title: "Progress tracking",
        description:
            "See project progress without manually maintaining spreadsheets.",
        icon: ChartLineUpIcon,
    },
    {
        id: "collaboration",
        title: "Team collaboration",
        description:
            "Keep comments, members, attachments and project activity together.",
        icon: ChatCircleIcon,
        wide: true,
    },
    {
        id: "deadlines",
        title: "Deadlines and calendar",
        description: "Track upcoming work and deadlines across your projects.",
        icon: CalendarBlankIcon,
        wide: true,
    },
    {
        id: "insights",
        title: "Project insights",
        description:
            "Understand workload, progress and project status at a glance.",
        icon: FoldersIcon,
    },
];

export default function Features() {
    return (
        <section id="features" className="py-16 md:py-24 lg:py-32">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    id="features-heading"
                    align="split"
                    title="Everything your team needs to keep work moving."
                    description="Boards, tasks, deadlines and reporting live in one workspace, so nothing hides in a side spreadsheet."
                />
                <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <FeatureCard key={feature.id} feature={feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}

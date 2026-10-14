import {
    FoldersIcon,
    LightningIcon,
    ListChecksIcon,
} from "@phosphor-icons/react/dist/ssr";
import { SectionHeading } from "../sectionHeading/SectionHeading";

const workflowSteps = [
    {
        number: "01",
        title: "Create a project",
        description: "Set up your workspace and define the workflow.",
        icon: FoldersIcon,
    },
    {
        number: "02",
        title: "Organize the work",
        description:
            "Add tasks, assign ownership, set priorities and deadlines.",
        icon: ListChecksIcon,
    },
    {
        number: "03",
        title: "Move work forward",
        description: "Track progress and keep the entire team aligned.",
        icon: LightningIcon,
    },
];

export default function Workflow() {
    return (
        <section
            id="how-it-works"
            className="scroll-mt-20 border-y bg-secondary/40 py-16 md:py-24 lg:py-32"
        >
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    id="workflow-heading"
                    align="center"
                    title="From idea to done."
                    description="Three steps between an empty workspace and a team that is moving."
                />
                <ol className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-8">
                    {workflowSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isLast = index === workflowSteps.length - 1;

                        return (
                            <li
                                key={step.number}
                                className="relative flex flex-col items-center text-center"
                            >
                                <span className="mb-6 flex size-12 items-center justify-center rounded-lg border bg-card">
                                    <Icon
                                        weight="duotone"
                                        className="size-6 text-bright-blue"
                                    />
                                </span>
                                {!isLast ? (
                                    <span className="absolute -bottom-8 left-1/2 top-14 w-px -translate-x-1/2 bg-border md:bottom-auto md:left-[calc(50%+2rem)] md:top-6 md:h-px md:w-[calc(100%-2rem)] md:translate-x-0" />
                                ) : null}
                                <p className="text-sm font-medium tabular-nums text-bright-blue">
                                    {step.number}
                                </p>
                                <h3 className="mt-1 text-lg font-semibold tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                                    {step.description}
                                </p>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}

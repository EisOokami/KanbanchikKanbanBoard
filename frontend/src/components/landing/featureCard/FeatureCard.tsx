import { cn } from "@/libs/utils";
import type { Icon } from "@phosphor-icons/react";
import { ReactNode } from "react";
import BoardsVisual from "./boardsVisual/BoardsVisual";
import TasksVisual from "./tasksVisual/TasksVisual";
import ProgressVisual from "./progressVisual/ProgressVisual";
import CollaborationVisual from "./collaborationVisual/CollaborationVisual";
import DeadlinesVisual from "./deadlinesVisual/DeadlinesVisual";
import InsightsVisual from "./insightsVisual/InsightsVisual";
import { Slot } from "@radix-ui/react-slot";

interface FeatureCardProps {
    feature: {
        id: string;
        title: string;
        description: string;
        icon: Icon;
        wide?: boolean;
    };
}

const visuals: Record<string, ReactNode> = {
    boards: <BoardsVisual />,
    tasks: <TasksVisual />,
    progress: <ProgressVisual />,
    collaboration: <CollaborationVisual />,
    deadlines: <DeadlinesVisual />,
    insights: <InsightsVisual />,
};

export default function FeatureCard({ feature }: FeatureCardProps) {
    const Icon = feature.icon;
    const wide = feature.wide === true;

    return (
        <Slot
            className={cn(
                "flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground transition-colors duration-300 hover:border-foreground/20 hover:bg-card-active",
                wide && "lg:col-span-2 lg:flex-row",
            )}
        >
            <article>
                <div
                    className={cn(
                        "p-6 pb-5",
                        wide && "lg:w-[40%] lg:shrink-0 lg:pb-6",
                    )}
                >
                    <span className="flex size-9 items-center justify-center rounded-md border bg-secondary">
                        <Icon
                            weight="duotone"
                            className="size-5 text-bright-blue"
                        />
                    </span>
                    <h3 className="mt-5 text-base font-semibold tracking-tight">
                        {feature.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                    </p>
                </div>
                <div
                    className={cn(
                        "mt-auto px-6 pb-6",
                        wide && "lg:mt-0 lg:flex-1 lg:pl-0 lg:pt-6",
                    )}
                >
                    {visuals[feature.id]}
                </div>
            </article>
        </Slot>
    );
}

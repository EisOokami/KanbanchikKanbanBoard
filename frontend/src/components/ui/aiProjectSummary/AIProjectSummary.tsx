"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../shadcn/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../shadcn/card";
import { cn } from "@/libs/utils";
import { generateProjectSummaryAction } from "@/data/actions";
import {
    ArrowsClockwiseIcon,
    CheckIcon,
    CopyIcon,
    SparkleIcon,
} from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { aiProjectSummarySchema } from "@/libs/validation/validation";
import z from "zod";
import {
    healthStyles,
    projectHealthLabels,
} from "@/constants/aIProjectSummary";

export default function AIProjectSummary({
    projectId,
    projectName,
}: Readonly<{ projectId: number; projectName: string }>) {
    const [result, setResult] = useState<z.infer<
        typeof aiProjectSummarySchema
    > | null>(null);
    const [busy, setBusy] = useState(false);
    const [copied, setCopied] = useState(false);
    const inFlight = useRef(false);
    const mounted = useRef(true);
    const copyTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;

            clearTimeout(copyTimeout.current);
        };
    }, []);

    const handleGenerate = async () => {
        if (inFlight.current) {
            return;
        }

        inFlight.current = true;

        setBusy(true);

        try {
            const response = await generateProjectSummaryAction(projectId);

            if (!mounted.current) {
                return;
            }

            if (!response.ok || !response.data) {
                toast.error("Error", { description: response.message });

                return;
            }

            setResult(response.data);
            setCopied(false);

            toast.success("Success", { description: response.message });
        } catch {
            if (mounted.current) {
                toast.error("Error", {
                    description: "Something went wrong",
                });
            }
        } finally {
            inFlight.current = false;

            if (mounted.current) {
                setBusy(false);
            }
        }
    };

    const handleCopySummary = async () => {
        if (!result) {
            return;
        }

        try {
            const { stats, analysis } = result;

            const formattedProjectSummary = [
                `AI Project Summary - ${projectName}`,
                `Snapshot: ${result.generatedAt}`,
                `Health: ${projectHealthLabels[analysis.health]} (AI assessment; advisory)`,
                "",
                "Statistics",
                `Total Tasks: ${stats.totalTasks}`,
                `Completed Tasks: ${stats.completedTasks}`,
                `Completion: ${stats.completionPercentage}%`,
                `In Progress: ${stats.inProgressTasks}`,
                `Remaining Tasks: ${stats.remainingTasks}`,
                `Overdue Tasks: ${stats.overdueTasks}`,
                `Upcoming Deadlines (${result.referenceDate} through ${result.upcomingThrough}): ${stats.upcomingDeadlines}`,
                `High / Critical Priority Incomplete Tasks: ${stats.highPriorityTasks} (${stats.criticalPriorityTasks} critical)`,
                `Columns Exceeding WIP Limits: ${stats.columnsExceedingWip}`,
                ...stats.columns.map(
                    (column) => `- ${column.name}: ${column.taskCount} tasks`,
                ),
                "Calendar dates use the database timezone; due today is not overdue.",
                "",
                "AI Summary",
                analysis.summary,
                "",
                "Key Highlights",
                ...(analysis.highlights.length
                    ? analysis.highlights.map((highlight) => `- ${highlight}`)
                    : ["No highlights identified."]),
                "",
                "Risks & Bottlenecks",
                ...(analysis.risks.length
                    ? analysis.risks.map(
                          (risk) =>
                              `- [${risk.severity}] ${risk.title}: ${risk.description}`,
                      )
                    : ["No specific risks identified in this snapshot."]),
                "",
                "Recommended Next Steps",
                ...analysis.recommendations.map(
                    (recommendation, index) =>
                        `${index + 1}. ${recommendation.title}: ${recommendation.description}`,
                ),
            ].join("\n");

            await navigator.clipboard.writeText(formattedProjectSummary);

            toast.success("Success", {
                description: "Summary has been copied",
            });

            setCopied(true);

            clearTimeout(copyTimeout.current);
            copyTimeout.current = setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Error", {
                description:
                    "Unable to copy the summary. Check clipboard permissions and try again.",
            });
        }
    };

    return (
        <Card className="min-w-0 shadow-none">
            <CardHeader className="gap-3 xl:flex-row xl:items-start xl:justify-between xl:space-y-0">
                <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <SparkleIcon
                            weight="duotone"
                            className="size-5 text-muted-foreground"
                        />{" "}
                        AI Project Summary
                    </CardTitle>
                    <CardDescription>
                        Get an AI-powered overview of your project&apos;s
                        progress, risks, and next steps.
                    </CardDescription>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    {result && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopySummary}
                            disabled={busy}
                        >
                            {copied ? (
                                <CheckIcon weight="duotone" />
                            ) : (
                                <CopyIcon weight="duotone" />
                            )}
                            {copied ? "Copied" : "Copy Summary"}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={busy}
                        className="bg-control text-control-text hover:bg-control-active"
                    >
                        {busy ? (
                            <Loader2 className="animate-spin" />
                        ) : result ? (
                            <ArrowsClockwiseIcon weight="duotone" />
                        ) : (
                            <SparkleIcon weight="duotone" />
                        )}
                        {busy
                            ? "Analyzing project..."
                            : result
                              ? "Regenerate"
                              : "Generate Summary"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 break-words text-sm">
                <span
                    role="status"
                    className={busy ? "text-muted-foreground" : "sr-only"}
                >
                    {busy
                        ? "Analyzing project..."
                        : result
                          ? "Project summary ready"
                          : ""}
                </span>
                {!result && !busy && (
                    <p className="text-xs text-muted-foreground">
                        Uses current saved project data. Nothing is changed
                        automatically.
                    </p>
                )}
                {result && (
                    <>
                        <section className="space-y-2">
                            <h3 className="font-medium">Project Health</h3>
                            <span
                                className={cn(
                                    "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                                    healthStyles[result.analysis.health],
                                )}
                            >
                                {projectHealthLabels[result.analysis.health]}
                            </span>
                            <p className="text-xs text-muted-foreground">
                                AI assessment; advisory. Based on a snapshot
                                from{" "}
                                <time dateTime={result.generatedAt}>
                                    {new Date(
                                        result.generatedAt,
                                    ).toLocaleString()}
                                </time>
                                . Regenerate after changes.
                            </p>
                        </section>
                        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {[
                                ["Total Tasks", result.stats.totalTasks],
                                [
                                    "Completed Tasks",
                                    result.stats.completedTasks,
                                ],
                                [
                                    "Completion",
                                    `${result.stats.completionPercentage}%`,
                                ],
                                ["Overdue Tasks", result.stats.overdueTasks],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-lg border border-border bg-background p-3"
                                >
                                    <dt className="text-xs text-muted-foreground">
                                        {label}
                                    </dt>
                                    <dd className="mt-1 text-xl font-semibold tabular-nums">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        <p className="text-xs text-muted-foreground">
                            {result.stats.upcomingDeadlines} upcoming deadlines
                            ({result.referenceDate} through{" "}
                            {result.upcomingThrough}),{" "}
                            {result.stats.highPriorityTasks} high / critical
                            priority tasks remaining. Deadlines are evaluated as
                            calendar dates; due today is not overdue.
                        </p>
                        <section className="space-y-2">
                            <h3 className="font-medium">AI Summary</h3>
                            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                                {result.analysis.summary}
                            </p>
                        </section>
                        <section className="space-y-2">
                            <h3 className="font-medium">Key Highlights</h3>
                            {result.analysis.highlights.length ? (
                                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                                    {result.analysis.highlights.map(
                                        (highlight, index) => (
                                            <li key={index}>{highlight}</li>
                                        ),
                                    )}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">
                                    No highlights identified.
                                </p>
                            )}
                        </section>
                        <section className="space-y-3">
                            <h3 className="font-medium">
                                Risks &amp; Bottlenecks
                            </h3>
                            {result.analysis.risks.length ? (
                                <ul className="space-y-3">
                                    {result.analysis.risks.map(
                                        (risk, index) => (
                                            <li
                                                key={index}
                                                className="rounded-md border border-border p-3"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="font-medium">
                                                        {risk.title}
                                                    </h4>
                                                    <span className="rounded border border-border px-1.5 py-0.5 text-xs capitalize text-muted-foreground">
                                                        {risk.severity} severity
                                                    </span>
                                                </div>
                                                <p className="mt-1 leading-relaxed text-muted-foreground">
                                                    {risk.description}
                                                </p>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">
                                    No specific risks identified in this
                                    snapshot.
                                </p>
                            )}
                        </section>
                        <section className="space-y-2">
                            <h3 className="font-medium">
                                Recommended Next Steps
                            </h3>
                            <ol className="list-decimal space-y-3 pl-5">
                                {result.analysis.recommendations.map(
                                    (recommendation, index) => (
                                        <li key={index}>
                                            <h4 className="font-medium">
                                                {recommendation.title}
                                            </h4>
                                            <p className="mt-1 leading-relaxed text-muted-foreground">
                                                {recommendation.description}
                                            </p>
                                        </li>
                                    ),
                                )}
                            </ol>
                        </section>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

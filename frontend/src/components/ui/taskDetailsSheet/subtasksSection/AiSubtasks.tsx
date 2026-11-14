"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { XIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "../../shadcn/button";
import type { Subtask } from "@/types/types";
import {
    addSuggestedSubtasksAction,
    generateSubtasksAction,
} from "@/data/actions";

interface AiSubtasksProps {
    taskId: number;
    disabled: boolean;
    existingSubtasks: { title: string }[];
    onAdded: (subtasks: Subtask[]) => void;
    onBusyChange: (busy: boolean) => void;
}

export default function AiSubtasks({
    taskId,
    disabled,
    existingSubtasks,
    onAdded,
    onBusyChange,
}: Readonly<AiSubtasksProps>) {
    const [suggestions, setSuggestions] = useState<{ title: string }[] | null>(
        null,
    );
    const [operation, setOperation] = useState<"generate" | "save" | null>(
        null,
    );
    const inFlight = useRef(false);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        };
    }, []);

    const handleGenerate = async () => {
        if (disabled || inFlight.current) {
            return;
        }

        inFlight.current = true;

        setOperation("generate");

        try {
            const result = await generateSubtasksAction(taskId);

            if (!mounted.current) {
                return;
            }

            if (!result.ok || !result.subtasks) {
                toast.error("Error", { description: result.message });

                return;
            }

            const existing = new Set(
                existingSubtasks.map((subtask) =>
                    subtask.title
                        .normalize("NFKC")
                        .trim()
                        .replace(/\s+/gu, " ")
                        .toLowerCase(),
                ),
            );

            const preview = result.subtasks.filter(
                (subtask) =>
                    !existing.has(
                        subtask.title
                            .normalize("NFKC")
                            .trim()
                            .replace(/\s+/gu, " ")
                            .toLowerCase(),
                    ),
            );

            if (!preview.length) {
                toast.error("Error", {
                    description:
                        "These subtasks are already in your checklist.",
                });

                return;
            }

            setSuggestions(preview);
        } catch {
            if (mounted.current) {
                toast.error("Error", {
                    description:
                        "Unable to generate subtasks. Please try again.",
                });
            }
        } finally {
            inFlight.current = false;

            if (mounted.current) {
                setOperation(null);
            }
        }
    };

    const handleSave = async () => {
        if (
            disabled ||
            inFlight.current ||
            !suggestions ||
            !suggestions.length
        ) {
            return;
        }

        inFlight.current = true;

        setOperation("save");
        onBusyChange(true);

        try {
            const existing = new Set(
                existingSubtasks.map((subtask) =>
                    subtask.title
                        .normalize("NFKC")
                        .trim()
                        .replace(/\s+/gu, " ")
                        .toLowerCase(),
                ),
            );

            const accepted = suggestions.filter(
                (subtask) =>
                    !existing.has(
                        subtask.title
                            .normalize("NFKC")
                            .trim()
                            .replace(/\s+/gu, " ")
                            .toLowerCase(),
                    ),
            );

            if (!accepted.length) {
                setSuggestions(null);

                return;
            }

            const result = await addSuggestedSubtasksAction(taskId, accepted);

            if (!mounted.current) {
                return;
            }

            if (!result.ok || !result.subtasks) {
                toast.error("Error", { description: result.message });

                return;
            }

            onAdded(result.subtasks);
            setSuggestions(null);

            toast.success("Success", { description: result.message });
        } catch {
            if (mounted.current) {
                toast.error("Error", {
                    description: "Unable to add subtasks. Please try again.",
                });
            }
        } finally {
            inFlight.current = false;

            onBusyChange(false);

            if (mounted.current) {
                setOperation(null);
            }
        }
    };

    return (
        <div className="mt-3 space-y-3">
            {!suggestions && (
                <div className="space-y-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={disabled || operation !== null}
                        className="bg-control text-control-text hover:bg-control-active"
                    >
                        <Sparkles />
                        {operation === "generate"
                            ? "Generating..."
                            : "Generate with AI"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Uses the saved task title and description.
                    </p>
                </div>
            )}
            {suggestions && (
                <div className="space-y-3 rounded-md border border-border bg-control p-3">
                    <p className="text-sm font-medium text-foreground">
                        Review suggested subtasks
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Remove any you don't need. Add Subtasks saves this list
                        immediately.
                    </p>
                    <ol className="space-y-2">
                        {suggestions.map((subtask, index) => (
                            <li
                                key={subtask.title}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                                <span className="min-w-0 flex-1 break-words">
                                    {index + 1}. {subtask.title}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-6 shrink-0 hover:text-red-400"
                                    disabled={disabled || operation !== null}
                                    onClick={() =>
                                        setSuggestions(
                                            suggestions.filter(
                                                (_, i) => i !== index,
                                            ),
                                        )
                                    }
                                >
                                    <XIcon />
                                </Button>
                            </li>
                        ))}
                    </ol>
                    {!suggestions.length && (
                        <p className="text-sm text-muted-foreground">
                            No suggestions selected.
                        </p>
                    )}
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSuggestions(null)}
                            disabled={disabled || operation !== null}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSave}
                            disabled={
                                disabled ||
                                operation !== null ||
                                !suggestions.length
                            }
                            className="bg-bright-blue text-white hover:bg-blue-600"
                        >
                            {operation === "save"
                                ? "Adding..."
                                : "Add Subtasks"}
                        </Button>
                    </div>
                </div>
            )}
            <span role="status" className="sr-only">
                {operation === "generate" ? "Generating subtasks" : ""}
            </span>
        </div>
    );
}

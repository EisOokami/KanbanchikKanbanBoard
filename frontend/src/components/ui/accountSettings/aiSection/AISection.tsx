"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { InfoIcon } from "@phosphor-icons/react";
import SectionTitle from "../sectionTitle/SectionTitle";
import FieldRow from "../fieldRow/FieldRow";
import { PasswordInput } from "../../shadcn/password-input";
import { Badge } from "../../shadcn/badge";
import { Button } from "../../shadcn/button";
import {
    geminiApiKeySchema,
    readGeminiApiKey,
    removeGeminiApiKey,
    saveGeminiApiKey,
} from "@/libs/geminiApiKey";

export default function AISection() {
    const [hasKey, setHasKey] = useState<boolean>(false);
    const [value, setValue] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasKey(readGeminiApiKey() !== null);
    }, []);

    const handleSave = () => {
        const parsed = geminiApiKeySchema.safeParse(value);

        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Invalid API key");

            return;
        }

        if (!saveGeminiApiKey(parsed.data)) {
            toast.error("Error", {
                description:
                    "Your browser does not allow saving data for this site",
            });

            return;
        }

        setValue("");
        setError(null);
        setHasKey(true);

        toast.success("Success", {
            description: "Your Gemini API key has been saved in this browser",
        });
    };

    const handleRemove = () => {
        removeGeminiApiKey();
        setHasKey(false);

        toast.success("Success", {
            description: "Your Gemini API key has been removed",
        });
    };

    return (
        <div className="mb-10 space-y-5">
            <div>
                <h2 className="text-lg font-bold">AI</h2>
                <p className="mt-0.5 text-sm text-gray-400">
                    Subtask suggestions and project summaries use your own
                    Google Gemini API key
                </p>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <SectionTitle>Gemini API key</SectionTitle>
                    <Badge variant={hasKey ? "default" : "secondary"}>
                        {hasKey ? "Saved in this browser" : "Not set"}
                    </Badge>
                </div>
                <div className="overflow-hidden rounded-md border border-border bg-background px-5">
                    <FieldRow
                        label={hasKey ? "Replace key" : "API key"}
                        hint="Create a key in Google AI Studio"
                    >
                        <form
                            className="space-y-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleSave();
                            }}
                        >
                            <PasswordInput
                                name="gemini-api-key"
                                placeholder="Paste your Gemini API key"
                                autoComplete="off"
                                spellCheck={false}
                                value={value}
                                onChange={(event) => {
                                    setValue(event.target.value);
                                    setError(null);
                                }}
                                className="h-8 bg-control pr-9 text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                            />
                            {error && (
                                <p className="text-xs text-rose-500">{error}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!value.trim()}
                                >
                                    Save key
                                </Button>
                                {hasKey && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={handleRemove}
                                    >
                                        Remove key
                                    </Button>
                                )}
                            </div>
                        </form>
                    </FieldRow>
                </div>
            </div>
            <div className="flex gap-2 rounded-md border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground">
                <InfoIcon
                    weight="duotone"
                    className="mt-0.5 size-4 shrink-0 text-bright-blue"
                />
                <div className="space-y-2">
                    <p>
                        The key is stored only in this browser. It is sent over
                        an encrypted connection with each AI request, solely to
                        make that request to Google, and is not saved on our
                        servers or written to logs. You can remove it at any
                        time.
                    </p>
                    <p>
                        With your key you use the Gemini API under your own
                        agreement with Google, including the data-use rules of
                        your plan. The task or project data described in the{" "}
                        <Link
                            href="/privacy#funkcje-ai"
                            className="text-foreground underline underline-offset-4"
                        >
                            Privacy Policy
                        </Link>{" "}
                        is sent to Google. Do not use AI on tasks containing
                        personal or confidential data.
                    </p>
                    <p>
                        Get a key at{" "}
                        <a
                            href="https://aistudio.google.com/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground underline underline-offset-4"
                        >
                            aistudio.google.com/apikey
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}

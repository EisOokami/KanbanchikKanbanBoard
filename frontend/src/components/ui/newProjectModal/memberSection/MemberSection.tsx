"use client";

import { BaseAction } from "@/types/actions";
import { NewProjectFormData } from "@/types/types";
import { EnvelopeIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { Input } from "../../shadcn/input";
import { cn } from "@/libs/utils";
import { Button } from "../../shadcn/button";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { useState } from "react";

interface StatusSectionProps {
    formData: NewProjectFormData;
    formState: BaseAction | undefined;
    isPending: boolean;
    onFormDataChange: (formData: NewProjectFormData) => void;
}

export default function MemberSection({
    formData,
    formState,
    isPending,
    onFormDataChange,
}: Readonly<StatusSectionProps>) {
    const [emailInput, setEmailInput] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");

    const inviteMember = () => {
        const email = emailInput.trim();

        if (!email) {
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Enter a valid email address");

            return;
        }

        if (formData.members.find((member) => member === email)) {
            setEmailError("Already added");

            return;
        }

        onFormDataChange({
            ...formData,
            members: [...formData.members, email],
        });
        setEmailInput("");
        setEmailError("");
    };

    const handleRemoveMember = (member: string) => {
        onFormDataChange({
            ...formData,
            members: formData.members.filter((value) => value !== member),
        });
    };

    return (
        <div className="space-y-1">
            <label className="font-semibold" htmlFor="members">
                Members
            </label>
            <div className="space-y-3">
                {formData.members.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.members.map((member) => (
                            <div
                                key={member}
                                className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5"
                            >
                                <div className="min-w-0">
                                    <p className="mt-0.5 max-w-[140px] truncate text-[10px] text-muted-foreground">
                                        {member}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveMember(member)}
                                    className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
                                    disabled={isPending}
                                >
                                    <XIcon
                                        weight="duotone"
                                        className="size-4"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <EnvelopeIcon
                            weight="duotone"
                            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            id="members"
                            name="email"
                            type="email"
                            placeholder="Invite by email..."
                            value={emailInput}
                            defaultValue={
                                formState?.formData?.get("email")?.toString() ??
                                undefined
                            }
                            onChange={(e) => {
                                setEmailInput(e.target.value);
                                setEmailError("");
                            }}
                            onKeyDown={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), inviteMember())
                            }
                            className={cn(
                                "h-9 bg-control pl-8 text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue",
                                emailError || formState?.zodErrors?.members
                                    ? "border-red-500"
                                    : "",
                            )}
                            disabled={isPending}
                        />
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        onClick={inviteMember}
                        className="h-9 gap-1.5 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                        disabled={isPending}
                    >
                        <PlusIcon weight="duotone" className="size-4" /> Invite
                    </Button>
                </div>
                <div>
                    <ZodErrors error={formState?.zodErrors?.members} />
                </div>
            </div>
        </div>
    );
}

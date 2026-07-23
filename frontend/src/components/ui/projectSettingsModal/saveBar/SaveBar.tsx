"use client";

import { cn } from "@/libs/utils";
import { BaseAction } from "@/types/actions";
import { CheckIcon, InfoIcon } from "@phosphor-icons/react";
import { DetailsErrors } from "../../detailsErrors/DetailsErrors";
import { Button } from "../../shadcn/button";

interface SaveBarProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    hasChanges: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SaveBar({
    formState,
    isPending,
    hasChanges,
    onOpenChange,
}: Readonly<SaveBarProps>) {
    return (
        <div
            className={cn(
                "flex border-t border-border px-6 py-3.5",
                formState?.status === "error" ||
                    formState?.status === "success" ||
                    (formState?.details && formState?.details?.length)
                    ? "justify-between gap-3"
                    : "justify-end",
            )}
        >
            <div>
                {formState?.status !== "success" && formState?.message && (
                    <div
                        className={cn(
                            "flex items-center gap-2 rounded-md text-sm",
                            formState?.status === "error"
                                ? "text-red-500"
                                : "text-yellow-300",
                        )}
                    >
                        <InfoIcon
                            weight="duotone"
                            className="size-4 shrink-0"
                        />
                        <p>{formState?.message}</p>
                    </div>
                )}
                {formState?.details &&
                    formState?.details?.length &&
                    formState.details.map((error) => (
                        <DetailsErrors
                            key={error.message + error.field}
                            error={error}
                        />
                    ))}
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="h-9 rounded-md bg-control px-4 text-sm text-control-text hover:bg-control-active"
                    disabled={isPending}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isPending || !hasChanges}
                    className={cn(
                        "h-9 rounded-md bg-bright-blue text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40",
                        !hasChanges && "cursor-not-allowed opacity-50",
                    )}
                >
                    <CheckIcon weight="duotone" size={14} />
                    Save changes
                </Button>
            </div>
        </div>
    );
}

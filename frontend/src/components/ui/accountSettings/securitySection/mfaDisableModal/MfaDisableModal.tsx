"use client";

import { Button } from "@/components/ui/shadcn/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { PasswordInput } from "@/components/ui/shadcn/password-input";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";
import { mfaDisableAction } from "@/data/actions";
import { cn } from "@/libs/utils";
import { BaseAction } from "@/types/actions";
import { InfoIcon, XIcon } from "@phosphor-icons/react";
import { useActionState, useEffect } from "react";

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

interface MfaDisableModal {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDisabled: () => void;
}

export default function MfaDisableModal({
    open,
    onOpenChange,
    onDisabled,
}: Readonly<MfaDisableModal>) {
    const [formState, formAction, isPending] = useActionState(
        mfaDisableAction,
        INITIAL_STATE,
    );

    useEffect(() => {
        if (formState?.status === "success") {
            onDisabled();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md border-border bg-background-secondary [&>button:first-of-type]:hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="mb-0.5">
                                Disable two-factor authentication
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Confirm your password to disable 2FA. Your
                                authenticator code is optional if your device is
                                unavailable.
                            </DialogDescription>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="size-6 text-control-text hover:bg-control-active [&_svg]:size-4"
                            disabled={isPending}
                        >
                            <XIcon weight="duotone" />
                        </Button>
                    </div>
                </DialogHeader>
                <form action={formAction} className="space-y-3">
                    <div className="space-y-1">
                        <PasswordInput
                            name="password"
                            placeholder="Password"
                            className="h-9 bg-control text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                            disabled={isPending}
                        />
                        <ZodErrors error={formState?.zodErrors?.password} />
                    </div>
                    <div className="space-y-1">
                        <input
                            name="token"
                            placeholder="6-digit code (optional)"
                            maxLength={6}
                            className="flex h-9 w-full rounded-md border border-border bg-control px-3 text-sm placeholder:text-control-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bright-blue"
                            disabled={isPending}
                        />
                    </div>
                    {formState?.message && (
                        <div
                            className={cn(
                                "flex items-center gap-2 text-sm",
                                formState?.status === "error"
                                    ? "text-red-500"
                                    : "text-emerald-500",
                            )}
                        >
                            <InfoIcon
                                weight="duotone"
                                className="size-4 shrink-0"
                            />
                            <p>{formState.message}</p>
                        </div>
                    )}
                    <Button
                        type="submit"
                        variant="destructive"
                        className="w-full"
                        disabled={isPending}
                    >
                        {isPending ? "Disabling..." : "Disable 2FA"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

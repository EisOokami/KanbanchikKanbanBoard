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
import { mfaRegenerateBackupCodesAction } from "@/data/actions";
import { BaseAction } from "@/types/actions";
import { CheckIcon, CopyIcon, InfoIcon, XIcon } from "@phosphor-icons/react";
import { useActionState, useState } from "react";

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
    data: null,
};

interface MfaBackupCodesModal {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function MfaBackupCodesModal({
    open,
    onOpenChange,
}: Readonly<MfaBackupCodesModal>) {
    const [formState, formAction, isPending] = useActionState(
        mfaRegenerateBackupCodesAction,
        INITIAL_STATE,
    );
    const [copiedAll, setCopiedAll] = useState<boolean>(false);

    const handleCopyAll = async () => {
        if (!formState || !formState.data.backupCodes) {
            return;
        }

        await navigator.clipboard.writeText(
            formState.data.backupCodes.join("\n"),
        );
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border bg-background-secondary sm:max-w-md [&>button:first-of-type]:hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="mb-0.5">
                                Backup codes
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Generating new codes invalidates any codes you
                                saved previously. Each code can be used once.
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
                {!formState ||
                !formState.data ||
                !formState.data.backupCodes ? (
                    <form action={formAction} className="space-y-3">
                        <div className="space-y-1">
                            <PasswordInput
                                name="password"
                                placeholder="Confirm your password"
                                className="h-9 bg-control text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                                disabled={isPending}
                            />
                            <ZodErrors error={formState?.zodErrors?.password} />
                        </div>
                        {formState?.message &&
                            formState?.status === "error" && (
                                <div className="flex items-center gap-2 text-sm text-red-500">
                                    <InfoIcon
                                        weight="duotone"
                                        className="size-4 shrink-0"
                                    />
                                    <p>{formState.message}</p>
                                </div>
                            )}
                        <Button
                            type="submit"
                            className="w-full bg-bright-blue text-white hover:bg-blue-600"
                            disabled={isPending}
                        >
                            {isPending
                                ? "Generating..."
                                : "Generate backup codes"}
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-control p-3 font-mono text-sm">
                            {formState.data.backupCodes.map((code: string) => (
                                <span
                                    key={code}
                                    className="text-gray-700 dark:text-gray-200"
                                >
                                    {code}
                                </span>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-border bg-control hover:bg-control-active"
                            onClick={handleCopyAll}
                        >
                            {copiedAll ? (
                                <>
                                    <CheckIcon
                                        weight="duotone"
                                        className="mr-2 size-4 text-emerald-500"
                                    />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <CopyIcon
                                        weight="duotone"
                                        className="mr-2 size-4"
                                    />
                                    Copy all codes
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-gray-400">
                            Save these somewhere safe - they won&apos;t be shown
                            again.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

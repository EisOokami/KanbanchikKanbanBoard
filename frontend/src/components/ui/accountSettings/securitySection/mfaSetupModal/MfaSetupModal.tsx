"use client";

import { Button } from "@/components/ui/shadcn/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/shadcn/input-otp";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";
import { mfaEnableAction, mfaSetupAction } from "@/data/actions";
import { BaseAction } from "@/types/actions";
import {
    CheckIcon,
    CopyIcon,
    InfoIcon,
    WarningCircleIcon,
    XIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
    data: null,
};

interface MfaSetupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEnabled: () => void;
}

export default function MfaSetupModal({
    open,
    onOpenChange,
    onEnabled,
}: Readonly<MfaSetupModalProps>) {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [manualEntryKey, setManualEntryKey] = useState<string | null>(null);
    const [isLoadingQr, setIsLoadingQr] = useState<boolean>(false);
    const [setupError, setSetupError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [formState, formAction, isPending] = useActionState(
        mfaEnableAction,
        INITIAL_STATE,
    );
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (!open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setQrCode(null);
            setManualEntryKey(null);
            setSetupError(null);

            return;
        }

        setIsLoadingQr(true);

        mfaSetupAction()
            .then((result) => {
                if (!result) {
                    setSetupError("Failed to start MFA setup");

                    return;
                }

                if (result.status === "success") {
                    setQrCode(result.data.qrCode ?? null);
                    setManualEntryKey(result.data.manualEntryKey ?? null);
                } else {
                    setSetupError(
                        result.message ?? "Failed to start MFA setup",
                    );
                }
            })
            .finally(() => setIsLoadingQr(false));
    }, [open]);

    useEffect(() => {
        if (formState?.status === "success") {
            onEnabled();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState]);

    const handleCopy = async () => {
        if (!manualEntryKey) return;

        await navigator.clipboard.writeText(manualEntryKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOtpComplete = () => {
        formRef.current?.requestSubmit();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border bg-background-secondary sm:max-w-md [&>button:first-of-type]:hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="mb-0.5">
                                Set up two-factor authentication
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Scan the QR code with your authenticator app,
                                then enter the 6-digit code to confirm.
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
                {isLoadingQr && (
                    <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                        Generating QR code...
                    </div>
                )}
                {setupError && (
                    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950">
                        <WarningCircleIcon
                            weight="duotone"
                            className="size-4"
                        />
                        <p>{setupError}</p>
                    </div>
                )}
                {qrCode && (
                    <div className="space-y-4">
                        <div className="flex justify-center rounded-md border border-border bg-white p-4">
                            <Image
                                src={qrCode}
                                alt="MFA QR code"
                                width={160}
                                height={160}
                            />
                        </div>
                        {manualEntryKey && (
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400">
                                    Or enter this code manually
                                </p>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="flex w-full items-center justify-between rounded-md border border-border bg-control px-3 py-2 text-left font-mono text-xs text-gray-700 hover:bg-control-active dark:text-gray-200"
                                    disabled={isPending}
                                >
                                    <span className="truncate">
                                        {manualEntryKey}
                                    </span>
                                    {copied ? (
                                        <CheckIcon
                                            weight="duotone"
                                            className="size-3.5 shrink-0 text-emerald-500"
                                        />
                                    ) : (
                                        <CopyIcon
                                            weight="duotone"
                                            className="size-3.5 shrink-0 text-gray-400"
                                        />
                                    )}
                                </button>
                            </div>
                        )}
                        <form
                            ref={formRef}
                            action={formAction}
                            className="space-y-3"
                        >
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    name="token"
                                    autoFocus
                                    onComplete={handleOtpComplete}
                                    disabled={isPending}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot
                                            index={0}
                                            className="border-border bg-control"
                                        />
                                        <InputOTPSlot
                                            index={1}
                                            className="border-border bg-control"
                                        />
                                        <InputOTPSlot
                                            index={2}
                                            className="border-border bg-control"
                                        />
                                        <InputOTPSlot
                                            index={3}
                                            className="border-border bg-control"
                                        />
                                        <InputOTPSlot
                                            index={4}
                                            className="border-border bg-control"
                                        />
                                        <InputOTPSlot
                                            index={5}
                                            className="border-border bg-control"
                                        />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <ZodErrors error={formState?.zodErrors?.token} />
                            {formState?.message &&
                                formState?.status === "error" && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-red-500">
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
                                    ? "Verifying..."
                                    : "Confirm and enable"}
                            </Button>
                        </form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

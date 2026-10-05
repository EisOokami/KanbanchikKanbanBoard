"use client";

import { InfoIcon, TrashSimpleIcon, WarningIcon } from "@phosphor-icons/react";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../../shadcn/alert-dialog";
import { Button } from "../../shadcn/button";
import { User } from "@/types/types";
import { useActionState, useEffect, useRef, useState } from "react";
import { deleteAccountAction } from "@/data/actions";
import { DeleteAccountAction } from "@/types/actions";
import { cn, formatBackupCode } from "@/libs/utils";
import { DetailsErrors } from "../../detailsErrors/DetailsErrors";
import { Label } from "../../shadcn/label";
import { PasswordInput } from "../../shadcn/password-input";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../shadcn/input-otp";
import { Input } from "../../shadcn/input";

interface DangerZoneProps {
    userData: User;
}

const INITIAL_STATE: DeleteAccountAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
    data: null,
};

export default function DangerZone({ userData }: Readonly<DangerZoneProps>) {
    const [password, setPassword] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [cooldown, setCooldown] = useState<number>(60);
    const [intent, setIntent] = useState<"verify" | "resend">("verify");
    const [backupCode, setBackupCode] = useState<string>("");
    const [useBackupCode, setUseBackupCode] = useState<boolean>(false);
    const [formState, formAction, isPending] = useActionState(
        deleteAccountAction,
        INITIAL_STATE,
    );
    const formRef = useRef<HTMLFormElement>(null);

    const step = formState?.data?.tempToken ? "code" : "password";
    const isResending = isPending && intent === "resend";
    const requiresRestart = formState?.data?.requiresRestart === true;

    useEffect(() => {
        if (formState?.status === "error") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOpen(true);
        }
    }, [formState]);

    useEffect(() => {
        if (step !== "code" || cooldown <= 0) {
            return;
        }

        const timer = setTimeout(
            () => setCooldown((prevState) => prevState - 1),
            1000,
        );

        return () => clearTimeout(timer);
    }, [step, cooldown]);

    useEffect(() => {
        setCode("");
        setBackupCode("");
        setUseBackupCode(false);
        setIntent("verify");

        if (formState?.data?.sentAt) {
            setCooldown(60);
        } else if (formState?.data?.retryAfter) {
            setCooldown(formState?.data.retryAfter);
        }
    }, [formState]);

    const resetFlow = () => {
        setOpen(false);
        setPassword("");
        setCode("");
    };

    return (
        <form
            ref={formRef}
            id="delete-account-form"
            action={formAction}
            className="mb-10 border-t border-border pt-5"
        >
            <p className="mb-4 font-semibold">Danger zone</p>
            <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        Delete account
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Permanently delete your account and all data. This
                        cannot be undone.
                    </p>
                </div>
                <AlertDialog
                    open={open}
                    onOpenChange={(nextOpen) => {
                        if (isPending) return;

                        if (!nextOpen) {
                            resetFlow();
                            return;
                        }

                        setOpen(true);
                    }}
                >
                    <AlertDialogTrigger asChild>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="gap-1.5"
                            disabled={isPending}
                        >
                            <TrashSimpleIcon
                                weight="duotone"
                                className="size-4"
                            />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-border">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <WarningIcon
                                    weight="duotone"
                                    className="size-5 text-red-500"
                                />
                                {step === "password"
                                    ? "Delete your account?"
                                    : "Confirm deletion"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {step === "password"
                                    ? "This will permanently delete your account, all your projects, tasks, and data. This action cannot be undone."
                                    : formState?.data?.requiresMfa
                                      ? "Enter the 6-digit code from your authenticator app."
                                      : "We sent a 6-digit code to your email."}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        {step === "password" ? (
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="delete-account-password"
                                    className="text-sm"
                                >
                                    Enter your password to confirm
                                </Label>
                                <PasswordInput
                                    id="delete-account-password"
                                    name="password"
                                    form="delete-account-form"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();

                                            if (
                                                !isPending &&
                                                password.length > 0
                                            ) {
                                                formRef.current?.requestSubmit();
                                            }
                                        }
                                    }}
                                    placeholder="Your password"
                                    className="bg-control placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                                    disabled={isPending}
                                />
                                <ZodErrors
                                    error={formState?.zodErrors?.password}
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <input
                                    type="hidden"
                                    name="tempToken"
                                    form="delete-account-form"
                                    value={formState?.data?.tempToken ?? ""}
                                />
                                <input
                                    type="hidden"
                                    name="method"
                                    form="delete-account-form"
                                    value={
                                        formState?.data?.requiresMfa
                                            ? "totp"
                                            : "email"
                                    }
                                />
                                {formState?.data?.requiresMfa &&
                                useBackupCode ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="delete-backup-code">
                                            Backup code
                                        </Label>
                                        <Input
                                            id="delete-backup-code"
                                            name="code"
                                            form="delete-account-form"
                                            type="text"
                                            placeholder="XXXX-XXXX"
                                            autoComplete="one-time-code"
                                            autoFocus
                                            value={backupCode}
                                            onChange={(e) =>
                                                setBackupCode(
                                                    formatBackupCode(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            maxLength={9}
                                            disabled={
                                                isPending || requiresRestart
                                            }
                                            className="bg-control text-center font-mono uppercase tracking-widest placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex justify-center">
                                        <InputOTP
                                            maxLength={6}
                                            name="code"
                                            form="delete-account-form"
                                            value={code}
                                            onChange={setCode}
                                            autoFocus
                                            disabled={
                                                isPending || requiresRestart
                                            }
                                            onComplete={() =>
                                                formRef.current?.requestSubmit()
                                            }
                                        >
                                            <InputOTPGroup>
                                                {[0, 1, 2, 3, 4, 5].map(
                                                    (index) => (
                                                        <InputOTPSlot
                                                            key={index}
                                                            index={index}
                                                            className="border-border bg-control"
                                                        />
                                                    ),
                                                )}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                )}
                                <ZodErrors error={formState?.zodErrors?.code} />
                                {formState?.data?.requiresMfa && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUseBackupCode(
                                                (prevState) => !prevState,
                                            );
                                            setBackupCode("");
                                            setCode("");
                                        }}
                                        className="text-center text-sm text-muted-foreground underline"
                                    >
                                        {useBackupCode
                                            ? "Use authenticator code instead"
                                            : "Use a backup code instead"}
                                    </button>
                                )}
                                {formState?.data?.requiresEmailCode && (
                                    <Button
                                        type="submit"
                                        name="intent"
                                        form="delete-account-form"
                                        value="resend"
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-border bg-control text-foreground hover:bg-control-active"
                                        disabled={
                                            isPending ||
                                            requiresRestart ||
                                            cooldown > 0
                                        }
                                        onClick={() => setIntent("resend")}
                                    >
                                        {isResending
                                            ? "Sending..."
                                            : cooldown > 0
                                              ? `Resend code in ${cooldown}s`
                                              : "Resend code"}
                                    </Button>
                                )}
                            </div>
                        )}
                        {formState?.message && (
                            <div
                                className={cn(
                                    "flex items-center gap-2 rounded-md text-sm",
                                    formState?.status === "error"
                                        ? "text-red-500"
                                        : "text-green-500",
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
                            formState.details.length > 0 &&
                            formState.details.map((error) => (
                                <DetailsErrors
                                    key={error.message + error.field}
                                    error={error}
                                />
                            ))}
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                type="button"
                                className="border-border bg-control text-sm text-control-text hover:bg-control-active"
                                disabled={isPending}
                                onClick={resetFlow}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                type="button"
                                onClick={() => {
                                    setIntent("verify");
                                    formRef.current?.requestSubmit();
                                }}
                                className="bg-red-600 text-sm font-semibold text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                                disabled={
                                    isPending ||
                                    requiresRestart ||
                                    (step === "password"
                                        ? password.length === 0
                                        : useBackupCode
                                          ? backupCode.length === 0
                                          : code.length !== 6)
                                }
                            >
                                {isPending && !isResending
                                    ? step === "password"
                                        ? "Checking..."
                                        : "Deleting..."
                                    : step === "password"
                                      ? "Continue"
                                      : "Yes, delete everything"}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <input type="hidden" name="id" value={userData.id} />
        </form>
    );
}

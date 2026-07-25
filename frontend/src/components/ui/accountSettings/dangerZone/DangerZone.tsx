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
import { BaseAction } from "@/types/actions";
import { cn } from "@/libs/utils";
import { DetailsErrors } from "../../detailsErrors/DetailsErrors";
import { Label } from "../../shadcn/label";
import { PasswordInput } from "../../shadcn/password-input";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface DangerZoneProps {
    userData: User;
}

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

export default function DangerZone({ userData }: Readonly<DangerZoneProps>) {
    const [password, setPassword] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [formState, formAction, isPending] = useActionState(
        deleteAccountAction,
        INITIAL_STATE,
    );
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (formState?.status === "error") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOpen(true);
        }
    }, [formState]);

    return (
        <form
            ref={formRef}
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
                        if (isPending) {
                            return;
                        }

                        setOpen(nextOpen);

                        if (nextOpen) {
                            setPassword("");
                        }
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
                                Delete your account?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete your account, all
                                your projects, tasks, and data. This action
                                cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
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
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();

                                        if (
                                            !isPending ||
                                            password.length === 0
                                        ) {
                                            formRef.current?.requestSubmit();
                                        }
                                    }
                                }}
                                placeholder="Your password"
                                className="bg-control placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                                disabled={isPending}
                            />
                            <ZodErrors error={formState?.zodErrors?.password} />
                            <ZodErrors error={formState?.zodErrors?.id} />
                            {formState?.message && (
                                <div
                                    className={cn(
                                        "flex items-center gap-2 rounded-md text-sm",
                                        formState?.status === "error"
                                            ? "text-red-500"
                                            : formState?.status === "success"
                                              ? "text-green-500"
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
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                type="button"
                                className="border-border bg-control text-sm text-control-text hover:bg-control-active"
                                disabled={isPending}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                type="button"
                                onClick={() => formRef.current?.requestSubmit()}
                                className="bg-red-600 text-sm font-semibold text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                                disabled={isPending || password.length === 0}
                            >
                                {isPending
                                    ? "Deleting..."
                                    : "Yes, delete everything"}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <input type="hidden" name="id" value={userData.id} />
            <input type="hidden" name="password" value={password} />
        </form>
    );
}

"use client";

import { InfoIcon, TrashSimpleIcon, WarningIcon } from "@phosphor-icons/react";
import {
    AlertDialog,
    AlertDialogAction,
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
import { useActionState, useRef } from "react";
import { deleteAccountAction } from "@/data/actions";
import { BaseAction } from "@/types/actions";
import { cn } from "@/libs/utils";

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
    const formRef = useRef<HTMLFormElement>(null);
    const [formState, formAction, isPending] = useActionState(
        deleteAccountAction,
        INITIAL_STATE,
    );

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
                <AlertDialog>
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
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                type="button"
                                className="text-sm"
                                disabled={isPending}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                type="button"
                                onClick={() => formRef.current?.requestSubmit()}
                                className="bg-red-600 text-sm font-semibold text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                                disabled={isPending}
                            >
                                Yes, delete everything
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <input type="hidden" name="id" value={userData.id} />
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
                    <InfoIcon weight="duotone" className="size-4" />
                    <p>{formState?.message}</p>
                </div>
            )}
        </form>
    );
}

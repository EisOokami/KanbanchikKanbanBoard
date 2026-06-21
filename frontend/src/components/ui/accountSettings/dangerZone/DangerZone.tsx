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
        <form ref={formRef} action={formAction} className="mb-10 border-t pt-5">
            <p className="mb-4 font-semibold">Danger zone</p>
            <div
                className="flex items-center justify-between rounded-md border p-4"
                style={{ background: "#FEF0EF", border: "1px solid #FACACB" }}
            >
                <div>
                    <p
                        className="text-sm font-semibold"
                        style={{ color: "#D93025" }}
                    >
                        Delete account
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                        Permanently delete your account and all data. This
                        cannot be undone.
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 shrink-0 gap-1.5 rounded-md px-3 text-xs font-medium"
                            style={{
                                border: "1px solid #FACACB",
                                color: "#D93025",
                                background: "#FFF",
                            }}
                            disabled={isPending}
                        >
                            <TrashSimpleIcon
                                weight="duotone"
                                className="size-4"
                            />{" "}
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <WarningIcon
                                    weight="duotone"
                                    className="size-5 text-rose-500"
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
                                className="rounded-md text-sm"
                                disabled={isPending}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                type="button"
                                onClick={() => formRef.current?.requestSubmit()}
                                className="rounded-md bg-red-500 text-sm font-semibold text-white hover:bg-red-600"
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

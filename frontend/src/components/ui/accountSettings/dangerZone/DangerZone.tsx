"use client";

import { TrashSimpleIcon, WarningIcon } from "@phosphor-icons/react";
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

export default function DangerZone() {
    return (
        <div className="mb-10 border-t pt-5">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Danger zone
            </p>
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
                            variant="outline"
                            size="sm"
                            className="h-8 shrink-0 gap-1.5 rounded-md px-3 text-xs font-medium"
                            style={{
                                border: "1px solid #FACACB",
                                color: "#D93025",
                                background: "#FFF",
                            }}
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
                            <AlertDialogCancel className="rounded-md text-sm">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction className="rounded-md bg-red-500 text-sm font-semibold text-white hover:bg-red-600">
                                Yes, delete everything
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

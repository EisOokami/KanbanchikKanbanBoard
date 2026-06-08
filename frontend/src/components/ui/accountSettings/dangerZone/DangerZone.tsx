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
        <div className="mt-8 border-t pt-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                Danger zone
            </p>
            <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50/40 p-4">
                <div>
                    <p className="text-sm font-bold text-rose-700">
                        Delete account
                    </p>
                    <p className="mt-0.5 text-xs text-rose-500">
                        This action is permanent and cannot be undone.
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1.5 border-rose-300 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-400"
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
                            <AlertDialogCancel className="text-sm">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction className="bg-rose-600 text-sm hover:bg-rose-700">
                                Yes, delete everything
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

"use client";

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
import { ArchiveIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { deleteProjectAction } from "@/data/actions";
import { toast } from "sonner";
import { NavSection } from "@/types/types";

interface DangerSectionProps {
    name: string;
    slug: string;
    isPending: boolean;
    onSectionChange: (section: NavSection) => void;
    onOpenChange: (open: boolean) => void;
}

export default function DangerSection({
    name,
    slug,
    isPending,
    onSectionChange,
    onOpenChange,
}: Readonly<DangerSectionProps>) {
    const handleDeleteProject = async () => {
        const result = await deleteProjectAction(slug);

        if (result && result.ok) {
            toast.success("Success", {
                description: `${name} has been deleted`,
            });

            onOpenChange(false);
        }

        if (result && !result.ok) {
            toast.success("Error", {
                description: result.message,
            });
        }
    };

    return (
        <div className="space-y-1">
            <h3 className="font-semibold">Danger Zone</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                    <div>
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                            Archive project
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Hide this project from the board. You can restore it
                            anytime.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSectionChange("general")}
                        disabled={isPending}
                        className="h-8 shrink-0 rounded-md border-amber-200 bg-background px-3 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-background dark:text-amber-300 dark:hover:bg-amber-950"
                    >
                        <ArchiveIcon weight="duotone" size={13} />
                        Archive
                    </Button>
                </div>
                <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                    <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                            Delete project
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Permanently delete this project and all its tasks.
                            This cannot be undone.
                        </p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isPending}
                                className="h-8 shrink-0 rounded-md border-red-200 bg-background px-3 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-background dark:text-red-300 dark:hover:bg-red-950"
                            >
                                <TrashSimpleIcon weight="duotone" size={13} />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-border">
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Delete &quot;{name}&quot;?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the project,
                                    all tasks, and all related data. This action
                                    cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel
                                    className="rounded-md"
                                    disabled={isPending}
                                >
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteProject}
                                    disabled={isPending}
                                    className="rounded-md bg-red-600 font-semibold text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                                >
                                    Delete project
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}

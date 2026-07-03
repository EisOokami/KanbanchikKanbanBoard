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
                <div
                    className="flex items-center justify-between rounded-md border p-4"
                    style={{
                        background: "#FEF4EC",
                        border: "1px solid #FCD9B5",
                    }}
                >
                    <div>
                        <p
                            className="text-sm font-semibold"
                            style={{ color: "#C9620A" }}
                        >
                            Archive project
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Hide this project from the board. You can restore it
                            anytime.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            onSectionChange("general");
                        }}
                        className="h-8 shrink-0 rounded-md px-3 text-xs font-medium"
                        style={{
                            border: "1px solid #FCD9B5",
                            color: "#C9620A",
                            background: "#FFF",
                        }}
                        disabled={isPending}
                    >
                        <ArchiveIcon weight="duotone" size={13} />
                        Archive
                    </Button>
                </div>
                <div
                    className="flex items-center justify-between rounded-md border p-4"
                    style={{
                        background: "#FEF0EF",
                        border: "1px solid #FACACB",
                    }}
                >
                    <div>
                        <p
                            className="text-sm font-semibold"
                            style={{ color: "#D93025" }}
                        >
                            Delete project
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Permanently delete this project and all its tasks.
                            This cannot be undone.
                        </p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 shrink-0 rounded-md px-3 text-xs font-medium"
                                style={{
                                    border: "1px solid #FACACB",
                                    color: "#D93025",
                                    background: "#FFF",
                                }}
                                disabled={isPending}
                            >
                                <TrashSimpleIcon weight="duotone" size={13} />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Delete &quot;{name}
                                    &quot;?
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
                                    className="rounded-md bg-red-500 font-semibold text-white hover:bg-red-600"
                                    onClick={handleDeleteProject}
                                    disabled={isPending}
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

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
import {
    ArchiveIcon,
    CrownIcon,
    TrashSimpleIcon,
    WarningIcon,
} from "@phosphor-icons/react";
import { deleteProjectAction, transferOwnershipAction } from "@/data/actions";
import { toast } from "sonner";
import { NavSection, User } from "@/types/types";
import { useState, useTransition } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../shadcn/select";
import { getInitials } from "@/libs/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";

interface DangerSectionProps {
    name: string;
    slug: string;
    members: Omit<User, "email">[];
    isPending: boolean;
    onSectionChange: (section: NavSection) => void;
    onOpenChange: (open: boolean) => void;
}

export default function DangerSection({
    name,
    slug,
    members,
    isPending,
    onSectionChange,
    onOpenChange,
}: Readonly<DangerSectionProps>) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [isTransferPending, startTransferTransition] = useTransition();

    const candidates = members.filter((member) => member.role !== "owner");
    const selectedMember = candidates.find(
        (member) => member.id === selectedId,
    );

    const handleDeleteProject = async () => {
        const result = await deleteProjectAction(slug);

        if (result && result.ok) {
            toast.success("Success", {
                description: `${name} has been deleted`,
            });

            onOpenChange(false);
            setIsSuccess(true);
        }

        if (result && !result.ok) {
            toast.error("Error", {
                description: result.message,
            });
        }
    };

    const handleTransfer = () => {
        if (selectedId === null || !selectedMember) {
            return;
        }

        startTransferTransition(async () => {
            const result = await transferOwnershipAction(slug, selectedId);

            if (result && result.ok) {
                toast.success("Success", {
                    description: `${selectedMember.name} ${selectedMember.surname} is now the project owner`,
                });

                setSelectedId(null);
            }

            if (result && !result.ok) {
                toast.error("Error", {
                    description: result.message,
                });
            }
        });
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
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                    <div>
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                            Transfer ownership
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Choose a member to become the new owner of this
                            project.
                        </p>
                    </div>
                    {!isSuccess && (
                        <div className="mt-3 flex items-center gap-2">
                            <Select
                                value={
                                    selectedId !== null
                                        ? String(selectedId)
                                        : ""
                                }
                                onValueChange={(value) =>
                                    setSelectedId(Number(value))
                                }
                                disabled={
                                    isPending ||
                                    isTransferPending ||
                                    candidates.length === 0 ||
                                    isSuccess
                                }
                            >
                                <SelectTrigger className="h-9 flex-1 bg-control text-sm transition-colors placeholder:text-control-text hover:bg-control-active hover:text-foreground">
                                    <SelectValue
                                        placeholder={
                                            candidates.length === 0
                                                ? "No members available"
                                                : "Select a member"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent className="border-border bg-control">
                                    {candidates.map((member) => (
                                        <SelectItem
                                            key={member.id}
                                            value={String(member.id)}
                                            className="cursor-pointer transition-colors hover:!bg-control-active"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Avatar
                                                    key={member.id}
                                                    className="size-6"
                                                >
                                                    <AvatarImage
                                                        src={member.avatar_url}
                                                        alt={member.name}
                                                    />
                                                    <AvatarFallback
                                                        className="text-xs font-semibold text-white"
                                                        style={{
                                                            background:
                                                                member.color,
                                                        }}
                                                    >
                                                        {getInitials(
                                                            member.name,
                                                            member.surname,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>
                                                    {member.name}{" "}
                                                    {member.surname}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            isPending ||
                                            isTransferPending ||
                                            selectedId === null
                                        }
                                        className="h-9 shrink-0 rounded-md border-amber-200 bg-background px-3 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-background dark:text-amber-300 dark:hover:bg-amber-950"
                                    >
                                        <CrownIcon weight="duotone" size={13} />
                                        Transfer
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="border-border">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                            <WarningIcon
                                                weight="duotone"
                                                className="size-5 text-amber-500"
                                            />
                                            Transfer ownership to{" "}
                                            {selectedMember?.name}?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            You will lose owner privileges for
                                            this project. The new owner will
                                            have to transfer it back if you
                                            change your mind.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel
                                            disabled={isTransferPending}
                                        >
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleTransfer}
                                            disabled={isTransferPending}
                                            className="bg-amber-600 font-semibold text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                                        >
                                            Transfer ownership
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
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
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <WarningIcon
                                        weight="duotone"
                                        className="size-5 text-red-500"
                                    />
                                    Delete &quot;{name}&quot;?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the project,
                                    all tasks, and all related data. This action
                                    cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isPending}>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteProject}
                                    disabled={isPending}
                                    className="bg-red-600 font-semibold text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
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

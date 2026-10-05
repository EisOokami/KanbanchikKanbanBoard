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
    InfoIcon,
    TrashSimpleIcon,
    WarningIcon,
} from "@phosphor-icons/react";
import {
    confirmOwnershipTransferAction,
    deleteProjectAction,
    initiateOwnershipTransferAction,
    resendOwnershipTransferCodeAction,
} from "@/data/actions";
import { toast } from "sonner";
import { NavSection, OwnershipTransferChallenge, User } from "@/types/types";
import { useEffect, useState, useTransition } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../shadcn/select";
import { formatBackupCode, getInitials } from "@/libs/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../shadcn/input-otp";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import { PasswordInput } from "../../shadcn/password-input";

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
    const [transferStep, setTransferStep] = useState<"confirm" | "code">(
        "confirm",
    );
    const [transferDialogOpen, setTransferDialogOpen] =
        useState<boolean>(false);
    const [challenge, setChallenge] =
        useState<OwnershipTransferChallenge | null>(null);
    const [code, setCode] = useState<string>("");
    const [backupCode, setBackupCode] = useState<string>("");
    const [useBackupCode, setUseBackupCode] = useState<boolean>(false);
    const [cooldown, setCooldown] = useState<number>(60);
    const [transferError, setTransferError] = useState<string | null>(null);
    const [requiresRestart, setRequiresRestart] = useState<boolean>(false);
    const [transferPassword, setTransferPassword] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isResendPending, startResendTransition] = useTransition();

    const candidates = members.filter((member) => member.role !== "owner");
    const selectedMember = candidates.find(
        (member) => member.id === selectedId,
    );

    useEffect(() => {
        if (transferStep !== "code" || cooldown <= 0) {
            return;
        }

        const timer = setTimeout(
            () => setCooldown((cooldown) => cooldown - 1),
            1000,
        );

        return () => clearTimeout(timer);
    }, [transferStep, cooldown]);

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

    const handleStartTransfer = () => {
        if (
            selectedId === null ||
            !selectedMember ||
            transferPassword.length === 0
        ) {
            return;
        }

        startTransferTransition(async () => {
            const result = await initiateOwnershipTransferAction(
                slug,
                selectedId,
                transferPassword,
            );

            if (!result.ok) {
                toast.error("Error", { description: result.message });

                return;
            }

            setChallenge(result.challenge);
            setTransferStep("code");
            setCooldown(60);
        });
    };

    const handleConfirmTransfer = (overrideCode?: string) => {
        if (!challenge) {
            return;
        }

        const enteredCode = useBackupCode ? backupCode : (overrideCode ?? code);

        if (enteredCode.length === 0) {
            return;
        }

        startTransferTransition(async () => {
            const result = await confirmOwnershipTransferAction(
                slug,
                challenge.tempToken,
                enteredCode,
            );

            if (!result.ok) {
                setTransferError(result.message);
                setRequiresRestart(result.requiresRestart === true);
                setCode("");
                setBackupCode("");

                return;
            }

            toast.success("Success", {
                description: `${selectedMember?.name} ${selectedMember?.surname} is now the project owner`,
            });

            setSelectedId(null);
            setTransferDialogOpen(false);
            setTransferStep("confirm");
            setChallenge(null);
            setCode("");
            setBackupCode("");
            setUseBackupCode(false);
            setTransferError(null);
            setRequiresRestart(false);
            setTransferPassword("");
            setPasswordError(null);

            window.location.reload();
        });
    };

    const handleResendCode = () => {
        if (!challenge) {
            return;
        }

        startResendTransition(async () => {
            const result = await resendOwnershipTransferCodeAction(
                slug,
                challenge.tempToken,
            );

            if (!result.ok) {
                setTransferError(result.message);

                if (result.retryAfter) {
                    setCooldown(result.retryAfter);
                }

                return;
            }

            setTransferError(null);
            setCooldown(60);
            toast.success("Code sent", { description: result.message });
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
                            <AlertDialog
                                open={transferDialogOpen}
                                onOpenChange={(nextOpen) => {
                                    if (isTransferPending) {
                                        return;
                                    }

                                    if (!nextOpen) {
                                        setTransferDialogOpen(false);
                                        setTransferStep("confirm");
                                        setChallenge(null);
                                        setCode("");
                                        setBackupCode("");
                                        setUseBackupCode(false);
                                        setTransferError(null);
                                        setRequiresRestart(false);
                                        setTransferPassword("");
                                        setPasswordError(null);

                                        return;
                                    }

                                    setTransferDialogOpen(true);
                                }}
                            >
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
                                            {transferStep === "confirm"
                                                ? `Transfer ownership to ${selectedMember?.name}?`
                                                : "Confirm transfer"}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {transferStep === "confirm"
                                                ? "You will lose owner privileges for this project. The new owner will have to transfer it back if you change your mind."
                                                : challenge?.requiresMfa
                                                  ? "Enter the 6-digit code from your authenticator app."
                                                  : "We sent a 6-digit code to your email."}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    {transferStep === "confirm" && (
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="transfer-password"
                                                className="text-sm"
                                            >
                                                Enter your password to confirm
                                            </Label>
                                            <PasswordInput
                                                id="transfer-password"
                                                autoComplete="current-password"
                                                autoFocus
                                                value={transferPassword}
                                                onChange={(e) =>
                                                    setTransferPassword(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();

                                                        if (
                                                            !isTransferPending &&
                                                            transferPassword.length >
                                                                0
                                                        ) {
                                                            handleStartTransfer();
                                                        }
                                                    }
                                                }}
                                                placeholder="Your password"
                                                disabled={isTransferPending}
                                                className="bg-control placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                                            />
                                        </div>
                                    )}
                                    {transferStep === "code" && (
                                        <div className="space-y-3">
                                            {challenge?.requiresMfa &&
                                            useBackupCode ? (
                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor="transfer-backup-code"
                                                        className="text-sm"
                                                    >
                                                        Backup code
                                                    </Label>
                                                    <Input
                                                        id="transfer-backup-code"
                                                        type="text"
                                                        placeholder="XXXX-XXXX"
                                                        autoComplete="one-time-code"
                                                        autoFocus
                                                        value={backupCode}
                                                        onChange={(e) =>
                                                            setBackupCode(
                                                                formatBackupCode(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        maxLength={9}
                                                        disabled={
                                                            isTransferPending ||
                                                            requiresRestart
                                                        }
                                                        className="bg-control text-center font-mono uppercase tracking-widest placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex justify-center">
                                                    <InputOTP
                                                        maxLength={6}
                                                        value={code}
                                                        onChange={setCode}
                                                        autoFocus
                                                        disabled={
                                                            isTransferPending ||
                                                            requiresRestart
                                                        }
                                                        onComplete={(value) =>
                                                            handleConfirmTransfer(
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <InputOTPGroup>
                                                            {[
                                                                0, 1, 2, 3, 4,
                                                                5,
                                                            ].map((index) => (
                                                                <InputOTPSlot
                                                                    key={index}
                                                                    index={
                                                                        index
                                                                    }
                                                                    className="border-border bg-control"
                                                                />
                                                            ))}
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </div>
                                            )}
                                            {challenge?.requiresMfa && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUseBackupCode(
                                                            (prevState) =>
                                                                !prevState,
                                                        );
                                                        setCode("");
                                                        setBackupCode("");
                                                    }}
                                                    className="block w-full text-center text-sm text-muted-foreground underline"
                                                >
                                                    {useBackupCode
                                                        ? "Use authenticator code instead"
                                                        : "Use a backup code instead"}
                                                </button>
                                            )}
                                            {challenge?.requiresEmailCode && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full border-border bg-control text-foreground hover:bg-control-active"
                                                    disabled={
                                                        isResendPending ||
                                                        cooldown > 0 ||
                                                        requiresRestart
                                                    }
                                                    onClick={handleResendCode}
                                                >
                                                    {isResendPending
                                                        ? "Sending..."
                                                        : cooldown > 0
                                                          ? `Resend code in ${cooldown}s`
                                                          : "Resend code"}
                                                </Button>
                                            )}
                                            {transferError && (
                                                <div className="flex items-center gap-2 rounded-md text-sm text-red-500">
                                                    <InfoIcon
                                                        weight="duotone"
                                                        className="size-4 shrink-0"
                                                    />
                                                    <p>{transferError}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <AlertDialogFooter>
                                        <AlertDialogCancel
                                            disabled={isTransferPending}
                                        >
                                            Cancel
                                        </AlertDialogCancel>
                                        {transferStep === "confirm" ? (
                                            <Button
                                                type="button"
                                                onClick={handleStartTransfer}
                                                disabled={
                                                    isTransferPending ||
                                                    transferPassword.length ===
                                                        0
                                                }
                                                className="bg-amber-600 font-semibold text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                                            >
                                                {isTransferPending
                                                    ? "Checking..."
                                                    : "Continue"}
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    handleConfirmTransfer()
                                                }
                                                disabled={
                                                    isTransferPending ||
                                                    requiresRestart ||
                                                    (useBackupCode
                                                        ? backupCode.length ===
                                                          0
                                                        : code.length !== 6)
                                                }
                                                className="bg-amber-600 font-semibold text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                                            >
                                                {isTransferPending
                                                    ? "Transferring..."
                                                    : "Confirm transfer"}
                                            </Button>
                                        )}
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

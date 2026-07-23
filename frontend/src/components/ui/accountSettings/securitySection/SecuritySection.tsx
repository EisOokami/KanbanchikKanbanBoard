"use client";

import { useActionState, useEffect, useState } from "react";
import SectionTitle from "../sectionTitle/SectionTitle";
import FieldRow from "../fieldRow/FieldRow";
import SaveBar from "../saveBar/SaveBar";
import { PasswordInput } from "../../shadcn/password-input";
import { BaseAction } from "@/types/actions";
import { changePasswordAction } from "@/data/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { InfoIcon } from "@phosphor-icons/react";
import { cn } from "@/libs/utils";
import { Badge } from "../../shadcn/badge";
import { Button } from "../../shadcn/button";
import MfaSetupModal from "./mfaSetupModal/MfaSetupModal";
import MfaDisableModal from "./mfaDisableModal/MfaDisableModal";
import MfaBackupCodesModal from "./mfaBackupCodesModal/MfaBackupCodesModal";

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

interface SecuritySectionProps {
    mfaEnabled: boolean;
}

export default function SecuritySection({
    mfaEnabled,
}: Readonly<SecuritySectionProps>) {
    const [currentPasswordValue, setCurrentPasswordValue] =
        useState<string>("");
    const [newPasswordValue, setNewPasswordValue] = useState<string>("");
    const [confirmPasswordValue, setConfirmPasswordValue] =
        useState<string>("");
    const [mfaEnabledState, setMfaEnabledState] = useState<boolean>(mfaEnabled);
    const [setupOpen, setSetupOpen] = useState<boolean>(false);
    const [disableOpen, setDisableOpen] = useState<boolean>(false);
    const [backupCodesOpen, setBackupCodesOpen] = useState<boolean>(false);
    const [isChanged, setIsChanged] = useState<boolean>(false);
    const [formState, formAction, isPending] = useActionState(
        changePasswordAction,
        INITIAL_STATE,
    );

    useEffect(() => {
        if (formState && formState.status === "success") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsChanged(false);
        }
    }, [formState]);

    const handleDiscard = () => {
        setCurrentPasswordValue("");
        setNewPasswordValue("");
        setConfirmPasswordValue("");

        setIsChanged(false);
    };

    return (
        <div className="mb-10 space-y-5">
            <div>
                <h2 className="text-lg font-bold">Security</h2>
                <p className="mt-0.5 text-sm text-gray-400">
                    Manage your password and two-factor authentication
                </p>
            </div>
            <form
                action={formAction}
                onSubmit={() => setIsChanged(false)}
                className="space-y-5"
            >
                <div className="space-y-2">
                    <SectionTitle>Change password</SectionTitle>
                    <div className="overflow-hidden rounded-md border border-border bg-background px-5">
                        <FieldRow
                            label="Current password"
                            hint="Minimum 8 characters"
                        >
                            <PasswordInput
                                name="current-password"
                                placeholder="Current password"
                                value={currentPasswordValue}
                                onChange={(e) => {
                                    setCurrentPasswordValue(e.target.value);

                                    if (e.target.value.trim() !== "") {
                                        setIsChanged(true);
                                    } else {
                                        setIsChanged(false);
                                    }
                                }}
                                className="h-8 bg-control pr-9 text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                                disabled={isPending}
                            />
                            <ZodErrors
                                error={formState?.zodErrors?.currentPassword}
                            />
                        </FieldRow>
                        <FieldRow
                            label="New password"
                            hint="Minimum 8 characters"
                        >
                            <PasswordInput
                                name="new-password"
                                placeholder="Enter your new password"
                                value={newPasswordValue}
                                onChange={(e) => {
                                    setNewPasswordValue(e.target.value);

                                    if (e.target.value.trim() !== "") {
                                        setIsChanged(true);
                                    } else {
                                        setIsChanged(false);
                                    }
                                }}
                                className="h-8 bg-control pr-9 text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                                disabled={isPending}
                            />
                            <ZodErrors
                                error={formState?.zodErrors?.newPassword}
                            />
                        </FieldRow>
                        <FieldRow label="Confirm password">
                            <PasswordInput
                                name="confirm-password"
                                placeholder="Confirm password"
                                value={confirmPasswordValue}
                                onChange={(e) => {
                                    setConfirmPasswordValue(e.target.value);

                                    if (e.target.value.trim() !== "") {
                                        setIsChanged(true);
                                    } else {
                                        setIsChanged(false);
                                    }
                                }}
                                className="h-8 bg-control pr-9 text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                                disabled={isPending}
                            />
                            <ZodErrors
                                error={formState?.zodErrors?.confirmPassword}
                            />
                        </FieldRow>
                    </div>
                </div>
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
                <SaveBar
                    isChanged={isChanged}
                    onDiscard={handleDiscard}
                    isPending={isPending}
                />
            </form>
            <div className="space-y-2">
                <SectionTitle>Two-factor authentication</SectionTitle>
                <div className="overflow-hidden rounded-md border border-border bg-background">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Authenticator app
                                </p>
                                <p className="mt-0.5 text-xs text-gray-400">
                                    TOTP via Google Authenticator, Authy, or
                                    similar
                                </p>
                                {mfaEnabledState && (
                                    <Badge className="mt-1 border-emerald-200 bg-emerald-100 text-[10px] text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-900 dark:hover:text-emerald-300">
                                        Enabled
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {mfaEnabledState ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 border-border bg-control text-xs hover:bg-control-active"
                                        onClick={() => setBackupCodesOpen(true)}
                                    >
                                        Backup codes
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => setDisableOpen(true)}
                                    >
                                        Disable
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 border-border bg-control text-xs hover:bg-control-active"
                                    onClick={() => setSetupOpen(true)}
                                >
                                    Enable
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                <MfaSetupModal
                    open={setupOpen}
                    onOpenChange={setSetupOpen}
                    onEnabled={() => {
                        setMfaEnabledState(true);
                        setSetupOpen(false);
                    }}
                />
                <MfaDisableModal
                    open={disableOpen}
                    onOpenChange={setDisableOpen}
                    onDisabled={() => {
                        setMfaEnabledState(false);
                        setDisableOpen(false);
                    }}
                />
                <MfaBackupCodesModal
                    open={backupCodesOpen}
                    onOpenChange={setBackupCodesOpen}
                />
            </div>
        </div>
    );
}

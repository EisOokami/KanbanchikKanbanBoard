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

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

export default function SecuritySection() {
    const [currentPasswordValue, setCurrentPasswordValue] =
        useState<string>("");
    const [newPasswordValue, setNewPasswordValue] = useState<string>("");
    const [confirmPasswordValue, setConfirmPasswordValue] =
        useState<string>("");
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
        <form
            action={formAction}
            onSubmit={() => setIsChanged(false)}
            className="mb-10 space-y-5"
        >
            <div>
                <h2 className="text-lg font-bold text-gray-800">Security</h2>
                <p className="mt-0.5 text-sm text-gray-400">
                    Manage your password
                </p>
            </div>
            <div className="space-y-2">
                <SectionTitle>Change password</SectionTitle>
                <div className="divide-y divide-gray-100 overflow-hidden rounded-md border px-5">
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
                            className="h-8 pr-9 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                            disabled={isPending}
                        />
                        <ZodErrors
                            error={formState?.zodErrors?.currentPassword}
                        />
                    </FieldRow>
                    <FieldRow label="New password" hint="Minimum 8 characters">
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
                            className="h-8 pr-9 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                            disabled={isPending}
                        />
                        <ZodErrors error={formState?.zodErrors?.newPassword} />
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
                            className="h-8 pr-9 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
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
                    <InfoIcon weight="duotone" className="size-4" />
                    <p>{formState?.message}</p>
                </div>
            )}
            <SaveBar
                isChanged={isChanged}
                onDiscard={handleDiscard}
                isPending={isPending}
            />
        </form>
    );
}

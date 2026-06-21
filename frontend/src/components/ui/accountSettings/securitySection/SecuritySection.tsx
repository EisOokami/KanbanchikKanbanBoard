"use client";

import { useActionState, useState } from "react";
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
    const [isChanged, setIsChanged] = useState<boolean>(false);
    const [formState, formAction, isPending] = useActionState(
        changePasswordAction,
        INITIAL_STATE,
    );

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
                    {/* , 2FA, and active sessions */}
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
                            defaultValue={
                                formState?.formData
                                    ?.get("current-password")
                                    ?.toString() ?? undefined
                            }
                            onChange={(e) =>
                                e.target.value.trim() !== ""
                                    ? setIsChanged(true)
                                    : setIsChanged(false)
                            }
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
                            defaultValue={
                                formState?.formData
                                    ?.get("new-password")
                                    ?.toString() ?? undefined
                            }
                            onChange={(e) =>
                                e.target.value.trim() !== ""
                                    ? setIsChanged(true)
                                    : setIsChanged(false)
                            }
                            className="h-8 pr-9 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                            disabled={isPending}
                        />
                        <ZodErrors error={formState?.zodErrors?.newPassword} />
                    </FieldRow>
                    <FieldRow label="Confirm password">
                        <PasswordInput
                            name="confirm-password"
                            placeholder="Confirm password"
                            defaultValue={
                                formState?.formData
                                    ?.get("confirm-password")
                                    ?.toString() ?? undefined
                            }
                            onChange={(e) =>
                                e.target.value.trim() !== ""
                                    ? setIsChanged(true)
                                    : setIsChanged(false)
                            }
                            className="h-8 pr-9 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                            disabled={isPending}
                        />
                        <ZodErrors
                            error={formState?.zodErrors?.confirmPassword}
                        />
                    </FieldRow>
                </div>
            </div>
            {/* <div className="space-y-2">
                <SectionTitle>Two-factor authentication</SectionTitle>
                <div className="overflow-hidden rounded-md border">
                    <div className="flex items-center justify-between border-b p-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn("rounded-md p-2", twoFa ? "bg-emerald-50" : "bg-gray-50")}
                            >
                                <DeviceMobileIcon
                                    weight="duotone"
                                    className={cn("size-4", twoFa ? "text-emerald-500" : "text-gray-400")}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">
                                    Authenticator app
                                </p>
                                <p className="text-xs text-gray-400">
                                    TOTP via Google Authenticator or Authy
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {twoFa && (
                                <Badge className="border-emerald-200 bg-emerald-100 text-[10px] text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700">
                                    Enabled
                                </Badge>
                            )}
                            <Switch
                                checked={twoFa}
                                onCheckedChange={setTwoFa}
                                className="data-[state=checked]:bg-bright-blue"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn("rounded-md p-2", passkey ? "bg-blue-50" : "bg-gray-50")}
                            >
                                <KeyIcon
                                    weight="duotone"
                                    className={cn("size-4", passkey ? "text-blue-500" : "text-gray-400")}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">
                                    Passkey
                                </p>
                                <p className="text-xs text-gray-400">
                                    Sign in with Face ID, Touch ID, or hardware
                                    key
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={passkey}
                            onCheckedChange={setPasskey}
                            className="data-[state=checked]:bg-bright-blue"
                        />
                    </div>
                </div>
            </div> */}
            {/* <div className="space-y-2">
                <SectionTitle>Active sessions</SectionTitle>
                <div className="overflow-hidden rounded-md border">
                    {sessions.map((s, i) => (
                        <div
                            key={i}
                            className={cn("flex items-center justify-between p-4", i < sessions.length - 1 ? "border-b" : "")}
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-md bg-gray-50 p-2">
                                    <MonitorIcon
                                        weight="duotone"
                                        className="size-4 text-gray-400"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-gray-700">
                                            {s.device}
                                        </p>
                                        {s.current && (
                                            <Badge className="border-blue-200 bg-blue-100 text-[10px] text-blue-600 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-600">
                                                Current
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {s.location} · {s.time}
                                    </p>
                                </div>
                            </div>
                            {!s.current && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-gray-400 hover:text-rose-500"
                                >
                                    Revoke
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div> */}
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
                onDiscard={() => setIsChanged(false)}
                isPending={isPending}
            />
        </form>
    );
}

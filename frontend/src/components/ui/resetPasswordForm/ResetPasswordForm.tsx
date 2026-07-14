"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { resetPasswordAction } from "@/data/actions";
import { BaseAction } from "@/types/actions";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/shadcn/card";
import { Label } from "@/components/ui/shadcn/label";
import { Button } from "@/components/ui/shadcn/button";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";
import { DetailsErrors } from "@/components/ui/detailsErrors/DetailsErrors";
import { PasswordInput } from "../shadcn/password-input";
import { cn } from "@/libs/utils";
import { InfoIcon } from "@phosphor-icons/react";

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    status: null,
    error: null,
    details: null,
    message: null,
    formData: null,
};

export default function ResetPasswordForm() {
    const [formState, formAction, isPending] = useActionState(
        resetPasswordAction,
        INITIAL_STATE,
    );
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const token = searchParams.get("token");

    return (
        <Card className="z-50 mx-auto w-full max-w-sm border-border">
            <CardHeader className="pb-5">
                <CardTitle className="text-2xl">Forgot password?</CardTitle>
                <CardDescription>
                    No worries, we&apos;ll send you reset instructions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <PasswordInput
                            id="newPassword"
                            name="newPassword"
                            className={cn(
                                "bg-control placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue",
                                formState?.zodErrors?.newPassword
                                    ? "border-red-500"
                                    : "",
                            )}
                            defaultValue={
                                formState?.formData
                                    ?.get("newPassword")
                                    ?.toString() ?? undefined
                            }
                            autoComplete="new-password"
                        />
                        <ZodErrors error={formState?.zodErrors?.newPassword} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">
                            Confirm New Password
                        </Label>
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            className={cn(
                                "bg-control placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue",
                                formState?.zodErrors?.confirmPassword
                                    ? "border-red-500"
                                    : "",
                            )}
                            defaultValue={
                                formState?.formData
                                    ?.get("confirmPassword")
                                    ?.toString() ?? undefined
                            }
                            autoComplete="new-password"
                        />
                        <ZodErrors
                            error={formState?.zodErrors?.confirmPassword}
                        />
                    </div>
                    <input type="hidden" name="id" value={id ?? ""} />
                    <input type="hidden" name="token" value={token ?? ""} />
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
                    {formState?.details &&
                        formState?.details?.length &&
                        formState.details.map((error) => (
                            <DetailsErrors
                                key={error.message + error.field}
                                error={error}
                            />
                        ))}
                    <Button
                        type="submit"
                        className="mt-3 w-full bg-bright-blue text-white hover:bg-blue-600"
                        disabled={
                            isPending ||
                            formState?.status === "success" ||
                            formState?.status === "message"
                        }
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Reset password...
                            </>
                        ) : (
                            "Reset password"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { loginAction } from "@/data/actions";
import { BaseAction } from "@/types/actions";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/shadcn/card";
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";
import { DetailsErrors } from "@/components/ui/detailsErrors/DetailsErrors";
import { PasswordInput } from "@/components/ui/shadcn/password-input";
import { cn, formatBackupCode } from "@/libs/utils";
import {
    GoogleLogoIcon,
    InfoIcon,
    ShieldCheckIcon,
} from "@phosphor-icons/react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../shadcn/input-otp";
import EmailCodeForm from "../emailCodeForm/EmailCodeForm";
import { Checkbox } from "../shadcn/checkbox";

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    status: null,
    error: null,
    details: null,
    message: null,
    formData: null,
    data: null,
};

interface LoginFormProps {
    redirect?: string;
}

export default function LoginForm({ redirect }: Readonly<LoginFormProps>) {
    const [backupCode, setBackupCode] = useState<string>("");
    const [useBackupCode, setUseBackupCode] = useState<boolean>(false);
    const [dismissedToken, setDismissedToken] = useState<string | null>(null);
    const [formState, formAction, isPending] = useActionState(
        loginAction,
        INITIAL_STATE,
    );
    const formRef = useRef<HTMLFormElement>(null);

    const handleOtpComplete = () => {
        formRef.current?.requestSubmit();
    };

    if (
        formState?.data &&
        formState?.data.requiresMfa &&
        formState?.data.tempToken
    ) {
        return (
            <Card className="z-50 mx-auto w-full max-w-sm border-border">
                <CardHeader className="pb-5">
                    <div className="mb-2 flex items-center gap-2">
                        <ShieldCheckIcon
                            weight="duotone"
                            className="size-6 text-bright-blue"
                        />
                        <CardTitle className="text-2xl">
                            Two-factor verification
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Enter the 6-digit code from your authenticator app, or
                        one of your backup codes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        ref={formRef}
                        action={formAction}
                        className="grid gap-4"
                    >
                        <input
                            type="hidden"
                            name="tempToken"
                            value={formState.data.tempToken}
                        />
                        {redirect && (
                            <input
                                type="hidden"
                                name="redirect"
                                value={redirect}
                            />
                        )}
                        {useBackupCode ? (
                            <div className="grid gap-2">
                                <Label htmlFor="token">Backup code</Label>
                                <Input
                                    id="token"
                                    name="token"
                                    type="text"
                                    placeholder="XXXX-XXXX"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    value={backupCode}
                                    onChange={(e) =>
                                        setBackupCode(
                                            formatBackupCode(e.target.value),
                                        )
                                    }
                                    maxLength={9}
                                    className="bg-control text-center font-mono uppercase tracking-widest placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    name="token"
                                    autoFocus
                                    onComplete={handleOtpComplete}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot
                                            index={0}
                                            className="border-border bg-control"
                                        />
                                        <InputOTPSlot
                                            index={1}
                                            className="border-border bg-control"
                                        />
                                        <InputOTPSlot
                                            index={2}
                                            className="border-border bg-control"
                                        />
                                        <InputOTPSlot
                                            index={3}
                                            className="border-border bg-control"
                                        />
                                        <InputOTPSlot
                                            index={4}
                                            className="border-border bg-control"
                                        />
                                        <InputOTPSlot
                                            index={5}
                                            className="border-border bg-control"
                                        />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                        )}
                        <ZodErrors error={formState?.zodErrors?.token} />
                        {formState?.message && (
                            <div
                                className={cn(
                                    "flex items-center gap-2 rounded-md text-sm",
                                    formState?.status === "error"
                                        ? "text-red-500"
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
                        <Button
                            type="submit"
                            className="mt-3 w-full bg-bright-blue text-white hover:bg-blue-600"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify"
                            )}
                        </Button>
                        <button
                            type="button"
                            onClick={() => {
                                setUseBackupCode((prevState) => !prevState);
                                setBackupCode("");
                            }}
                            className="text-center text-sm text-muted-foreground underline"
                        >
                            {useBackupCode
                                ? "Use authenticator code instead"
                                : "Use a backup code instead"}
                        </button>
                    </form>
                </CardContent>
            </Card>
        );
    }

    if (
        formState?.data?.requiresEmailCode &&
        formState.data.tempToken &&
        formState.data.tempToken !== dismissedToken
    ) {
        const emailTempToken = formState.data.tempToken;

        return (
            <EmailCodeForm
                tempToken={emailTempToken}
                redirect={redirect}
                onBack={() => setDismissedToken(emailTempToken)}
            />
        );
    }

    return (
        <Card className="z-50 mx-auto w-full max-w-sm border-border">
            <CardHeader className="pb-5">
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Enter your details to access your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            className={cn(
                                "bg-control placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue",
                                formState?.zodErrors?.email
                                    ? "border-red-500"
                                    : "",
                            )}
                            defaultValue={
                                formState?.formData?.get("email")?.toString() ??
                                undefined
                            }
                            autoComplete="email"
                        />
                        <ZodErrors error={formState?.zodErrors?.email} />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/forgotPassword"
                                className="text-sm text-muted-foreground underline"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                        <PasswordInput
                            id="password"
                            name="password"
                            className={cn(
                                "bg-control placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue",
                                formState?.zodErrors?.password
                                    ? "border-red-500"
                                    : "",
                            )}
                            defaultValue={
                                formState?.formData
                                    ?.get("password")
                                    ?.toString() ?? undefined
                            }
                            autoComplete="current-password"
                        />
                        <ZodErrors error={formState?.zodErrors?.password} />
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
                    {formState?.data?.requiresTermsAcceptance && (
                        <div className="flex items-start gap-2">
                            <Checkbox
                                id="acceptTerms"
                                name="acceptTerms"
                                className="mt-0.5"
                            />
                            <Label
                                htmlFor="acceptTerms"
                                className="text-sm font-normal leading-snug text-muted-foreground"
                            >
                                I agree to the updated{" "}
                                <Link
                                    href="/terms"
                                    target="_blank"
                                    className="text-primary underline"
                                >
                                    Terms &amp; Conditions
                                </Link>{" "}
                                and{" "}
                                <Link
                                    href="/privacy"
                                    target="_blank"
                                    className="text-primary underline"
                                >
                                    Privacy Policy
                                </Link>
                            </Label>
                        </div>
                    )}
                    {formState?.data?.requiresVerification && (
                        <Link
                            href={`/resendVerification${
                                formState?.formData?.get("email")
                                    ? `?email=${encodeURIComponent(
                                          formState.formData
                                              .get("email")!
                                              .toString(),
                                      )}`
                                    : ""
                            }`}
                            className="text-center text-sm text-primary underline"
                        >
                            Resend verification email
                        </Link>
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
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Login...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                    {redirect && (
                        <input type="hidden" name="redirect" value={redirect} />
                    )}
                </form>
                <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <div className="h-px flex-1 bg-border" />
                </div>
                <Button
                    asChild
                    type="button"
                    variant="outline"
                    className="w-full border-border bg-control text-foreground hover:bg-control-active"
                >
                    <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>
                        <GoogleLogoIcon
                            weight="duotone"
                            className="mr-2 size-4"
                        />
                        Continue with Google
                    </a>
                </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signUp" className="text-primary underline">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}

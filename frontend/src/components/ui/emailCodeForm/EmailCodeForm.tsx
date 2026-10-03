"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { EnvelopeSimpleIcon, InfoIcon } from "@phosphor-icons/react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { cn } from "@/libs/utils";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/shadcn/input-otp";
import { BaseAction } from "@/types/actions";
import { emailCodeAction } from "@/data/actions";

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    status: null,
    error: null,
    details: null,
    message: null,
    formData: null,
    data: null,
};

interface EmailCodeFormProps {
    tempToken: string;
    redirect?: string;
    onBack: () => void;
}

export default function EmailCodeForm({
    tempToken,
    redirect,
    onBack,
}: Readonly<EmailCodeFormProps>) {
    const [code, setCode] = useState<string>("");
    const [cooldown, setCooldown] = useState<number>(60);
    const [intent, setIntent] = useState<"verify" | "resend">("verify");
    const [formState, formAction, isPending] = useActionState(
        emailCodeAction,
        INITIAL_STATE,
    );

    const isResending = isPending && intent === "resend";
    const requiresRelogin = formState.data?.requiresRelogin === true;

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);

        return () => clearTimeout(timer);
    }, [cooldown]);

    useEffect(() => {
        if (!formState.status) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCode("");
        setIntent("verify");

        if (formState.data?.sentAt) {
            setCooldown(60);
        } else if (formState.data?.retryAfter) {
            setCooldown(formState.data.retryAfter);
        }
    }, [formState]);

    return (
        <Card className="z-50 mx-auto w-full max-w-sm border-border">
            <CardHeader className="pb-5">
                <div className="mb-2 flex items-center gap-2">
                    <EnvelopeSimpleIcon
                        weight="duotone"
                        className="size-6 text-bright-blue"
                    />
                    <CardTitle className="text-2xl">Check your email</CardTitle>
                </div>
                <CardDescription>
                    We sent a 6-digit verification code to your email. Enter it
                    below to finish signing in.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="email-code-form"
                    action={formAction}
                    className="grid gap-4"
                >
                    <input type="hidden" name="tempToken" value={tempToken} />
                    {redirect && (
                        <input type="hidden" name="redirect" value={redirect} />
                    )}
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={6}
                            name="code"
                            value={code}
                            onChange={setCode}
                            pattern={REGEXP_ONLY_DIGITS}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            autoFocus
                            disabled={isPending || requiresRelogin}
                            onComplete={() =>
                                document
                                    .getElementById("email-code-form")
                                    ?.dispatchEvent(
                                        new Event("submit", {
                                            bubbles: true,
                                            cancelable: true,
                                        }),
                                    )
                            }
                        >
                            <InputOTPGroup>
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <InputOTPSlot
                                        key={index}
                                        index={index}
                                        className="border-border bg-control"
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    <ZodErrors error={formState.zodErrors?.code} />
                    {formState.message && (
                        <div
                            className={cn(
                                "flex items-center gap-2 rounded-md text-sm",
                                formState.status === "error"
                                    ? "text-red-500"
                                    : "text-green-500",
                            )}
                        >
                            <InfoIcon
                                weight="duotone"
                                className="size-4 shrink-0"
                            />
                            <p>{formState.message}</p>
                        </div>
                    )}
                    <Button
                        type="submit"
                        name="intent"
                        value="verify"
                        className="mt-3 w-full bg-bright-blue text-white hover:bg-blue-600"
                        disabled={isPending || requiresRelogin}
                    >
                        {isPending && !isResending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify"
                        )}
                    </Button>
                    <Button
                        type="submit"
                        name="intent"
                        value="resend"
                        variant="outline"
                        className="w-full border-border bg-control text-foreground hover:bg-control-active"
                        disabled={isPending || cooldown > 0 || requiresRelogin}
                        onClick={() => setIntent("resend")}
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : cooldown > 0 ? (
                            `Resend code in ${cooldown}s`
                        ) : (
                            "Resend code"
                        )}
                    </Button>
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-center text-sm text-muted-foreground underline"
                    >
                        Back to login
                    </button>
                </form>
            </CardContent>
        </Card>
    );
}

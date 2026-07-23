"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { resendVerificationAction } from "@/data/actions";
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
import { cn } from "@/libs/utils";
import { EnvelopeSimpleIcon, InfoIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    status: null,
    error: null,
    details: null,
    message: null,
    formData: null,
    data: null,
};

interface ResendVerificationFormProps {
    defaultEmail?: string;
}

export default function ResendVerificationForm({
    defaultEmail,
}: Readonly<ResendVerificationFormProps>) {
    const [secondsLeft, setSecondsLeft] = useState<number>(5);
    const [formState, formAction, isPending] = useActionState(
        resendVerificationAction,
        INITIAL_STATE,
    );
    const router = useRouter();

    useEffect(() => {
        if (formState?.status !== "success") return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSecondsLeft(30);

        const interval = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        const timeout = setTimeout(() => {
            router.push("/signIn");
        }, 30 * 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [formState?.status, router]);

    return (
        <Card className="z-50 mx-auto w-full max-w-sm border-border">
            <CardHeader className="pb-5">
                <div className="mb-2 flex items-center gap-2">
                    <EnvelopeSimpleIcon
                        weight="duotone"
                        className="size-6 text-bright-blue"
                    />
                    <CardTitle className="text-2xl">
                        Resend verification
                    </CardTitle>
                </div>
                <CardDescription>
                    Enter your email and we&apos;ll send you a new verification
                    link.
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
                                defaultEmail ??
                                undefined
                            }
                            autoComplete="email"
                        />
                        <ZodErrors error={formState?.zodErrors?.email} />
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
                            <p>
                                {formState?.message}
                                {formState?.status === "success" && (
                                    <span className="block text-xs text-muted-foreground">
                                        Redirecting to sign in in {secondsLeft}
                                        s...
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                    <Button
                        type="submit"
                        className="mt-3 w-full bg-bright-blue text-white hover:bg-blue-600"
                        disabled={isPending || formState?.status === "success"}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send verification link"
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already verified?{" "}
                    <Link href="/signIn" className="text-primary underline">
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}

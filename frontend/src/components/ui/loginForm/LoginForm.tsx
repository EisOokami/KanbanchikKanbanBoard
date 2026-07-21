"use client";

import { useActionState } from "react";
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
import { cn } from "@/libs/utils";
import { GoogleLogoIcon, InfoIcon } from "@phosphor-icons/react";

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    status: null,
    error: null,
    details: null,
    message: null,
    formData: null,
};

interface LoginFormProps {
    redirect?: string;
}

export default function LoginForm({ redirect }: Readonly<LoginFormProps>) {
    const [formState, formAction, isPending] = useActionState(
        loginAction,
        INITIAL_STATE,
    );

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

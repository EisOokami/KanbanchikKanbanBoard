import { getConfirmEmailChangeData } from "@/data/loaders";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface ConfirmEmailChangePageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function ConfirmEmailChangePage({
    searchParams,
}: ConfirmEmailChangePageProps) {
    const { token } = await searchParams;

    const result = token
        ? await getConfirmEmailChangeData(token)
        : { status: "error", message: "Token missing from link" };

    const isSuccess = result.status === "success";

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="z-50 flex w-full max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-background-secondary p-8 text-center">
                {isSuccess ? (
                    <CheckCircleIcon
                        weight="duotone"
                        className="size-16 text-green-500"
                    />
                ) : (
                    <XCircleIcon
                        weight="duotone"
                        className="size-16 text-destructive"
                    />
                )}
                <h1 className="text-xl font-semibold">
                    {isSuccess ? "Email Changed" : "Failed to Change Email"}
                </h1>
                <p className="text-muted-foreground">{result.message}</p>
                <Link
                    href="/overview"
                    className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-bright-blue px-4 text-sm font-medium text-white"
                >
                    Go to Kanbanchik
                </Link>
            </div>
        </div>
    );
}

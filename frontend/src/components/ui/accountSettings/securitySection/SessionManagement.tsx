"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    DesktopIcon,
    DeviceMobileIcon,
    DeviceTabletIcon,
    WarningIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { revokeOtherSessionsAction, revokeSessionAction } from "@/data/actions";
import { getUserSessionsData } from "@/data/loaders";
import type { UserSession } from "@/types/types";
import { Button } from "../../shadcn/button";
import { Badge } from "../../shadcn/badge";
import { Skeleton } from "../../shadcn/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../shadcn/alert-dialog";
import SectionTitle from "../sectionTitle/SectionTitle";
import {
    formatSessionDate,
    getSessionActivity,
    getSessionLabel,
} from "@/libs/accountSettings";

export default function SessionManagement() {
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [confirmation, setConfirmation] = useState<
        UserSession | "others" | null
    >(null);
    const requestId = useRef(0);
    const isRevoking = useRef(false);

    const loadSessions = useCallback(() => {
        const id = ++requestId.current;

        return getUserSessionsData()
            .then((result) => {
                if (id !== requestId.current) {
                    return;
                }

                if (result.status === "success") {
                    setError(null);

                    setSessions(result.data);
                }

                if (result.status === "error") {
                    setError(result.message);

                    toast.error(result.message);
                }
            })
            .catch(() => {
                if (id !== requestId.current) {
                    return;
                }

                setError("Unable to loadSessions sessions. Please try again.");

                toast.error(
                    "Unable to loadSessions sessions. Please try again.",
                );
            })
            .finally(() => {
                if (id === requestId.current) {
                    setIsLoading(false);
                }
            });
    }, []);

    useEffect(() => {
        const requests = requestId;

        void loadSessions();

        return () => {
            requests.current++;
        };
    }, [loadSessions]);

    const handleRefresh = () => {
        setIsLoading(true);
        setError(null);

        void loadSessions();
    };

    const handleRevoke = async () => {
        if (!confirmation || isRevoking.current) {
            return;
        }

        isRevoking.current = true;

        setIsPending(true);

        try {
            const result =
                confirmation === "others"
                    ? await revokeOtherSessionsAction()
                    : await revokeSessionAction(confirmation.id);

            if (!result.ok) {
                toast.error(result.message);

                return;
            }

            setSessions((current) =>
                current.filter((session) =>
                    confirmation === "others"
                        ? session.isCurrent
                        : session.id !== confirmation.id,
                ),
            );

            toast.success(
                confirmation === "others"
                    ? `${result.revokedCount} other sessions signed out`
                    : "Session revoked",
            );

            setConfirmation(null);

            await loadSessions();
        } catch {
            toast.error("Unable to revoke sessions. Please try again.");
        } finally {
            setIsPending(false);

            isRevoking.current = false;
        }
    };

    return (
        <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-1">
                <SectionTitle>Sessions / Devices</SectionTitle>
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                            isLoading ||
                            isPending ||
                            !!error ||
                            !sessions.some((session) => !session.isCurrent)
                        }
                        onClick={() => setConfirmation("others")}
                    >
                        Log out all other sessions
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLoading || isPending}
                        onClick={handleRefresh}
                    >
                        Refresh
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Manage devices signed in to your account. Use Sign out to
                    end your current session.
                </p>
            </div>
            {isLoading ? (
                <div className="space-y-3 rounded-md border border-border bg-background p-4">
                    <span className="sr-only">Loading sessions</span>
                    {[0, 1].map((index) => (
                        <Skeleton key={index} className="h-28 w-full" />
                    ))}
                </div>
            ) : error ? (
                <div
                    role="alert"
                    className="rounded-md border border-border bg-background p-4 text-sm"
                >
                    <p>{error}</p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={handleRefresh}
                    >
                        Try again
                    </Button>
                </div>
            ) : sessions.length === 0 ? (
                <p className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
                    No active sessions to display. Refresh the list or sign in
                    again.
                </p>
            ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background">
                    {sessions.map((session) => {
                        const Icon =
                            session.device.type === "mobile"
                                ? DeviceMobileIcon
                                : session.device.type === "tablet"
                                  ? DeviceTabletIcon
                                  : DesktopIcon;

                        return (
                            <li
                                key={session.id}
                                className="flex items-start gap-3 p-4"
                            >
                                <Icon
                                    size={24}
                                    weight="duotone"
                                    className="mt-1 shrink-0 text-muted-foreground"
                                />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="break-words text-sm font-medium">
                                            {getSessionLabel(session)}
                                        </p>
                                        {session.isCurrent && (
                                            <Badge variant="secondary">
                                                Current session
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="space-y-1 break-words text-xs text-muted-foreground">
                                        <p>
                                            {[
                                                session.browser.name,
                                                session.browser.version,
                                                session.os.name,
                                                session.os.version,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ") ||
                                                "Device details unavailable"}
                                        </p>
                                        <p>IP: {session.ip ?? "Unknown"}</p>
                                        <p
                                            title={formatSessionDate(
                                                session.lastUsedAt,
                                            )}
                                        >
                                            {getSessionActivity(session)}
                                        </p>
                                        <p>
                                            Signed in:{" "}
                                            <time dateTime={session.createdAt}>
                                                {formatSessionDate(
                                                    session.createdAt,
                                                )}
                                            </time>
                                        </p>
                                        <p>
                                            Expires:{" "}
                                            <time dateTime={session.expiresAt}>
                                                {formatSessionDate(
                                                    session.expiresAt,
                                                )}
                                            </time>
                                        </p>
                                    </div>
                                    {!session.isCurrent && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isPending}
                                            onClick={() =>
                                                setConfirmation(session)
                                            }
                                        >
                                            Revoke
                                        </Button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            <AlertDialog
                open={confirmation !== null}
                onOpenChange={(open) => {
                    if (!open && !isPending) {
                        setConfirmation(null);
                    }
                }}
            >
                <AlertDialogContent className="border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <WarningIcon
                                weight="duotone"
                                className="size-5 text-red-500"
                            />
                            {confirmation === "others"
                                ? "Log out all other sessions?"
                                : "Revoke session?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmation === "others"
                                ? "All other devices will be signed out. Your current session will remain active."
                                : `This device${confirmation ? ` (${getSessionLabel(confirmation)})` : ""} will be signed out and will need to authenticate again.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            type="button"
                            className="text-sm"
                            disabled={isPending}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                void handleRevoke();
                            }}
                            className="bg-red-600 text-sm font-semibold text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                            disabled={isPending}
                        >
                            {isPending
                                ? "Signing out…"
                                : confirmation === "others"
                                  ? "Log out other sessions"
                                  : "Revoke session"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}

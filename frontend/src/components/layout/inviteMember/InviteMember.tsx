"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/shadcn/button";
import { acceptInviteAction } from "@/data/actions";

type Status = "loading" | "ready" | "joining" | "success" | "error";

interface InviteClientProps {
    token: string;
}

export function InviteMember({ token }: Readonly<InviteClientProps>) {
    const router = useRouter();
    const [status, setStatus] = useState<Status>("loading");
    const [errorMsg, setErrorMsg] = useState("");
    const [projectId, setProjectId] = useState<number | null>(null);

    const handleAccept = async () => {
        setStatus("joining");

        const result = await acceptInviteAction(token);

        if (!result) {
            setErrorMsg("Ops! Something went wrong. Please try again.");
            setStatus("error");

            return;
        }

        if (!result.ok || !result.projectId) {
            setErrorMsg(result.message);
            setStatus("error");

            return;
        }

        setProjectId(result.projectId);
        setStatus("success");
    };

    if (status === "success") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <p className="text-lg font-medium">You joined the project!</p>
                <Button onClick={() => router.push(`/projects/${projectId}`)}>
                    Go to project
                </Button>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <p className="text-sm text-destructive">{errorMsg}</p>
                <Button variant="outline" onClick={() => router.push("/")}>
                    Go home
                </Button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-xl font-medium">You have been invited</h1>
                <p className="text-sm text-muted-foreground">
                    Click below to join the project.
                </p>
            </div>
            <Button onClick={handleAccept} disabled={status === "joining"}>
                {status === "joining" ? "Joining..." : "Join project"}
            </Button>
        </div>
    );
}

"use client";

import { STATUS_CONFIG } from "@/constants/constants";
import { cn } from "@/libs/utils";
import { Status } from "@/types/types";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { useState } from "react";
import { BaseAction } from "@/types/actions";
import { Button } from "../../shadcn/button";

interface StatusSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
}

export default function StatusSection({
    formState,
    isPending,
}: Readonly<StatusSectionProps>) {
    const [status, setStatus] = useState<Status>("active");

    return (
        <div>
            <h3 className="mb-2 block font-semibold">Status</h3>
            <div className="flex flex-wrap gap-1.5">
                {(Object.keys(STATUS_CONFIG) as Status[]).map(
                    (statusConfig) => (
                        <Button
                            key={statusConfig}
                            type="button"
                            onClick={() => setStatus(statusConfig)}
                            className={cn(
                                "h-6 border border-border bg-control px-2.5 text-xs font-medium text-foreground transition-all hover:bg-control-active",
                                status === statusConfig
                                    ? "bg-control-active"
                                    : "opacity-60 hover:opacity-100",
                            )}
                            disabled={isPending}
                        >
                            <span
                                className="size-1.5 rounded-full"
                                style={{
                                    backgroundColor:
                                        STATUS_CONFIG[statusConfig].dot,
                                }}
                            />
                            {STATUS_CONFIG[statusConfig].label}
                        </Button>
                    ),
                )}
            </div>
            <ZodErrors error={formState?.zodErrors?.status} />
            <input type="hidden" name="status" value={status} />
        </div>
    );
}

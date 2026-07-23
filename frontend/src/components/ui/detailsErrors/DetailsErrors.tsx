"use client";

import { DetailsError } from "@/types/actions";
import { WarningIcon } from "@phosphor-icons/react";

interface DetailsErrorsProps {
    error: DetailsError | null | undefined;
}

export function DetailsErrors({ error }: Readonly<DetailsErrorsProps>) {
    if (!error) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 py-1 text-sm text-red-500">
            <WarningIcon weight="duotone" className="size-4 shrink-0" />
            <p>{error.message}</p>
        </div>
    );
}

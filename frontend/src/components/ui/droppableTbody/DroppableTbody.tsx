"use client";

import { cn } from "@/libs/utils";
import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableTbodyProps {
    columnId: number;
    children: ReactNode;
}

export default function DroppableTbody({
    columnId,
    children,
}: Readonly<DroppableTbodyProps>) {
    const { setNodeRef } = useDroppable({ id: columnId });

    return (
        <tbody ref={setNodeRef} className={cn("divide-y-[1px] divide-border")}>
            {children}
        </tbody>
    );
}

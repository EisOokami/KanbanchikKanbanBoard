"use client";

import { Role } from "@/types/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../shadcn/select";
import { cn } from "@/libs/utils";
import { ROLES } from "@/constants/constants";

export default function RoleSelect({
    value,
    onChange,
    compact = false,
}: {
    value: Role;
    onChange: (r: Role) => void;
    compact?: boolean;
}) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as Role)}>
            <SelectTrigger
                className={cn(
                    "h-8 gap-1 rounded-md border text-xs font-medium capitalize focus:ring-1 focus:ring-bright-blue",
                    compact ? "w-[110px]" : "w-[130px]",
                )}
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {/* {(
                    Object.entries(ROLE_META) as [
                        Role,
                        (typeof ROLE_META)[Role],
                    ][]
                ).map(([key, m]) => ( */}
                {ROLES.map((role) => (
                    <SelectItem
                        key={role}
                        value={role}
                        className="cursor-pointer text-sm font-medium capitalize"
                    >
                        <span
                        // style={{ color: m.color }}
                        >
                            {/* {m.label} */}
                            {role}
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

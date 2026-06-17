"use client";

import { LightningIcon } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import { getInitials } from "@/libs/utils";
import { formatDistanceToNow } from "date-fns";
import { ActivityEntry } from "@/types/taskDetailsSheet";

interface ActivitySectionProps {
    activity: ActivityEntry[];
}

export default function ActivitySection({
    activity,
}: Readonly<ActivitySectionProps>) {
    return (
        <>
            <div className="mb-4 flex items-center gap-1.5">
                <LightningIcon
                    weight="duotone"
                    size={16}
                    className="text-gray-500"
                />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Activity
                </span>
                {activity.length > 0 && (
                    <span className="text-xs text-gray-500">
                        {activity.length}
                    </span>
                )}
            </div>
            <div>
                {activity.map((entry) => (
                    <div key={entry.id} className="mb-3">
                        <div className="flex items-start gap-3">
                            <Avatar className="mt-0.5 size-7 shrink-0">
                                <AvatarImage src={entry.author.avatar_url} />
                                <AvatarFallback
                                    className="text-[10px] font-bold text-white"
                                    style={{
                                        background: entry.author.color,
                                    }}
                                >
                                    {getInitials(
                                        entry.author.name,
                                        entry.author.surname,
                                    )}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs font-semibold">
                                        {entry.author.name}{" "}
                                        {entry.author.surname}
                                    </span>
                                    <span className="ml-auto text-xs text-gray-300">
                                        {formatDistanceToNow(entry.timestamp, {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                                {entry.type === "change" && (
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        changed{" "}
                                        <span className="font-medium text-gray-700">
                                            {entry.field}
                                        </span>{" "}
                                        <span
                                            className="mx-0.5 rounded px-1.5 py-0.5 line-through"
                                            style={{
                                                background: "#FEF0EF",
                                                color: "#D93025",
                                            }}
                                        >
                                            {entry.from}
                                        </span>
                                        <span className="text-gray-400">→</span>
                                        <span
                                            className="mx-0.5 rounded px-1.5 py-0.5"
                                            style={{
                                                background: "#EEFAF2",
                                                color: "#1E7E3A",
                                            }}
                                        >
                                            {entry.to}
                                        </span>
                                    </p>
                                )}
                                {entry.type === "comment" && (
                                    <div className="mt-1.5 rounded-md rounded-tl-sm border px-3 py-2.5 text-sm leading-relaxed text-gray-700">
                                        {entry.body}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {activity.length === 0 && (
                    <p className="text-sm text-gray-300">No activity yet.</p>
                )}
            </div>
        </>
    );
}

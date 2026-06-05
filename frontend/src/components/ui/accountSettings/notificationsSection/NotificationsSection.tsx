"use client";

import { EmailDigest, NotificationSettings } from "@/types/accountSettings";
import { useState } from "react";
import { notificationsSection, rows } from "@/constants/accountSettings";
import { Switch } from "../../shadcn/switch";
import FieldRow from "../fieldRow/FieldRow";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../shadcn/select";
import SectionTitle from "../sectionTitle/SectionTitle";
import SaveBar from "../saveBar/SaveBar";

export default function NotificationsSection() {
    const [settings, setSettings] =
        useState<NotificationSettings>(notificationsSection);
    const [dirty, setDirty] = useState<boolean>(false);

    const up = <K extends keyof NotificationSettings>(
        k: K,
        v: NotificationSettings[K],
    ): void => {
        setSettings((s) => ({ ...s, [k]: v }));
        setDirty(true);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                    Notifications
                </h2>
                <p className="mt-0.5 text-sm text-gray-400">
                    Control what alerts you receive and how
                </p>
            </div>
            <SectionTitle>In-app & push</SectionTitle>
            <div className="mb-6 overflow-hidden rounded-md border">
                <div className="flex items-center justify-between border-b bg-gray-50 px-5 py-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Event
                    </span>
                    <div className="flex items-center gap-6">
                        <span className="w-14 text-center text-xs font-bold uppercase tracking-wider text-gray-400">
                            Push
                        </span>
                    </div>
                </div>
                {rows.map((r, i) => (
                    <div
                        key={r.key}
                        className={`flex items-center justify-between px-5 py-3.5 ${i < rows.length - 1 ? "border-b" : ""}`}
                    >
                        <div>
                            <p className="text-sm font-semibold text-gray-700">
                                {r.label}
                            </p>
                            <p className="text-xs text-gray-400">{r.hint}</p>
                        </div>
                        <Switch
                            checked={settings[r.key]}
                            onCheckedChange={(v: boolean) => up(r.key, v)}
                            className="data-[state=checked]:bg-bright-blue"
                        />
                    </div>
                ))}
            </div>
            <SectionTitle>Email digest</SectionTitle>
            <div className="mb-6 divide-y divide-gray-100 overflow-hidden rounded-md border px-5">
                <FieldRow
                    label="Digest frequency"
                    hint="How often we email you a summary"
                >
                    <Select
                        value={settings.emailDigest}
                        onValueChange={(v: EmailDigest) => up("emailDigest", v)}
                    >
                        <SelectTrigger className="h-8 w-40 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="daily">Daily digest</SelectItem>
                            <SelectItem value="weekly">
                                Weekly digest
                            </SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                    </Select>
                </FieldRow>
            </div>
            <SaveBar
                dirty={dirty}
                onSave={() => setDirty(false)}
                onDiscard={() => setDirty(false)}
            />
        </div>
    );
}

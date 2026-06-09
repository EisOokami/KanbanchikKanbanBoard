"use client";

import { useState } from "react";
import SectionTitle from "../sectionTitle/SectionTitle";
import FieldRow from "../fieldRow/FieldRow";
import { Input } from "../../shadcn/input";
import { strengthColor } from "@/libs/accountSettings";
import { Switch } from "../../shadcn/switch";
import { sessions } from "@/constants/accountSettings";
import { Button } from "../../shadcn/button";
import SaveBar from "../saveBar/SaveBar";
import { Badge } from "../../shadcn/badge";
import {
    DeviceMobileIcon,
    EyeIcon,
    EyeSlashIcon,
    KeyIcon,
    MonitorIcon,
} from "@phosphor-icons/react";

export default function SecuritySection() {
    const [showCurrent, setShowCurrent] = useState<boolean>(false);
    const [showNew, setShowNew] = useState<boolean>(false);
    const [twoFa, setTwoFa] = useState<boolean>(true);
    const [passkey, setPasskey] = useState<boolean>(false);
    const [dirty, setDirty] = useState<boolean>(false);

    return (
        <div className="mb-10 space-y-5">
            <div>
                <h2 className="text-lg font-bold text-gray-800">Security</h2>
                <p className="mt-0.5 text-sm text-gray-400">
                    Manage your password, 2FA, and active sessions
                </p>
            </div>
            <div className="space-y-2">
                <SectionTitle>Change password</SectionTitle>
                <div className="divide-y divide-gray-100 overflow-hidden rounded-md border px-5">
                    <FieldRow label="Current password" hint="">
                        <div className="relative">
                            <Input
                                type={showCurrent ? "text" : "password"}
                                className="h-8 pr-9 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                placeholder="••••••••"
                            />
                            <button
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrent ? (
                                    <EyeSlashIcon
                                        weight="duotone"
                                        className="size-3.5"
                                    />
                                ) : (
                                    <EyeIcon
                                        weight="duotone"
                                        className="size-3.5"
                                    />
                                )}
                            </button>
                        </div>
                    </FieldRow>
                    <FieldRow label="New password" hint="Minimum 12 characters">
                        <div className="relative">
                            <Input
                                type={showNew ? "text" : "password"}
                                className="h-8 pr-9 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                placeholder="••••••••"
                                onChange={() => setDirty(true)}
                            />
                            <button
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNew ? (
                                    <EyeSlashIcon
                                        weight="duotone"
                                        className="size-3.5"
                                    />
                                ) : (
                                    <EyeIcon
                                        weight="duotone"
                                        className="size-3.5"
                                    />
                                )}
                            </button>
                        </div>
                        <div className="mt-2 flex gap-1">
                            {([1, 2, 3, 4] as const).map((n) => (
                                <div
                                    key={n}
                                    className={`h-1 flex-1 rounded-full ${strengthColor(n)}`}
                                />
                            ))}
                        </div>
                    </FieldRow>
                    <FieldRow label="Confirm password" hint="">
                        <Input
                            type="password"
                            className="h-8 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                            placeholder="••••••••"
                        />
                    </FieldRow>
                </div>
            </div>
            <div className="space-y-2">
                <SectionTitle>Two-factor authentication</SectionTitle>
                <div className="overflow-hidden rounded-md border">
                    <div className="flex items-center justify-between border-b p-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={`rounded-md p-2 ${twoFa ? "bg-emerald-50" : "bg-gray-50"}`}
                            >
                                <DeviceMobileIcon
                                    weight="duotone"
                                    className={`size-4 ${twoFa ? "text-emerald-500" : "text-gray-400"}`}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">
                                    Authenticator app
                                </p>
                                <p className="text-xs text-gray-400">
                                    TOTP via Google Authenticator or Authy
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {twoFa && (
                                <Badge className="border-emerald-200 bg-emerald-100 text-[10px] text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700">
                                    Enabled
                                </Badge>
                            )}
                            <Switch
                                checked={twoFa}
                                onCheckedChange={setTwoFa}
                                className="data-[state=checked]:bg-bright-blue"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={`rounded-md p-2 ${passkey ? "bg-blue-50" : "bg-gray-50"}`}
                            >
                                <KeyIcon
                                    weight="duotone"
                                    className={`size-4 ${passkey ? "text-blue-500" : "text-gray-400"}`}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">
                                    Passkey
                                </p>
                                <p className="text-xs text-gray-400">
                                    Sign in with Face ID, Touch ID, or hardware
                                    key
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={passkey}
                            onCheckedChange={setPasskey}
                            className="data-[state=checked]:bg-bright-blue"
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <SectionTitle>Active sessions</SectionTitle>
                <div className="overflow-hidden rounded-md border">
                    {sessions.map((s, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-between p-4 ${i < sessions.length - 1 ? "border-b" : ""}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-md bg-gray-50 p-2">
                                    <MonitorIcon
                                        weight="duotone"
                                        className="size-4 text-gray-400"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-gray-700">
                                            {s.device}
                                        </p>
                                        {s.current && (
                                            <Badge className="border-blue-200 bg-blue-100 text-[10px] text-blue-600 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-600">
                                                Current
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {s.location} · {s.time}
                                    </p>
                                </div>
                            </div>
                            {!s.current && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-gray-400 hover:text-rose-500"
                                >
                                    Revoke
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {dirty && (
                <SaveBar
                    dirty
                    onSave={() => setDirty(false)}
                    onDiscard={() => setDirty(false)}
                />
            )}
        </div>
    );
}

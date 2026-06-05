"use client";

import { profileForm, socialLinks } from "@/constants/accountSettings";
import { ProfileForm } from "@/types/accountSettings";
import { useState } from "react";
import SectionTitle from "../sectionTitle/SectionTitle";
import { Avatar, AvatarFallback } from "../../shadcn/avatar";
import { Camera, CheckCircle2 } from "lucide-react";
import { Button } from "../../shadcn/button";
import FieldRow from "..//fieldRow/FieldRow";
import { Input } from "../../shadcn/input";
import { Textarea } from "../../shadcn/textarea";
import SaveBar from "../saveBar/SaveBar";
import { Badge } from "../../shadcn/badge";

export default function ProfileSection() {
    const [dirty, setDirty] = useState<boolean>(false);
    const [saved, setSaved] = useState<boolean>(false);
    const [form, setForm] = useState<ProfileForm>(profileForm);

    const up = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]): void => {
        setForm((f) => ({ ...f, [k]: v }));
        setDirty(true);
    };

    const save = (): void => {
        setSaved(true);
        setDirty(false);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">Profile</h2>
                <p className="mt-0.5 text-sm text-gray-400">
                    Manage your public profile information
                </p>
            </div>
            <SectionTitle>Avatar</SectionTitle>
            <div className="mb-6 flex items-center gap-5 rounded-md border bg-gray-50 p-4">
                <div className="group relative">
                    <Avatar className="size-16 shadow-md ring-2 ring-white">
                        <AvatarFallback className="bg-blue-500 text-xl font-bold text-white">
                            AK
                        </AvatarFallback>
                    </Avatar>
                    <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Camera className="size-4 text-white" />
                    </button>
                </div>
                <div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 h-7 text-xs"
                    >
                        Upload photo
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-gray-400"
                    >
                        Remove
                    </Button>
                    <p className="mt-1.5 text-xs text-gray-400">
                        JPG, PNG or WebP. Max 2 MB.
                    </p>
                </div>
            </div>
            <SectionTitle>Personal info</SectionTitle>
            <div className="divide-y divide-gray-100 overflow-hidden rounded-md border px-5">
                <FieldRow
                    label="Full name"
                    hint="Your display name across the workspace"
                >
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            value={form.firstName}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => up("firstName", e.target.value)}
                            placeholder="First"
                            className="h-8 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                        />
                        <Input
                            value={form.lastName}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => up("lastName", e.target.value)}
                            placeholder="Last"
                            className="h-8 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                        />
                    </div>
                </FieldRow>
                <FieldRow
                    label="Email address"
                    hint="Used for notifications and sign-in"
                >
                    <div className="flex items-center gap-2">
                        <Input
                            value={form.email}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => up("email", e.target.value)}
                            className="h-8 flex-1 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                        />
                        <Badge className="gap-1 border-emerald-200 bg-emerald-100 px-2 text-[10px] text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700">
                            <CheckCircle2 className="size-2.5" /> Verified
                        </Badge>
                    </div>
                </FieldRow>
                <FieldRow label="Phone" hint="Optional — shown to teammates">
                    <Input
                        value={form.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            up("phone", e.target.value)
                        }
                        className="h-8 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                    />
                </FieldRow>
                <FieldRow label="Job title" hint="">
                    <Input
                        value={form.role}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            up("role", e.target.value)
                        }
                        className="h-8 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                    />
                </FieldRow>
                <FieldRow label="Location" hint="">
                    <Input
                        value={form.location}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            up("location", e.target.value)
                        }
                        className="h-8 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                    />
                </FieldRow>
                <FieldRow
                    label="Bio"
                    hint="Brief description shown on your profile"
                >
                    <Textarea
                        value={form.bio}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            up("bio", e.target.value)
                        }
                        rows={3}
                        className="resize-none text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                    />
                </FieldRow>
            </div>
            <SectionTitle className="mt-6">Social links</SectionTitle>
            <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-md border px-5">
                {socialLinks.map(({ key, icon: Icon, label, placeholder }) => (
                    <FieldRow key={key} label={label} hint="">
                        <div className="relative">
                            <Icon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                            <Input
                                value={form[key]}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => up(key, e.target.value)}
                                placeholder={placeholder}
                                className="h-8 pl-8 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                            />
                        </div>
                    </FieldRow>
                ))}
            </div>
            <SaveBar
                dirty={dirty}
                onSave={save}
                onDiscard={() => setDirty(false)}
            />
            {saved && (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 className="size-4" /> Changes saved!
                </div>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { Badge } from "@/components/ui/shadcn/badge";
import { Switch } from "@/components/ui/shadcn/switch";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/shadcn/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/shadcn/alert-dialog";
import {
    User,
    Lock,
    Bell,
    Palette,
    LogOut,
    Trash2,
    Camera,
    Check,
    ChevronRight,
    Globe,
    Moon,
    Sun,
    Monitor,
    Eye,
    EyeOff,
    Smartphone,
    CircleAlert,
    CheckCircle2,
    AlertTriangle,
    Github,
    Twitter,
    KeyRound,
    LucideProps,
} from "lucide-react";

type SectionId = "profile" | "security" | "notifications" | "appearance";

type NavGroup = "Account";

type ThemeId = "light" | "dark" | "system";
type DensityId = "compact" | "comfortable" | "spacious";
type FontId = "system" | "geist" | "ibm" | "jetbrains";
type EmailDigest = "realtime" | "daily" | "weekly" | "never";

interface NavItem {
    id: SectionId;
    label: string;
    icon: React.FC<LucideProps>;
    group: NavGroup;
}

const NAV: NavItem[] = [
    { id: "profile", label: "Profile", icon: User, group: "Account" },
    { id: "security", label: "Security", icon: Lock, group: "Account" },
    {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        group: "Account",
    },
    { id: "appearance", label: "Appearance", icon: Palette, group: "Account" },
];

const GROUPS: NavGroup[] = ["Account"];

interface FieldRowProps {
    label: string;
    hint?: string;
    children: React.ReactNode;
}

function FieldRow({ label, hint, children }: FieldRowProps) {
    return (
        <div className="grid grid-cols-[1fr_1.6fr] items-start gap-6 border-b py-5 last:border-0">
            <div>
                <p className="text-sm font-semibold text-gray-700">{label}</p>
                {hint && (
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                        {hint}
                    </p>
                )}
            </div>
            <div>{children}</div>
        </div>
    );
}

interface SectionTitleProps {
    children: React.ReactNode;
    className?: string;
}

function SectionTitle({ children, className }: SectionTitleProps) {
    return (
        <h3
            className={`mb-4 pt-1 text-xs font-bold uppercase tracking-widest text-gray-400 ${className ?? ""}`}
        >
            {children}
        </h3>
    );
}

interface SaveBarProps {
    dirty: boolean;
    onSave: () => void;
    onDiscard: () => void;
}

function SaveBar({ dirty, onSave, onDiscard }: SaveBarProps) {
    if (!dirty) return null;

    return (
        <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-between gap-3 border-t bg-white/95 px-6 py-3 backdrop-blur">
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <CircleAlert className="size-3.5 text-amber-500" />
                You have unsaved changes
            </p>
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDiscard}
                    className="h-7 text-xs"
                >
                    Discard
                </Button>
                <Button
                    size="sm"
                    onClick={onSave}
                    className="h-7 gap-1.5 bg-bright-blue text-xs hover:bg-blue-600"
                >
                    <Check className="size-3" /> Save changes
                </Button>
            </div>
        </div>
    );
}

interface ProfileForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    location: string;
    bio: string;
    website: string;
    twitter: string;
    github: string;
}

interface SocialLink {
    key: keyof ProfileForm;
    icon: React.FC<LucideProps>;
    label: string;
    placeholder: string;
}

function ProfileSection() {
    const [dirty, setDirty] = useState<boolean>(false);
    const [saved, setSaved] = useState<boolean>(false);
    const [form, setForm] = useState<ProfileForm>({
        firstName: "Alex",
        lastName: "Kovalenko",
        email: "alex@acme.com",
        phone: "+1 (555) 234-5678",
        role: "Product Designer",
        location: "Kyiv, Ukraine",
        bio: "Crafting digital products with a focus on clarity, usability, and a little bit of delight.",
        website: "https://alexkovalenko.design",
        twitter: "@alexkov",
        github: "alexkov",
    });

    const up = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]): void => {
        setForm((f) => ({ ...f, [k]: v }));
        setDirty(true);
    };

    const save = (): void => {
        setSaved(true);
        setDirty(false);
        setTimeout(() => setSaved(false), 2500);
    };

    const socialLinks: SocialLink[] = [
        {
            key: "website",
            icon: Globe,
            label: "Website",
            placeholder: "https://…",
        },
        {
            key: "twitter",
            icon: Twitter,
            label: "Twitter",
            placeholder: "@handle",
        },
        {
            key: "github",
            icon: Github,
            label: "GitHub",
            placeholder: "username",
        },
    ];

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

interface Session {
    device: string;
    location: string;
    current: boolean;
    time: string;
}

function strengthColor(n: number): string {
    if (n <= 2) return "bg-amber-400";
    return "bg-gray-200";
}

function SecuritySection() {
    const [showCurrent, setShowCurrent] = useState<boolean>(false);
    const [showNew, setShowNew] = useState<boolean>(false);
    const [twoFa, setTwoFa] = useState<boolean>(true);
    const [passkey, setPasskey] = useState<boolean>(false);
    const [dirty, setDirty] = useState<boolean>(false);

    const sessions: Session[] = [
        {
            device: "Chrome · macOS",
            location: "Kyiv, UA",
            current: true,
            time: "Now",
        },
        {
            device: "Safari · iPhone",
            location: "Kyiv, UA",
            current: false,
            time: "2h ago",
        },
        {
            device: "Firefox · Windows",
            location: "Berlin, DE",
            current: false,
            time: "3d ago",
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">Security</h2>
                <p className="mt-0.5 text-sm text-gray-400">
                    Manage your password, 2FA, and active sessions
                </p>
            </div>
            <SectionTitle>Change password</SectionTitle>
            <div className="mb-6 divide-y divide-gray-100 overflow-hidden rounded-md border px-5">
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
                                <EyeOff className="size-3.5" />
                            ) : (
                                <Eye className="size-3.5" />
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
                                <EyeOff className="size-3.5" />
                            ) : (
                                <Eye className="size-3.5" />
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
            <SectionTitle>Two-factor authentication</SectionTitle>
            <div className="mb-6 overflow-hidden rounded-md border">
                <div className="flex items-center justify-between border-b p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`rounded-md p-2 ${twoFa ? "bg-emerald-50" : "bg-gray-50"}`}
                        >
                            <Smartphone
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
                            <KeyRound
                                className={`size-4 ${passkey ? "text-blue-500" : "text-gray-400"}`}
                            />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">
                                Passkey
                            </p>
                            <p className="text-xs text-gray-400">
                                Sign in with Face ID, Touch ID, or hardware key
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
            <SectionTitle>Active sessions</SectionTitle>
            <div className="mb-6 overflow-hidden rounded-md border">
                {sessions.map((s, i) => (
                    <div
                        key={i}
                        className={`flex items-center justify-between p-4 ${i < sessions.length - 1 ? "border-b" : ""}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-md bg-gray-50 p-2">
                                <Monitor className="size-4 text-gray-400" />
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

interface NotificationSettings {
    taskAssigned: boolean;
    taskDue: boolean;
    taskComment: boolean;
    sprintStart: boolean;
    sprintEnd: boolean;
    teamMention: boolean;
    projectUpdate: boolean;
    weeklySummary: boolean;
    emailDigest: EmailDigest;
    pushEnabled: boolean;
}

type BooleanNotificationKey = {
    [K in keyof NotificationSettings]: NotificationSettings[K] extends boolean
        ? K
        : never;
}[keyof NotificationSettings];

interface NotificationRow {
    key: BooleanNotificationKey;
    label: string;
    hint: string;
}

function NotificationsSection() {
    const [settings, setSettings] = useState<NotificationSettings>({
        taskAssigned: true,
        taskDue: true,
        taskComment: false,
        sprintStart: true,
        sprintEnd: true,
        teamMention: true,
        projectUpdate: false,
        weeklySummary: true,
        emailDigest: "daily",
        pushEnabled: true,
    });
    const [dirty, setDirty] = useState<boolean>(false);

    const up = <K extends keyof NotificationSettings>(
        k: K,
        v: NotificationSettings[K],
    ): void => {
        setSettings((s) => ({ ...s, [k]: v }));
        setDirty(true);
    };

    const rows: NotificationRow[] = [
        {
            key: "taskAssigned",
            label: "Task assigned to me",
            hint: "When someone assigns you a task",
        },
        {
            key: "taskDue",
            label: "Task due soon",
            hint: "24h before a task you own is due",
        },
        {
            key: "taskComment",
            label: "Comments on my tasks",
            hint: "When someone comments on your card",
        },
        {
            key: "sprintStart",
            label: "Sprint started",
            hint: "When a new sprint begins",
        },
        {
            key: "sprintEnd",
            label: "Sprint ending",
            hint: "48h before sprint closes",
        },
        {
            key: "teamMention",
            label: "@Mention",
            hint: "When you're mentioned anywhere",
        },
        {
            key: "projectUpdate",
            label: "Project status change",
            hint: "When a project moves to At Risk or On Hold",
        },
        {
            key: "weeklySummary",
            label: "Weekly summary",
            hint: "Every Monday — your week at a glance",
        },
    ];

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

interface ThemeOption {
    id: ThemeId;
    label: string;
    icon: React.FC<LucideProps>;
}

interface DensityOption {
    id: DensityId;
    label: string;
    sub: string;
}

function AppearanceSection() {
    const [theme, setTheme] = useState<ThemeId>("system");
    const [accent, setAccent] = useState<string>("#6366f1");
    const [density, setDensity] = useState<DensityId>("comfortable");
    const [font, setFont] = useState<FontId>("system");
    const [dirty, setDirty] = useState<boolean>(false);

    const themes: ThemeOption[] = [
        { id: "light", label: "Light", icon: Sun },
        { id: "dark", label: "Dark", icon: Moon },
        { id: "system", label: "System", icon: Monitor },
    ];

    const accents: string[] = [
        "#6366f1",
        "#0ea5e9",
        "#10b981",
        "#f59e0b",
        "#ec4899",
        "#8b5cf6",
        "#f43f5e",
        "#14b8a6",
    ];

    const densities: DensityOption[] = [
        { id: "compact", label: "Compact", sub: "Tighter spacing" },
        { id: "comfortable", label: "Comfortable", sub: "Default spacing" },
        { id: "spacious", label: "Spacious", sub: "Extra breathing room" },
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">Appearance</h2>
                <p className="mt-0.5 text-sm text-gray-400">
                    Personalise how KanbanBoard looks for you
                </p>
            </div>
            <SectionTitle>Theme</SectionTitle>
            <div className="mb-6 grid grid-cols-3 gap-3">
                {themes.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => {
                            setTheme(id);
                            setDirty(true);
                        }}
                        className={`relative flex flex-col items-center gap-2 rounded-md border-2 p-4 transition-all ${theme === id ? "border-blue-500 bg-blue-50" : "bg-white hover:border-gray-300"}`}
                    >
                        <div
                            className={`rounded-md p-2 ${theme === id ? "bg-blue-100" : "bg-gray-100"}`}
                        >
                            <Icon
                                className={`size-5 ${theme === id ? "text-bright-blue" : "text-gray-500"}`}
                            />
                        </div>
                        <span
                            className={`text-xs font-semibold ${theme === id ? "text-blue-600" : "text-gray-600"}`}
                        >
                            {label}
                        </span>
                        {theme === id && (
                            <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-bright-blue">
                                <Check className="size-2.5 text-white" />
                            </span>
                        )}
                    </button>
                ))}
            </div>
            <SectionTitle>Accent colour</SectionTitle>
            <div className="mb-6 flex gap-3">
                {accents.map((c) => (
                    <button
                        key={c}
                        onClick={() => {
                            setAccent(c);
                            setDirty(true);
                        }}
                        className={`flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${accent === c ? "scale-110 ring-2 ring-gray-400 ring-offset-2" : ""}`}
                        style={{ background: c }}
                    >
                        {accent === c && (
                            <Check className="size-3.5 text-white" />
                        )}
                    </button>
                ))}
            </div>
            <SectionTitle>Density</SectionTitle>
            <div className="mb-6 grid grid-cols-3 gap-3">
                {densities.map(({ id, label, sub }) => (
                    <button
                        key={id}
                        onClick={() => {
                            setDensity(id);
                            setDirty(true);
                        }}
                        className={`flex flex-col gap-1 rounded-md border-2 p-3.5 text-left transition-all ${density === id ? "border-blue-500 bg-blue-50" : "bg-white hover:border-gray-300"}`}
                    >
                        <span
                            className={`text-xs font-bold ${density === id ? "text-blue-600" : "text-gray-700"}`}
                        >
                            {label}
                        </span>
                        <span className="text-xs text-gray-400">{sub}</span>
                    </button>
                ))}
            </div>
            <SectionTitle>Font</SectionTitle>
            <div className="mb-6 divide-y divide-gray-100 overflow-hidden rounded-md border px-5">
                <FieldRow
                    label="Interface font"
                    hint="Applied across the entire app"
                >
                    <Select
                        value={font}
                        onValueChange={(v: FontId) => {
                            setFont(v);
                            setDirty(true);
                        }}
                    >
                        <SelectTrigger className="h-8 w-44 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="system">
                                System default
                            </SelectItem>
                            <SelectItem value="geist">Geist</SelectItem>
                            <SelectItem value="ibm">IBM Plex Sans</SelectItem>
                            <SelectItem value="jetbrains">
                                JetBrains Mono
                            </SelectItem>
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

function DangerZone() {
    return (
        <div className="mt-8 border-t pt-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                Danger zone
            </p>
            <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50/40 p-4">
                <div>
                    <p className="text-sm font-bold text-rose-700">
                        Delete account
                    </p>
                    <p className="mt-0.5 text-xs text-rose-500">
                        This action is permanent and cannot be undone.
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1.5 border-rose-300 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-400"
                        >
                            <Trash2 className="size-3.5" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="size-5 text-rose-500" />
                                Delete your account?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete your account, all
                                your projects, tasks, and data. This action
                                cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="text-sm">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction className="bg-rose-600 text-sm hover:bg-rose-700">
                                Yes, delete everything
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

interface AccountSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function renderSection(id: SectionId): React.ReactNode {
    switch (id) {
        case "profile":
            return (
                <>
                    <ProfileSection />
                    <DangerZone />
                </>
            );
        case "security":
            return <SecuritySection />;
        case "notifications":
            return <NotificationsSection />;
        case "appearance":
            return <AppearanceSection />;
    }
}

export default function AccountSettingsModal({
    open,
    onOpenChange,
}: AccountSettingsModalProps) {
    const [activeSection, setActiveSection] = useState<SectionId>("profile");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] w-full max-w-[860px] flex-col gap-0 overflow-hidden rounded-md p-0 shadow-2xl">
                <div className="flex min-h-0 flex-1">
                    <aside className="flex w-52 flex-shrink-0 flex-col border-r bg-gray-50">
                        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
                            {GROUPS.map((group) => (
                                <div key={group} className="mb-4">
                                    <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        {group}
                                    </p>
                                    <div className="space-y-1">
                                        {NAV.filter(
                                            (n) => n.group === group,
                                        ).map((item) => {
                                            const Icon = item.icon;
                                            const active =
                                                activeSection === item.id;

                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() =>
                                                        setActiveSection(
                                                            item.id,
                                                        )
                                                    }
                                                    className={`flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-xs font-medium transition-all
                                                    ${
                                                        active
                                                            ? "bg-white font-semibold text-bright-blue shadow-sm"
                                                            : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                                    }`}
                                                >
                                                    <Icon
                                                        className={`size-3.5 flex-shrink-0 ${active ? "text-bright-blue" : "text-gray-400"}`}
                                                    />
                                                    {item.label}
                                                    {active && (
                                                        <ChevronRight className="ml-auto size-3 text-bright-blue" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                        <div className="border-t p-3">
                            <div className="mb-2 flex items-center gap-2 px-1">
                                <Avatar className="size-7">
                                    <AvatarFallback className="bg-blue-500 text-[10px] font-bold text-white">
                                        AK
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold text-gray-700">
                                        Alex Kovalenko
                                    </p>
                                    <p className="truncate text-[10px] text-gray-400">
                                        alex@acme.com
                                    </p>
                                </div>
                            </div>
                            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500">
                                <LogOut className="size-3.5" /> Sign out
                            </button>
                        </div>
                    </aside>
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <ScrollArea className="flex-1">
                            <div className="px-7 py-6">
                                {renderSection(activeSection)}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

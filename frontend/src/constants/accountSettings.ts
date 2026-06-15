import {
    DensityOption,
    NavGroup,
    NavItem,
    NotificationRow,
    NotificationSettings,
    ProfileForm,
    Session,
    SocialLink,
    ThemeOption,
} from "@/types/accountSettings";
import {
    GithubLogoIcon,
    GlobeIcon,
    LockKeyIcon,
    MonitorIcon,
    MoonIcon,
    PaletteIcon,
    SunIcon,
    TwitterLogoIcon,
    UserIcon,
} from "@phosphor-icons/react";

export const NAV: NavItem[] = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "security", label: "Security", icon: LockKeyIcon },
    // { id: "appearance", label: "Appearance", icon: PaletteIcon },
];

export const GROUPS: NavGroup[] = ["Account"];

export const socialLinks: SocialLink[] = [
    {
        key: "website",
        icon: GlobeIcon,
        label: "Website",
        placeholder: "https://…",
    },
    {
        key: "twitter",
        icon: TwitterLogoIcon,
        label: "Twitter",
        placeholder: "@handle",
    },
    {
        key: "github",
        icon: GithubLogoIcon,
        label: "GitHub",
        placeholder: "username",
    },
];

export const profileForm: ProfileForm = {
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
};

export const sessions: Session[] = [
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

export const rows: NotificationRow[] = [
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

export const notificationsSection: NotificationSettings = {
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
};

export const themes: ThemeOption[] = [
    { id: "light", label: "Light", icon: SunIcon },
    { id: "dark", label: "Dark", icon: MoonIcon },
    { id: "system", label: "System", icon: MonitorIcon },
];

export const accents: string[] = [
    "#6366f1",
    "#0ea5e9",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#f43f5e",
    "#14b8a6",
];

export const densities: DensityOption[] = [
    { id: "compact", label: "Compact", sub: "Tighter spacing" },
    { id: "comfortable", label: "Comfortable", sub: "Default spacing" },
    { id: "spacious", label: "Spacious", sub: "Extra breathing room" },
];

import { Icon } from "@phosphor-icons/react";

export type SectionId = "profile" | "security" | "appearance";

export type NavGroup = "Account";

export type ThemeId = "light" | "dark" | "system";
export type DensityId = "compact" | "comfortable" | "spacious";
export type FontId = "system" | "geist" | "ibm" | "jetbrains";
export type EmailDigest = "realtime" | "daily" | "weekly" | "never";

export interface NavItem {
    id: SectionId;
    label: string;
    icon: Icon;
    group?: NavGroup;
}

export interface ProfileForm {
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

export interface SocialLink {
    key: keyof ProfileForm;
    icon: Icon;
    label: string;
    placeholder: string;
}

export interface Session {
    device: string;
    location: string;
    current: boolean;
    time: string;
}

export interface NotificationSettings {
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

export type BooleanNotificationKey = {
    [K in keyof NotificationSettings]: NotificationSettings[K] extends boolean
        ? K
        : never;
}[keyof NotificationSettings];

export interface NotificationRow {
    key: BooleanNotificationKey;
    label: string;
    hint: string;
}

export interface ThemeOption {
    id: ThemeId;
    label: string;
    icon: Icon;
}

export interface DensityOption {
    id: DensityId;
    label: string;
    sub: string;
}

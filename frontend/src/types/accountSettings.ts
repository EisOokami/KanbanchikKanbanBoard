import { Icon } from "@phosphor-icons/react";

export type SectionId = "profile" | "security" | "ai" | "appearance";
export type NavGroup = "Account";
export type ThemeId = "light" | "dark" | "system";

export interface NavItem {
    id: SectionId;
    label: string;
    icon: Icon;
    group?: NavGroup;
}

export interface ThemeOption {
    id: ThemeId;
    label: string;
    icon: Icon;
}

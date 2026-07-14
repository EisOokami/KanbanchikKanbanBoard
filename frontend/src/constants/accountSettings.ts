import { NavItem, ThemeOption } from "@/types/accountSettings";
import {
    LockKeyIcon,
    MonitorIcon,
    MoonIcon,
    PaletteIcon,
    SunIcon,
    UserIcon,
} from "@phosphor-icons/react";

export const NAV: NavItem[] = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "security", label: "Security", icon: LockKeyIcon },
    { id: "appearance", label: "Appearance", icon: PaletteIcon },
];

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

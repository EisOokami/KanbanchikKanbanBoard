import { NavSection } from "@/types/projectSettingsDialog";
import {
    ArchiveIcon,
    ColumnsIcon,
    GearSixIcon,
    Icon,
    TagIcon,
    TagSimpleIcon,
    UsersIcon,
} from "@phosphor-icons/react";

export const NAV_ITEMS: {
    id: NavSection;
    label: string;
    icon: Icon;
}[] = [
    { id: "general", label: "General", icon: GearSixIcon },
    { id: "columns", label: "Columns", icon: ColumnsIcon },
    { id: "categories", label: "Categories", icon: TagIcon },
    { id: "labels", label: "Labels", icon: TagSimpleIcon },
    { id: "members", label: "Members", icon: UsersIcon },
    { id: "danger", label: "Danger zone", icon: ArchiveIcon },
];

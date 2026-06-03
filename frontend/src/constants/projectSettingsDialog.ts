import { NavSection } from "@/types/projectSettingsDialog";
import {
    Archive,
    FolderOpen,
    LayoutGrid,
    LucideProps,
    Settings,
    Tag,
    Users,
} from "lucide-react";
import { FC } from "react";

export const NAV_ITEMS: {
    id: NavSection;
    label: string;
    icon: FC<LucideProps>;
}[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "columns", label: "Columns", icon: LayoutGrid },
    { id: "categories", label: "Categories", icon: FolderOpen },
    { id: "labels", label: "Labels", icon: Tag },
    { id: "members", label: "Members", icon: Users },
    { id: "danger", label: "Danger zone", icon: Archive },
];

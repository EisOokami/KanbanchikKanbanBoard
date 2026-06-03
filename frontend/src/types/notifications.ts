import { LucideProps } from "lucide-react";

export type NotificationType =
    | "mention"
    | "comment"
    | "assignment"
    | "due"
    | "status"
    | "at_risk"
    | "completed"
    | "sprint";

export type TeamMember = "AK" | "JS" | "MO" | "KL" | "NP";

export type TabValue = "all" | "unread" | "pinned" | "archived";

export interface Notification {
    id: number;
    type: NotificationType;
    read: boolean;
    pinned: boolean;
    archived: boolean;
    actor: TeamMember | null;
    time: number;
    project: string;
    projectColor: string;
    title: string;
    body: string;
    task: string | null;
    action: string | null;
}

export interface NotificationGroup {
    label: string;
    items: Notification[];
}

export interface TypeConfig {
    label: string;
    icon: React.FC<LucideProps>;
    color: string;
    bg: string;
    text: string;
}

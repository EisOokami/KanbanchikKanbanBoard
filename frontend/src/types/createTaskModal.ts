import { Attachment, Priority, Subtask } from "./types";

export interface TaskFormData {
    title: string;
    description: string;
    startDate: Date | undefined;
    dueDate: Date | undefined;
    priority: Priority | null;
    categories: string[];
    members: number[];
    attachments: Attachment[];
    subtasks: Subtask[];
}

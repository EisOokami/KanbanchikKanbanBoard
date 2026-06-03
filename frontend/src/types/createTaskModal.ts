import { Attachment, Priority, Subtask } from "./types";

export interface TaskFormData {
    title: string;
    description: string;
    dueDate: Date | undefined;
    priority: Priority | null;
    categories: string[];
    assignees: number[];
    attachments: Attachment[];
    subtasks: Subtask[];
}

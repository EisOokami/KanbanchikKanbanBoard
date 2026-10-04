import { User } from "./types";
import type { Comment } from "@/types/types";

export type ActivityComment = {
    id: number;
    type: "comment";
    author: Omit<User, "email"> | null;
    body: string;
    timestamp: Date;
};

export type ActivityChange = {
    id: number;
    type: "change";
    author: Omit<User, "email"> | null;
    field: string;
    from: string;
    to: string;
    timestamp: Date;
};

export type ActivityEntry = ActivityComment | ActivityChange;

export interface DisplayComment {
    id: number;
    member: Omit<User, "email"> | null;
    body: string;
    createdAt: string | null;
    isNew: boolean;
    isEdited: boolean;
}

export interface AddCommentAction {
    type: "add";
    comment: Comment;
}

export interface UpdateCommentAction {
    type: "update";
    id: number;
    body: string;
    updatedAt: string;
}

export interface DeleteCommentAction {
    type: "delete";
    id: number;
}

export type OptimisticCommentAction =
    | AddCommentAction
    | UpdateCommentAction
    | DeleteCommentAction;

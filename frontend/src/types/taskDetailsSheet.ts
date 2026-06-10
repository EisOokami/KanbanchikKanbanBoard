import { User } from "./types";

export type ActivityComment = {
    id: number;
    type: "comment";
    author: Omit<User, "email">;
    body: string;
    timestamp: Date;
};

export type ActivityChange = {
    id: number;
    type: "change";
    author: Omit<User, "email">;
    field: string;
    from: string;
    to: string;
    timestamp: Date;
};

export type ActivityEntry = ActivityComment | ActivityChange;

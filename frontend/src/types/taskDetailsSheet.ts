import { Member } from "./types";

export type ActivityComment = {
    id: number;
    type: "comment";
    author: Omit<Member, "email">;
    body: string;
    timestamp: Date;
};

export type ActivityChange = {
    id: number;
    type: "change";
    author: Omit<Member, "email">;
    field: string;
    from: string;
    to: string;
    timestamp: Date;
};

export type ActivityEntry = ActivityComment | ActivityChange;

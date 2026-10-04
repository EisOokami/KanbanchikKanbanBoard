"use client";

import { getInitials } from "@/libs/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import { Textarea } from "../../shadcn/textarea";
import { Button } from "../../shadcn/button";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { UpdateTaskFormData, User } from "@/types/types";
import { useState } from "react";
import { ActivityEntry } from "@/types/taskDetailsSheet";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface CommentsSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    formData: UpdateTaskFormData;
    userData: Omit<User, "email">;
    activity: ActivityEntry[];
    onActivityChange: (activity: ActivityEntry[]) => void;
    onFormDataChange: (formData: UpdateTaskFormData) => void;
}

export default function CommentsSection({
    formState,
    isPending,
    formData,
    userData,
    // activity,
    // onActivityChange,
    onFormDataChange,
}: Readonly<CommentsSectionProps>) {
    const [newComment, setNewComment] = useState<string>("");

    const addComment = () => {
        if (!newComment.trim()) {
            return;
        }

        const comment = {
            id: Date.now(),
            member: userData,
            body: newComment.trim(),
        };

        onFormDataChange({
            ...formData,
            newComments: [...formData.newComments, comment],
        });
        // onActivityChange([...activity, entry]);
        setNewComment("");
    };

    return (
        <div className="space-y-2">
            <div className="mt-5 flex items-start gap-3">
                <Avatar className="mt-1 size-7 shrink-0">
                    <AvatarImage src={userData.avatar_url} />
                    <AvatarFallback
                        className="text-[10px] font-medium text-white"
                        style={{ background: userData.color }}
                    >
                        {getInitials(userData.name, userData.surname)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                                addComment();
                        }}
                        rows={3}
                        className="resize-none rounded-md bg-control text-xs placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                        disabled={isPending}
                    />
                    {newComment.trim() && (
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-300">
                                ⌘ + Enter to send
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setNewComment("")}
                                    className="h-7 px-3 text-xs text-control-text hover:bg-control-active"
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addComment}
                                    className="h-7 gap-2 bg-bright-blue px-3 text-xs text-white hover:bg-blue-600 [&_svg]:size-3.5"
                                    disabled={isPending}
                                >
                                    <PaperPlaneTiltIcon
                                        weight="duotone"
                                        size={14}
                                    />
                                    Send
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <ZodErrors error={formState?.zodErrors?.comments} />
            </div>
        </div>
    );
}

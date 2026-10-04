"use client";

import { getInitials } from "@/libs/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import { Textarea } from "../../shadcn/textarea";
import { Button } from "../../shadcn/button";
import {
    CheckIcon,
    PaperPlaneTiltIcon,
    PencilSimpleIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import { Comment, Task, User } from "@/types/types";
import { useOptimistic, useState, useTransition } from "react";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import {
    applyCommentAction,
    commentsToActivity,
    formatDateTime,
} from "@/libs/taskDetailsSheet";
import {
    createCommentAction,
    deleteCommentAction,
    updateCommentAction,
} from "@/data/actions";
import { getTaskData } from "@/data/loaders";
import { ActivityEntry } from "@/types/taskDetailsSheet";

interface CommentsSectionProps {
    task: Task;
    isPending: boolean;
    userData: Omit<User, "email">;
    commentsData: Comment[];
    canModerate: boolean;
    onTaskChange: (task: Task) => void;
    onActivityChange: (activity: ActivityEntry[]) => void;
}

export default function CommentsSection({
    task,
    isPending,
    userData,
    commentsData,
    canModerate,
    onTaskChange,
    onActivityChange,
}: Readonly<CommentsSectionProps>) {
    const [comments, applyOptimistic] = useOptimistic(
        commentsData,
        applyCommentAction,
    );
    const [isMutating, startTransition] = useTransition();
    const [newComment, setNewComment] = useState<string>("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editBody, setEditBody] = useState<string>("");
    const [errors, setErrors] = useState<string[] | undefined>(undefined);

    const isBusy = isPending || isMutating;

    const syncComments = async () => {
        try {
            const updatedTask = await getTaskData(task.id);

            startTransition(() => {
                onTaskChange({
                    ...task,
                    comments: updatedTask.comments,
                });
                onActivityChange(commentsToActivity(updatedTask.comments));
            });
        } catch {
            setErrors(["Failed to refresh comments"]);
        }
    };

    const addComment = () => {
        const body = newComment.trim();

        if (!body) {
            return;
        }

        setErrors(undefined);
        setNewComment("");

        startTransition(async () => {
            applyOptimistic({
                type: "add",
                comment: {
                    id: -Date.now(),
                    member: userData,
                    body,
                    created_at: new Date().toISOString(),
                    updated_at: null,
                },
            });

            const result = await createCommentAction(task.id, body);

            if (result.status === "error") {
                setErrors(result.zodErrors?.body ?? [result.message]);
                setNewComment(body);

                return;
            }

            await syncComments();
        });
    };

    const startEdit = (comment: Comment) => {
        setEditingId(comment.id);
        setEditBody(comment.body);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditBody("");
    };

    const saveEdit = (comment: Comment) => {
        const body = editBody.trim();

        if (!body) {
            return;
        }

        if (body === comment.body) {
            cancelEdit();

            return;
        }

        setErrors(undefined);
        cancelEdit();

        startTransition(async () => {
            applyOptimistic({
                type: "update",
                id: comment.id,
                body,
                updatedAt: new Date().toISOString(),
            });

            const result = await updateCommentAction(task.id, comment.id, body);

            if (result.status === "error") {
                setErrors(result.zodErrors?.body ?? [result.message]);

                return;
            }

            await syncComments();
        });
    };

    const removeComment = (comment: Comment) => {
        setErrors(undefined);

        if (editingId === comment.id) {
            cancelEdit();
        }

        startTransition(async () => {
            applyOptimistic({ type: "delete", id: comment.id });

            const result = await deleteCommentAction(task.id, comment.id);

            if (result.status === "error") {
                setErrors([result.message]);

                return;
            }

            await syncComments();
        });
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
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                e.preventDefault();
                                addComment();
                            }
                        }}
                        rows={3}
                        maxLength={2000}
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
                                    disabled={isBusy}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addComment}
                                    className="h-7 gap-2 bg-bright-blue px-3 text-xs text-white hover:bg-blue-600 [&_svg]:size-3.5"
                                    disabled={isBusy}
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
            {comments.length > 0 && (
                <ul className="space-y-4 pt-2">
                    {comments.map((comment) => {
                        const isSending = comment.id < 0;
                        const isEditing = editingId === comment.id;
                        const isAuthor = comment.member
                            ? comment.member.id === userData.id
                            : false;
                        const canEdit = isAuthor;
                        const canDelete = isAuthor || canModerate;
                        const showActions =
                            (canEdit || canDelete) && !isSending && !isEditing;

                        return (
                            <li key={comment.id} className="group flex gap-3">
                                <Avatar className="mt-0.5 size-7 shrink-0">
                                    {comment.member && (
                                        <AvatarImage
                                            src={
                                                comment.member.avatar_url ??
                                                undefined
                                            }
                                        />
                                    )}
                                    <AvatarFallback
                                        className="text-[10px] font-medium text-white"
                                        style={{
                                            background:
                                                comment.member &&
                                                comment.member.color
                                                    ? comment.member.color
                                                    : "#6b7280",
                                        }}
                                    >
                                        {comment.member
                                            ? getInitials(
                                                  comment.member.name,
                                                  comment.member.surname,
                                              )
                                            : "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={
                                                comment.member
                                                    ? "text-xs font-medium"
                                                    : "text-xs font-medium italic text-control-text"
                                            }
                                        >
                                            {comment.member
                                                ? `${comment.member.name} ${comment.member.surname}`
                                                : "Deleted user"}
                                        </span>
                                        <p className="text-[10px] text-control-text">
                                            {formatDateTime(
                                                comment.created_at instanceof
                                                    Date
                                                    ? comment.created_at.toISOString()
                                                    : comment.created_at,
                                            )}
                                        </p>
                                        {comment.updated_at && (
                                            <span className="text-[10px] text-control-text">
                                                (edited)
                                            </span>
                                        )}
                                        {isSending && (
                                            <span className="rounded bg-control px-1.5 py-0.5 text-[10px] text-control-text">
                                                Sending...
                                            </span>
                                        )}
                                        {showActions && (
                                            <div className="ml-auto flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                                                {canEdit && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        aria-label="Edit comment"
                                                        onClick={() =>
                                                            startEdit(comment)
                                                        }
                                                        className="size-6 text-control-text hover:bg-control-active"
                                                        disabled={isBusy}
                                                    >
                                                        <PencilSimpleIcon
                                                            weight="duotone"
                                                            size={14}
                                                        />
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        aria-label="Delete comment"
                                                        onClick={() =>
                                                            removeComment(
                                                                comment,
                                                            )
                                                        }
                                                        className="size-6 text-control-text hover:bg-control-active"
                                                        disabled={isBusy}
                                                    >
                                                        <TrashIcon
                                                            weight="duotone"
                                                            size={14}
                                                        />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {isEditing ? (
                                        <div className="mt-1">
                                            <Textarea
                                                autoFocus
                                                value={editBody}
                                                onChange={(e) =>
                                                    setEditBody(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "Enter" &&
                                                        (e.metaKey || e.ctrlKey)
                                                    ) {
                                                        e.preventDefault();
                                                        saveEdit(comment);
                                                    }
                                                }}
                                                rows={3}
                                                maxLength={2000}
                                                className="resize-none rounded-md bg-control text-xs focus-visible:ring-1 focus-visible:ring-bright-blue"
                                                disabled={isPending}
                                            />
                                            <div className="mt-2 flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={cancelEdit}
                                                    className="h-7 px-3 text-xs text-control-text hover:bg-control-active"
                                                    disabled={isBusy}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() =>
                                                        saveEdit(comment)
                                                    }
                                                    className="h-7 gap-2 bg-bright-blue px-3 text-xs text-white hover:bg-blue-600 [&_svg]:size-3.5"
                                                    disabled={
                                                        isBusy ||
                                                        !editBody.trim()
                                                    }
                                                >
                                                    <CheckIcon
                                                        weight="duotone"
                                                        size={14}
                                                    />
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-0.5 whitespace-pre-wrap break-words text-xs">
                                            {comment.body}
                                        </p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            <div>
                <ZodErrors error={errors} />
            </div>
        </div>
    );
}

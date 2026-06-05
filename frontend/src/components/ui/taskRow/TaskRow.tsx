import { cn, formatDate, getInitials, isOverdue } from "@/libs/utils";
import {
    Calendar,
    Flame,
    MessageSquare,
    MoreHorizontal,
    Paperclip,
    Trash2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import { Button } from "../shadcn/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../shadcn/alert-dialog";
import { Task } from "@/types/types";
import { Progress } from "../shadcn/progress";
import { COLUMNS_CONFIG, PRIORITY_CONFIG } from "@/constants/constants";

interface TaskRowProps {
    task: Task;
    onDelete: (id: number) => void;
    projectName: string;
}

export default function TaskRow({
    task,
    onDelete,
    projectName,
}: Readonly<TaskRowProps>) {
    const priority = PRIORITY_CONFIG[task.priority];
    const column = COLUMNS_CONFIG[task.column];
    const overdue = isOverdue(task.due_date, task.column);
    const progress = Math.round(
        ((task.subtasksDone ?? 0) * 100) / (task.subtasksTotal ?? 1),
    );

    return (
        <tr className="group cursor-pointer border-b transition-colors duration-100">
            <td className="w-24 py-3 pl-8 pr-2">
                <span className="font-mono text-xs font-medium text-gray-400">
                    {task.id}
                </span>
            </td>
            <td className="min-w-[240px] py-3 pr-4">
                <span className="text-sm font-semibold leading-snug text-gray-800">
                    {task.title}
                </span>
                {task.labels.length > 0 && (
                    <div className="mt-1 flex gap-1">
                        {task.labels.slice(0, 2).map((l) => (
                            <span
                                key={l}
                                className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500"
                            >
                                {l}
                            </span>
                        ))}
                        {task.labels.length > 2 && (
                            <span className="text-[10px] text-gray-400">
                                +{task.labels.length - 2}
                            </span>
                        )}
                        {task.categories.length > 0 && (
                            <span className="rounded-md bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                                {task.categories
                                    .map((category) => category.name)
                                    .join(", ")}
                            </span>
                        )}
                    </div>
                )}
            </td>
            <td className="w-36 py-3 pr-4">
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
                        column.pill,
                    )}
                >
                    <span className={cn("size-1.5 rounded-full", column.dot)} />
                    {column.label}
                </span>
            </td>
            <td className="w-28 py-3 pr-4">
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
                        priority.pill,
                    )}
                >
                    <span
                        className={cn("size-1.5 rounded-full", priority.dot)}
                    />
                    {priority.label}
                </span>
            </td>
            <td className="w-36 py-3 pr-4">
                <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold">
                    {projectName}
                </span>
            </td>
            <td className="w-28 py-3 pr-4">
                <div className="flex -space-x-1.5">
                    {task.assignees.slice(0, 3).map((assignee) => (
                        <Tooltip key={assignee.id}>
                            <TooltipTrigger asChild>
                                <Avatar className="size-6 ring-2 ring-white">
                                    <AvatarImage
                                        src={assignee.avatar_url}
                                        alt={assignee.name}
                                    />
                                    <AvatarFallback className="text-[9px] font-medium">
                                        {getInitials(
                                            assignee.name,
                                            assignee.surname,
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                {assignee.name} {assignee.surname}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                    {task.assignees.length > 3 && (
                        <div className="z-10 flex size-6 items-center justify-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-500 ring-2 ring-white">
                            +{task.assignees.length - 3}
                        </div>
                    )}
                </div>
            </td>
            <td className="w-28 py-3 pr-4">
                {task.due_date && (
                    <div
                        className={cn(
                            "flex items-center gap-1 text-xs font-semibold",
                            overdue ? "text-rose-500" : "text-gray-500",
                        )}
                    >
                        {overdue ? (
                            <Flame className="size-3" />
                        ) : (
                            <Calendar className="size-3" />
                        )}
                        {formatDate(task.due_date)}
                    </div>
                )}
            </td>
            <td className="w-24 py-3 pr-4">
                {task.subtasksTotal && task.subtasksTotal > 0 && (
                    <div className="flex items-center gap-2">
                        <Progress
                            value={progress}
                            className="h-1 w-12 [&>*]:bg-bright-blue"
                        />
                        <span className="text-[10px] text-gray-400">
                            {task.subtasksDone ?? 0}/{task.subtasksTotal ?? 0}
                        </span>
                    </div>
                )}
            </td>
            <td className="w-24 py-3 pr-4">
                <div className="flex items-center gap-2.5 text-gray-400">
                    {task.comments.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px]">
                            <MessageSquare className="size-3" />{" "}
                            {task.comments.length}
                        </span>
                    )}
                    {task.attachments.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px]">
                            <Paperclip className="size-3" />{" "}
                            {task.attachments.length}
                        </span>
                    )}
                </div>
            </td>
            <td className="w-10 py-3 pr-3" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <MoreHorizontal className="size-3.5 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className="cursor-pointer gap-2 text-xs text-rose-500 focus:text-rose-500"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <Trash2 className="size-3.5" /> Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Delete task?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        &quot;{task.title}&quot; will be
                                        permanently deleted. This cannot be
                                        undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onDelete(task.id)}
                                        className="bg-rose-600 hover:bg-rose-700"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
}

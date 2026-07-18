"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mutateData } from "./mutateData";
import {
    BaseAction,
    ChangePasswordAction,
    CreateProjectAction,
    CreateTaskAction,
    ForgotPasswordAction,
    InviteMemberAction,
    LoginAction,
    RegisterAction,
    ResetPasswordAction,
    UpdateProfileAction,
    UpdateProjectAction,
    UpdateTaskAction,
} from "@/types/actions";
import {
    forgotPasswordService,
    loginService,
    registerService,
    resetPasswordService,
} from "./service";
import {
    Attachment,
    Category,
    Column,
    Label,
    Role,
    Subtask,
    User,
} from "@/types/types";
import { revalidatePath } from "next/cache";
import {
    changePasswordSchema,
    createProjectSchema,
    createTaskSchema,
    forgotPasswordSchema,
    inviteMemberSchema,
    loginSchema,
    moveTaskSchema,
    registerSchema,
    resetPasswordSchema,
    updateProfileSchema,
    updateProjectSchema,
    updateTaskSchema,
} from "@/libs/validation/validation";

const accessTokenConfig = {
    maxAge: 15 * 60,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
};
const refreshTokenConfig = {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};

export async function loginAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<LoginAction | undefined> {
    const validatedFields = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await loginService(validatedFields.data);

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if ("refreshToken" in responseData && "accessToken" in responseData) {
        const cookieStore = await cookies();
        cookieStore.set(
            "refreshToken",
            responseData.refreshToken,
            refreshTokenConfig,
        );
        cookieStore.set(
            "accessToken",
            responseData.accessToken,
            accessTokenConfig,
        );

        const redirectPath = formData.get("redirect")?.toString();
        redirect(redirectPath ?? "/overview");
    }
}

export async function registerAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<RegisterAction | undefined> {
    const validatedFields = registerSchema.safeParse({
        name: formData.get("name"),
        surname: formData.get("surname"),
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await registerService(validatedFields.data);

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if ("refreshToken" in responseData && "accessToken" in responseData) {
        const cookieStore = await cookies();
        cookieStore.set(
            "refreshToken",
            responseData.refreshToken,
            refreshTokenConfig,
        );
        cookieStore.set(
            "accessToken",
            responseData.accessToken,
            accessTokenConfig,
        );

        redirect("/overview");
    }
}

export async function logoutAction() {
    const responseData = await mutateData("POST", "/auth/logout");

    if (!responseData) {
        console.error("Unauthorized or invalid token");
    }

    if (
        responseData &&
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        console.error(responseData.message);
    }

    const cookieStore = await cookies();

    cookieStore.delete("refreshToken");
    cookieStore.delete("accessToken");
}

export async function forgotPasswordAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<ForgotPasswordAction | undefined> {
    const validatedFields = forgotPasswordSchema.safeParse({
        email: formData.get("email"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await forgotPasswordService(validatedFields.data);

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }
}

export async function resetPasswordAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<ResetPasswordAction | undefined> {
    const validatedFields = resetPasswordSchema.safeParse({
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
        id: formData.get("id"),
        token: formData.get("token"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await resetPasswordService({
        token: validatedFields.data.token,
        password: validatedFields.data.newPassword,
        id: +validatedFields.data.id,
    });

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if ("refreshToken" in responseData && "accessToken" in responseData) {
        const cookieStore = await cookies();
        cookieStore.set(
            "refreshToken",
            responseData.refreshToken,
            refreshTokenConfig,
        );
        cookieStore.set(
            "accessToken",
            responseData.accessToken,
            accessTokenConfig,
        );

        redirect("/overview");
    }
}

export async function createProjectAction(
    data: {
        labels: Omit<Label, "created_at" | "updated_at" | "id">[];
        columns: Omit<Column, "tasks" | "updated_at" | "created_at" | "id">[];
        categories: Omit<Category, "updated_at" | "created_at" | "id">[];
        members: string[];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<CreateProjectAction | undefined> {
    const validatedFields = createProjectSchema.safeParse({
        icon: formData.get("icon"),
        color: formData.get("color"),
        name: formData.get("name"),
        description: formData.get("description"),
        status: formData.get("status"),
        showPriorityEmoji: formData.get("show-priority-emoji"),
        members: data.members,
        columns: data.columns,
        categories: data.categories,
        labels: data.labels,
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData(
        "POST",
        "/projects",
        validatedFields.data,
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    revalidatePath(`/overview`);

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }
}

export async function updateProjectAction(
    data: {
        labels: Label[];
        newLabels: Omit<Label, "updated_at" | "created_at">[];
        deletedLabelIds: number[];
        columns: Omit<Column, "tasks">[];
        newColumns: Omit<Column, "tasks" | "updated_at" | "created_at">[];
        deletedColumnIds: number[];
        categories: Category[];
        newCategories: Omit<Category, "updated_at" | "created_at">[];
        deletedCategoryIds: number[];
        members: Omit<User, "email">[];
        emails: string[];
    },
    currentPath: string | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<UpdateProjectAction | undefined> {
    const validatedFields = updateProjectSchema.safeParse({
        slug: formData.get("slug"),
        icon: formData.get("icon"),
        color: formData.get("color"),
        name: formData.get("name"),
        description: formData.get("description"),
        status: formData.get("status"),
        showPriorityEmoji: formData.get("show-priority-emoji"),
        members: data.members,
        columns: data.columns,
        newColumns: data.newColumns,
        deletedColumnIds: data.deletedColumnIds,
        categories: data.categories,
        newCategories: data.newCategories,
        deletedCategoryIds: data.deletedCategoryIds,
        labels: data.labels,
        newLabels: data.newLabels,
        deletedLabelIds: data.deletedLabelIds,
        emails: data.emails,
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData(
        "PUT",
        `/projects/${validatedFields.data.slug}`,
        validatedFields.data,
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if (currentPath) {
        revalidatePath(currentPath);
    }

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }
}

export async function deleteProjectAction(
    slug: string,
): Promise<{ ok: boolean; message: string } | undefined> {
    const responseData = await mutateData("DELETE", `/projects/${slug}`);

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status &&
        responseData.status === "error"
    ) {
        return {
            ok: false,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Failed to delete a project",
        };
    }

    redirect("/overview");
}

export async function createTaskAction(
    data: {
        members: Omit<User, "email">[];
        categories: Category[];
        newCategories: Omit<Category, "created_at" | "updated_at">[];
        subtasks: Omit<Subtask, "created_at">[];
        attachments: { id: number | string; file: File }[];
        labels: Label[];
        newLabels: Omit<Label, "created_at" | "updated_at">[];
    },
    currentPath: string | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<CreateTaskAction | undefined> {
    const validatedFields = createTaskSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        startDate: formData.get("start-date"),
        dueDate: formData.get("due-date"),
        priority: formData.get("priority"),
        slug: formData.get("slug"),
        columnId: formData.get("column-id"),
        showProgress: formData.get("show-progress"),
        members: data.members,
        categories: data.categories,
        newCategories: data.newCategories,
        subtasks: data.subtasks,
        attachments: data.attachments.map((attachment) => attachment.file),
        labels: data.labels,
        newLabels: data.newLabels,
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData(
        "POST",
        "/tasks",
        validatedFields.data,
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    const body = new FormData();

    if (
        validatedFields.data.attachments &&
        validatedFields.data.attachments.length &&
        "message" in responseData &&
        "status" in responseData &&
        responseData.data
    ) {
        validatedFields.data.attachments.forEach((attachment) => {
            body.append("files", attachment);
        });

        body.append("taskId", responseData.data.id);

        const uploadResponseData = await mutateData(
            "POST",
            "/uploads/multiple",
            body,
            true,
        );

        if (!uploadResponseData) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: null,
                details: null,
                message: "Ops! Something went wrong. Please try again.",
            };
        }

        if (
            "message" in uploadResponseData &&
            "status" in uploadResponseData &&
            uploadResponseData.message &&
            uploadResponseData.status !== "success"
        ) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: uploadResponseData.status,
                details: null,
                message: uploadResponseData.message,
            };
        }

        if ("error" in uploadResponseData && uploadResponseData.error) {
            return {
                formData,
                zodErrors: null,
                error: uploadResponseData.error,
                status: null,
                details: uploadResponseData.details,
                message: null,
            };
        }
    }

    if (currentPath) {
        revalidatePath(currentPath, "page");
    }

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: responseData.data,
        };
    }
}

export async function updateTaskAction(
    data: {
        categories: Category[];
        members: Omit<User, "email">[];
        subtasks: Omit<Subtask, "created_at">[];
        newSubtasks: Omit<Subtask, "created_at">[];
        attachments: Attachment[];
        newAttachments: { id: number | string; file: File }[];
        labels: Label[];
    },
    currentPath: string | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<UpdateTaskAction | undefined> {
    const validatedFields = updateTaskSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        startDate: formData.get("start-date"),
        dueDate: formData.get("due-date"),
        priority: formData.get("priority"),
        taskId: formData.get("task-id"),
        columnId: formData.get("column-id"),
        showProgress: formData.get("show-progress"),
        members: data.members,
        categories: data.categories,
        subtasks: data.subtasks,
        newSubtasks: data.newSubtasks,
        newAttachments: data.newAttachments.map(
            (attachment) => attachment.file,
        ),
        labels: data.labels,
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData(
        "PUT",
        `/tasks/${validatedFields.data.taskId}`,
        validatedFields.data,
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    const body = new FormData();

    if (
        validatedFields.data.newAttachments &&
        validatedFields.data.newAttachments.length
    ) {
        validatedFields.data.newAttachments.forEach((file) => {
            body.append("files", file);
        });

        body.append("taskId", validatedFields.data.taskId.toString());

        const uploadResponseData = await mutateData(
            "POST",
            "/uploads/multiple",
            body,
            true,
        );

        if (!uploadResponseData) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: null,
                details: null,
                message: "Ops! Something went wrong. Please try again.",
            };
        }

        if (
            "message" in uploadResponseData &&
            "status" in uploadResponseData &&
            uploadResponseData.message &&
            uploadResponseData.status !== "success"
        ) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: uploadResponseData.status,
                details: null,
                message: uploadResponseData.message,
            };
        }

        if ("error" in uploadResponseData && uploadResponseData.error) {
            return {
                formData,
                zodErrors: null,
                error: uploadResponseData.error,
                status: null,
                details: uploadResponseData.details,
                message: null,
            };
        }
    }

    if (currentPath) {
        revalidatePath(currentPath, "page");
    }

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: responseData.data,
        };
    }
}

export async function deleteTaskAction(
    taskId: number,
    currentPath?: string,
): Promise<{ ok: boolean; message: string } | undefined> {
    const responseData = await mutateData("DELETE", `/tasks/${taskId}`);

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
    ) {
        return {
            ok: false,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Failed to delete a task",
        };
    }

    if (currentPath) {
        revalidatePath(currentPath, "page");
    }

    return {
        ok: true,
        message: "Task has been deleted",
    };
}

export async function updateProfileAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<UpdateProfileAction | undefined> {
    const validatedFields = updateProfileSchema.safeParse({
        avatar: formData.get("avatar"),
        name: formData.get("name"),
        surname: formData.get("surname"),
        email: formData.get("email"),
        color: formData.get("color"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const file = new FormData();

    if (validatedFields.data.avatar) {
        file.append("file", validatedFields.data.avatar);

        const uploadResponseData = await mutateData(
            "POST",
            "/uploads/avatar",
            file,
            true,
        );

        if (!uploadResponseData) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: null,
                details: null,
                message: "Ops! Something went wrong. Please try again.",
            };
        }

        if (
            "message" in uploadResponseData &&
            "status" in uploadResponseData &&
            uploadResponseData.message &&
            uploadResponseData.status !== "success"
        ) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: uploadResponseData.status,
                details: null,
                message: uploadResponseData.message,
            };
        }

        if ("error" in uploadResponseData && uploadResponseData.error) {
            return {
                formData,
                zodErrors: null,
                error: uploadResponseData.error,
                status: null,
                details: uploadResponseData.details,
                message: null,
            };
        }
    }

    const responseData = await mutateData(
        "POST",
        "/users/update-profile",
        validatedFields.data,
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    revalidatePath("/", "layout");

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: responseData.data,
        };
    }
}

export async function deleteAccountAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<Pick<BaseAction, "status" | "message"> | undefined> {
    const id = formData.get("id");

    const responseData = await mutateData("DELETE", `/users/${id}`);

    if (!responseData) {
        return {
            status: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            status: responseData.status,
            message: responseData.message,
        };
    }

    await logoutAction();

    redirect("/");
}

export async function changePasswordAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<ChangePasswordAction | undefined> {
    const validatedFields = changePasswordSchema.safeParse({
        currentPassword: formData.get("current-password"),
        newPassword: formData.get("new-password"),
        confirmPassword: formData.get("confirm-password"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData("POST", "/users/change-password", {
        currentPassword: validatedFields.data.currentPassword,
        newPassword: validatedFields.data.newPassword,
    });

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    revalidatePath("/", "layout");

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: responseData.data,
        };
    }
}

export async function moveTaskAction(data: {
    taskId: number;
    columnId: number;
    position: number;
    projectId: number;
}): Promise<Pick<BaseAction, "status" | "message" | "zodErrors"> | undefined> {
    const validatedFields = moveTaskSchema.safeParse({
        taskId: data.taskId,
        columnId: data.columnId,
        position: data.position,
    });

    if (!validatedFields.success) {
        return {
            status: "error",
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            message: null,
        };
    }

    const responseData = await mutateData(
        "PATCH",
        `/tasks/${data.taskId}/move`,
        {
            taskId: data.taskId,
            columnId: data.columnId,
            position: data.position,
        },
    );

    if (!responseData) {
        return {
            status: null,
            zodErrors: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            status: responseData.status,
            zodErrors: null,
            message: responseData.message,
        };
    }

    revalidatePath(`/project`);
}

export async function deleteAttachmentAction(
    attachmentId: number,
): Promise<{ ok: boolean; message: string } | undefined> {
    const responseData = await mutateData("DELETE", `/uploads/${attachmentId}`);

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status
    ) {
        return {
            ok: responseData.status === "error" ? false : true,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Failed to delete a attachment",
        };
    }

    return {
        ok: true,
        message: "Attachment has been deleted",
    };
}

export async function deleteAvatarAction(
    avatar_url: string,
): Promise<{ ok: boolean; message: string } | undefined> {
    const responseData = await mutateData("DELETE", `/uploads/avatar`, {
        avatar_url,
    });

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status
    ) {
        return {
            ok: responseData.status === "error" ? false : true,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Failed to delete a avatar",
        };
    }

    revalidatePath("/");

    return {
        ok: true,
        message: "Avatar has been deleted",
    };
}

export async function generateInviteAction(
    projectId: number,
): Promise<{ ok: boolean; message: string; inviteUrl?: string } | undefined> {
    const responseData = await mutateData(
        "POST",
        `/invites/generate/${projectId}`,
    );

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
    ) {
        return {
            ok: false,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Failed to accept a invite",
        };
    }

    if ("data" in responseData && responseData.data) {
        return {
            ok: true,
            message: "Invitation has been accepted",
            inviteUrl: responseData.data.inviteUrl,
        };
    }
}

export async function acceptInviteAction(
    token: string,
): Promise<{ ok: boolean; message: string; projectId?: number } | undefined> {
    const responseData = await mutateData("POST", `/invites/accept`, {
        token,
    });

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status
    ) {
        return {
            ok: responseData.status === "error" ? false : true,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Failed to accept a invite",
        };
    }

    if (
        "data" in responseData &&
        responseData.data &&
        "projectId" in responseData.data
    ) {
        return {
            ok: true,
            message: "Invitation has been accepted",
            projectId: responseData.data.projectId,
        };
    }

    return {
        ok: true,
        message: "Invitation has been accepted",
    };
}

export async function inviteMemberAction(
    invites: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<InviteMemberAction | undefined> {
    const validatedFields = inviteMemberSchema.safeParse({
        projectId: formData.get("projectId"),
        role: formData.get("role"),
        members: invites,
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData(
        "POST",
        `/invites/member`,
        validatedFields.data,
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }
}

export async function changeRoleAction(
    slug: string,
    memberId: number,
    role: Role,
): Promise<{ ok: boolean; message: string } | undefined> {
    const responseData = await mutateData(
        "POST",
        `/projects/change-role/${slug}`,
        {
            memberId,
            role,
        },
    );

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status
    ) {
        return {
            ok: responseData.status === "error" ? false : true,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Failed to change a role",
        };
    }

    return {
        ok: true,
        message: "Role has been changed",
    };
}

export async function deleteMemberAction(
    projectId: number,
    memberId: number,
): Promise<{ ok: boolean; message: string } | undefined> {
    const responseData = await mutateData(
        "DELETE",
        `/projects/delete-member/${projectId}`,
        {
            memberId,
        },
    );

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status
    ) {
        return {
            ok: responseData.status === "error" ? false : true,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Failed to delete a member",
        };
    }

    revalidatePath("/");

    return {
        ok: true,
        message: "Member has been deleted",
    };
}

export async function transferOwnershipAction(
    slug: string,
    memberId: number,
): Promise<{ ok: boolean; message: string } | undefined> {
    const responseData = await mutateData(
        "POST",
        `/projects/transfer-ownership/${slug}`,
        {
            memberId,
        },
    );

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status
    ) {
        return {
            ok: responseData.status === "error" ? false : true,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Failed to change a role",
        };
    }

    return {
        ok: true,
        message: "Role has been changed",
    };
}

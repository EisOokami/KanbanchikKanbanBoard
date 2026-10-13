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
    DeleteAccountAction,
    ForgotPasswordAction,
    InviteMemberAction,
    LoginAction,
    MfaDisableAction,
    MfaEnableAction,
    MfaRegenerateBackupCodesAction,
    RegisterAction,
    ResendVerificationAction,
    ResetPasswordAction,
    SetPasswordAction,
    UpdateProfileAction,
    UpdateProjectAction,
    UpdateTaskAction,
} from "@/types/actions";
import {
    emailCodeResendService,
    emailCodeVerifyService,
    forgotPasswordService,
    googleExchangeService,
    loginService,
    mfaVerifyService,
    registerService,
    resendVerificationService,
    resetPasswordService,
} from "./service";
import {
    Attachment,
    Category,
    Column,
    Label,
    OwnershipTransferChallenge,
    Role,
    Subtask,
    User,
} from "@/types/types";
import { revalidatePath } from "next/cache";
import {
    changePasswordSchema,
    createCommentSchema,
    createProjectSchema,
    createTaskSchema,
    deleteAccountConfirmSchema,
    deleteAccountPasswordSchema,
    deleteAccountResendSchema,
    emailCodeFormSchema,
    forgotPasswordSchema,
    initiateOwnershipTransferSchema,
    inviteMemberSchema,
    loginSchema,
    mfaBackupCodesSchema,
    mfaDisableSchema,
    mfaEnableSchema,
    mfaVerifySchema,
    moveColumnSchema,
    moveTaskSchema,
    registerSchema,
    resendVerificationSchema,
    resetPasswordSchema,
    setPasswordSchema,
    sessionIdSchema,
    updateCommentSchema,
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
    const tempToken = formData.get("tempToken");

    if (tempToken) {
        const validatedFields = mfaVerifySchema.safeParse({
            tempToken,
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
                data: {
                    requiresMfa: true,
                    tempToken: tempToken.toString(),
                },
            };
        }

        const responseData = await mfaVerifyService(validatedFields.data);

        if (!responseData) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: null,
                details: null,
                message: "Ops! Something went wrong. Please try again.",
                data: {
                    requiresMfa: true,
                    tempToken: tempToken.toString(),
                },
            };
        }

        if (
            "message" in responseData &&
            "status" in responseData &&
            responseData.message &&
            responseData.status !== "success"
        ) {
            return {
                formData: null,
                zodErrors: null,
                error: null,
                status: responseData.status,
                details: null,
                message: responseData.message,
                data: {
                    requiresMfa: true,
                    tempToken: tempToken.toString(),
                },
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

        return;
    }

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
        responseData.status !== "success" &&
        "data" in responseData
    ) {
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

    if ("requiresMfa" in responseData && responseData.requiresMfa) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: "success",
            details: null,
            message: null,
            data: {
                requiresMfa: responseData.requiresMfa,
                tempToken: responseData.tempToken,
            },
        };
    }

    if ("requiresEmailCode" in responseData && responseData.requiresEmailCode) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: "success",
            details: null,
            message: null,
            data: {
                requiresEmailCode: responseData.requiresEmailCode,
                tempToken: responseData.tempToken,
            },
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
        terms: formData.get("terms"),
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

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message
    ) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
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
    cookieStore.delete("csrfToken");
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
): Promise<DeleteAccountAction | undefined> {
    const id = formData.get("id");
    const tempToken = formData.get("tempToken");
    const method = formData.get("method");
    const intent = formData.get("intent");

    if (tempToken) {
        const requiresMfa = method === "totp";
        const requiresEmailCode = method === "email";

        if (intent === "resend") {
            const validatedFields = deleteAccountResendSchema.safeParse({
                id: id,
                tempToken: tempToken,
            });

            if (!validatedFields.success) {
                return {
                    formData,
                    zodErrors: z.flattenError(validatedFields.error)
                        .fieldErrors,
                    error: null,
                    status: "error",
                    details: null,
                    message: "Invalid request. Please start again",
                    data: { requiresRestart: true },
                };
            }

            const responseData = await mutateData(
                "POST",
                `/users/${id}/delete/resend-code`,
                {
                    tempToken: validatedFields.data.tempToken,
                },
            );

            if (!responseData) {
                return {
                    formData,
                    zodErrors: null,
                    error: null,
                    status: "error",
                    details: null,
                    message: "Ops! Something went wrong. Please try again.",
                    data: {
                        tempToken,
                        requiresEmailCode: true,
                    },
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
                    data: {
                        tempToken,
                        requiresEmailCode: true,
                        requiresRestart: responseData.data.requiresRelogin,
                        retryAfter: responseData.data.retryAfter,
                    },
                };
            }

            return {
                formData,
                zodErrors: null,
                error: null,
                status: "success",
                details: null,
                message: "A new verification code has been sent",
                data: {
                    tempToken,
                    requiresEmailCode: true,
                    sentAt: Date.now(),
                },
            };
        }

        const validatedFields = deleteAccountConfirmSchema.safeParse({
            id: id,
            tempToken: tempToken,
            code: formData.get("code"),
        });

        if (!validatedFields.success) {
            return {
                formData,
                zodErrors: z.flattenError(validatedFields.error).fieldErrors,
                error: null,
                status: null,
                details: null,
                message: null,
                data: {
                    tempToken: tempToken,
                    requiresMfa: requiresMfa,
                    requiresEmailCode: requiresEmailCode,
                },
            };
        }

        const responseData = await mutateData(
            "POST",
            `/users/${id}/delete/confirm`,
            {
                tempToken: validatedFields.data.tempToken,
                code: validatedFields.data.code,
            },
        );

        if (!responseData) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: "error",
                details: null,
                message: "Ops! Something went wrong. Please try again.",
                data: {
                    tempToken: tempToken,
                    requiresMfa: requiresMfa,
                    requiresEmailCode: requiresEmailCode,
                },
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
                message:
                    responseData.data.attemptsLeft !== undefined
                        ? `${responseData.message}. Attempts left: ${responseData.data.attemptsLeft}`
                        : responseData.message,
                data: {
                    tempToken,
                    requiresMfa,
                    requiresEmailCode,
                    attemptsLeft: responseData.data.attemptsLeft,
                    requiresRestart: responseData.data.requiresRestart,
                },
            };
        }

        await logoutAction();

        redirect("/");
    }

    const validatedFields = deleteAccountPasswordSchema.safeParse({
        id: formData.get("id"),
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

    const responseData = await mutateData(
        "POST",
        `/users/${id}/delete/initiate`,
        {
            password: validatedFields.data.password,
        },
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: "error",
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

export async function deleteAvatarAction(): Promise<
    { ok: boolean; message: string } | undefined
> {
    const responseData = await mutateData("DELETE", `/uploads/avatar`);

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

    revalidatePath("/", "layout");

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

export async function initiateOwnershipTransferAction(
    slug: string,
    memberId: number,
    password?: string,
): Promise<
    | {
          ok: false;
          message: string;
      }
    | {
          ok: true;
          challenge: OwnershipTransferChallenge;
      }
> {
    const validatedFields = initiateOwnershipTransferSchema.safeParse({
        slug: slug,
        memberId: memberId,
        password: password,
    });

    if (!validatedFields.success) {
        const fieldErrors = z.flattenError(validatedFields.error).fieldErrors;

        const message = Object.values(fieldErrors)
            .flat()
            .filter((error): error is string => Boolean(error))
            .join(", ");

        return {
            ok: false,
            message: message || "Invalid data",
        };
    }

    const responseData = await mutateData(
        "POST",
        `/projects/transfer-ownership/${slug}/initiate`,
        {
            memberId: validatedFields.data.memberId,
            password: validatedFields.data.password,
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
            message: "Failed to initiate ownership transfer",
        };
    }

    if ("status" in responseData && responseData.status === "success") {
        return {
            ok: true,
            challenge: {
                tempToken: responseData.data.tempToken,
                requiresMfa: responseData.data.requiresMfa,
                requiresEmailCode: responseData.data.requiresEmailCode,
            },
        };
    }

    return {
        ok: false,
        message:
            "message" in responseData && responseData.message
                ? responseData.message
                : "Ops! Something went wrong. Please try again or later",
    };
}

export async function confirmOwnershipTransferAction(
    slug: string,
    tempToken: string,
    code: string,
): Promise<{
    ok: boolean;
    message: string;
    attemptsLeft?: number;
    requiresRestart?: boolean;
}> {
    const responseData = await mutateData(
        "POST",
        `/projects/transfer-ownership/${slug}/confirm`,
        { tempToken, code },
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
            message: "Failed to confirm ownership transfer",
        };
    }

    if ("status" in responseData && responseData.status === "success") {
        return {
            ok: true,
            message: responseData.message ?? "Role has been changed",
        };
    }

    if ("data" in responseData) {
        return {
            ok: false,
            message:
                "message" in responseData && responseData.message
                    ? responseData.message
                    : "Invalid verification code",
            attemptsLeft: responseData.data.attemptsLeft,
            requiresRestart: responseData.data.requiresRestart,
        };
    }

    return {
        ok: false,
        message:
            "message" in responseData && responseData.message
                ? responseData.message
                : "Ops! Something went wrong. Please try again or later",
    };
}

export async function resendOwnershipTransferCodeAction(
    slug: string,
    tempToken: string,
): Promise<{ ok: boolean; message: string; retryAfter?: number }> {
    const responseData = await mutateData(
        "POST",
        `/projects/transfer-ownership/${slug}/resend-code`,
        { tempToken },
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
            message: "Failed to confirm ownership transfer",
        };
    }

    if ("status" in responseData && responseData.status === "success") {
        return { ok: true, message: responseData.message };
    }

    if ("data" in responseData) {
        return {
            ok: false,
            message:
                "message" in responseData && responseData.message
                    ? responseData.message
                    : "Failed to resend the code",
            retryAfter: responseData.data.retryAfter,
        };
    }

    return {
        ok: false,
        message:
            "message" in responseData && responseData.message
                ? responseData.message
                : "Ops! Something went wrong. Please try again or later",
    };
}

export async function exchangeGoogleCodeAction(
    code: string,
): Promise<{ ok: boolean; message: string } | undefined> {
    const responseData = await googleExchangeService(code);

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
            message: "Failed to login",
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

        return { ok: true, message: "User logged in successfully" };
    }

    return {
        ok: false,
        message: "Failed to login",
    };
}

export async function mfaSetupAction(): Promise<BaseAction | undefined> {
    const responseData = await mutateData("POST", "/auth/mfa/setup");

    if (!responseData) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
    ) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData: null,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: {
                qrCode: responseData.data.qrCode,
                manualEntryKey: responseData.data.manualEntryKey,
            },
        };
    }
}

export async function mfaEnableAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<MfaEnableAction | undefined> {
    const validatedFields = mfaEnableSchema.safeParse({
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

    const responseData = await mutateData("POST", "/auth/mfa/enable", {
        token: validatedFields.data.token,
    });

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
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

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: {
                enable: true,
            },
        };
    }
}

export async function mfaDisableAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<MfaDisableAction | undefined> {
    const validatedFields = mfaDisableSchema.safeParse({
        password: formData.get("password"),
        token: formData.get("token") || undefined,
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

    const responseData = await mutateData("POST", "/auth/mfa/disable", {
        password: validatedFields.data.password,
        token: validatedFields.data.token,
    });

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
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

    revalidatePath("/");
}

export async function mfaRegenerateBackupCodesAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<MfaRegenerateBackupCodesAction | undefined> {
    const validatedFields = mfaBackupCodesSchema.safeParse({
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

    const responseData = await mutateData(
        "POST",
        "/auth/mfa/regenerate-backup-codes",
        { password: validatedFields.data.password },
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
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

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: {
                backupCodes: responseData.data.backupCodes,
            },
        };
    }
}

export async function resendVerificationAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<ResendVerificationAction | undefined> {
    const validatedFields = resendVerificationSchema.safeParse({
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

    const responseData = await resendVerificationService(
        validatedFields.data.email,
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
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

export async function setPasswordAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<SetPasswordAction | undefined> {
    const validatedFields = setPasswordSchema.safeParse({
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

    const responseData = await mutateData("POST", "/users/set-password", {
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

    revalidatePath("/");

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }
}

export async function emailCodeAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<SetPasswordAction> {
    const rawTempToken = formData.get("tempToken") ?? "";

    const validatedFields = emailCodeFormSchema.safeParse({
        intent: formData.get("intent") ?? "verify",
        tempToken: formData.get("tempToken") ?? "",
        code: formData.get("code"),
        redirect: formData.get("redirect") ?? undefined,
    });

    if (!validatedFields.success) {
        if (
            z.flattenError(validatedFields.error).fieldErrors.tempToken ||
            z.flattenError(validatedFields.error).fieldErrors.intent
        ) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: "error",
                details: null,
                message:
                    z.flattenError(validatedFields.error).fieldErrors
                        .tempToken?.[0] ??
                    "Invalid request. Please log in again",
                data: { tempToken: rawTempToken, requiresRelogin: true },
            };
        }

        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
            data: { tempToken: rawTempToken },
        };
    }

    if (validatedFields.data.intent === "resend") {
        const responseData = await emailCodeResendService(
            validatedFields.data.tempToken,
        );

        if (!responseData) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: "error",
                details: null,
                message: "Ops! Something went wrong. Please try again.",
                data: { tempToken: validatedFields.data.tempToken },
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
                data: { tempToken: validatedFields.data.tempToken },
            };
        }

        if ("status" in responseData && responseData.status !== "success") {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: "error",
                details: null,
                message: responseData.message,
                data: {
                    tempToken: validatedFields.data.tempToken,
                    requiresRelogin: responseData.data?.requiresRelogin,
                    retryAfter: responseData.data?.retryAfter,
                },
            };
        }

        if ("status" in responseData && responseData.status === "success") {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: "success",
                details: null,
                message: responseData.message,
                data: {
                    tempToken: validatedFields.data.tempToken,
                    sentAt: Date.now(),
                },
            };
        }
    }

    if (validatedFields.data.intent !== "verify") {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
            data: { tempToken: validatedFields.data.tempToken },
        };
    }

    const responseData = await emailCodeVerifyService(
        validatedFields.data.tempToken,
        validatedFields.data.code,
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
            data: { tempToken: validatedFields.data.tempToken },
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
            data: { tempToken: validatedFields.data.tempToken },
        };
    }

    if ("status" in responseData && responseData.status !== "success") {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message:
                responseData.data?.attemptsLeft !== undefined
                    ? `${responseData.message}. Attempts left: ${responseData.data?.attemptsLeft}`
                    : responseData.message,
            data: {
                tempToken: validatedFields.data.tempToken,
                attemptsLeft: responseData.data?.attemptsLeft,
                requiresRelogin: responseData.data?.requiresRelogin,
            },
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

        const redirectPath = validatedFields.data.redirect?.toString();

        redirect(redirectPath ?? "/overview");
    }

    return {
        formData: null,
        zodErrors: null,
        error: null,
        status: "error",
        details: null,
        message: "Ops! Something went wrong. Please try again.",
        data: { tempToken: validatedFields.data.tempToken },
    };
}

export async function createCommentAction(
    taskId: number,
    body: string,
): Promise<{
    status: "success" | "error";
    message: string;
    zodErrors?: { body?: string[] };
}> {
    const validatedFields = createCommentSchema.safeParse({
        taskId: taskId,
        body: body,
    });

    if (!validatedFields.success) {
        return {
            status: "error",
            message: "Invalid data",
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
        };
    }

    const responseData = await mutateData(
        "POST",
        `/tasks/${validatedFields.data.taskId}/comments`,
        {
            body: validatedFields.data.body,
        },
    );

    if (!responseData) {
        return {
            status: "error",
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
            status: "error",
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            status: "error",
            message: responseData.error,
        };
    }

    revalidatePath(`/project`);

    return {
        status: "success",
        message: "The comment has been added",
    };
}

export async function updateCommentAction(
    taskId: number,
    commentId: number,
    body: string,
): Promise<{
    status: "success" | "error";
    message: string;
    zodErrors?: { body?: string[] };
}> {
    const validatedFields = updateCommentSchema.safeParse({
        taskId: taskId,
        commentId: commentId,
        body: body,
    });

    if (!validatedFields.success) {
        return {
            status: "error",
            message: "Invalid data",
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
        };
    }

    const responseData = await mutateData(
        "PATCH",
        `/tasks/${validatedFields.data.taskId}/comments/${validatedFields.data.commentId}`,
        {
            body: validatedFields.data.body,
        },
    );

    if (!responseData) {
        return {
            status: "error",
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
            status: "error",
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            status: "error",
            message: responseData.error,
        };
    }

    revalidatePath(`/project`);

    return {
        status: "success",
        message: "The comment has been updated",
    };
}

export async function deleteCommentAction(
    taskId: number,
    commentId: number,
): Promise<{
    status: "success" | "error";
    message: string;
    zodErrors?: { body?: string[] };
}> {
    const validatedFields = updateCommentSchema.safeParse({
        taskId: taskId,
        commentId: commentId,
    });

    if (!validatedFields.success) {
        return {
            status: "error",
            message: "Invalid data",
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
        };
    }

    const responseData = await mutateData(
        "DELETE",
        `/tasks/${validatedFields.data.taskId}/comments/${validatedFields.data.commentId}`,
    );

    if (!responseData) {
        return {
            status: "error",
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
            status: "error",
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            status: "error",
            message: responseData.error,
        };
    }

    revalidatePath(`/project`);

    return {
        status: "success",
        message: "The comment has been deleted",
    };
}

export async function moveColumnAction(
    projectId: number,
    columnIds: number[],
): Promise<Pick<BaseAction, "status" | "message" | "zodErrors"> | undefined> {
    const validatedFields = moveColumnSchema.safeParse({
        projectId: projectId,
        columnIds: columnIds,
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
        `/projects/${projectId}/columns/reorder`,
        {
            columnIds: columnIds,
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

export async function revokeSessionAction(
    sessionId: string,
): Promise<
    | { ok: true; message: string; revokedCount: number }
    | { ok: false; message: string }
> {
    const validatedFields = sessionIdSchema.safeParse(sessionId);

    if (!validatedFields.success) {
        return {
            ok: false,
            message: "Session not found",
        };
    }

    const responseData = await mutateData(
        "DELETE",
        `/users/me/sessions/${sessionId}`,
    );

    if (!responseData) {
        return {
            ok: false,
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
            ok: false,
            message: responseData.message,
        };
    }

    if ("error" in responseData) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    return {
        ok: true,
        message: responseData.message,
        revokedCount: responseData.data.revokedCount,
    };
}

export async function revokeOtherSessionsAction(): Promise<
    | { ok: true; message: string; revokedCount: number }
    | { ok: false; message: string }
> {
    const responseData = await mutateData("DELETE", "/users/me/sessions");

    if (!responseData) {
        return {
            ok: false,
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
            ok: false,
            message: responseData.message,
        };
    }

    if ("error" in responseData) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    return {
        ok: true,
        message: responseData.message,
        revokedCount: responseData.data.revokedCount,
    };
}

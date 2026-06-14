"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mutateData } from "./mutateData";
import {
    CreateProjectAction,
    CreateTaskAction,
    ForgotPasswordAction,
    LoginAction,
    RegisterAction,
    ResetPasswordAction,
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
    Subtask,
    User,
} from "@/types/types";

const accessTokenConfig = {
    maxAge: 15 * 60,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};
const refreshTokenConfig = {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};

const loginSchema = z.object({
    email: z
        .email("Incorrect email address")
        .trim()
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters long"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be less than 50 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(
            /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
            "Password must contain at least one special character",
        ),
});

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

        redirect("/overview");
    }
}

const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name must be at least 1 characters")
        .max(100, "Name must be less than 100 characters"),
    surname: z
        .string()
        .trim()
        .min(1, "Surname must be at least 1 characters")
        .max(100, "Surname must be less than 100 characters"),
    email: z
        .email("Please enter a valid email address")
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters long"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(255, "Password must be less than 255 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(
            /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
            "Password must contain at least one special character",
        ),
});

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

const forgotPasswordSchema = z.object({
    email: z
        .email("Incorrect email address")
        .trim()
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters long"),
});

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

const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(50, "Password must be less than 50 characters")
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter",
            )
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter",
            )
            .regex(/\d/, "Password must contain at least one number")
            .regex(
                /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
                "Password must contain at least one special character",
            ),
        confirmPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(50, "Password must be less than 50 characters")
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter",
            )
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter",
            )
            .regex(/\d/, "Password must contain at least one number")
            .regex(
                /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
                "Password must contain at least one special character",
            ),
        id: z.string("Invalid data"),
        token: z
            .string("Invalid data")
            .trim()
            .min(60, "Invalid data")
            .max(70, "Invalid data"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Confirm New Password must be the same as New Password",
        path: ["confirmPassword"],
    });

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

const namedColorSchema = z.object({
    id: z.number().int().positive().optional(),
    name: z
        .string()
        .min(1, "Name is required")
        .max(150, "Name must be less than 255 characters long"),
    color: z
        .string()
        .trim()
        .length(7, { message: "Color must be a valid HEX value" })
        .regex(/^#[0-9A-Fa-f]{6}$/, {
            message: "Color must be a valid HEX value",
        }),
});

const columnSchema = z.object({
    id: z.number().int().positive().optional(),
    name: z
        .string()
        .min(1, "Name is required")
        .max(150, "Name must be less than 255 characters long"),
    position: z.number().int().min(0),
    wip_limit: z.number().int().max(100).optional(),
});

const createProjectSchema = z.object({
    icon: z.string().trim().min(1, "Invalid emoji").max(10, "Invalid emoji"),
    color: z
        .string()
        .trim()
        .length(7, { message: "Color must be a valid HEX value" })
        .regex(/^#[0-9A-Fa-f]{6}$/, {
            message: "Color must be a valid HEX value",
        }),
    name: z
        .string()
        .trim()
        .min(1, "Name must be at least 1 characters")
        .max(150, "Name must be less than 150 characters"),
    description: z
        .string()
        .trim()
        .max(500, "Description must be less than 500 characters long")
        .nullable()
        .optional(),
    status: z.enum(["active", "paused", "completed", "archived"], {
        message: "Invalid project status",
    }),
    labels: z.array(namedColorSchema).min(1, "At least one label is required"),
    categories: z
        .array(namedColorSchema)
        .min(1, "At least one category is required"),
    members: z.array(
        z
            .email("Invalid email")
            .trim()
            .toLowerCase()
            .min(1, "Email is required")
            .max(255, "Email must be less than 255 characters long"),
    ),
    columns: z.array(columnSchema).min(1, "At least one column is required"),
});

export async function createProjectAction(
    data: {
        labels: Omit<Label, "id">[];
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
}

const memberSchema = z.object({
    id: z.number().int().positive(),
    name: z
        .string()
        .trim()
        .min(1, "Name must be at least 1 characters")
        .max(100, "Name must be less than 100 characters"),
    surname: z
        .string()
        .trim()
        .min(1, "Surname must be at least 1 characters")
        .max(100, "Surname must be less than 100 characters"),
    avatar_url: z
        .url({ message: "Invalid avatar URL" })
        .max(500, { message: "Avatar URL must be less than 500 characters" })
        .nullable()
        .optional(),
    role: z.enum(["owner", "admin", "member", "viewer"], {
        message: "Invalid member role",
    }),
    joined_at: z.iso
        .datetime({ message: "Invalid datetime format" })
        .optional(),
    color: z
        .string()
        .trim()
        .length(7, { message: "Color must be a valid HEX value" })
        .regex(/^#[0-9A-Fa-f]{6}$/, {
            message: "Color must be a valid HEX value",
        }),
    status: z.enum(["active", "pending"], {
        message: "Invalid member status",
    }),
});

const updateProjectSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .refine((value) => Number.isSafeInteger(value), {
            message: "ID is too lcarge a numerical value",
        }),
    icon: z.string().trim().min(1, "Invalid emoji").max(10, "Invalid emoji"),
    color: z
        .string()
        .trim()
        .length(7, { message: "Color must be a valid HEX value" })
        .regex(/^#[0-9A-Fa-f]{6}$/, {
            message: "Color must be a valid HEX value",
        }),
    name: z
        .string()
        .trim()
        .min(1, "Name must be at least 1 characters")
        .max(150, "Name must be less than 150 characters"),
    description: z
        .string()
        .trim()
        .max(500, "Description must be less than 500 characters long")
        .nullable()
        .optional(),
    status: z.enum(["active", "paused", "completed", "archived"], {
        message: "Invalid project status",
    }),
    labels: z.array(namedColorSchema).min(1, "At least one label is required"),
    newLabels: z.array(namedColorSchema),
    categories: z
        .array(namedColorSchema)
        .min(1, "At least one category is required"),
    newCategories: z.array(namedColorSchema),
    emails: z.array(
        z
            .email("Invalid email")
            .trim()
            .toLowerCase()
            .min(1, "Email is required")
            .max(255, "Email must be less than 255 characters long"),
    ),
    columns: z.array(columnSchema).min(1, "At least one column is required"),
    newColumns: z.array(columnSchema),
    members: z.array(memberSchema).min(1, "At least one member is required"),
});

export async function updateProjectAction(
    data: {
        labels: Label[];
        newLabels: Omit<Label, "updated_at" | "created_at">[];
        columns: Omit<Column, "tasks">[];
        newColumns: Omit<
            Column,
            "tasks" | "updated_at" | "created_at" | "wip_limit"
        >[];
        categories: Omit<
            Category,
            "updated_at" | "updated_at" | "created_at" | "id"
        >[];
        newCategories: Omit<Category, "updated_at" | "created_at">[];
        members: Omit<User, "email">[];
        emails: string[];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<UpdateProjectAction | undefined> {
    const validatedFields = updateProjectSchema.safeParse({
        id: formData.get("id"),
        icon: formData.get("icon"),
        color: formData.get("color"),
        name: formData.get("name"),
        description: formData.get("description"),
        status: formData.get("status"),
        members: data.members,
        columns: data.columns,
        newColumns: data.newColumns,
        categories: data.categories,
        newCategories: data.newCategories,
        labels: data.labels,
        newLabels: data.newLabels,
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
        `/projects/${validatedFields.data.id}`,
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

export async function deleteProjectAction(
    projectId: number,
): Promise<{ ok: boolean; message: string } | undefined> {
    const responseData = await mutateData("DELETE", `/projects/${projectId}`);

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
            message: "Failed to delete a project",
        };
    }

    return {
        ok: true,
        message: "Project delete",
    };
}

const attachmentSchema = z.object({
    filename: z
        .string({
            error: "Filename is required",
        })
        .trim()
        .min(1, "Filename cannot be empty")
        .max(255, "Filename must be less than 255 characters"),
    file_url: z
        .url("File URL must be a valid URL")
        .trim()
        .max(500, "File URL must be less than 500 characters"),
    mime_type: z
        .string()
        .trim()
        .max(100, "MIME type must be less than 100 characters")
        .nullable()
        .optional(),
    size_bytes: z
        .number()
        .int("File size must be an integer")
        .min(0, "File size cannot be negative")
        .nullable()
        .optional(),
});

const subtaskSchema = z.object({
    title: z
        .string({
            error: "Title is required",
        })
        .trim()
        .min(1, "Title cannot be empty")
        .max(150, "Title must be less than 150 characters"),
    position: z
        .number()
        .int("Position must be an integer")
        .min(0, "Position cannot be negative")
        .max(255, "Position must be less than 255")
        .default(0),
    is_done: z
        .union([z.boolean(), z.literal(0), z.literal(1)])
        .transform((value) => Boolean(value)),
});

const createTaskSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(1, "Title must be at least 1 characters")
            .max(255, "Title must be less than 255 characters"),
        description: z
            .string()
            .trim()
            .max(500, "Description must be less than 500 characters long")
            .nullable()
            .optional(),
        priority: z.enum(["low", "medium", "high", "critical"], {
            message: "Invalid task priority",
        }),
        dueDate: z.preprocess(
            (value) => (value === "" ? undefined : value),
            z.iso.date().nullable().optional(),
        ),
        startDate: z.preprocess(
            (value) => (value === "" ? undefined : value),
            z.iso.date().nullable().optional(),
        ),
        showProgress: z.stringbool(),
        projectId: z
            .string()
            .regex(/^\d+$/, "Select a project")
            .transform(Number)
            .refine((value) => Number.isSafeInteger(value), {
                message: "ID is too large a numerical value",
            }),
        columnId: z
            .string()
            .regex(/^\d+$/, "Select a column")
            .transform(Number)
            .refine((value) => Number.isSafeInteger(value), {
                message: "ID is too large a numerical value",
            }),
        categories: z.array(namedColorSchema),
        newCategories: z.array(namedColorSchema),
        members: z
            .array(memberSchema)
            .min(1, "At least one member is required"),
        labels: z.array(namedColorSchema),
        newLabels: z.array(namedColorSchema),
        // attachments: z.array(attachmentSchema),
        subtasks: z.array(subtaskSchema),
    })
    .superRefine((data, ctx) => {
        if (!data.categories.length && !data.newCategories.length) {
            ctx.addIssue({
                code: "custom",
                message: "At least one category (existing or new) is required",
                path: ["categories"],
            });
        }

        if (!data.labels.length && !data.newLabels.length) {
            ctx.addIssue({
                code: "custom",
                message: "At least one label (existing or new) is required",
                path: ["labels"],
            });
        }
    });

export async function createTaskAction(
    data: {
        members: Omit<User, "email">[];
        categories: Category[];
        newCategories: Omit<Category, "created_at" | "updated_at">[];
        subtasks: Omit<Subtask, "created_at">[];
        attachments: Attachment[];
        labels: Label[];
        newLabels: Omit<Label, "created_at" | "updated_at">[];
    },
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
        projectId: formData.get("project-id"),
        columnId: formData.get("column-id"),
        showProgress: formData.get("show-progress"),
        members: data.members,
        categories: data.categories,
        newCategories: data.newCategories,
        subtasks: data.subtasks,
        // attachments: data.attachments,
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
}

const updateTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Title must be at least 1 characters")
        .max(255, "Title must be less than 255 characters"),
    description: z
        .string()
        .trim()
        .max(500, "Description must be less than 500 characters long")
        .nullable()
        .optional(),
    priority: z.enum(["low", "medium", "high", "critical"], {
        message: "Invalid task priority",
    }),
    dueDate: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.iso.date().nullable().optional(),
    ),
    startDate: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.iso.date().nullable().optional(),
    ),
    showProgress: z.stringbool(),
    taskId: z
        .string()
        .regex(/^\d+$/, "Select a project")
        .transform(Number)
        .refine((value) => Number.isSafeInteger(value), {
            message: "ID is too large a numerical value",
        }),
    columnId: z
        .string()
        .regex(/^\d+$/, "Select a column")
        .transform(Number)
        .refine((value) => Number.isSafeInteger(value), {
            message: "ID is too large a numerical value",
        }),
    categories: z
        .array(namedColorSchema)
        .min(1, "At least one category is required"),
    members: z.array(memberSchema).min(1, "At least one member is required"),
    labels: z.array(namedColorSchema).min(1, "At least one label is required"),
    // attachments: z.array(attachmentSchema),
    // newAttachments: z.array(attachmentSchema),
    subtasks: z.array(subtaskSchema),
    newSubtasks: z.array(subtaskSchema),
});

export async function updateTaskAction(
    data: {
        categories: Category[];
        members: Omit<User, "email">[];
        subtasks: Omit<Subtask, "created_at">[];
        newSubtasks: Omit<Subtask, "created_at">[];
        attachments: Attachment[];
        newAttachments: Attachment[];
        labels: Label[];
    },
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
        // attachments: data.attachments,
        // newAttachments: data.newAttachments,
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
}

export async function deleteTaskAction(
    taskId: number,
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
            message: "Failed to delete a task",
        };
    }

    return {
        ok: true,
        message: "Task delete",
    };
}

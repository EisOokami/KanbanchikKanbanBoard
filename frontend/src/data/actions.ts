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

        const redirectPath = formData.get("redirect")?.toString();
        redirect(redirectPath ?? "/overview");
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
    id: z
        .number()
        .positive()
        .int("ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "ID is too large a numerical value",
        })
        .optional(),
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
    id: z
        .number()
        .positive()
        .int("ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "ID is too large a numerical value",
        })
        .optional(),
    name: z
        .string()
        .min(1, "Name is required")
        .max(150, "Name must be less than 255 characters long"),
    position: z.number().int().min(0),
    wip_limit: z.number().int().min(1).max(999).nullable(),
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
    showPriorityEmoji: z.stringbool(),
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

const memberSchema = z.object({
    id: z
        .number()
        .positive()
        .int("ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "ID is too large a numerical value",
        }),
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

const updateProjectSchema = z
    .object({
        slug: z
            .string()
            .min(1, "Slug must be at least 1 characters")
            .max(200, "Slug must be 200 characters or less")
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
                message:
                    "Slug can only contain lowercase letters, numbers, and single hyphens",
            }),
        icon: z
            .string()
            .trim()
            .min(1, "Invalid emoji")
            .max(10, "Invalid emoji"),
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
        showPriorityEmoji: z.stringbool(),
        labels: z.array(namedColorSchema),
        newLabels: z.array(namedColorSchema),
        deletedLabelIds: z
            .array(
                z
                    .number()
                    .positive()
                    .int("Label ID must be an integer")
                    .refine((value) => Number.isSafeInteger(value), {
                        message: "ID is too large a numerical value",
                    }),
            )
            .optional()
            .default([]),
        categories: z.array(namedColorSchema),
        newCategories: z.array(namedColorSchema),
        deletedCategoryIds: z
            .array(
                z
                    .number()
                    .positive()
                    .int("Category ID must be an integer")
                    .refine((value) => Number.isSafeInteger(value), {
                        message: "ID is too large a numerical value",
                    }),
            )
            .optional()
            .default([]),
        emails: z.array(
            z
                .email("Invalid email")
                .trim()
                .toLowerCase()
                .min(1, "Email is required")
                .max(255, "Email must be less than 255 characters long"),
        ),
        columns: z.array(columnSchema),
        newColumns: z.array(columnSchema),
        deletedColumnIds: z
            .array(
                z
                    .number()
                    .positive()
                    .int("Column ID must be an integer")
                    .refine((value) => Number.isSafeInteger(value), {
                        message: "ID is too large a numerical value",
                    }),
            )
            .optional()
            .default([]),
        members: z
            .array(memberSchema)
            .min(1, "At least one member is required"),
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

        if (!data.columns.length && !data.newColumns.length) {
            ctx.addIssue({
                code: "custom",
                message: "At least one label (existing or new) is required",
                path: ["labels"],
            });
        }
    });

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
        slug: z
            .string()
            .min(1, "Slug must be at least 1 characters")
            .max(200, "Slug must be 200 characters or less")
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
                message:
                    "Slug can only contain lowercase letters, numbers, and single hyphens",
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
        attachments: z
            .preprocess(
                (value) => {
                    if (!value) return [undefined];

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return Array.from(value as Iterable<any>).filter(
                        (file) =>
                            file instanceof File &&
                            file.name !== "" &&
                            file.size > 0,
                    );
                },
                z
                    .array(
                        z
                            .instanceof(File, {
                                message: "Attachment is required",
                            })
                            .refine((file) => file.size <= 5 * 1024 * 1024, {
                                message: "Maximum file size is 5MB",
                            })
                            .refine(
                                (file) =>
                                    [
                                        "image/jpeg",
                                        "image/png",
                                        "image/svg+xml",
                                        "image/webp",
                                        "image/gif",
                                        "image/avif",
                                        "application/pdf",
                                        "video/mp4",
                                        "video/webm",
                                        "video/mpeg",
                                        "application/msword",
                                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                        "text/plain",
                                        "application/vnd.ms-",
                                        "application/vnd.openxmlformats-",
                                    ].some((type) =>
                                        file.type.startsWith(type),
                                    ),
                                {
                                    message: "File type is not allowed",
                                },
                            ),
                    )
                    .max(3, "Attachments must be less than 3"),
            )
            .optional(),
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
    newAttachments: z
        .preprocess(
            (value) => {
                if (!value) return [undefined];

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return Array.from(value as Iterable<any>).filter(
                    (file) =>
                        file instanceof File &&
                        file.name !== "" &&
                        file.size > 0,
                );
            },
            z
                .array(
                    z
                        .instanceof(File, {
                            message: "Attachment is required",
                        })
                        .refine((file) => file.size <= 5 * 1024 * 1024, {
                            message: "Maximum file size is 5MB",
                        })
                        .refine(
                            (file) =>
                                [
                                    "image/jpeg",
                                    "image/png",
                                    "image/svg+xml",
                                    "image/webp",
                                    "image/gif",
                                    "image/avif",
                                    "application/pdf",
                                    "video/mp4",
                                    "video/webm",
                                    "video/mpeg",
                                    "application/msword",
                                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                    "text/plain",
                                    "application/vnd.ms-",
                                    "application/vnd.openxmlformats-",
                                ].some((type) => file.type.startsWith(type)),
                            {
                                message: "File type is not allowed",
                            },
                        ),
                )
                .max(3, "Attachments must be less than 3"),
        )
        .optional(),
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

const updateProfileSchema = z.object({
    avatar: z.preprocess(
        (value) => {
            if (!value || value === "") return undefined;

            if (typeof window !== "undefined" && value instanceof FileList) {
                const file = value.item(0);
                return file && file.size > 0 ? file : undefined;
            }

            if (
                value instanceof File &&
                (value.size === 0 || value.name === "")
            ) {
                return undefined;
            }

            return value;
        },
        z
            .instanceof(File, { message: "Avatar is required" })
            .refine((file) => file.size <= 5 * 1024 * 1024, {
                message: "Maximum file size is 5MB",
            })
            .refine(
                (file) =>
                    ["image/jpeg", "image/png", "image/webp"].includes(
                        file.type,
                    ),
                { message: "Only JPG, PNG and WEBP are allowed" },
            )
            .optional(),
    ),
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
    color: z
        .string()
        .trim()
        .length(7, { message: "Color must be a valid HEX value" })
        .regex(/^#[0-9A-Fa-f]{6}$/, {
            message: "Color must be a valid HEX value",
        }),
});

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

const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .max(255, "Password must be less than 255 characters long")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?])/,
                "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
            ),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .max(255, "Password must be less than 255 characters long")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?])/,
                "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
            ),
        confirmPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .max(255, "Password must be less than 255 characters long")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?])/,
                "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
            ),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "Passwords are the same",
        path: ["confirmPassword"],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Confirm New Password must be the same as New Password",
        path: ["confirmPassword"],
    });

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

const EPSILON = 1e-9;
const MAX_POSITION = Number.MAX_SAFE_INTEGER;

const moveTaskSchema = z.object({
    taskId: z
        .number()
        .positive()
        .int("Task ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "ID is too large a numerical value",
        }),
    columnId: z
        .number()
        .positive()
        .int("Column ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "ID is too large a numerical value",
        }),
    position: z
        .number("Position is required")
        .gt(
            EPSILON,
            `position must be greater than ${EPSILON} (fractional index minimum)`,
        )
        .lte(MAX_POSITION, `position must not exceed MAX_SAFE_INTEGER`)
        .refine(Number.isFinite, {
            message: "position must be a finite number",
        }),
});

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

const inviteMemberSchema = z.object({
    projectId: z
        .string()
        .regex(/^\d+$/, "Select a project")
        .transform(Number)
        .refine((value) => Number.isSafeInteger(value), {
            message: "ID is too large a numerical value",
        }),
    members: z
        .array(
            z
                .email("Invalid email")
                .trim()
                .toLowerCase()
                .min(1, "Email is required")
                .max(255, "Email must be less than 255 characters long"),
        )
        .min(1, "At least one member is required"),
});

export async function inviteMemberAction(
    // invites: Invite[],
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
        "PUT",
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

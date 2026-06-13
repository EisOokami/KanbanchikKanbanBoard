import { z } from "zod";

export const updateProfileSchema = z
    .object({
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
            .email("Invalid email format")
            .trim()
            .toLowerCase()
            .min(1, "Email is required")
            .max(255, "Email must be less than 255 characters long"),
        avatar_url: z
            .url({ message: "Invalid avatar URL" })
            .max(500, {
                message: "Avatar URL must be less than 500 characters",
            })
            .nullable()
            .optional(),
        color: z
            .string()
            .trim()
            .length(7, { message: "Color must be a valid HEX value" })
            .regex(/^#[0-9A-Fa-f]{6}$/, {
                message: "Color must be a valid HEX value",
            })
            .optional(),
    })
    .refine((data) => Object.values(data).some((v) => v !== undefined), {
        message: "At least one field must be provided",
    });

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(6),
        newPassword: z.string().min(8).max(255),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    });

export const validateIdSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .refine((value) => Number.isSafeInteger(value), {
            message: "ID is too lcarge a numerical value",
        }),
});

export const registerSchema = z.object({
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
        .email("Invalid email format")
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters long"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(255, "Password must be less than 255 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?])/,
            "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
        ),
    avatar_url: z
        .url({ message: "Invalid avatar URL" })
        .max(500, { message: "Avatar URL must be less than 500 characters" })
        .nullable()
        .optional(),
    color: z
        .string()
        .trim()
        .length(7, { message: "Color must be a valid HEX value" })
        .regex(/^#[0-9A-Fa-f]{6}$/, {
            message: "Color must be a valid HEX value",
        })
        .optional(),
});

export const loginSchema = z.object({
    email: z
        .email("Invalid email format")
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters long"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(255, "Password must be less than 255 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?])/,
            "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
        ),
});

export const forgotPasswordSchema = z.object({
    email: z
        .email("Invalid email format")
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters long"),
});

export const resetPasswordSchema = z.object({
    token: z
        .string("Invalid data")
        .trim()
        .min(60, "Invalid data")
        .max(70, "Invalid data"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(255, "Password must be less than 255 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?])/,
            "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
        ),
    id: z.number("Invalid data").int("Invalid data").positive("Invalid data"),
});

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

export const createProjectSchema = z.object({
    icon: z.string().trim().min(1, "Invalid emoji").max(10, "Invalid emoji"),
    name: z
        .string()
        .trim()
        .min(1, "Name must be at least 1 characters")
        .max(150, "Name must be less than 150 characters"),
    color: z
        .string()
        .trim()
        .length(7, { message: "Color must be a valid HEX value" })
        .regex(/^#[0-9A-Fa-f]{6}$/, {
            message: "Color must be a valid HEX value",
        }),
    description: z
        .string()
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

export const updateProjectSchema = z.object({
    id: z.number().int().positive(),
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

export const createTaskSchema = z.object({
    column_id: z.number().int().positive(),
    title: z.string().min(1).max(255),
    description: z
        .string()
        .max(500, "Description must be less than 500 characters long")
        .nullable()
        .optional(),
    due_date: z.string().datetime().nullable().optional(),
    start_date: z.string().datetime().nullable().optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    show_progress: z.boolean().optional(),
    category_ids: z.array(z.number().int().positive()).optional(),
    member_ids: z.array(z.number().int().positive()).optional(),
    label_ids: z.array(z.number().int().positive()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
    position: z.number().int().nonnegative().optional(),
});

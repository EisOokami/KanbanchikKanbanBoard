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
        avatar_url: z.url().max(500).nullable().optional(),
        color: z
            .string()
            .regex(/^#[0-9A-Fa-f]{6}$/)
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
    id: z.string().regex(/^\d+$/).transform(Number),
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
    avatar_url: z.url().max(500).nullable().optional(),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
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

import { z } from "zod";

const isWithinDateRange = (value: string): boolean => {
    const date = new Date(value);
    const now = new Date();

    const minDate = new Date(
        now.getFullYear() - 3,
        now.getMonth(),
        now.getDate(),
    );
    const maxDate = new Date(
        now.getFullYear() + 3,
        now.getMonth(),
        now.getDate(),
    );

    return date >= minDate && date <= maxDate;
};

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
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
        ),
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
        .email("Please enter a valid email address")
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters long"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(255, "Password must be less than 255 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
        ),
    avatar_url: z
        .url("Invalid avatar URL")
        .max(500, "Avatar URL must be less than 500 characters")
        .nullable()
        .optional(),
    color: z
        .string()
        .trim()
        .length(7, "Color must be a valid HEX value")
        .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid HEX value")
        .optional(),
});

export const resetPasswordSchema = z.object({
    token: z.string(),
    // .regex(
    //     /^\$2[aby]\$(0[4-9]|[12][0-9]|3[01])\$[./A-Za-z0-9]{53}$/,
    //     "Invalid token",
    // ),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(255, "Password must be less than 255 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
        ),
    id: z.number("Invalid data").int("Invalid data").positive("Invalid data"),
});

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
        .length(7, "Color must be a valid HEX value")
        .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid HEX value"),
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
    wip_limit: z
        .number()
        .int()
        .min(1)
        .max(999, "WIP limit cannot exceed 999")
        .nullable(),
});

export const createProjectSchema = z.object({
    icon: z.string().trim().min(1, "Invalid emoji").max(10, "Invalid emoji"),
    color: z
        .string()
        .trim()
        .length(7, "Color must be a valid HEX value")
        .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid HEX value"),
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
    status: z.enum(
        ["active", "paused", "completed", "archived"],
        "Invalid project status",
    ),
    showPriorityEmoji: z.boolean(),
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
        .url("Invalid avatar URL")
        .max(500, "Avatar URL must be less than 500 characters")
        .nullable()
        .optional(),
    role: z.enum(["owner", "admin", "member", "viewer"], "Invalid member role"),
    joined_at: z.iso.datetime("Invalid datetime format").optional(),
    color: z
        .string()
        .trim()
        .length(7, "Color must be a valid HEX value")
        .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid HEX value"),
    status: z.enum(["active", "pending"], "Invalid member status"),
});

export const updateProjectSchema = z
    .object({
        slug: z
            .string()
            .min(1, "Slug must be at least 1 characters")
            .max(200, "Slug must be 200 characters or less")
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "Slug can only contain lowercase letters, numbers, and single hyphens",
            ),
        icon: z
            .string()
            .trim()
            .min(1, "Invalid emoji")
            .max(10, "Invalid emoji"),
        color: z
            .string()
            .trim()
            .length(7, "Color must be a valid HEX value")
            .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid HEX value"),
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
        status: z.enum(
            ["active", "paused", "completed", "archived"],
            "Invalid project status",
        ),
        showPriorityEmoji: z.boolean(),
        labels: z.array(namedColorSchema),
        newLabels: z.array(namedColorSchema),
        deletedLabelIds: z
            .array(
                z
                    .number()
                    .positive()
                    .int("Label ID must be an integer")
                    .refine((value) => Number.isSafeInteger(value), {
                        message: "Label ID is too large a numerical value",
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
                        message: "Category ID is too large a numerical value",
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
                        message: "Column ID is too large a numerical value",
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
                message: "At least one column (existing or new) is required",
                path: ["columns"],
            });
        }
    });

export const subtaskSchema = z.object({
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
    is_done: z.boolean(),
});

export const createTaskSchema = z
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
        priority: z.enum(
            ["low", "medium", "high", "critical"],
            "Invalid task priority",
        ),
        dueDate: z.preprocess(
            (value) => (value === "" ? undefined : value),
            z.iso
                .date()
                .nullable()
                .optional()
                .refine((value) => value == null || isWithinDateRange(value), {
                    message:
                        "Date must be within 3 years from the current date",
                }),
        ),
        startDate: z.preprocess(
            (value) => (value === "" ? undefined : value),
            z.iso
                .date()
                .nullable()
                .optional()
                .refine((value) => value == null || isWithinDateRange(value), {
                    message:
                        "Date must be within 3 years from the current date",
                }),
        ),
        showProgress: z.boolean(),
        slug: z
            .string()
            .min(1, "Slug must be at least 1 characters")
            .max(200, "Slug must be 200 characters or less")
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "Slug can only contain lowercase letters, numbers, and single hyphens",
            ),
        columnId: z
            .number()
            .positive()
            .int("Column ID must be an integer")
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
                            .refine(
                                (file) => {
                                    const fileNameWithoutExtension =
                                        file.name.replace(/\.[^/.]+$/, "");

                                    return (
                                        fileNameWithoutExtension.length <= 50
                                    );
                                },
                                {
                                    message:
                                        "File name must be less than or equal to 50 characters",
                                },
                            )
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

export const updateTaskSchema = z.object({
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
    priority: z.enum(
        ["low", "medium", "high", "critical"],
        "Invalid task priority",
    ),
    dueDate: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.iso
            .date()
            .nullable()
            .optional()
            .refine((value) => value == null || isWithinDateRange(value), {
                message: "Date must be within 3 years from the current date",
            }),
    ),
    startDate: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.iso
            .date()
            .nullable()
            .optional()
            .refine((value) => value == null || isWithinDateRange(value), {
                message: "Date must be within 3 years from the current date",
            }),
    ),
    showProgress: z.boolean(),
    taskId: z
        .number()
        .positive()
        .int("Task ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "Task ID is too large a numerical value",
        }),
    columnId: z
        .number()
        .positive()
        .int("Column ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "Column ID is too large a numerical value",
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
                            (file) => {
                                const fileNameWithoutExtension =
                                    file.name.replace(/\.[^/.]+$/, "");

                                return fileNameWithoutExtension.length <= 50;
                            },
                            {
                                message:
                                    "File name must be less than or equal to 50 characters",
                            },
                        )
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
        color: z
            .string()
            .trim()
            .length(7, "Color must be a valid HEX value")
            .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid HEX value")
            .optional(),
    })
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        {
            message: "At least one field must be provided",
        },
    );

export const forgotPasswordSchema = z.object({
    email: z
        .email("Invalid email format")
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters long"),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .max(255, "Password must be less than 255 characters long")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
                "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
            ),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .max(255, "Password must be less than 255 characters long")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
                "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
            ),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "Passwords are the same",
        path: ["confirmPassword"],
    });

const EPSILON = 1e-9;
const MAX_POSITION = Number.MAX_SAFE_INTEGER;

export const moveTaskSchema = z.object({
    taskId: z
        .number()
        .positive()
        .int("Task ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "Task ID is too large a numerical value",
        }),
    columnId: z
        .number()
        .positive()
        .int("Column ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "Column ID is too large a numerical value",
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

export const getAttachmentsSchema = z.object({
    taskId: z
        .string()
        .refine((value) => /^\d+$/.test(value), {
            message: "Task ID must be a numeric string",
        })
        .refine((value) => Number.isSafeInteger(Number(value)), {
            message: "Task ID is too large a numerical value",
        })
        .transform((value) => Number(value)),
});

export const deleteAvatarSchema = z.object({
    avatar_url: z
        .url("Invalid avatar URL")
        .max(500, "Avatar URL must be less than 500 characters")
        .nullable()
        .optional(),
});

export const memberInviteSchema = z.object({
    projectId: z
        .number()
        .positive()
        .int("Project ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "Project ID is too large a numerical value",
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

export const validateSlugSchema = z.object({
    slug: z
        .string()
        .min(1, "Slug must be at least 1 characters")
        .max(200, "Slug must be 200 characters or less")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug can only contain lowercase letters, numbers, and single hyphens",
        ),
});

export const changeRoleSchema = z.object({
    memberId: z
        .number()
        .positive()
        .int("Member ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "Member ID is too large a numerical value",
        }),
    role: z.enum(["owner", "admin", "member", "viewer"], "Invalid member role"),
});

export const deleteMemberSchema = z.object({
    memberId: z
        .number()
        .positive()
        .int("Member ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "Member ID is too large a numerical value",
        }),
});
export const validateIdSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .refine((value) => Number.isSafeInteger(value), {
            message: "ID is too large a numerical value",
        }),
});

export const transferOwnershipSchema = z.object({
    memberId: z
        .number()
        .positive()
        .int("Member ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "Member ID is too large a numerical value",
        }),
});

export const tokenSchema = z.object({
    token: z
        .string()
        .trim()
        .length(64, "Invalid token.")
        .regex(/^[a-f0-9]{64}$/, "Invalid token."),
});

export const mfaEnableSchema = z.object({
    token: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});

export const mfaVerifySchema = z.object({
    tempToken: z.string().trim().min(1, "TempToken is required"),
    token: z.string().trim().min(1, "Code is required").max(9),
});

export const mfaDisableSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(255, "Password must be less than 255 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
        ),
    token: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "Code must be exactly 6 digits")
        .optional(),
});

export const mfaBackupCodesSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(255, "Password must be less than 255 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
        ),
});

export const resendVerificationSchema = z.object({
    email: z
        .email("Invalid email format")
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters long"),
});

export const deleteAccountSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(255, "Password must be less than 255 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
        ),
});

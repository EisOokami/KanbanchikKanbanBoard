export interface BaseZodErrors {
    [key: string]: string[] | undefined;
}

export interface DetailsError {
    field: string;
    message: string;
}

export interface BaseAction {
    zodErrors: BaseZodErrors | null;
    status: "error" | "message" | "success" | null;
    message: string | null;
    error: string | null;
    details: DetailsError[] | null;
    formData: FormData | null;
}

export interface LoginZodErrors extends BaseZodErrors {
    identifier?: string[];
    password?: string[];
}

export interface RegisterZodErrors extends BaseZodErrors {
    username?: string[];
    email?: string[];
    password?: string[];
}

export interface UpdateProfileZodErrors extends BaseZodErrors {
    username?: string[];
    email?: string[];
}

export interface ChangePasswordZodErrors extends BaseZodErrors {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
}

export interface ForgotPasswordZodErrors extends BaseZodErrors {
    email?: string[];
}

export interface ResetPasswordZodErrors extends BaseZodErrors {
    newPassword?: string[];
    confirmPassword?: string[];
    id?: string[];
    token?: string[];
}

export interface UpdateProjectZodErrors extends BaseZodErrors {
    id?: string[];
    icon?: string[];
    color?: string[];
    name?: string[];
    description?: string[];
    status?: string[];
    members?: string[];
    columns?: string[];
    categories?: string[];
    labels?: string[];
    emails?: string[];
}

export interface LoginAction extends BaseAction {
    zodErrors: LoginZodErrors | null;
}

export interface RegisterAction extends BaseAction {
    zodErrors: RegisterZodErrors | null;
}

export interface UpdateProfileAction extends BaseAction {
    zodErrors: UpdateProfileZodErrors | null;
}

export interface ChangePasswordAction extends BaseAction {
    zodErrors: ChangePasswordZodErrors | null;
}

export interface ForgotPasswordAction extends BaseAction {
    zodErrors: ForgotPasswordZodErrors | null;
}

export interface ResetPasswordAction extends BaseAction {
    zodErrors: ResetPasswordZodErrors | null;
}


export interface UpdateProjectAction extends BaseAction {
    zodErrors: UpdateProjectZodErrors | null;
}

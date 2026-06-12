export interface IBaseZodErrors {
    [key: string]: string[] | undefined;
}

export interface IDetailsError {
    field: string;
    message: string;
}

export interface IBaseAction {
    zodErrors: IBaseZodErrors | null;
    status: "error" | "message" | "success" | null;
    message: string | null;
    error: string | null;
    details: IDetailsError[] | null;
    formData: FormData | null;
}

export interface ILoginZodErrors extends IBaseZodErrors {
    identifier?: string[];
    password?: string[];
}

export interface IRegisterZodErrors extends IBaseZodErrors {
    username?: string[];
    email?: string[];
    password?: string[];
}

export interface IUpdateProfileZodErrors extends IBaseZodErrors {
    username?: string[];
    email?: string[];
}

export interface IChangePasswordZodErrors extends IBaseZodErrors {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
}

export interface IForgotPasswordZodErrors extends IBaseZodErrors {
    email?: string[];
}

export interface IResetPasswordZodErrors extends IBaseZodErrors {
    newPassword?: string[];
    confirmPassword?: string[];
    id?: string[];
    token?: string[];
}

export interface ILoginAction extends IBaseAction {
    zodErrors: ILoginZodErrors | null;
}

export interface IRegisterAction extends IBaseAction {
    zodErrors: IRegisterZodErrors | null;
}

export interface IUpdateProfileAction extends IBaseAction {
    zodErrors: IUpdateProfileZodErrors | null;
}

export interface IChangePasswordAction extends IBaseAction {
    zodErrors: IChangePasswordZodErrors | null;
}

export interface IForgotPasswordAction extends IBaseAction {
    zodErrors: IForgotPasswordZodErrors | null;
}

export interface IResetPasswordAction extends IBaseAction {
    zodErrors: IResetPasswordZodErrors | null;
}

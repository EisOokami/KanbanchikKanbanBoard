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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
}

export interface LoginZodErrors extends BaseZodErrors {
    identifier?: string[];
    password?: string[];
    tempToken?: string[];
    token?: string[];
}

export interface RegisterZodErrors extends BaseZodErrors {
    username?: string[];
    email?: string[];
    password?: string[];
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

export interface CreateProjectZodErrors extends BaseZodErrors {
    icon?: string[];
    color?: string[];
    name?: string[];
    description?: string[];
    status?: string[];
    members?: string[];
    columns?: string[];
    categories?: string[];
    labels?: string[];
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

export interface CreateTaskZodErrors extends BaseZodErrors {
    title?: string[];
    description?: string[];
    startDate?: string[];
    dueDate?: string[];
    priority?: string[];
    members?: string[];
    categories?: string[];
    subtasks?: string[];
    attachments?: string[];
}

export interface UpdateTaskZodErrors extends BaseZodErrors {
    title?: string[];
    description?: string[];
    startDate?: string[];
    dueDate?: string[];
    priority?: string[];
    members?: string[];
    categories?: string[];
    subtasks?: string[];
    newSubtasks?: string[];
    attachments?: string[];
    newAttachments?: string[];
    newAttachmentFiles?: string[];
    comments?: string[];
    newComments?: string[];
}

export interface UpdateProfileZodErrors extends BaseZodErrors {
    name?: string[];
    surname?: string[];
    avatar?: string[];
    email?: string[];
}

export interface ChangePasswordZodErrors extends BaseZodErrors {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
}

export interface InviteMemberZodErrors extends BaseZodErrors {
    projectId?: string[];
    members?: string[];
}

export interface MfaSetupZodErrors extends BaseZodErrors {
    qrCode?: string[];
    manualEntryKey?: string[];
}

export interface MfaDisableZodErrors extends BaseZodErrors {
    password?: string[];
    token?: string[];
}

export interface MfaEnableZodErrors extends BaseZodErrors {
    enabled?: string[];
}

export interface MfaBackupCodesZodErrors extends BaseZodErrors {
    backupCodes?: string[];
}

export interface ResendVerificationZodErrors extends BaseZodErrors {
    email?: string[];
}

export interface DeleteAccountZodErrors extends BaseZodErrors {
    id?: string[];
    password?: string[];
}

export interface SetPasswordZodErrors extends BaseZodErrors {
    newPassword?: string[];
    confirmPassword?: string[];
}

export interface LoginAction extends BaseAction {
    zodErrors: LoginZodErrors | null;
}

export interface RegisterAction extends BaseAction {
    zodErrors: RegisterZodErrors | null;
}

export interface ForgotPasswordAction extends BaseAction {
    zodErrors: ForgotPasswordZodErrors | null;
}

export interface ResetPasswordAction extends BaseAction {
    zodErrors: ResetPasswordZodErrors | null;
}

export interface CreateProjectAction extends BaseAction {
    zodErrors: CreateProjectZodErrors | null;
}

export interface UpdateProjectAction extends BaseAction {
    zodErrors: UpdateProjectZodErrors | null;
}

export interface CreateTaskAction extends BaseAction {
    zodErrors: CreateTaskZodErrors | null;
}

export interface UpdateTaskAction extends BaseAction {
    zodErrors: UpdateTaskZodErrors | null;
}

export interface UpdateProfileAction extends BaseAction {
    zodErrors: UpdateProfileZodErrors | null;
}

export interface ChangePasswordAction extends BaseAction {
    zodErrors: ChangePasswordZodErrors | null;
}

export interface InviteMemberAction extends BaseAction {
    zodErrors: InviteMemberZodErrors | null;
}

export interface MfaSetupAction extends BaseAction {
    zodErrors: MfaSetupZodErrors | null;
}

export interface MfaDisableAction extends BaseAction {
    zodErrors: MfaDisableZodErrors | null;
}

export interface MfaEnableAction extends BaseAction {
    zodErrors: MfaEnableZodErrors | null;
}

export interface MfaBackupCodesAction extends BaseAction {
    zodErrors: MfaBackupCodesZodErrors | null;
}

export interface ResendVerificationAction extends BaseAction {
    zodErrors: ResendVerificationZodErrors | null;
}

export interface DeleteAccountAction extends BaseAction {
    zodErrors: DeleteAccountZodErrors | null;
}

export interface SetPasswordAction extends BaseAction {
    zodErrors: SetPasswordZodErrors | null;
}

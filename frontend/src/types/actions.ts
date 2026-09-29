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
    email?: string[];
    password?: string[];
    tempToken?: string[];
    token?: string[];
}

export interface RegisterZodErrors extends BaseZodErrors {
    name?: string[];
    surname?: string[];
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
    showPriorityEmoji?: string[];
    members?: string[];
    columns?: string[];
    categories?: string[];
    labels?: string[];
}

export interface UpdateProjectZodErrors extends BaseZodErrors {
    slug?: string[];
    icon?: string[];
    color?: string[];
    name?: string[];
    description?: string[];
    status?: string[];
    showPriorityEmoji?: string[];
    members?: string[];
    columns?: string[];
    newColumns?: string[];
    deletedColumnIds?: string[];
    categories?: string[];
    newCategories?: string[];
    deletedCategoryIds?: string[];
    labels?: string[];
    newLabels?: string[];
    deletedLabelIds?: string[];
    emails?: string[];
}

export interface CreateTaskZodErrors extends BaseZodErrors {
    title?: string[];
    description?: string[];
    startDate?: string[];
    dueDate?: string[];
    priority?: string[];
    slug?: string[];
    columnId?: string[];
    showProgress?: string[];
    members?: string[];
    categories?: string[];
    newCategories?: string[];
    subtasks?: string[];
    attachments?: string[];
    labels?: string[];
    newLabels?: string[];
}

export interface UpdateTaskZodErrors extends BaseZodErrors {
    title?: string[];
    description?: string[];
    startDate?: string[];
    dueDate?: string[];
    priority?: string[];
    taskId?: string[];
    columnId?: string[];
    showProgress?: string[];
    members?: string[];
    categories?: string[];
    subtasks?: string[];
    newSubtasks?: string[];
    newAttachments?: string[];
    labels?: string[];
}

export interface UpdateProfileZodErrors extends BaseZodErrors {
    avatar?: string[];
    name?: string[];
    surname?: string[];
    email?: string[];
    color?: string[];
}

export interface ChangePasswordZodErrors extends BaseZodErrors {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
}

export interface InviteMemberZodErrors extends BaseZodErrors {
    projectId?: string[];
    role?: string[];
    members?: string[];
}

export interface MfaEnableZodErrors extends BaseZodErrors {
    token?: string[];
}

export interface MfaDisableZodErrors extends BaseZodErrors {
    password?: string[];
    token?: string[];
}

export interface MfaRegenerateBackupCodesZodErrors extends BaseZodErrors {
    password?: string[];
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

export interface MfaEnableAction extends BaseAction {
    zodErrors: MfaEnableZodErrors | null;
}

export interface MfaDisableAction extends BaseAction {
    zodErrors: MfaDisableZodErrors | null;
}

export interface MfaRegenerateBackupCodesAction extends BaseAction {
    zodErrors: MfaRegenerateBackupCodesZodErrors | null;
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

export interface Register {
    name: string;
    surname: string;
    password: string;
    email: string;
}

export interface Login {
    email: string;
    password: string;
}

export interface ForgotPassword {
    email: string;
}

export interface ResetPassword {
    token: string;
    password: string;
    id: number;
}

export interface IRegister {
    name: string;
    surname: string;
    password: string;
    email: string;
}

export interface ILogin {
    email: string;
    password: string;
}

export interface IForgotPassword {
    email: string;
}

export interface IResetPassword {
    token: string;
    password: string;
    id: number;
}

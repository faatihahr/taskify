interface AuthResponse {
    user_id: string;
    name: string;
    email: string;
    token: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const registerUser: (name: string, email: string, password: string) => Promise<AuthResponse>;
export declare function loginUser(email: string, password: string): Promise<AuthResponse>;
export {};

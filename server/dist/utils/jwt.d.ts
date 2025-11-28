export interface UserPayload {
    id: string;
}
export declare function signToken(payload: UserPayload): string;
export declare function verifyToken(token: string): UserPayload;

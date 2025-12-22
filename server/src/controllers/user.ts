import { Request, Response } from "express";
import { registerUser, loginUser } from "../service/auth";
import { loginSchema, registerSchema } from "../validation/auth_joi";

export async function handleRegister(req: Request, res: Response) {
    // Ensure request body is parsed
    if (!req.body || Object.keys(req.body).length === 0) {
        const err = new Error("Request body is required. Make sure to send JSON data with Content-Type: application/json");
        (err as any).status = 400;
        throw err;
    }

    const {error} = registerSchema.validate(req.body);
    if (error) {
        const validationError = new Error(error.message);
        (validationError as any).status = 400;
        throw validationError;
    }

    const {name, email, password} = req.body;
    const result = await registerUser(name, email, password);
    res.status(201).json({ message : "User Registered", user: result});
}

export async function handleLogin(req: Request, res: Response){
    // Ensure request body is parsed
    if (!req.body || Object.keys(req.body).length === 0) {
        const err = new Error("Request body is required. Make sure to send JSON data with Content-Type: application/json");
        (err as any).status = 400;
        throw err;
    }

    const {error} = loginSchema.validate(req.body);
    if (error) {
        const validationError = new Error(error.message);
        (validationError as any).status = 400;
        throw validationError;
    }

    const {email, password} = req.body;
    // Dev stub: if USE_STUB_LOGIN=true in env, return a fake user quickly
    if (process.env.USE_STUB_LOGIN === 'true') {
        console.log('handleLogin: using dev stub for', email);
        return res.json({
            message: 'Login success',
            user_id: 'stub-user-id',
            name: 'Developer',
            email,
            token: 'stub-token',
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    try {
        const result = await loginUser(email, password);
        res.json({ message : "Login success", ...result});
    } catch (err) {
        console.error('handleLogin: error', err instanceof Error ? err.message : err);
        // If DB or other error and stub allowed, fallback to stub
        if (process.env.USE_STUB_LOGIN === 'true') {
            console.log('handleLogin: falling back to dev stub after error for', email);
            return res.json({
                message: 'Login success',
                user_id: 'stub-user-id',
                name: 'Developer',
                email,
                token: 'stub-token',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        res.status(401).json({ message: (err as Error).message || 'Login failed' });
    }
}

export async function handleLogout(req: Request, res: Response) {

    res.json({ message : "Logout success"});
}
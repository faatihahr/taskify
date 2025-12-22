import { Request, Response } from "express";
export declare function handleRegister(req: Request, res: Response): Promise<void>;
export declare function handleLogin(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function handleLogout(req: Request, res: Response): Promise<void>;

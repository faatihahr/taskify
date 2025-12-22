import { Request, Response } from 'express';
export declare const inviteMember: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const acceptInvitation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const acceptInvitationById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPendingInvitations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;

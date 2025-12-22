import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name?: string;
    };
}
export declare const createCard: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCard: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const moveCard: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCard: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCardById: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCard: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createComment: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadCoverImage: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const coverUploadMiddleware: (req: any, res: any, next: any) => any;
export declare const updateCardLabels: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAllLabels: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createChecklist: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createChecklistItem: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateChecklistItem: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteChecklistItem: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateChecklist: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteChecklist: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};

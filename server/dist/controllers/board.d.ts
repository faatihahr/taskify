import { Request, Response } from 'express';
export declare function createBoard(req: Request, res: Response): Promise<void>;
export declare function getUserBoards(req: Request, res: Response): Promise<void>;
export declare function getBoardById(req: Request, res: Response): Promise<void>;
export declare function updateBoard(req: Request, res: Response): Promise<void>;
export declare function deleteBoard(req: Request, res: Response): Promise<void>;

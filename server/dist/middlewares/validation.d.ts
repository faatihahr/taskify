import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
export declare const validate: (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;

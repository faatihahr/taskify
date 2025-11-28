import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class";
import * as Prisma from "./internal/prismaNamespace";
export * as $Enums from './enums';
export * from "./enums";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model Board
 *
 */
export type Board = Prisma.BoardModel;
/**
 * Model BoardMember
 *
 */
export type BoardMember = Prisma.BoardMemberModel;
/**
 * Model List
 *
 */
export type List = Prisma.ListModel;
/**
 * Model Card
 *
 */
export type Card = Prisma.CardModel;
/**
 * Model Label
 *
 */
export type Label = Prisma.LabelModel;
/**
 * Model Attachment
 *
 */
export type Attachment = Prisma.AttachmentModel;
/**
 * Model Comment
 *
 */
export type Comment = Prisma.CommentModel;
/**
 * Model Checklist
 *
 */
export type Checklist = Prisma.ChecklistModel;
/**
 * Model ChecklistItem
 *
 */
export type ChecklistItem = Prisma.ChecklistItemModel;
/**
 * Model Activity
 *
 */
export type Activity = Prisma.ActivityModel;

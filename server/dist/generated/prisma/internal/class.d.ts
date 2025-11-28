import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "./prismaNamespace";
export type LogOptions<ClientOptions extends Prisma.PrismaClientOptions> = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never;
export interface PrismaClientConstructor {
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
    new <Options extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, LogOpts extends LogOptions<Options> = LogOptions<Options>, OmitOpts extends Prisma.PrismaClientOptions['omit'] = Options extends {
        omit: infer U;
    } ? U : Prisma.PrismaClientOptions['omit'], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs>(options: Prisma.Subset<Options, Prisma.PrismaClientOptions>): PrismaClient<LogOpts, OmitOpts, ExtArgs>;
}
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
export interface PrismaClient<in LogOpts extends Prisma.LogLevel = never, in out OmitOpts extends Prisma.PrismaClientOptions['omit'] = undefined, in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['other'];
    };
    $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;
    /**
     * Connect with the database
     */
    $connect(): runtime.Types.Utils.JsPromise<void>;
    /**
     * Disconnect from the database
     */
    $disconnect(): runtime.Types.Utils.JsPromise<void>;
    /**
       * Executes a prepared raw query and returns the number of affected rows.
       * @example
       * ```
       * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
       * ```
       *
       * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
       */
    $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Executes a raw query and returns the number of affected rows.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
     */
    $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Performs a prepared raw query and returns the `SELECT` data.
     * @example
     * ```
     * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
     */
    $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Performs a raw query and returns the `SELECT` data.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
     */
    $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
     * @example
     * ```
     * const [george, bob, alice] = await prisma.$transaction([
     *   prisma.user.create({ data: { name: 'George' } }),
     *   prisma.user.create({ data: { name: 'Bob' } }),
     *   prisma.user.create({ data: { name: 'Alice' } }),
     * ])
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
     */
    $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;
    $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<R>;
    $extends: runtime.Types.Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<Prisma.TypeMapCb<OmitOpts>, {
        extArgs: ExtArgs;
    }>>;
    /**
 * `prisma.user`: Exposes CRUD operations for the **User** model.
  * Example usage:
  * ```ts
  * // Fetch zero or more Users
  * const users = await prisma.user.findMany()
  * ```
  */
    get user(): Prisma.UserDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.board`: Exposes CRUD operations for the **Board** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Boards
      * const boards = await prisma.board.findMany()
      * ```
      */
    get board(): Prisma.BoardDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.boardMember`: Exposes CRUD operations for the **BoardMember** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more BoardMembers
      * const boardMembers = await prisma.boardMember.findMany()
      * ```
      */
    get boardMember(): Prisma.BoardMemberDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.list`: Exposes CRUD operations for the **List** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Lists
      * const lists = await prisma.list.findMany()
      * ```
      */
    get list(): Prisma.ListDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.card`: Exposes CRUD operations for the **Card** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Cards
      * const cards = await prisma.card.findMany()
      * ```
      */
    get card(): Prisma.CardDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.label`: Exposes CRUD operations for the **Label** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Labels
      * const labels = await prisma.label.findMany()
      * ```
      */
    get label(): Prisma.LabelDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.attachment`: Exposes CRUD operations for the **Attachment** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Attachments
      * const attachments = await prisma.attachment.findMany()
      * ```
      */
    get attachment(): Prisma.AttachmentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.comment`: Exposes CRUD operations for the **Comment** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Comments
      * const comments = await prisma.comment.findMany()
      * ```
      */
    get comment(): Prisma.CommentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.checklist`: Exposes CRUD operations for the **Checklist** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Checklists
      * const checklists = await prisma.checklist.findMany()
      * ```
      */
    get checklist(): Prisma.ChecklistDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.checklistItem`: Exposes CRUD operations for the **ChecklistItem** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ChecklistItems
      * const checklistItems = await prisma.checklistItem.findMany()
      * ```
      */
    get checklistItem(): Prisma.ChecklistItemDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.activity`: Exposes CRUD operations for the **Activity** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Activities
      * const activities = await prisma.activity.findMany()
      * ```
      */
    get activity(): Prisma.ActivityDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
}
export declare function getPrismaClientClass(): PrismaClientConstructor;

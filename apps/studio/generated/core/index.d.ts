
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model CimsMessage
 * 
 */
export type CimsMessage = $Result.DefaultSelection<Prisma.$CimsMessagePayload>
/**
 * Model WorkfocusTask
 * 
 */
export type WorkfocusTask = $Result.DefaultSelection<Prisma.$WorkfocusTaskPayload>
/**
 * Model MemoryVendor
 * 
 */
export type MemoryVendor = $Result.DefaultSelection<Prisma.$MemoryVendorPayload>
/**
 * Model MemoryPack
 * 
 */
export type MemoryPack = $Result.DefaultSelection<Prisma.$MemoryPackPayload>
/**
 * Model MemoryPackItem
 * 
 */
export type MemoryPackItem = $Result.DefaultSelection<Prisma.$MemoryPackItemPayload>
/**
 * Model MemoryTenant
 * 
 */
export type MemoryTenant = $Result.DefaultSelection<Prisma.$MemoryTenantPayload>
/**
 * Model MemoryInstall
 * 
 */
export type MemoryInstall = $Result.DefaultSelection<Prisma.$MemoryInstallPayload>
/**
 * Model MemoryOverride
 * 
 */
export type MemoryOverride = $Result.DefaultSelection<Prisma.$MemoryOverridePayload>
/**
 * Model LearnedMemory
 * 
 */
export type LearnedMemory = $Result.DefaultSelection<Prisma.$LearnedMemoryPayload>
/**
 * Model CaiaMemory
 * 
 */
export type CaiaMemory = $Result.DefaultSelection<Prisma.$CaiaMemoryPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const MemoryKind: {
  fact: 'fact',
  preference: 'preference',
  task: 'task',
  note: 'note',
  identity: 'identity'
};

export type MemoryKind = (typeof MemoryKind)[keyof typeof MemoryKind]

}

export type MemoryKind = $Enums.MemoryKind

export const MemoryKind: typeof $Enums.MemoryKind

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

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
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cimsMessage`: Exposes CRUD operations for the **CimsMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CimsMessages
    * const cimsMessages = await prisma.cimsMessage.findMany()
    * ```
    */
  get cimsMessage(): Prisma.CimsMessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.workfocusTask`: Exposes CRUD operations for the **WorkfocusTask** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WorkfocusTasks
    * const workfocusTasks = await prisma.workfocusTask.findMany()
    * ```
    */
  get workfocusTask(): Prisma.WorkfocusTaskDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.memoryVendor`: Exposes CRUD operations for the **MemoryVendor** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MemoryVendors
    * const memoryVendors = await prisma.memoryVendor.findMany()
    * ```
    */
  get memoryVendor(): Prisma.MemoryVendorDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.memoryPack`: Exposes CRUD operations for the **MemoryPack** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MemoryPacks
    * const memoryPacks = await prisma.memoryPack.findMany()
    * ```
    */
  get memoryPack(): Prisma.MemoryPackDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.memoryPackItem`: Exposes CRUD operations for the **MemoryPackItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MemoryPackItems
    * const memoryPackItems = await prisma.memoryPackItem.findMany()
    * ```
    */
  get memoryPackItem(): Prisma.MemoryPackItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.memoryTenant`: Exposes CRUD operations for the **MemoryTenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MemoryTenants
    * const memoryTenants = await prisma.memoryTenant.findMany()
    * ```
    */
  get memoryTenant(): Prisma.MemoryTenantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.memoryInstall`: Exposes CRUD operations for the **MemoryInstall** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MemoryInstalls
    * const memoryInstalls = await prisma.memoryInstall.findMany()
    * ```
    */
  get memoryInstall(): Prisma.MemoryInstallDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.memoryOverride`: Exposes CRUD operations for the **MemoryOverride** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MemoryOverrides
    * const memoryOverrides = await prisma.memoryOverride.findMany()
    * ```
    */
  get memoryOverride(): Prisma.MemoryOverrideDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.learnedMemory`: Exposes CRUD operations for the **LearnedMemory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LearnedMemories
    * const learnedMemories = await prisma.learnedMemory.findMany()
    * ```
    */
  get learnedMemory(): Prisma.LearnedMemoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.caiaMemory`: Exposes CRUD operations for the **CaiaMemory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CaiaMemories
    * const caiaMemories = await prisma.caiaMemory.findMany()
    * ```
    */
  get caiaMemory(): Prisma.CaiaMemoryDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.2
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    CimsMessage: 'CimsMessage',
    WorkfocusTask: 'WorkfocusTask',
    MemoryVendor: 'MemoryVendor',
    MemoryPack: 'MemoryPack',
    MemoryPackItem: 'MemoryPackItem',
    MemoryTenant: 'MemoryTenant',
    MemoryInstall: 'MemoryInstall',
    MemoryOverride: 'MemoryOverride',
    LearnedMemory: 'LearnedMemory',
    CaiaMemory: 'CaiaMemory'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "cimsMessage" | "workfocusTask" | "memoryVendor" | "memoryPack" | "memoryPackItem" | "memoryTenant" | "memoryInstall" | "memoryOverride" | "learnedMemory" | "caiaMemory"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      CimsMessage: {
        payload: Prisma.$CimsMessagePayload<ExtArgs>
        fields: Prisma.CimsMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CimsMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CimsMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CimsMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CimsMessagePayload>
          }
          findFirst: {
            args: Prisma.CimsMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CimsMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CimsMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CimsMessagePayload>
          }
          findMany: {
            args: Prisma.CimsMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CimsMessagePayload>[]
          }
          create: {
            args: Prisma.CimsMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CimsMessagePayload>
          }
          createMany: {
            args: Prisma.CimsMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CimsMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CimsMessagePayload>[]
          }
          delete: {
            args: Prisma.CimsMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CimsMessagePayload>
          }
          update: {
            args: Prisma.CimsMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CimsMessagePayload>
          }
          deleteMany: {
            args: Prisma.CimsMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CimsMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CimsMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CimsMessagePayload>[]
          }
          upsert: {
            args: Prisma.CimsMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CimsMessagePayload>
          }
          aggregate: {
            args: Prisma.CimsMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCimsMessage>
          }
          groupBy: {
            args: Prisma.CimsMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<CimsMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.CimsMessageCountArgs<ExtArgs>
            result: $Utils.Optional<CimsMessageCountAggregateOutputType> | number
          }
        }
      }
      WorkfocusTask: {
        payload: Prisma.$WorkfocusTaskPayload<ExtArgs>
        fields: Prisma.WorkfocusTaskFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkfocusTaskFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkfocusTaskPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkfocusTaskFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkfocusTaskPayload>
          }
          findFirst: {
            args: Prisma.WorkfocusTaskFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkfocusTaskPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkfocusTaskFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkfocusTaskPayload>
          }
          findMany: {
            args: Prisma.WorkfocusTaskFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkfocusTaskPayload>[]
          }
          create: {
            args: Prisma.WorkfocusTaskCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkfocusTaskPayload>
          }
          createMany: {
            args: Prisma.WorkfocusTaskCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WorkfocusTaskCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkfocusTaskPayload>[]
          }
          delete: {
            args: Prisma.WorkfocusTaskDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkfocusTaskPayload>
          }
          update: {
            args: Prisma.WorkfocusTaskUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkfocusTaskPayload>
          }
          deleteMany: {
            args: Prisma.WorkfocusTaskDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkfocusTaskUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WorkfocusTaskUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkfocusTaskPayload>[]
          }
          upsert: {
            args: Prisma.WorkfocusTaskUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkfocusTaskPayload>
          }
          aggregate: {
            args: Prisma.WorkfocusTaskAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorkfocusTask>
          }
          groupBy: {
            args: Prisma.WorkfocusTaskGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkfocusTaskGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkfocusTaskCountArgs<ExtArgs>
            result: $Utils.Optional<WorkfocusTaskCountAggregateOutputType> | number
          }
        }
      }
      MemoryVendor: {
        payload: Prisma.$MemoryVendorPayload<ExtArgs>
        fields: Prisma.MemoryVendorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemoryVendorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryVendorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemoryVendorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryVendorPayload>
          }
          findFirst: {
            args: Prisma.MemoryVendorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryVendorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemoryVendorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryVendorPayload>
          }
          findMany: {
            args: Prisma.MemoryVendorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryVendorPayload>[]
          }
          create: {
            args: Prisma.MemoryVendorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryVendorPayload>
          }
          createMany: {
            args: Prisma.MemoryVendorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemoryVendorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryVendorPayload>[]
          }
          delete: {
            args: Prisma.MemoryVendorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryVendorPayload>
          }
          update: {
            args: Prisma.MemoryVendorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryVendorPayload>
          }
          deleteMany: {
            args: Prisma.MemoryVendorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemoryVendorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemoryVendorUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryVendorPayload>[]
          }
          upsert: {
            args: Prisma.MemoryVendorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryVendorPayload>
          }
          aggregate: {
            args: Prisma.MemoryVendorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemoryVendor>
          }
          groupBy: {
            args: Prisma.MemoryVendorGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemoryVendorGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemoryVendorCountArgs<ExtArgs>
            result: $Utils.Optional<MemoryVendorCountAggregateOutputType> | number
          }
        }
      }
      MemoryPack: {
        payload: Prisma.$MemoryPackPayload<ExtArgs>
        fields: Prisma.MemoryPackFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemoryPackFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemoryPackFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackPayload>
          }
          findFirst: {
            args: Prisma.MemoryPackFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemoryPackFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackPayload>
          }
          findMany: {
            args: Prisma.MemoryPackFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackPayload>[]
          }
          create: {
            args: Prisma.MemoryPackCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackPayload>
          }
          createMany: {
            args: Prisma.MemoryPackCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemoryPackCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackPayload>[]
          }
          delete: {
            args: Prisma.MemoryPackDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackPayload>
          }
          update: {
            args: Prisma.MemoryPackUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackPayload>
          }
          deleteMany: {
            args: Prisma.MemoryPackDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemoryPackUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemoryPackUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackPayload>[]
          }
          upsert: {
            args: Prisma.MemoryPackUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackPayload>
          }
          aggregate: {
            args: Prisma.MemoryPackAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemoryPack>
          }
          groupBy: {
            args: Prisma.MemoryPackGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemoryPackGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemoryPackCountArgs<ExtArgs>
            result: $Utils.Optional<MemoryPackCountAggregateOutputType> | number
          }
        }
      }
      MemoryPackItem: {
        payload: Prisma.$MemoryPackItemPayload<ExtArgs>
        fields: Prisma.MemoryPackItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemoryPackItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemoryPackItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackItemPayload>
          }
          findFirst: {
            args: Prisma.MemoryPackItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemoryPackItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackItemPayload>
          }
          findMany: {
            args: Prisma.MemoryPackItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackItemPayload>[]
          }
          create: {
            args: Prisma.MemoryPackItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackItemPayload>
          }
          createMany: {
            args: Prisma.MemoryPackItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemoryPackItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackItemPayload>[]
          }
          delete: {
            args: Prisma.MemoryPackItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackItemPayload>
          }
          update: {
            args: Prisma.MemoryPackItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackItemPayload>
          }
          deleteMany: {
            args: Prisma.MemoryPackItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemoryPackItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemoryPackItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackItemPayload>[]
          }
          upsert: {
            args: Prisma.MemoryPackItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPackItemPayload>
          }
          aggregate: {
            args: Prisma.MemoryPackItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemoryPackItem>
          }
          groupBy: {
            args: Prisma.MemoryPackItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemoryPackItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemoryPackItemCountArgs<ExtArgs>
            result: $Utils.Optional<MemoryPackItemCountAggregateOutputType> | number
          }
        }
      }
      MemoryTenant: {
        payload: Prisma.$MemoryTenantPayload<ExtArgs>
        fields: Prisma.MemoryTenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemoryTenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemoryTenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTenantPayload>
          }
          findFirst: {
            args: Prisma.MemoryTenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemoryTenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTenantPayload>
          }
          findMany: {
            args: Prisma.MemoryTenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTenantPayload>[]
          }
          create: {
            args: Prisma.MemoryTenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTenantPayload>
          }
          createMany: {
            args: Prisma.MemoryTenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemoryTenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTenantPayload>[]
          }
          delete: {
            args: Prisma.MemoryTenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTenantPayload>
          }
          update: {
            args: Prisma.MemoryTenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTenantPayload>
          }
          deleteMany: {
            args: Prisma.MemoryTenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemoryTenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemoryTenantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTenantPayload>[]
          }
          upsert: {
            args: Prisma.MemoryTenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryTenantPayload>
          }
          aggregate: {
            args: Prisma.MemoryTenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemoryTenant>
          }
          groupBy: {
            args: Prisma.MemoryTenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemoryTenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemoryTenantCountArgs<ExtArgs>
            result: $Utils.Optional<MemoryTenantCountAggregateOutputType> | number
          }
        }
      }
      MemoryInstall: {
        payload: Prisma.$MemoryInstallPayload<ExtArgs>
        fields: Prisma.MemoryInstallFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemoryInstallFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryInstallPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemoryInstallFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryInstallPayload>
          }
          findFirst: {
            args: Prisma.MemoryInstallFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryInstallPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemoryInstallFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryInstallPayload>
          }
          findMany: {
            args: Prisma.MemoryInstallFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryInstallPayload>[]
          }
          create: {
            args: Prisma.MemoryInstallCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryInstallPayload>
          }
          createMany: {
            args: Prisma.MemoryInstallCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemoryInstallCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryInstallPayload>[]
          }
          delete: {
            args: Prisma.MemoryInstallDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryInstallPayload>
          }
          update: {
            args: Prisma.MemoryInstallUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryInstallPayload>
          }
          deleteMany: {
            args: Prisma.MemoryInstallDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemoryInstallUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemoryInstallUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryInstallPayload>[]
          }
          upsert: {
            args: Prisma.MemoryInstallUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryInstallPayload>
          }
          aggregate: {
            args: Prisma.MemoryInstallAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemoryInstall>
          }
          groupBy: {
            args: Prisma.MemoryInstallGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemoryInstallGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemoryInstallCountArgs<ExtArgs>
            result: $Utils.Optional<MemoryInstallCountAggregateOutputType> | number
          }
        }
      }
      MemoryOverride: {
        payload: Prisma.$MemoryOverridePayload<ExtArgs>
        fields: Prisma.MemoryOverrideFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemoryOverrideFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryOverridePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemoryOverrideFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryOverridePayload>
          }
          findFirst: {
            args: Prisma.MemoryOverrideFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryOverridePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemoryOverrideFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryOverridePayload>
          }
          findMany: {
            args: Prisma.MemoryOverrideFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryOverridePayload>[]
          }
          create: {
            args: Prisma.MemoryOverrideCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryOverridePayload>
          }
          createMany: {
            args: Prisma.MemoryOverrideCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemoryOverrideCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryOverridePayload>[]
          }
          delete: {
            args: Prisma.MemoryOverrideDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryOverridePayload>
          }
          update: {
            args: Prisma.MemoryOverrideUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryOverridePayload>
          }
          deleteMany: {
            args: Prisma.MemoryOverrideDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemoryOverrideUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemoryOverrideUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryOverridePayload>[]
          }
          upsert: {
            args: Prisma.MemoryOverrideUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryOverridePayload>
          }
          aggregate: {
            args: Prisma.MemoryOverrideAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemoryOverride>
          }
          groupBy: {
            args: Prisma.MemoryOverrideGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemoryOverrideGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemoryOverrideCountArgs<ExtArgs>
            result: $Utils.Optional<MemoryOverrideCountAggregateOutputType> | number
          }
        }
      }
      LearnedMemory: {
        payload: Prisma.$LearnedMemoryPayload<ExtArgs>
        fields: Prisma.LearnedMemoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LearnedMemoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearnedMemoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LearnedMemoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearnedMemoryPayload>
          }
          findFirst: {
            args: Prisma.LearnedMemoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearnedMemoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LearnedMemoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearnedMemoryPayload>
          }
          findMany: {
            args: Prisma.LearnedMemoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearnedMemoryPayload>[]
          }
          create: {
            args: Prisma.LearnedMemoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearnedMemoryPayload>
          }
          createMany: {
            args: Prisma.LearnedMemoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LearnedMemoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearnedMemoryPayload>[]
          }
          delete: {
            args: Prisma.LearnedMemoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearnedMemoryPayload>
          }
          update: {
            args: Prisma.LearnedMemoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearnedMemoryPayload>
          }
          deleteMany: {
            args: Prisma.LearnedMemoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LearnedMemoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LearnedMemoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearnedMemoryPayload>[]
          }
          upsert: {
            args: Prisma.LearnedMemoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearnedMemoryPayload>
          }
          aggregate: {
            args: Prisma.LearnedMemoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLearnedMemory>
          }
          groupBy: {
            args: Prisma.LearnedMemoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<LearnedMemoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.LearnedMemoryCountArgs<ExtArgs>
            result: $Utils.Optional<LearnedMemoryCountAggregateOutputType> | number
          }
        }
      }
      CaiaMemory: {
        payload: Prisma.$CaiaMemoryPayload<ExtArgs>
        fields: Prisma.CaiaMemoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CaiaMemoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaiaMemoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CaiaMemoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaiaMemoryPayload>
          }
          findFirst: {
            args: Prisma.CaiaMemoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaiaMemoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CaiaMemoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaiaMemoryPayload>
          }
          findMany: {
            args: Prisma.CaiaMemoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaiaMemoryPayload>[]
          }
          create: {
            args: Prisma.CaiaMemoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaiaMemoryPayload>
          }
          createMany: {
            args: Prisma.CaiaMemoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CaiaMemoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaiaMemoryPayload>[]
          }
          delete: {
            args: Prisma.CaiaMemoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaiaMemoryPayload>
          }
          update: {
            args: Prisma.CaiaMemoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaiaMemoryPayload>
          }
          deleteMany: {
            args: Prisma.CaiaMemoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CaiaMemoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CaiaMemoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaiaMemoryPayload>[]
          }
          upsert: {
            args: Prisma.CaiaMemoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaiaMemoryPayload>
          }
          aggregate: {
            args: Prisma.CaiaMemoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCaiaMemory>
          }
          groupBy: {
            args: Prisma.CaiaMemoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<CaiaMemoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.CaiaMemoryCountArgs<ExtArgs>
            result: $Utils.Optional<CaiaMemoryCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    cimsMessage?: CimsMessageOmit
    workfocusTask?: WorkfocusTaskOmit
    memoryVendor?: MemoryVendorOmit
    memoryPack?: MemoryPackOmit
    memoryPackItem?: MemoryPackItemOmit
    memoryTenant?: MemoryTenantOmit
    memoryInstall?: MemoryInstallOmit
    memoryOverride?: MemoryOverrideOmit
    learnedMemory?: LearnedMemoryOmit
    caiaMemory?: CaiaMemoryOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    messages: number
    tasks: number
    learnedMemories: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | UserCountOutputTypeCountMessagesArgs
    tasks?: boolean | UserCountOutputTypeCountTasksArgs
    learnedMemories?: boolean | UserCountOutputTypeCountLearnedMemoriesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CimsMessageWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkfocusTaskWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountLearnedMemoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LearnedMemoryWhereInput
  }


  /**
   * Count Type MemoryVendorCountOutputType
   */

  export type MemoryVendorCountOutputType = {
    packs: number
  }

  export type MemoryVendorCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    packs?: boolean | MemoryVendorCountOutputTypeCountPacksArgs
  }

  // Custom InputTypes
  /**
   * MemoryVendorCountOutputType without action
   */
  export type MemoryVendorCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendorCountOutputType
     */
    select?: MemoryVendorCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MemoryVendorCountOutputType without action
   */
  export type MemoryVendorCountOutputTypeCountPacksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryPackWhereInput
  }


  /**
   * Count Type MemoryPackCountOutputType
   */

  export type MemoryPackCountOutputType = {
    items: number
    installs: number
  }

  export type MemoryPackCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | MemoryPackCountOutputTypeCountItemsArgs
    installs?: boolean | MemoryPackCountOutputTypeCountInstallsArgs
  }

  // Custom InputTypes
  /**
   * MemoryPackCountOutputType without action
   */
  export type MemoryPackCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackCountOutputType
     */
    select?: MemoryPackCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MemoryPackCountOutputType without action
   */
  export type MemoryPackCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryPackItemWhereInput
  }

  /**
   * MemoryPackCountOutputType without action
   */
  export type MemoryPackCountOutputTypeCountInstallsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryInstallWhereInput
  }


  /**
   * Count Type MemoryPackItemCountOutputType
   */

  export type MemoryPackItemCountOutputType = {
    overrides: number
  }

  export type MemoryPackItemCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    overrides?: boolean | MemoryPackItemCountOutputTypeCountOverridesArgs
  }

  // Custom InputTypes
  /**
   * MemoryPackItemCountOutputType without action
   */
  export type MemoryPackItemCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItemCountOutputType
     */
    select?: MemoryPackItemCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MemoryPackItemCountOutputType without action
   */
  export type MemoryPackItemCountOutputTypeCountOverridesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryOverrideWhereInput
  }


  /**
   * Count Type MemoryTenantCountOutputType
   */

  export type MemoryTenantCountOutputType = {
    installs: number
    overrides: number
  }

  export type MemoryTenantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    installs?: boolean | MemoryTenantCountOutputTypeCountInstallsArgs
    overrides?: boolean | MemoryTenantCountOutputTypeCountOverridesArgs
  }

  // Custom InputTypes
  /**
   * MemoryTenantCountOutputType without action
   */
  export type MemoryTenantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenantCountOutputType
     */
    select?: MemoryTenantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MemoryTenantCountOutputType without action
   */
  export type MemoryTenantCountOutputTypeCountInstallsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryInstallWhereInput
  }

  /**
   * MemoryTenantCountOutputType without action
   */
  export type MemoryTenantCountOutputTypeCountOverridesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryOverrideWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    displayName: string | null
    role: string | null
    createdAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    displayName: string | null
    role: string | null
    createdAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    displayName: number
    role: number
    createdAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    displayName?: true
    role?: true
    createdAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    displayName?: true
    role?: true
    createdAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    displayName?: true
    role?: true
    createdAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    displayName: string | null
    role: string
    createdAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    displayName?: boolean
    role?: boolean
    createdAt?: boolean
    messages?: boolean | User$messagesArgs<ExtArgs>
    tasks?: boolean | User$tasksArgs<ExtArgs>
    learnedMemories?: boolean | User$learnedMemoriesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    displayName?: boolean
    role?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    displayName?: boolean
    role?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    displayName?: boolean
    role?: boolean
    createdAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "displayName" | "role" | "createdAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | User$messagesArgs<ExtArgs>
    tasks?: boolean | User$tasksArgs<ExtArgs>
    learnedMemories?: boolean | User$learnedMemoriesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      messages: Prisma.$CimsMessagePayload<ExtArgs>[]
      tasks: Prisma.$WorkfocusTaskPayload<ExtArgs>[]
      learnedMemories: Prisma.$LearnedMemoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      displayName: string | null
      role: string
      createdAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    messages<T extends User$messagesArgs<ExtArgs> = {}>(args?: Subset<T, User$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CimsMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tasks<T extends User$tasksArgs<ExtArgs> = {}>(args?: Subset<T, User$tasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkfocusTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    learnedMemories<T extends User$learnedMemoriesArgs<ExtArgs> = {}>(args?: Subset<T, User$learnedMemoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearnedMemoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly displayName: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.messages
   */
  export type User$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageInclude<ExtArgs> | null
    where?: CimsMessageWhereInput
    orderBy?: CimsMessageOrderByWithRelationInput | CimsMessageOrderByWithRelationInput[]
    cursor?: CimsMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CimsMessageScalarFieldEnum | CimsMessageScalarFieldEnum[]
  }

  /**
   * User.tasks
   */
  export type User$tasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskInclude<ExtArgs> | null
    where?: WorkfocusTaskWhereInput
    orderBy?: WorkfocusTaskOrderByWithRelationInput | WorkfocusTaskOrderByWithRelationInput[]
    cursor?: WorkfocusTaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WorkfocusTaskScalarFieldEnum | WorkfocusTaskScalarFieldEnum[]
  }

  /**
   * User.learnedMemories
   */
  export type User$learnedMemoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryInclude<ExtArgs> | null
    where?: LearnedMemoryWhereInput
    orderBy?: LearnedMemoryOrderByWithRelationInput | LearnedMemoryOrderByWithRelationInput[]
    cursor?: LearnedMemoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LearnedMemoryScalarFieldEnum | LearnedMemoryScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model CimsMessage
   */

  export type AggregateCimsMessage = {
    _count: CimsMessageCountAggregateOutputType | null
    _min: CimsMessageMinAggregateOutputType | null
    _max: CimsMessageMaxAggregateOutputType | null
  }

  export type CimsMessageMinAggregateOutputType = {
    id: string | null
    threadId: string | null
    channel: string | null
    direction: string | null
    body: string | null
    mediaUrl: string | null
    createdAt: Date | null
    senderUserId: string | null
  }

  export type CimsMessageMaxAggregateOutputType = {
    id: string | null
    threadId: string | null
    channel: string | null
    direction: string | null
    body: string | null
    mediaUrl: string | null
    createdAt: Date | null
    senderUserId: string | null
  }

  export type CimsMessageCountAggregateOutputType = {
    id: number
    threadId: number
    channel: number
    direction: number
    body: number
    mediaUrl: number
    meta: number
    createdAt: number
    senderUserId: number
    _all: number
  }


  export type CimsMessageMinAggregateInputType = {
    id?: true
    threadId?: true
    channel?: true
    direction?: true
    body?: true
    mediaUrl?: true
    createdAt?: true
    senderUserId?: true
  }

  export type CimsMessageMaxAggregateInputType = {
    id?: true
    threadId?: true
    channel?: true
    direction?: true
    body?: true
    mediaUrl?: true
    createdAt?: true
    senderUserId?: true
  }

  export type CimsMessageCountAggregateInputType = {
    id?: true
    threadId?: true
    channel?: true
    direction?: true
    body?: true
    mediaUrl?: true
    meta?: true
    createdAt?: true
    senderUserId?: true
    _all?: true
  }

  export type CimsMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CimsMessage to aggregate.
     */
    where?: CimsMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CimsMessages to fetch.
     */
    orderBy?: CimsMessageOrderByWithRelationInput | CimsMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CimsMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CimsMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CimsMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CimsMessages
    **/
    _count?: true | CimsMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CimsMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CimsMessageMaxAggregateInputType
  }

  export type GetCimsMessageAggregateType<T extends CimsMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateCimsMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCimsMessage[P]>
      : GetScalarType<T[P], AggregateCimsMessage[P]>
  }




  export type CimsMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CimsMessageWhereInput
    orderBy?: CimsMessageOrderByWithAggregationInput | CimsMessageOrderByWithAggregationInput[]
    by: CimsMessageScalarFieldEnum[] | CimsMessageScalarFieldEnum
    having?: CimsMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CimsMessageCountAggregateInputType | true
    _min?: CimsMessageMinAggregateInputType
    _max?: CimsMessageMaxAggregateInputType
  }

  export type CimsMessageGroupByOutputType = {
    id: string
    threadId: string | null
    channel: string
    direction: string
    body: string | null
    mediaUrl: string | null
    meta: JsonValue
    createdAt: Date
    senderUserId: string | null
    _count: CimsMessageCountAggregateOutputType | null
    _min: CimsMessageMinAggregateOutputType | null
    _max: CimsMessageMaxAggregateOutputType | null
  }

  type GetCimsMessageGroupByPayload<T extends CimsMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CimsMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CimsMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CimsMessageGroupByOutputType[P]>
            : GetScalarType<T[P], CimsMessageGroupByOutputType[P]>
        }
      >
    >


  export type CimsMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    threadId?: boolean
    channel?: boolean
    direction?: boolean
    body?: boolean
    mediaUrl?: boolean
    meta?: boolean
    createdAt?: boolean
    senderUserId?: boolean
    sender?: boolean | CimsMessage$senderArgs<ExtArgs>
  }, ExtArgs["result"]["cimsMessage"]>

  export type CimsMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    threadId?: boolean
    channel?: boolean
    direction?: boolean
    body?: boolean
    mediaUrl?: boolean
    meta?: boolean
    createdAt?: boolean
    senderUserId?: boolean
    sender?: boolean | CimsMessage$senderArgs<ExtArgs>
  }, ExtArgs["result"]["cimsMessage"]>

  export type CimsMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    threadId?: boolean
    channel?: boolean
    direction?: boolean
    body?: boolean
    mediaUrl?: boolean
    meta?: boolean
    createdAt?: boolean
    senderUserId?: boolean
    sender?: boolean | CimsMessage$senderArgs<ExtArgs>
  }, ExtArgs["result"]["cimsMessage"]>

  export type CimsMessageSelectScalar = {
    id?: boolean
    threadId?: boolean
    channel?: boolean
    direction?: boolean
    body?: boolean
    mediaUrl?: boolean
    meta?: boolean
    createdAt?: boolean
    senderUserId?: boolean
  }

  export type CimsMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "threadId" | "channel" | "direction" | "body" | "mediaUrl" | "meta" | "createdAt" | "senderUserId", ExtArgs["result"]["cimsMessage"]>
  export type CimsMessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sender?: boolean | CimsMessage$senderArgs<ExtArgs>
  }
  export type CimsMessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sender?: boolean | CimsMessage$senderArgs<ExtArgs>
  }
  export type CimsMessageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sender?: boolean | CimsMessage$senderArgs<ExtArgs>
  }

  export type $CimsMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CimsMessage"
    objects: {
      sender: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      threadId: string | null
      channel: string
      direction: string
      body: string | null
      mediaUrl: string | null
      meta: Prisma.JsonValue
      createdAt: Date
      senderUserId: string | null
    }, ExtArgs["result"]["cimsMessage"]>
    composites: {}
  }

  type CimsMessageGetPayload<S extends boolean | null | undefined | CimsMessageDefaultArgs> = $Result.GetResult<Prisma.$CimsMessagePayload, S>

  type CimsMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CimsMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CimsMessageCountAggregateInputType | true
    }

  export interface CimsMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CimsMessage'], meta: { name: 'CimsMessage' } }
    /**
     * Find zero or one CimsMessage that matches the filter.
     * @param {CimsMessageFindUniqueArgs} args - Arguments to find a CimsMessage
     * @example
     * // Get one CimsMessage
     * const cimsMessage = await prisma.cimsMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CimsMessageFindUniqueArgs>(args: SelectSubset<T, CimsMessageFindUniqueArgs<ExtArgs>>): Prisma__CimsMessageClient<$Result.GetResult<Prisma.$CimsMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CimsMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CimsMessageFindUniqueOrThrowArgs} args - Arguments to find a CimsMessage
     * @example
     * // Get one CimsMessage
     * const cimsMessage = await prisma.cimsMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CimsMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, CimsMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CimsMessageClient<$Result.GetResult<Prisma.$CimsMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CimsMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CimsMessageFindFirstArgs} args - Arguments to find a CimsMessage
     * @example
     * // Get one CimsMessage
     * const cimsMessage = await prisma.cimsMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CimsMessageFindFirstArgs>(args?: SelectSubset<T, CimsMessageFindFirstArgs<ExtArgs>>): Prisma__CimsMessageClient<$Result.GetResult<Prisma.$CimsMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CimsMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CimsMessageFindFirstOrThrowArgs} args - Arguments to find a CimsMessage
     * @example
     * // Get one CimsMessage
     * const cimsMessage = await prisma.cimsMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CimsMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, CimsMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__CimsMessageClient<$Result.GetResult<Prisma.$CimsMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CimsMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CimsMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CimsMessages
     * const cimsMessages = await prisma.cimsMessage.findMany()
     * 
     * // Get first 10 CimsMessages
     * const cimsMessages = await prisma.cimsMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cimsMessageWithIdOnly = await prisma.cimsMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CimsMessageFindManyArgs>(args?: SelectSubset<T, CimsMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CimsMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CimsMessage.
     * @param {CimsMessageCreateArgs} args - Arguments to create a CimsMessage.
     * @example
     * // Create one CimsMessage
     * const CimsMessage = await prisma.cimsMessage.create({
     *   data: {
     *     // ... data to create a CimsMessage
     *   }
     * })
     * 
     */
    create<T extends CimsMessageCreateArgs>(args: SelectSubset<T, CimsMessageCreateArgs<ExtArgs>>): Prisma__CimsMessageClient<$Result.GetResult<Prisma.$CimsMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CimsMessages.
     * @param {CimsMessageCreateManyArgs} args - Arguments to create many CimsMessages.
     * @example
     * // Create many CimsMessages
     * const cimsMessage = await prisma.cimsMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CimsMessageCreateManyArgs>(args?: SelectSubset<T, CimsMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CimsMessages and returns the data saved in the database.
     * @param {CimsMessageCreateManyAndReturnArgs} args - Arguments to create many CimsMessages.
     * @example
     * // Create many CimsMessages
     * const cimsMessage = await prisma.cimsMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CimsMessages and only return the `id`
     * const cimsMessageWithIdOnly = await prisma.cimsMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CimsMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, CimsMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CimsMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CimsMessage.
     * @param {CimsMessageDeleteArgs} args - Arguments to delete one CimsMessage.
     * @example
     * // Delete one CimsMessage
     * const CimsMessage = await prisma.cimsMessage.delete({
     *   where: {
     *     // ... filter to delete one CimsMessage
     *   }
     * })
     * 
     */
    delete<T extends CimsMessageDeleteArgs>(args: SelectSubset<T, CimsMessageDeleteArgs<ExtArgs>>): Prisma__CimsMessageClient<$Result.GetResult<Prisma.$CimsMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CimsMessage.
     * @param {CimsMessageUpdateArgs} args - Arguments to update one CimsMessage.
     * @example
     * // Update one CimsMessage
     * const cimsMessage = await prisma.cimsMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CimsMessageUpdateArgs>(args: SelectSubset<T, CimsMessageUpdateArgs<ExtArgs>>): Prisma__CimsMessageClient<$Result.GetResult<Prisma.$CimsMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CimsMessages.
     * @param {CimsMessageDeleteManyArgs} args - Arguments to filter CimsMessages to delete.
     * @example
     * // Delete a few CimsMessages
     * const { count } = await prisma.cimsMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CimsMessageDeleteManyArgs>(args?: SelectSubset<T, CimsMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CimsMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CimsMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CimsMessages
     * const cimsMessage = await prisma.cimsMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CimsMessageUpdateManyArgs>(args: SelectSubset<T, CimsMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CimsMessages and returns the data updated in the database.
     * @param {CimsMessageUpdateManyAndReturnArgs} args - Arguments to update many CimsMessages.
     * @example
     * // Update many CimsMessages
     * const cimsMessage = await prisma.cimsMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CimsMessages and only return the `id`
     * const cimsMessageWithIdOnly = await prisma.cimsMessage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CimsMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, CimsMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CimsMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CimsMessage.
     * @param {CimsMessageUpsertArgs} args - Arguments to update or create a CimsMessage.
     * @example
     * // Update or create a CimsMessage
     * const cimsMessage = await prisma.cimsMessage.upsert({
     *   create: {
     *     // ... data to create a CimsMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CimsMessage we want to update
     *   }
     * })
     */
    upsert<T extends CimsMessageUpsertArgs>(args: SelectSubset<T, CimsMessageUpsertArgs<ExtArgs>>): Prisma__CimsMessageClient<$Result.GetResult<Prisma.$CimsMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CimsMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CimsMessageCountArgs} args - Arguments to filter CimsMessages to count.
     * @example
     * // Count the number of CimsMessages
     * const count = await prisma.cimsMessage.count({
     *   where: {
     *     // ... the filter for the CimsMessages we want to count
     *   }
     * })
    **/
    count<T extends CimsMessageCountArgs>(
      args?: Subset<T, CimsMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CimsMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CimsMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CimsMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CimsMessageAggregateArgs>(args: Subset<T, CimsMessageAggregateArgs>): Prisma.PrismaPromise<GetCimsMessageAggregateType<T>>

    /**
     * Group by CimsMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CimsMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CimsMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CimsMessageGroupByArgs['orderBy'] }
        : { orderBy?: CimsMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CimsMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCimsMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CimsMessage model
   */
  readonly fields: CimsMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CimsMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CimsMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sender<T extends CimsMessage$senderArgs<ExtArgs> = {}>(args?: Subset<T, CimsMessage$senderArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CimsMessage model
   */
  interface CimsMessageFieldRefs {
    readonly id: FieldRef<"CimsMessage", 'String'>
    readonly threadId: FieldRef<"CimsMessage", 'String'>
    readonly channel: FieldRef<"CimsMessage", 'String'>
    readonly direction: FieldRef<"CimsMessage", 'String'>
    readonly body: FieldRef<"CimsMessage", 'String'>
    readonly mediaUrl: FieldRef<"CimsMessage", 'String'>
    readonly meta: FieldRef<"CimsMessage", 'Json'>
    readonly createdAt: FieldRef<"CimsMessage", 'DateTime'>
    readonly senderUserId: FieldRef<"CimsMessage", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CimsMessage findUnique
   */
  export type CimsMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageInclude<ExtArgs> | null
    /**
     * Filter, which CimsMessage to fetch.
     */
    where: CimsMessageWhereUniqueInput
  }

  /**
   * CimsMessage findUniqueOrThrow
   */
  export type CimsMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageInclude<ExtArgs> | null
    /**
     * Filter, which CimsMessage to fetch.
     */
    where: CimsMessageWhereUniqueInput
  }

  /**
   * CimsMessage findFirst
   */
  export type CimsMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageInclude<ExtArgs> | null
    /**
     * Filter, which CimsMessage to fetch.
     */
    where?: CimsMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CimsMessages to fetch.
     */
    orderBy?: CimsMessageOrderByWithRelationInput | CimsMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CimsMessages.
     */
    cursor?: CimsMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CimsMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CimsMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CimsMessages.
     */
    distinct?: CimsMessageScalarFieldEnum | CimsMessageScalarFieldEnum[]
  }

  /**
   * CimsMessage findFirstOrThrow
   */
  export type CimsMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageInclude<ExtArgs> | null
    /**
     * Filter, which CimsMessage to fetch.
     */
    where?: CimsMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CimsMessages to fetch.
     */
    orderBy?: CimsMessageOrderByWithRelationInput | CimsMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CimsMessages.
     */
    cursor?: CimsMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CimsMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CimsMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CimsMessages.
     */
    distinct?: CimsMessageScalarFieldEnum | CimsMessageScalarFieldEnum[]
  }

  /**
   * CimsMessage findMany
   */
  export type CimsMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageInclude<ExtArgs> | null
    /**
     * Filter, which CimsMessages to fetch.
     */
    where?: CimsMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CimsMessages to fetch.
     */
    orderBy?: CimsMessageOrderByWithRelationInput | CimsMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CimsMessages.
     */
    cursor?: CimsMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CimsMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CimsMessages.
     */
    skip?: number
    distinct?: CimsMessageScalarFieldEnum | CimsMessageScalarFieldEnum[]
  }

  /**
   * CimsMessage create
   */
  export type CimsMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageInclude<ExtArgs> | null
    /**
     * The data needed to create a CimsMessage.
     */
    data: XOR<CimsMessageCreateInput, CimsMessageUncheckedCreateInput>
  }

  /**
   * CimsMessage createMany
   */
  export type CimsMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CimsMessages.
     */
    data: CimsMessageCreateManyInput | CimsMessageCreateManyInput[]
  }

  /**
   * CimsMessage createManyAndReturn
   */
  export type CimsMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * The data used to create many CimsMessages.
     */
    data: CimsMessageCreateManyInput | CimsMessageCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CimsMessage update
   */
  export type CimsMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageInclude<ExtArgs> | null
    /**
     * The data needed to update a CimsMessage.
     */
    data: XOR<CimsMessageUpdateInput, CimsMessageUncheckedUpdateInput>
    /**
     * Choose, which CimsMessage to update.
     */
    where: CimsMessageWhereUniqueInput
  }

  /**
   * CimsMessage updateMany
   */
  export type CimsMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CimsMessages.
     */
    data: XOR<CimsMessageUpdateManyMutationInput, CimsMessageUncheckedUpdateManyInput>
    /**
     * Filter which CimsMessages to update
     */
    where?: CimsMessageWhereInput
    /**
     * Limit how many CimsMessages to update.
     */
    limit?: number
  }

  /**
   * CimsMessage updateManyAndReturn
   */
  export type CimsMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * The data used to update CimsMessages.
     */
    data: XOR<CimsMessageUpdateManyMutationInput, CimsMessageUncheckedUpdateManyInput>
    /**
     * Filter which CimsMessages to update
     */
    where?: CimsMessageWhereInput
    /**
     * Limit how many CimsMessages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CimsMessage upsert
   */
  export type CimsMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageInclude<ExtArgs> | null
    /**
     * The filter to search for the CimsMessage to update in case it exists.
     */
    where: CimsMessageWhereUniqueInput
    /**
     * In case the CimsMessage found by the `where` argument doesn't exist, create a new CimsMessage with this data.
     */
    create: XOR<CimsMessageCreateInput, CimsMessageUncheckedCreateInput>
    /**
     * In case the CimsMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CimsMessageUpdateInput, CimsMessageUncheckedUpdateInput>
  }

  /**
   * CimsMessage delete
   */
  export type CimsMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageInclude<ExtArgs> | null
    /**
     * Filter which CimsMessage to delete.
     */
    where: CimsMessageWhereUniqueInput
  }

  /**
   * CimsMessage deleteMany
   */
  export type CimsMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CimsMessages to delete
     */
    where?: CimsMessageWhereInput
    /**
     * Limit how many CimsMessages to delete.
     */
    limit?: number
  }

  /**
   * CimsMessage.sender
   */
  export type CimsMessage$senderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * CimsMessage without action
   */
  export type CimsMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CimsMessage
     */
    select?: CimsMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CimsMessage
     */
    omit?: CimsMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CimsMessageInclude<ExtArgs> | null
  }


  /**
   * Model WorkfocusTask
   */

  export type AggregateWorkfocusTask = {
    _count: WorkfocusTaskCountAggregateOutputType | null
    _min: WorkfocusTaskMinAggregateOutputType | null
    _max: WorkfocusTaskMaxAggregateOutputType | null
  }

  export type WorkfocusTaskMinAggregateOutputType = {
    id: string | null
    ownerUserId: string | null
    bucket: string | null
    title: string | null
    status: string | null
    dueAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WorkfocusTaskMaxAggregateOutputType = {
    id: string | null
    ownerUserId: string | null
    bucket: string | null
    title: string | null
    status: string | null
    dueAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WorkfocusTaskCountAggregateOutputType = {
    id: number
    ownerUserId: number
    bucket: number
    title: number
    status: number
    dueAt: number
    meta: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WorkfocusTaskMinAggregateInputType = {
    id?: true
    ownerUserId?: true
    bucket?: true
    title?: true
    status?: true
    dueAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WorkfocusTaskMaxAggregateInputType = {
    id?: true
    ownerUserId?: true
    bucket?: true
    title?: true
    status?: true
    dueAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WorkfocusTaskCountAggregateInputType = {
    id?: true
    ownerUserId?: true
    bucket?: true
    title?: true
    status?: true
    dueAt?: true
    meta?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WorkfocusTaskAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkfocusTask to aggregate.
     */
    where?: WorkfocusTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkfocusTasks to fetch.
     */
    orderBy?: WorkfocusTaskOrderByWithRelationInput | WorkfocusTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkfocusTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkfocusTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkfocusTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WorkfocusTasks
    **/
    _count?: true | WorkfocusTaskCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkfocusTaskMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkfocusTaskMaxAggregateInputType
  }

  export type GetWorkfocusTaskAggregateType<T extends WorkfocusTaskAggregateArgs> = {
        [P in keyof T & keyof AggregateWorkfocusTask]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkfocusTask[P]>
      : GetScalarType<T[P], AggregateWorkfocusTask[P]>
  }




  export type WorkfocusTaskGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkfocusTaskWhereInput
    orderBy?: WorkfocusTaskOrderByWithAggregationInput | WorkfocusTaskOrderByWithAggregationInput[]
    by: WorkfocusTaskScalarFieldEnum[] | WorkfocusTaskScalarFieldEnum
    having?: WorkfocusTaskScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkfocusTaskCountAggregateInputType | true
    _min?: WorkfocusTaskMinAggregateInputType
    _max?: WorkfocusTaskMaxAggregateInputType
  }

  export type WorkfocusTaskGroupByOutputType = {
    id: string
    ownerUserId: string | null
    bucket: string
    title: string
    status: string
    dueAt: Date | null
    meta: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: WorkfocusTaskCountAggregateOutputType | null
    _min: WorkfocusTaskMinAggregateOutputType | null
    _max: WorkfocusTaskMaxAggregateOutputType | null
  }

  type GetWorkfocusTaskGroupByPayload<T extends WorkfocusTaskGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkfocusTaskGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkfocusTaskGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkfocusTaskGroupByOutputType[P]>
            : GetScalarType<T[P], WorkfocusTaskGroupByOutputType[P]>
        }
      >
    >


  export type WorkfocusTaskSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ownerUserId?: boolean
    bucket?: boolean
    title?: boolean
    status?: boolean
    dueAt?: boolean
    meta?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | WorkfocusTask$ownerArgs<ExtArgs>
  }, ExtArgs["result"]["workfocusTask"]>

  export type WorkfocusTaskSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ownerUserId?: boolean
    bucket?: boolean
    title?: boolean
    status?: boolean
    dueAt?: boolean
    meta?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | WorkfocusTask$ownerArgs<ExtArgs>
  }, ExtArgs["result"]["workfocusTask"]>

  export type WorkfocusTaskSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ownerUserId?: boolean
    bucket?: boolean
    title?: boolean
    status?: boolean
    dueAt?: boolean
    meta?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | WorkfocusTask$ownerArgs<ExtArgs>
  }, ExtArgs["result"]["workfocusTask"]>

  export type WorkfocusTaskSelectScalar = {
    id?: boolean
    ownerUserId?: boolean
    bucket?: boolean
    title?: boolean
    status?: boolean
    dueAt?: boolean
    meta?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WorkfocusTaskOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ownerUserId" | "bucket" | "title" | "status" | "dueAt" | "meta" | "createdAt" | "updatedAt", ExtArgs["result"]["workfocusTask"]>
  export type WorkfocusTaskInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | WorkfocusTask$ownerArgs<ExtArgs>
  }
  export type WorkfocusTaskIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | WorkfocusTask$ownerArgs<ExtArgs>
  }
  export type WorkfocusTaskIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | WorkfocusTask$ownerArgs<ExtArgs>
  }

  export type $WorkfocusTaskPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WorkfocusTask"
    objects: {
      owner: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ownerUserId: string | null
      bucket: string
      title: string
      status: string
      dueAt: Date | null
      meta: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["workfocusTask"]>
    composites: {}
  }

  type WorkfocusTaskGetPayload<S extends boolean | null | undefined | WorkfocusTaskDefaultArgs> = $Result.GetResult<Prisma.$WorkfocusTaskPayload, S>

  type WorkfocusTaskCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WorkfocusTaskFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WorkfocusTaskCountAggregateInputType | true
    }

  export interface WorkfocusTaskDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WorkfocusTask'], meta: { name: 'WorkfocusTask' } }
    /**
     * Find zero or one WorkfocusTask that matches the filter.
     * @param {WorkfocusTaskFindUniqueArgs} args - Arguments to find a WorkfocusTask
     * @example
     * // Get one WorkfocusTask
     * const workfocusTask = await prisma.workfocusTask.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkfocusTaskFindUniqueArgs>(args: SelectSubset<T, WorkfocusTaskFindUniqueArgs<ExtArgs>>): Prisma__WorkfocusTaskClient<$Result.GetResult<Prisma.$WorkfocusTaskPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WorkfocusTask that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WorkfocusTaskFindUniqueOrThrowArgs} args - Arguments to find a WorkfocusTask
     * @example
     * // Get one WorkfocusTask
     * const workfocusTask = await prisma.workfocusTask.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkfocusTaskFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkfocusTaskFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkfocusTaskClient<$Result.GetResult<Prisma.$WorkfocusTaskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WorkfocusTask that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkfocusTaskFindFirstArgs} args - Arguments to find a WorkfocusTask
     * @example
     * // Get one WorkfocusTask
     * const workfocusTask = await prisma.workfocusTask.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkfocusTaskFindFirstArgs>(args?: SelectSubset<T, WorkfocusTaskFindFirstArgs<ExtArgs>>): Prisma__WorkfocusTaskClient<$Result.GetResult<Prisma.$WorkfocusTaskPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WorkfocusTask that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkfocusTaskFindFirstOrThrowArgs} args - Arguments to find a WorkfocusTask
     * @example
     * // Get one WorkfocusTask
     * const workfocusTask = await prisma.workfocusTask.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkfocusTaskFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkfocusTaskFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkfocusTaskClient<$Result.GetResult<Prisma.$WorkfocusTaskPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WorkfocusTasks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkfocusTaskFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WorkfocusTasks
     * const workfocusTasks = await prisma.workfocusTask.findMany()
     * 
     * // Get first 10 WorkfocusTasks
     * const workfocusTasks = await prisma.workfocusTask.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workfocusTaskWithIdOnly = await prisma.workfocusTask.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkfocusTaskFindManyArgs>(args?: SelectSubset<T, WorkfocusTaskFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkfocusTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WorkfocusTask.
     * @param {WorkfocusTaskCreateArgs} args - Arguments to create a WorkfocusTask.
     * @example
     * // Create one WorkfocusTask
     * const WorkfocusTask = await prisma.workfocusTask.create({
     *   data: {
     *     // ... data to create a WorkfocusTask
     *   }
     * })
     * 
     */
    create<T extends WorkfocusTaskCreateArgs>(args: SelectSubset<T, WorkfocusTaskCreateArgs<ExtArgs>>): Prisma__WorkfocusTaskClient<$Result.GetResult<Prisma.$WorkfocusTaskPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WorkfocusTasks.
     * @param {WorkfocusTaskCreateManyArgs} args - Arguments to create many WorkfocusTasks.
     * @example
     * // Create many WorkfocusTasks
     * const workfocusTask = await prisma.workfocusTask.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkfocusTaskCreateManyArgs>(args?: SelectSubset<T, WorkfocusTaskCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WorkfocusTasks and returns the data saved in the database.
     * @param {WorkfocusTaskCreateManyAndReturnArgs} args - Arguments to create many WorkfocusTasks.
     * @example
     * // Create many WorkfocusTasks
     * const workfocusTask = await prisma.workfocusTask.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WorkfocusTasks and only return the `id`
     * const workfocusTaskWithIdOnly = await prisma.workfocusTask.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WorkfocusTaskCreateManyAndReturnArgs>(args?: SelectSubset<T, WorkfocusTaskCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkfocusTaskPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WorkfocusTask.
     * @param {WorkfocusTaskDeleteArgs} args - Arguments to delete one WorkfocusTask.
     * @example
     * // Delete one WorkfocusTask
     * const WorkfocusTask = await prisma.workfocusTask.delete({
     *   where: {
     *     // ... filter to delete one WorkfocusTask
     *   }
     * })
     * 
     */
    delete<T extends WorkfocusTaskDeleteArgs>(args: SelectSubset<T, WorkfocusTaskDeleteArgs<ExtArgs>>): Prisma__WorkfocusTaskClient<$Result.GetResult<Prisma.$WorkfocusTaskPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WorkfocusTask.
     * @param {WorkfocusTaskUpdateArgs} args - Arguments to update one WorkfocusTask.
     * @example
     * // Update one WorkfocusTask
     * const workfocusTask = await prisma.workfocusTask.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkfocusTaskUpdateArgs>(args: SelectSubset<T, WorkfocusTaskUpdateArgs<ExtArgs>>): Prisma__WorkfocusTaskClient<$Result.GetResult<Prisma.$WorkfocusTaskPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WorkfocusTasks.
     * @param {WorkfocusTaskDeleteManyArgs} args - Arguments to filter WorkfocusTasks to delete.
     * @example
     * // Delete a few WorkfocusTasks
     * const { count } = await prisma.workfocusTask.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkfocusTaskDeleteManyArgs>(args?: SelectSubset<T, WorkfocusTaskDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkfocusTasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkfocusTaskUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WorkfocusTasks
     * const workfocusTask = await prisma.workfocusTask.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkfocusTaskUpdateManyArgs>(args: SelectSubset<T, WorkfocusTaskUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkfocusTasks and returns the data updated in the database.
     * @param {WorkfocusTaskUpdateManyAndReturnArgs} args - Arguments to update many WorkfocusTasks.
     * @example
     * // Update many WorkfocusTasks
     * const workfocusTask = await prisma.workfocusTask.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WorkfocusTasks and only return the `id`
     * const workfocusTaskWithIdOnly = await prisma.workfocusTask.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WorkfocusTaskUpdateManyAndReturnArgs>(args: SelectSubset<T, WorkfocusTaskUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkfocusTaskPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WorkfocusTask.
     * @param {WorkfocusTaskUpsertArgs} args - Arguments to update or create a WorkfocusTask.
     * @example
     * // Update or create a WorkfocusTask
     * const workfocusTask = await prisma.workfocusTask.upsert({
     *   create: {
     *     // ... data to create a WorkfocusTask
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WorkfocusTask we want to update
     *   }
     * })
     */
    upsert<T extends WorkfocusTaskUpsertArgs>(args: SelectSubset<T, WorkfocusTaskUpsertArgs<ExtArgs>>): Prisma__WorkfocusTaskClient<$Result.GetResult<Prisma.$WorkfocusTaskPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WorkfocusTasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkfocusTaskCountArgs} args - Arguments to filter WorkfocusTasks to count.
     * @example
     * // Count the number of WorkfocusTasks
     * const count = await prisma.workfocusTask.count({
     *   where: {
     *     // ... the filter for the WorkfocusTasks we want to count
     *   }
     * })
    **/
    count<T extends WorkfocusTaskCountArgs>(
      args?: Subset<T, WorkfocusTaskCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkfocusTaskCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WorkfocusTask.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkfocusTaskAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WorkfocusTaskAggregateArgs>(args: Subset<T, WorkfocusTaskAggregateArgs>): Prisma.PrismaPromise<GetWorkfocusTaskAggregateType<T>>

    /**
     * Group by WorkfocusTask.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkfocusTaskGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WorkfocusTaskGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkfocusTaskGroupByArgs['orderBy'] }
        : { orderBy?: WorkfocusTaskGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WorkfocusTaskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkfocusTaskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WorkfocusTask model
   */
  readonly fields: WorkfocusTaskFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WorkfocusTask.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkfocusTaskClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    owner<T extends WorkfocusTask$ownerArgs<ExtArgs> = {}>(args?: Subset<T, WorkfocusTask$ownerArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WorkfocusTask model
   */
  interface WorkfocusTaskFieldRefs {
    readonly id: FieldRef<"WorkfocusTask", 'String'>
    readonly ownerUserId: FieldRef<"WorkfocusTask", 'String'>
    readonly bucket: FieldRef<"WorkfocusTask", 'String'>
    readonly title: FieldRef<"WorkfocusTask", 'String'>
    readonly status: FieldRef<"WorkfocusTask", 'String'>
    readonly dueAt: FieldRef<"WorkfocusTask", 'DateTime'>
    readonly meta: FieldRef<"WorkfocusTask", 'Json'>
    readonly createdAt: FieldRef<"WorkfocusTask", 'DateTime'>
    readonly updatedAt: FieldRef<"WorkfocusTask", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WorkfocusTask findUnique
   */
  export type WorkfocusTaskFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskInclude<ExtArgs> | null
    /**
     * Filter, which WorkfocusTask to fetch.
     */
    where: WorkfocusTaskWhereUniqueInput
  }

  /**
   * WorkfocusTask findUniqueOrThrow
   */
  export type WorkfocusTaskFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskInclude<ExtArgs> | null
    /**
     * Filter, which WorkfocusTask to fetch.
     */
    where: WorkfocusTaskWhereUniqueInput
  }

  /**
   * WorkfocusTask findFirst
   */
  export type WorkfocusTaskFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskInclude<ExtArgs> | null
    /**
     * Filter, which WorkfocusTask to fetch.
     */
    where?: WorkfocusTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkfocusTasks to fetch.
     */
    orderBy?: WorkfocusTaskOrderByWithRelationInput | WorkfocusTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkfocusTasks.
     */
    cursor?: WorkfocusTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkfocusTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkfocusTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkfocusTasks.
     */
    distinct?: WorkfocusTaskScalarFieldEnum | WorkfocusTaskScalarFieldEnum[]
  }

  /**
   * WorkfocusTask findFirstOrThrow
   */
  export type WorkfocusTaskFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskInclude<ExtArgs> | null
    /**
     * Filter, which WorkfocusTask to fetch.
     */
    where?: WorkfocusTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkfocusTasks to fetch.
     */
    orderBy?: WorkfocusTaskOrderByWithRelationInput | WorkfocusTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkfocusTasks.
     */
    cursor?: WorkfocusTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkfocusTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkfocusTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkfocusTasks.
     */
    distinct?: WorkfocusTaskScalarFieldEnum | WorkfocusTaskScalarFieldEnum[]
  }

  /**
   * WorkfocusTask findMany
   */
  export type WorkfocusTaskFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskInclude<ExtArgs> | null
    /**
     * Filter, which WorkfocusTasks to fetch.
     */
    where?: WorkfocusTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkfocusTasks to fetch.
     */
    orderBy?: WorkfocusTaskOrderByWithRelationInput | WorkfocusTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WorkfocusTasks.
     */
    cursor?: WorkfocusTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkfocusTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkfocusTasks.
     */
    skip?: number
    distinct?: WorkfocusTaskScalarFieldEnum | WorkfocusTaskScalarFieldEnum[]
  }

  /**
   * WorkfocusTask create
   */
  export type WorkfocusTaskCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskInclude<ExtArgs> | null
    /**
     * The data needed to create a WorkfocusTask.
     */
    data: XOR<WorkfocusTaskCreateInput, WorkfocusTaskUncheckedCreateInput>
  }

  /**
   * WorkfocusTask createMany
   */
  export type WorkfocusTaskCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WorkfocusTasks.
     */
    data: WorkfocusTaskCreateManyInput | WorkfocusTaskCreateManyInput[]
  }

  /**
   * WorkfocusTask createManyAndReturn
   */
  export type WorkfocusTaskCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * The data used to create many WorkfocusTasks.
     */
    data: WorkfocusTaskCreateManyInput | WorkfocusTaskCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WorkfocusTask update
   */
  export type WorkfocusTaskUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskInclude<ExtArgs> | null
    /**
     * The data needed to update a WorkfocusTask.
     */
    data: XOR<WorkfocusTaskUpdateInput, WorkfocusTaskUncheckedUpdateInput>
    /**
     * Choose, which WorkfocusTask to update.
     */
    where: WorkfocusTaskWhereUniqueInput
  }

  /**
   * WorkfocusTask updateMany
   */
  export type WorkfocusTaskUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WorkfocusTasks.
     */
    data: XOR<WorkfocusTaskUpdateManyMutationInput, WorkfocusTaskUncheckedUpdateManyInput>
    /**
     * Filter which WorkfocusTasks to update
     */
    where?: WorkfocusTaskWhereInput
    /**
     * Limit how many WorkfocusTasks to update.
     */
    limit?: number
  }

  /**
   * WorkfocusTask updateManyAndReturn
   */
  export type WorkfocusTaskUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * The data used to update WorkfocusTasks.
     */
    data: XOR<WorkfocusTaskUpdateManyMutationInput, WorkfocusTaskUncheckedUpdateManyInput>
    /**
     * Filter which WorkfocusTasks to update
     */
    where?: WorkfocusTaskWhereInput
    /**
     * Limit how many WorkfocusTasks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WorkfocusTask upsert
   */
  export type WorkfocusTaskUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskInclude<ExtArgs> | null
    /**
     * The filter to search for the WorkfocusTask to update in case it exists.
     */
    where: WorkfocusTaskWhereUniqueInput
    /**
     * In case the WorkfocusTask found by the `where` argument doesn't exist, create a new WorkfocusTask with this data.
     */
    create: XOR<WorkfocusTaskCreateInput, WorkfocusTaskUncheckedCreateInput>
    /**
     * In case the WorkfocusTask was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkfocusTaskUpdateInput, WorkfocusTaskUncheckedUpdateInput>
  }

  /**
   * WorkfocusTask delete
   */
  export type WorkfocusTaskDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskInclude<ExtArgs> | null
    /**
     * Filter which WorkfocusTask to delete.
     */
    where: WorkfocusTaskWhereUniqueInput
  }

  /**
   * WorkfocusTask deleteMany
   */
  export type WorkfocusTaskDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkfocusTasks to delete
     */
    where?: WorkfocusTaskWhereInput
    /**
     * Limit how many WorkfocusTasks to delete.
     */
    limit?: number
  }

  /**
   * WorkfocusTask.owner
   */
  export type WorkfocusTask$ownerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * WorkfocusTask without action
   */
  export type WorkfocusTaskDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkfocusTask
     */
    select?: WorkfocusTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkfocusTask
     */
    omit?: WorkfocusTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkfocusTaskInclude<ExtArgs> | null
  }


  /**
   * Model MemoryVendor
   */

  export type AggregateMemoryVendor = {
    _count: MemoryVendorCountAggregateOutputType | null
    _min: MemoryVendorMinAggregateOutputType | null
    _max: MemoryVendorMaxAggregateOutputType | null
  }

  export type MemoryVendorMinAggregateOutputType = {
    id: string | null
    name: string | null
    website: string | null
    createdAt: Date | null
  }

  export type MemoryVendorMaxAggregateOutputType = {
    id: string | null
    name: string | null
    website: string | null
    createdAt: Date | null
  }

  export type MemoryVendorCountAggregateOutputType = {
    id: number
    name: number
    website: number
    createdAt: number
    _all: number
  }


  export type MemoryVendorMinAggregateInputType = {
    id?: true
    name?: true
    website?: true
    createdAt?: true
  }

  export type MemoryVendorMaxAggregateInputType = {
    id?: true
    name?: true
    website?: true
    createdAt?: true
  }

  export type MemoryVendorCountAggregateInputType = {
    id?: true
    name?: true
    website?: true
    createdAt?: true
    _all?: true
  }

  export type MemoryVendorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryVendor to aggregate.
     */
    where?: MemoryVendorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryVendors to fetch.
     */
    orderBy?: MemoryVendorOrderByWithRelationInput | MemoryVendorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemoryVendorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryVendors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryVendors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MemoryVendors
    **/
    _count?: true | MemoryVendorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemoryVendorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemoryVendorMaxAggregateInputType
  }

  export type GetMemoryVendorAggregateType<T extends MemoryVendorAggregateArgs> = {
        [P in keyof T & keyof AggregateMemoryVendor]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemoryVendor[P]>
      : GetScalarType<T[P], AggregateMemoryVendor[P]>
  }




  export type MemoryVendorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryVendorWhereInput
    orderBy?: MemoryVendorOrderByWithAggregationInput | MemoryVendorOrderByWithAggregationInput[]
    by: MemoryVendorScalarFieldEnum[] | MemoryVendorScalarFieldEnum
    having?: MemoryVendorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemoryVendorCountAggregateInputType | true
    _min?: MemoryVendorMinAggregateInputType
    _max?: MemoryVendorMaxAggregateInputType
  }

  export type MemoryVendorGroupByOutputType = {
    id: string
    name: string
    website: string | null
    createdAt: Date
    _count: MemoryVendorCountAggregateOutputType | null
    _min: MemoryVendorMinAggregateOutputType | null
    _max: MemoryVendorMaxAggregateOutputType | null
  }

  type GetMemoryVendorGroupByPayload<T extends MemoryVendorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemoryVendorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemoryVendorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemoryVendorGroupByOutputType[P]>
            : GetScalarType<T[P], MemoryVendorGroupByOutputType[P]>
        }
      >
    >


  export type MemoryVendorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    website?: boolean
    createdAt?: boolean
    packs?: boolean | MemoryVendor$packsArgs<ExtArgs>
    _count?: boolean | MemoryVendorCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryVendor"]>

  export type MemoryVendorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    website?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["memoryVendor"]>

  export type MemoryVendorSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    website?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["memoryVendor"]>

  export type MemoryVendorSelectScalar = {
    id?: boolean
    name?: boolean
    website?: boolean
    createdAt?: boolean
  }

  export type MemoryVendorOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "website" | "createdAt", ExtArgs["result"]["memoryVendor"]>
  export type MemoryVendorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    packs?: boolean | MemoryVendor$packsArgs<ExtArgs>
    _count?: boolean | MemoryVendorCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MemoryVendorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type MemoryVendorIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $MemoryVendorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MemoryVendor"
    objects: {
      packs: Prisma.$MemoryPackPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      website: string | null
      createdAt: Date
    }, ExtArgs["result"]["memoryVendor"]>
    composites: {}
  }

  type MemoryVendorGetPayload<S extends boolean | null | undefined | MemoryVendorDefaultArgs> = $Result.GetResult<Prisma.$MemoryVendorPayload, S>

  type MemoryVendorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemoryVendorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemoryVendorCountAggregateInputType | true
    }

  export interface MemoryVendorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MemoryVendor'], meta: { name: 'MemoryVendor' } }
    /**
     * Find zero or one MemoryVendor that matches the filter.
     * @param {MemoryVendorFindUniqueArgs} args - Arguments to find a MemoryVendor
     * @example
     * // Get one MemoryVendor
     * const memoryVendor = await prisma.memoryVendor.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemoryVendorFindUniqueArgs>(args: SelectSubset<T, MemoryVendorFindUniqueArgs<ExtArgs>>): Prisma__MemoryVendorClient<$Result.GetResult<Prisma.$MemoryVendorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MemoryVendor that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemoryVendorFindUniqueOrThrowArgs} args - Arguments to find a MemoryVendor
     * @example
     * // Get one MemoryVendor
     * const memoryVendor = await prisma.memoryVendor.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemoryVendorFindUniqueOrThrowArgs>(args: SelectSubset<T, MemoryVendorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemoryVendorClient<$Result.GetResult<Prisma.$MemoryVendorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryVendor that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryVendorFindFirstArgs} args - Arguments to find a MemoryVendor
     * @example
     * // Get one MemoryVendor
     * const memoryVendor = await prisma.memoryVendor.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemoryVendorFindFirstArgs>(args?: SelectSubset<T, MemoryVendorFindFirstArgs<ExtArgs>>): Prisma__MemoryVendorClient<$Result.GetResult<Prisma.$MemoryVendorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryVendor that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryVendorFindFirstOrThrowArgs} args - Arguments to find a MemoryVendor
     * @example
     * // Get one MemoryVendor
     * const memoryVendor = await prisma.memoryVendor.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemoryVendorFindFirstOrThrowArgs>(args?: SelectSubset<T, MemoryVendorFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemoryVendorClient<$Result.GetResult<Prisma.$MemoryVendorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MemoryVendors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryVendorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MemoryVendors
     * const memoryVendors = await prisma.memoryVendor.findMany()
     * 
     * // Get first 10 MemoryVendors
     * const memoryVendors = await prisma.memoryVendor.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memoryVendorWithIdOnly = await prisma.memoryVendor.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemoryVendorFindManyArgs>(args?: SelectSubset<T, MemoryVendorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryVendorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MemoryVendor.
     * @param {MemoryVendorCreateArgs} args - Arguments to create a MemoryVendor.
     * @example
     * // Create one MemoryVendor
     * const MemoryVendor = await prisma.memoryVendor.create({
     *   data: {
     *     // ... data to create a MemoryVendor
     *   }
     * })
     * 
     */
    create<T extends MemoryVendorCreateArgs>(args: SelectSubset<T, MemoryVendorCreateArgs<ExtArgs>>): Prisma__MemoryVendorClient<$Result.GetResult<Prisma.$MemoryVendorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MemoryVendors.
     * @param {MemoryVendorCreateManyArgs} args - Arguments to create many MemoryVendors.
     * @example
     * // Create many MemoryVendors
     * const memoryVendor = await prisma.memoryVendor.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemoryVendorCreateManyArgs>(args?: SelectSubset<T, MemoryVendorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MemoryVendors and returns the data saved in the database.
     * @param {MemoryVendorCreateManyAndReturnArgs} args - Arguments to create many MemoryVendors.
     * @example
     * // Create many MemoryVendors
     * const memoryVendor = await prisma.memoryVendor.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MemoryVendors and only return the `id`
     * const memoryVendorWithIdOnly = await prisma.memoryVendor.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemoryVendorCreateManyAndReturnArgs>(args?: SelectSubset<T, MemoryVendorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryVendorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MemoryVendor.
     * @param {MemoryVendorDeleteArgs} args - Arguments to delete one MemoryVendor.
     * @example
     * // Delete one MemoryVendor
     * const MemoryVendor = await prisma.memoryVendor.delete({
     *   where: {
     *     // ... filter to delete one MemoryVendor
     *   }
     * })
     * 
     */
    delete<T extends MemoryVendorDeleteArgs>(args: SelectSubset<T, MemoryVendorDeleteArgs<ExtArgs>>): Prisma__MemoryVendorClient<$Result.GetResult<Prisma.$MemoryVendorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MemoryVendor.
     * @param {MemoryVendorUpdateArgs} args - Arguments to update one MemoryVendor.
     * @example
     * // Update one MemoryVendor
     * const memoryVendor = await prisma.memoryVendor.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemoryVendorUpdateArgs>(args: SelectSubset<T, MemoryVendorUpdateArgs<ExtArgs>>): Prisma__MemoryVendorClient<$Result.GetResult<Prisma.$MemoryVendorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MemoryVendors.
     * @param {MemoryVendorDeleteManyArgs} args - Arguments to filter MemoryVendors to delete.
     * @example
     * // Delete a few MemoryVendors
     * const { count } = await prisma.memoryVendor.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemoryVendorDeleteManyArgs>(args?: SelectSubset<T, MemoryVendorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryVendors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryVendorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MemoryVendors
     * const memoryVendor = await prisma.memoryVendor.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemoryVendorUpdateManyArgs>(args: SelectSubset<T, MemoryVendorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryVendors and returns the data updated in the database.
     * @param {MemoryVendorUpdateManyAndReturnArgs} args - Arguments to update many MemoryVendors.
     * @example
     * // Update many MemoryVendors
     * const memoryVendor = await prisma.memoryVendor.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MemoryVendors and only return the `id`
     * const memoryVendorWithIdOnly = await prisma.memoryVendor.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MemoryVendorUpdateManyAndReturnArgs>(args: SelectSubset<T, MemoryVendorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryVendorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MemoryVendor.
     * @param {MemoryVendorUpsertArgs} args - Arguments to update or create a MemoryVendor.
     * @example
     * // Update or create a MemoryVendor
     * const memoryVendor = await prisma.memoryVendor.upsert({
     *   create: {
     *     // ... data to create a MemoryVendor
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MemoryVendor we want to update
     *   }
     * })
     */
    upsert<T extends MemoryVendorUpsertArgs>(args: SelectSubset<T, MemoryVendorUpsertArgs<ExtArgs>>): Prisma__MemoryVendorClient<$Result.GetResult<Prisma.$MemoryVendorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MemoryVendors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryVendorCountArgs} args - Arguments to filter MemoryVendors to count.
     * @example
     * // Count the number of MemoryVendors
     * const count = await prisma.memoryVendor.count({
     *   where: {
     *     // ... the filter for the MemoryVendors we want to count
     *   }
     * })
    **/
    count<T extends MemoryVendorCountArgs>(
      args?: Subset<T, MemoryVendorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemoryVendorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MemoryVendor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryVendorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemoryVendorAggregateArgs>(args: Subset<T, MemoryVendorAggregateArgs>): Prisma.PrismaPromise<GetMemoryVendorAggregateType<T>>

    /**
     * Group by MemoryVendor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryVendorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemoryVendorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemoryVendorGroupByArgs['orderBy'] }
        : { orderBy?: MemoryVendorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemoryVendorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemoryVendorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MemoryVendor model
   */
  readonly fields: MemoryVendorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MemoryVendor.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemoryVendorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    packs<T extends MemoryVendor$packsArgs<ExtArgs> = {}>(args?: Subset<T, MemoryVendor$packsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MemoryVendor model
   */
  interface MemoryVendorFieldRefs {
    readonly id: FieldRef<"MemoryVendor", 'String'>
    readonly name: FieldRef<"MemoryVendor", 'String'>
    readonly website: FieldRef<"MemoryVendor", 'String'>
    readonly createdAt: FieldRef<"MemoryVendor", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MemoryVendor findUnique
   */
  export type MemoryVendorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendor
     */
    select?: MemoryVendorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryVendor
     */
    omit?: MemoryVendorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryVendorInclude<ExtArgs> | null
    /**
     * Filter, which MemoryVendor to fetch.
     */
    where: MemoryVendorWhereUniqueInput
  }

  /**
   * MemoryVendor findUniqueOrThrow
   */
  export type MemoryVendorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendor
     */
    select?: MemoryVendorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryVendor
     */
    omit?: MemoryVendorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryVendorInclude<ExtArgs> | null
    /**
     * Filter, which MemoryVendor to fetch.
     */
    where: MemoryVendorWhereUniqueInput
  }

  /**
   * MemoryVendor findFirst
   */
  export type MemoryVendorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendor
     */
    select?: MemoryVendorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryVendor
     */
    omit?: MemoryVendorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryVendorInclude<ExtArgs> | null
    /**
     * Filter, which MemoryVendor to fetch.
     */
    where?: MemoryVendorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryVendors to fetch.
     */
    orderBy?: MemoryVendorOrderByWithRelationInput | MemoryVendorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryVendors.
     */
    cursor?: MemoryVendorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryVendors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryVendors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryVendors.
     */
    distinct?: MemoryVendorScalarFieldEnum | MemoryVendorScalarFieldEnum[]
  }

  /**
   * MemoryVendor findFirstOrThrow
   */
  export type MemoryVendorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendor
     */
    select?: MemoryVendorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryVendor
     */
    omit?: MemoryVendorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryVendorInclude<ExtArgs> | null
    /**
     * Filter, which MemoryVendor to fetch.
     */
    where?: MemoryVendorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryVendors to fetch.
     */
    orderBy?: MemoryVendorOrderByWithRelationInput | MemoryVendorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryVendors.
     */
    cursor?: MemoryVendorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryVendors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryVendors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryVendors.
     */
    distinct?: MemoryVendorScalarFieldEnum | MemoryVendorScalarFieldEnum[]
  }

  /**
   * MemoryVendor findMany
   */
  export type MemoryVendorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendor
     */
    select?: MemoryVendorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryVendor
     */
    omit?: MemoryVendorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryVendorInclude<ExtArgs> | null
    /**
     * Filter, which MemoryVendors to fetch.
     */
    where?: MemoryVendorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryVendors to fetch.
     */
    orderBy?: MemoryVendorOrderByWithRelationInput | MemoryVendorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MemoryVendors.
     */
    cursor?: MemoryVendorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryVendors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryVendors.
     */
    skip?: number
    distinct?: MemoryVendorScalarFieldEnum | MemoryVendorScalarFieldEnum[]
  }

  /**
   * MemoryVendor create
   */
  export type MemoryVendorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendor
     */
    select?: MemoryVendorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryVendor
     */
    omit?: MemoryVendorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryVendorInclude<ExtArgs> | null
    /**
     * The data needed to create a MemoryVendor.
     */
    data: XOR<MemoryVendorCreateInput, MemoryVendorUncheckedCreateInput>
  }

  /**
   * MemoryVendor createMany
   */
  export type MemoryVendorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MemoryVendors.
     */
    data: MemoryVendorCreateManyInput | MemoryVendorCreateManyInput[]
  }

  /**
   * MemoryVendor createManyAndReturn
   */
  export type MemoryVendorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendor
     */
    select?: MemoryVendorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryVendor
     */
    omit?: MemoryVendorOmit<ExtArgs> | null
    /**
     * The data used to create many MemoryVendors.
     */
    data: MemoryVendorCreateManyInput | MemoryVendorCreateManyInput[]
  }

  /**
   * MemoryVendor update
   */
  export type MemoryVendorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendor
     */
    select?: MemoryVendorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryVendor
     */
    omit?: MemoryVendorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryVendorInclude<ExtArgs> | null
    /**
     * The data needed to update a MemoryVendor.
     */
    data: XOR<MemoryVendorUpdateInput, MemoryVendorUncheckedUpdateInput>
    /**
     * Choose, which MemoryVendor to update.
     */
    where: MemoryVendorWhereUniqueInput
  }

  /**
   * MemoryVendor updateMany
   */
  export type MemoryVendorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MemoryVendors.
     */
    data: XOR<MemoryVendorUpdateManyMutationInput, MemoryVendorUncheckedUpdateManyInput>
    /**
     * Filter which MemoryVendors to update
     */
    where?: MemoryVendorWhereInput
    /**
     * Limit how many MemoryVendors to update.
     */
    limit?: number
  }

  /**
   * MemoryVendor updateManyAndReturn
   */
  export type MemoryVendorUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendor
     */
    select?: MemoryVendorSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryVendor
     */
    omit?: MemoryVendorOmit<ExtArgs> | null
    /**
     * The data used to update MemoryVendors.
     */
    data: XOR<MemoryVendorUpdateManyMutationInput, MemoryVendorUncheckedUpdateManyInput>
    /**
     * Filter which MemoryVendors to update
     */
    where?: MemoryVendorWhereInput
    /**
     * Limit how many MemoryVendors to update.
     */
    limit?: number
  }

  /**
   * MemoryVendor upsert
   */
  export type MemoryVendorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendor
     */
    select?: MemoryVendorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryVendor
     */
    omit?: MemoryVendorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryVendorInclude<ExtArgs> | null
    /**
     * The filter to search for the MemoryVendor to update in case it exists.
     */
    where: MemoryVendorWhereUniqueInput
    /**
     * In case the MemoryVendor found by the `where` argument doesn't exist, create a new MemoryVendor with this data.
     */
    create: XOR<MemoryVendorCreateInput, MemoryVendorUncheckedCreateInput>
    /**
     * In case the MemoryVendor was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemoryVendorUpdateInput, MemoryVendorUncheckedUpdateInput>
  }

  /**
   * MemoryVendor delete
   */
  export type MemoryVendorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendor
     */
    select?: MemoryVendorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryVendor
     */
    omit?: MemoryVendorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryVendorInclude<ExtArgs> | null
    /**
     * Filter which MemoryVendor to delete.
     */
    where: MemoryVendorWhereUniqueInput
  }

  /**
   * MemoryVendor deleteMany
   */
  export type MemoryVendorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryVendors to delete
     */
    where?: MemoryVendorWhereInput
    /**
     * Limit how many MemoryVendors to delete.
     */
    limit?: number
  }

  /**
   * MemoryVendor.packs
   */
  export type MemoryVendor$packsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackInclude<ExtArgs> | null
    where?: MemoryPackWhereInput
    orderBy?: MemoryPackOrderByWithRelationInput | MemoryPackOrderByWithRelationInput[]
    cursor?: MemoryPackWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryPackScalarFieldEnum | MemoryPackScalarFieldEnum[]
  }

  /**
   * MemoryVendor without action
   */
  export type MemoryVendorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryVendor
     */
    select?: MemoryVendorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryVendor
     */
    omit?: MemoryVendorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryVendorInclude<ExtArgs> | null
  }


  /**
   * Model MemoryPack
   */

  export type AggregateMemoryPack = {
    _count: MemoryPackCountAggregateOutputType | null
    _min: MemoryPackMinAggregateOutputType | null
    _max: MemoryPackMaxAggregateOutputType | null
  }

  export type MemoryPackMinAggregateOutputType = {
    id: string | null
    vendorId: string | null
    slug: string | null
    version: string | null
    title: string | null
    notes: string | null
    signature: string | null
    createdAt: Date | null
  }

  export type MemoryPackMaxAggregateOutputType = {
    id: string | null
    vendorId: string | null
    slug: string | null
    version: string | null
    title: string | null
    notes: string | null
    signature: string | null
    createdAt: Date | null
  }

  export type MemoryPackCountAggregateOutputType = {
    id: number
    vendorId: number
    slug: number
    version: number
    title: number
    notes: number
    signature: number
    createdAt: number
    _all: number
  }


  export type MemoryPackMinAggregateInputType = {
    id?: true
    vendorId?: true
    slug?: true
    version?: true
    title?: true
    notes?: true
    signature?: true
    createdAt?: true
  }

  export type MemoryPackMaxAggregateInputType = {
    id?: true
    vendorId?: true
    slug?: true
    version?: true
    title?: true
    notes?: true
    signature?: true
    createdAt?: true
  }

  export type MemoryPackCountAggregateInputType = {
    id?: true
    vendorId?: true
    slug?: true
    version?: true
    title?: true
    notes?: true
    signature?: true
    createdAt?: true
    _all?: true
  }

  export type MemoryPackAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryPack to aggregate.
     */
    where?: MemoryPackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryPacks to fetch.
     */
    orderBy?: MemoryPackOrderByWithRelationInput | MemoryPackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemoryPackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryPacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryPacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MemoryPacks
    **/
    _count?: true | MemoryPackCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemoryPackMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemoryPackMaxAggregateInputType
  }

  export type GetMemoryPackAggregateType<T extends MemoryPackAggregateArgs> = {
        [P in keyof T & keyof AggregateMemoryPack]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemoryPack[P]>
      : GetScalarType<T[P], AggregateMemoryPack[P]>
  }




  export type MemoryPackGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryPackWhereInput
    orderBy?: MemoryPackOrderByWithAggregationInput | MemoryPackOrderByWithAggregationInput[]
    by: MemoryPackScalarFieldEnum[] | MemoryPackScalarFieldEnum
    having?: MemoryPackScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemoryPackCountAggregateInputType | true
    _min?: MemoryPackMinAggregateInputType
    _max?: MemoryPackMaxAggregateInputType
  }

  export type MemoryPackGroupByOutputType = {
    id: string
    vendorId: string
    slug: string
    version: string
    title: string
    notes: string | null
    signature: string | null
    createdAt: Date
    _count: MemoryPackCountAggregateOutputType | null
    _min: MemoryPackMinAggregateOutputType | null
    _max: MemoryPackMaxAggregateOutputType | null
  }

  type GetMemoryPackGroupByPayload<T extends MemoryPackGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemoryPackGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemoryPackGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemoryPackGroupByOutputType[P]>
            : GetScalarType<T[P], MemoryPackGroupByOutputType[P]>
        }
      >
    >


  export type MemoryPackSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vendorId?: boolean
    slug?: boolean
    version?: boolean
    title?: boolean
    notes?: boolean
    signature?: boolean
    createdAt?: boolean
    vendor?: boolean | MemoryVendorDefaultArgs<ExtArgs>
    items?: boolean | MemoryPack$itemsArgs<ExtArgs>
    installs?: boolean | MemoryPack$installsArgs<ExtArgs>
    _count?: boolean | MemoryPackCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryPack"]>

  export type MemoryPackSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vendorId?: boolean
    slug?: boolean
    version?: boolean
    title?: boolean
    notes?: boolean
    signature?: boolean
    createdAt?: boolean
    vendor?: boolean | MemoryVendorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryPack"]>

  export type MemoryPackSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vendorId?: boolean
    slug?: boolean
    version?: boolean
    title?: boolean
    notes?: boolean
    signature?: boolean
    createdAt?: boolean
    vendor?: boolean | MemoryVendorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryPack"]>

  export type MemoryPackSelectScalar = {
    id?: boolean
    vendorId?: boolean
    slug?: boolean
    version?: boolean
    title?: boolean
    notes?: boolean
    signature?: boolean
    createdAt?: boolean
  }

  export type MemoryPackOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "vendorId" | "slug" | "version" | "title" | "notes" | "signature" | "createdAt", ExtArgs["result"]["memoryPack"]>
  export type MemoryPackInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vendor?: boolean | MemoryVendorDefaultArgs<ExtArgs>
    items?: boolean | MemoryPack$itemsArgs<ExtArgs>
    installs?: boolean | MemoryPack$installsArgs<ExtArgs>
    _count?: boolean | MemoryPackCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MemoryPackIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vendor?: boolean | MemoryVendorDefaultArgs<ExtArgs>
  }
  export type MemoryPackIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vendor?: boolean | MemoryVendorDefaultArgs<ExtArgs>
  }

  export type $MemoryPackPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MemoryPack"
    objects: {
      vendor: Prisma.$MemoryVendorPayload<ExtArgs>
      items: Prisma.$MemoryPackItemPayload<ExtArgs>[]
      installs: Prisma.$MemoryInstallPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      vendorId: string
      slug: string
      version: string
      title: string
      notes: string | null
      signature: string | null
      createdAt: Date
    }, ExtArgs["result"]["memoryPack"]>
    composites: {}
  }

  type MemoryPackGetPayload<S extends boolean | null | undefined | MemoryPackDefaultArgs> = $Result.GetResult<Prisma.$MemoryPackPayload, S>

  type MemoryPackCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemoryPackFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemoryPackCountAggregateInputType | true
    }

  export interface MemoryPackDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MemoryPack'], meta: { name: 'MemoryPack' } }
    /**
     * Find zero or one MemoryPack that matches the filter.
     * @param {MemoryPackFindUniqueArgs} args - Arguments to find a MemoryPack
     * @example
     * // Get one MemoryPack
     * const memoryPack = await prisma.memoryPack.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemoryPackFindUniqueArgs>(args: SelectSubset<T, MemoryPackFindUniqueArgs<ExtArgs>>): Prisma__MemoryPackClient<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MemoryPack that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemoryPackFindUniqueOrThrowArgs} args - Arguments to find a MemoryPack
     * @example
     * // Get one MemoryPack
     * const memoryPack = await prisma.memoryPack.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemoryPackFindUniqueOrThrowArgs>(args: SelectSubset<T, MemoryPackFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemoryPackClient<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryPack that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackFindFirstArgs} args - Arguments to find a MemoryPack
     * @example
     * // Get one MemoryPack
     * const memoryPack = await prisma.memoryPack.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemoryPackFindFirstArgs>(args?: SelectSubset<T, MemoryPackFindFirstArgs<ExtArgs>>): Prisma__MemoryPackClient<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryPack that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackFindFirstOrThrowArgs} args - Arguments to find a MemoryPack
     * @example
     * // Get one MemoryPack
     * const memoryPack = await prisma.memoryPack.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemoryPackFindFirstOrThrowArgs>(args?: SelectSubset<T, MemoryPackFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemoryPackClient<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MemoryPacks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MemoryPacks
     * const memoryPacks = await prisma.memoryPack.findMany()
     * 
     * // Get first 10 MemoryPacks
     * const memoryPacks = await prisma.memoryPack.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memoryPackWithIdOnly = await prisma.memoryPack.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemoryPackFindManyArgs>(args?: SelectSubset<T, MemoryPackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MemoryPack.
     * @param {MemoryPackCreateArgs} args - Arguments to create a MemoryPack.
     * @example
     * // Create one MemoryPack
     * const MemoryPack = await prisma.memoryPack.create({
     *   data: {
     *     // ... data to create a MemoryPack
     *   }
     * })
     * 
     */
    create<T extends MemoryPackCreateArgs>(args: SelectSubset<T, MemoryPackCreateArgs<ExtArgs>>): Prisma__MemoryPackClient<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MemoryPacks.
     * @param {MemoryPackCreateManyArgs} args - Arguments to create many MemoryPacks.
     * @example
     * // Create many MemoryPacks
     * const memoryPack = await prisma.memoryPack.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemoryPackCreateManyArgs>(args?: SelectSubset<T, MemoryPackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MemoryPacks and returns the data saved in the database.
     * @param {MemoryPackCreateManyAndReturnArgs} args - Arguments to create many MemoryPacks.
     * @example
     * // Create many MemoryPacks
     * const memoryPack = await prisma.memoryPack.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MemoryPacks and only return the `id`
     * const memoryPackWithIdOnly = await prisma.memoryPack.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemoryPackCreateManyAndReturnArgs>(args?: SelectSubset<T, MemoryPackCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MemoryPack.
     * @param {MemoryPackDeleteArgs} args - Arguments to delete one MemoryPack.
     * @example
     * // Delete one MemoryPack
     * const MemoryPack = await prisma.memoryPack.delete({
     *   where: {
     *     // ... filter to delete one MemoryPack
     *   }
     * })
     * 
     */
    delete<T extends MemoryPackDeleteArgs>(args: SelectSubset<T, MemoryPackDeleteArgs<ExtArgs>>): Prisma__MemoryPackClient<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MemoryPack.
     * @param {MemoryPackUpdateArgs} args - Arguments to update one MemoryPack.
     * @example
     * // Update one MemoryPack
     * const memoryPack = await prisma.memoryPack.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemoryPackUpdateArgs>(args: SelectSubset<T, MemoryPackUpdateArgs<ExtArgs>>): Prisma__MemoryPackClient<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MemoryPacks.
     * @param {MemoryPackDeleteManyArgs} args - Arguments to filter MemoryPacks to delete.
     * @example
     * // Delete a few MemoryPacks
     * const { count } = await prisma.memoryPack.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemoryPackDeleteManyArgs>(args?: SelectSubset<T, MemoryPackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryPacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MemoryPacks
     * const memoryPack = await prisma.memoryPack.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemoryPackUpdateManyArgs>(args: SelectSubset<T, MemoryPackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryPacks and returns the data updated in the database.
     * @param {MemoryPackUpdateManyAndReturnArgs} args - Arguments to update many MemoryPacks.
     * @example
     * // Update many MemoryPacks
     * const memoryPack = await prisma.memoryPack.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MemoryPacks and only return the `id`
     * const memoryPackWithIdOnly = await prisma.memoryPack.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MemoryPackUpdateManyAndReturnArgs>(args: SelectSubset<T, MemoryPackUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MemoryPack.
     * @param {MemoryPackUpsertArgs} args - Arguments to update or create a MemoryPack.
     * @example
     * // Update or create a MemoryPack
     * const memoryPack = await prisma.memoryPack.upsert({
     *   create: {
     *     // ... data to create a MemoryPack
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MemoryPack we want to update
     *   }
     * })
     */
    upsert<T extends MemoryPackUpsertArgs>(args: SelectSubset<T, MemoryPackUpsertArgs<ExtArgs>>): Prisma__MemoryPackClient<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MemoryPacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackCountArgs} args - Arguments to filter MemoryPacks to count.
     * @example
     * // Count the number of MemoryPacks
     * const count = await prisma.memoryPack.count({
     *   where: {
     *     // ... the filter for the MemoryPacks we want to count
     *   }
     * })
    **/
    count<T extends MemoryPackCountArgs>(
      args?: Subset<T, MemoryPackCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemoryPackCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MemoryPack.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemoryPackAggregateArgs>(args: Subset<T, MemoryPackAggregateArgs>): Prisma.PrismaPromise<GetMemoryPackAggregateType<T>>

    /**
     * Group by MemoryPack.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemoryPackGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemoryPackGroupByArgs['orderBy'] }
        : { orderBy?: MemoryPackGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemoryPackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemoryPackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MemoryPack model
   */
  readonly fields: MemoryPackFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MemoryPack.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemoryPackClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    vendor<T extends MemoryVendorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemoryVendorDefaultArgs<ExtArgs>>): Prisma__MemoryVendorClient<$Result.GetResult<Prisma.$MemoryVendorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    items<T extends MemoryPack$itemsArgs<ExtArgs> = {}>(args?: Subset<T, MemoryPack$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    installs<T extends MemoryPack$installsArgs<ExtArgs> = {}>(args?: Subset<T, MemoryPack$installsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MemoryPack model
   */
  interface MemoryPackFieldRefs {
    readonly id: FieldRef<"MemoryPack", 'String'>
    readonly vendorId: FieldRef<"MemoryPack", 'String'>
    readonly slug: FieldRef<"MemoryPack", 'String'>
    readonly version: FieldRef<"MemoryPack", 'String'>
    readonly title: FieldRef<"MemoryPack", 'String'>
    readonly notes: FieldRef<"MemoryPack", 'String'>
    readonly signature: FieldRef<"MemoryPack", 'String'>
    readonly createdAt: FieldRef<"MemoryPack", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MemoryPack findUnique
   */
  export type MemoryPackFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackInclude<ExtArgs> | null
    /**
     * Filter, which MemoryPack to fetch.
     */
    where: MemoryPackWhereUniqueInput
  }

  /**
   * MemoryPack findUniqueOrThrow
   */
  export type MemoryPackFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackInclude<ExtArgs> | null
    /**
     * Filter, which MemoryPack to fetch.
     */
    where: MemoryPackWhereUniqueInput
  }

  /**
   * MemoryPack findFirst
   */
  export type MemoryPackFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackInclude<ExtArgs> | null
    /**
     * Filter, which MemoryPack to fetch.
     */
    where?: MemoryPackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryPacks to fetch.
     */
    orderBy?: MemoryPackOrderByWithRelationInput | MemoryPackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryPacks.
     */
    cursor?: MemoryPackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryPacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryPacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryPacks.
     */
    distinct?: MemoryPackScalarFieldEnum | MemoryPackScalarFieldEnum[]
  }

  /**
   * MemoryPack findFirstOrThrow
   */
  export type MemoryPackFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackInclude<ExtArgs> | null
    /**
     * Filter, which MemoryPack to fetch.
     */
    where?: MemoryPackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryPacks to fetch.
     */
    orderBy?: MemoryPackOrderByWithRelationInput | MemoryPackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryPacks.
     */
    cursor?: MemoryPackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryPacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryPacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryPacks.
     */
    distinct?: MemoryPackScalarFieldEnum | MemoryPackScalarFieldEnum[]
  }

  /**
   * MemoryPack findMany
   */
  export type MemoryPackFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackInclude<ExtArgs> | null
    /**
     * Filter, which MemoryPacks to fetch.
     */
    where?: MemoryPackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryPacks to fetch.
     */
    orderBy?: MemoryPackOrderByWithRelationInput | MemoryPackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MemoryPacks.
     */
    cursor?: MemoryPackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryPacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryPacks.
     */
    skip?: number
    distinct?: MemoryPackScalarFieldEnum | MemoryPackScalarFieldEnum[]
  }

  /**
   * MemoryPack create
   */
  export type MemoryPackCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackInclude<ExtArgs> | null
    /**
     * The data needed to create a MemoryPack.
     */
    data: XOR<MemoryPackCreateInput, MemoryPackUncheckedCreateInput>
  }

  /**
   * MemoryPack createMany
   */
  export type MemoryPackCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MemoryPacks.
     */
    data: MemoryPackCreateManyInput | MemoryPackCreateManyInput[]
  }

  /**
   * MemoryPack createManyAndReturn
   */
  export type MemoryPackCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * The data used to create many MemoryPacks.
     */
    data: MemoryPackCreateManyInput | MemoryPackCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemoryPack update
   */
  export type MemoryPackUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackInclude<ExtArgs> | null
    /**
     * The data needed to update a MemoryPack.
     */
    data: XOR<MemoryPackUpdateInput, MemoryPackUncheckedUpdateInput>
    /**
     * Choose, which MemoryPack to update.
     */
    where: MemoryPackWhereUniqueInput
  }

  /**
   * MemoryPack updateMany
   */
  export type MemoryPackUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MemoryPacks.
     */
    data: XOR<MemoryPackUpdateManyMutationInput, MemoryPackUncheckedUpdateManyInput>
    /**
     * Filter which MemoryPacks to update
     */
    where?: MemoryPackWhereInput
    /**
     * Limit how many MemoryPacks to update.
     */
    limit?: number
  }

  /**
   * MemoryPack updateManyAndReturn
   */
  export type MemoryPackUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * The data used to update MemoryPacks.
     */
    data: XOR<MemoryPackUpdateManyMutationInput, MemoryPackUncheckedUpdateManyInput>
    /**
     * Filter which MemoryPacks to update
     */
    where?: MemoryPackWhereInput
    /**
     * Limit how many MemoryPacks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemoryPack upsert
   */
  export type MemoryPackUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackInclude<ExtArgs> | null
    /**
     * The filter to search for the MemoryPack to update in case it exists.
     */
    where: MemoryPackWhereUniqueInput
    /**
     * In case the MemoryPack found by the `where` argument doesn't exist, create a new MemoryPack with this data.
     */
    create: XOR<MemoryPackCreateInput, MemoryPackUncheckedCreateInput>
    /**
     * In case the MemoryPack was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemoryPackUpdateInput, MemoryPackUncheckedUpdateInput>
  }

  /**
   * MemoryPack delete
   */
  export type MemoryPackDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackInclude<ExtArgs> | null
    /**
     * Filter which MemoryPack to delete.
     */
    where: MemoryPackWhereUniqueInput
  }

  /**
   * MemoryPack deleteMany
   */
  export type MemoryPackDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryPacks to delete
     */
    where?: MemoryPackWhereInput
    /**
     * Limit how many MemoryPacks to delete.
     */
    limit?: number
  }

  /**
   * MemoryPack.items
   */
  export type MemoryPack$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemInclude<ExtArgs> | null
    where?: MemoryPackItemWhereInput
    orderBy?: MemoryPackItemOrderByWithRelationInput | MemoryPackItemOrderByWithRelationInput[]
    cursor?: MemoryPackItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryPackItemScalarFieldEnum | MemoryPackItemScalarFieldEnum[]
  }

  /**
   * MemoryPack.installs
   */
  export type MemoryPack$installsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallInclude<ExtArgs> | null
    where?: MemoryInstallWhereInput
    orderBy?: MemoryInstallOrderByWithRelationInput | MemoryInstallOrderByWithRelationInput[]
    cursor?: MemoryInstallWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryInstallScalarFieldEnum | MemoryInstallScalarFieldEnum[]
  }

  /**
   * MemoryPack without action
   */
  export type MemoryPackDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPack
     */
    select?: MemoryPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPack
     */
    omit?: MemoryPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackInclude<ExtArgs> | null
  }


  /**
   * Model MemoryPackItem
   */

  export type AggregateMemoryPackItem = {
    _count: MemoryPackItemCountAggregateOutputType | null
    _min: MemoryPackItemMinAggregateOutputType | null
    _max: MemoryPackItemMaxAggregateOutputType | null
  }

  export type MemoryPackItemMinAggregateOutputType = {
    id: string | null
    packId: string | null
    kind: string | null
    subject: string | null
    content: string | null
    tags: string | null
    createdAt: Date | null
  }

  export type MemoryPackItemMaxAggregateOutputType = {
    id: string | null
    packId: string | null
    kind: string | null
    subject: string | null
    content: string | null
    tags: string | null
    createdAt: Date | null
  }

  export type MemoryPackItemCountAggregateOutputType = {
    id: number
    packId: number
    kind: number
    subject: number
    content: number
    tags: number
    createdAt: number
    _all: number
  }


  export type MemoryPackItemMinAggregateInputType = {
    id?: true
    packId?: true
    kind?: true
    subject?: true
    content?: true
    tags?: true
    createdAt?: true
  }

  export type MemoryPackItemMaxAggregateInputType = {
    id?: true
    packId?: true
    kind?: true
    subject?: true
    content?: true
    tags?: true
    createdAt?: true
  }

  export type MemoryPackItemCountAggregateInputType = {
    id?: true
    packId?: true
    kind?: true
    subject?: true
    content?: true
    tags?: true
    createdAt?: true
    _all?: true
  }

  export type MemoryPackItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryPackItem to aggregate.
     */
    where?: MemoryPackItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryPackItems to fetch.
     */
    orderBy?: MemoryPackItemOrderByWithRelationInput | MemoryPackItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemoryPackItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryPackItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryPackItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MemoryPackItems
    **/
    _count?: true | MemoryPackItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemoryPackItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemoryPackItemMaxAggregateInputType
  }

  export type GetMemoryPackItemAggregateType<T extends MemoryPackItemAggregateArgs> = {
        [P in keyof T & keyof AggregateMemoryPackItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemoryPackItem[P]>
      : GetScalarType<T[P], AggregateMemoryPackItem[P]>
  }




  export type MemoryPackItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryPackItemWhereInput
    orderBy?: MemoryPackItemOrderByWithAggregationInput | MemoryPackItemOrderByWithAggregationInput[]
    by: MemoryPackItemScalarFieldEnum[] | MemoryPackItemScalarFieldEnum
    having?: MemoryPackItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemoryPackItemCountAggregateInputType | true
    _min?: MemoryPackItemMinAggregateInputType
    _max?: MemoryPackItemMaxAggregateInputType
  }

  export type MemoryPackItemGroupByOutputType = {
    id: string
    packId: string
    kind: string
    subject: string | null
    content: string
    tags: string | null
    createdAt: Date
    _count: MemoryPackItemCountAggregateOutputType | null
    _min: MemoryPackItemMinAggregateOutputType | null
    _max: MemoryPackItemMaxAggregateOutputType | null
  }

  type GetMemoryPackItemGroupByPayload<T extends MemoryPackItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemoryPackItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemoryPackItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemoryPackItemGroupByOutputType[P]>
            : GetScalarType<T[P], MemoryPackItemGroupByOutputType[P]>
        }
      >
    >


  export type MemoryPackItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    packId?: boolean
    kind?: boolean
    subject?: boolean
    content?: boolean
    tags?: boolean
    createdAt?: boolean
    pack?: boolean | MemoryPackDefaultArgs<ExtArgs>
    overrides?: boolean | MemoryPackItem$overridesArgs<ExtArgs>
    _count?: boolean | MemoryPackItemCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryPackItem"]>

  export type MemoryPackItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    packId?: boolean
    kind?: boolean
    subject?: boolean
    content?: boolean
    tags?: boolean
    createdAt?: boolean
    pack?: boolean | MemoryPackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryPackItem"]>

  export type MemoryPackItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    packId?: boolean
    kind?: boolean
    subject?: boolean
    content?: boolean
    tags?: boolean
    createdAt?: boolean
    pack?: boolean | MemoryPackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryPackItem"]>

  export type MemoryPackItemSelectScalar = {
    id?: boolean
    packId?: boolean
    kind?: boolean
    subject?: boolean
    content?: boolean
    tags?: boolean
    createdAt?: boolean
  }

  export type MemoryPackItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "packId" | "kind" | "subject" | "content" | "tags" | "createdAt", ExtArgs["result"]["memoryPackItem"]>
  export type MemoryPackItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pack?: boolean | MemoryPackDefaultArgs<ExtArgs>
    overrides?: boolean | MemoryPackItem$overridesArgs<ExtArgs>
    _count?: boolean | MemoryPackItemCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MemoryPackItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pack?: boolean | MemoryPackDefaultArgs<ExtArgs>
  }
  export type MemoryPackItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pack?: boolean | MemoryPackDefaultArgs<ExtArgs>
  }

  export type $MemoryPackItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MemoryPackItem"
    objects: {
      pack: Prisma.$MemoryPackPayload<ExtArgs>
      overrides: Prisma.$MemoryOverridePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      packId: string
      kind: string
      subject: string | null
      content: string
      tags: string | null
      createdAt: Date
    }, ExtArgs["result"]["memoryPackItem"]>
    composites: {}
  }

  type MemoryPackItemGetPayload<S extends boolean | null | undefined | MemoryPackItemDefaultArgs> = $Result.GetResult<Prisma.$MemoryPackItemPayload, S>

  type MemoryPackItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemoryPackItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemoryPackItemCountAggregateInputType | true
    }

  export interface MemoryPackItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MemoryPackItem'], meta: { name: 'MemoryPackItem' } }
    /**
     * Find zero or one MemoryPackItem that matches the filter.
     * @param {MemoryPackItemFindUniqueArgs} args - Arguments to find a MemoryPackItem
     * @example
     * // Get one MemoryPackItem
     * const memoryPackItem = await prisma.memoryPackItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemoryPackItemFindUniqueArgs>(args: SelectSubset<T, MemoryPackItemFindUniqueArgs<ExtArgs>>): Prisma__MemoryPackItemClient<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MemoryPackItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemoryPackItemFindUniqueOrThrowArgs} args - Arguments to find a MemoryPackItem
     * @example
     * // Get one MemoryPackItem
     * const memoryPackItem = await prisma.memoryPackItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemoryPackItemFindUniqueOrThrowArgs>(args: SelectSubset<T, MemoryPackItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemoryPackItemClient<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryPackItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackItemFindFirstArgs} args - Arguments to find a MemoryPackItem
     * @example
     * // Get one MemoryPackItem
     * const memoryPackItem = await prisma.memoryPackItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemoryPackItemFindFirstArgs>(args?: SelectSubset<T, MemoryPackItemFindFirstArgs<ExtArgs>>): Prisma__MemoryPackItemClient<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryPackItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackItemFindFirstOrThrowArgs} args - Arguments to find a MemoryPackItem
     * @example
     * // Get one MemoryPackItem
     * const memoryPackItem = await prisma.memoryPackItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemoryPackItemFindFirstOrThrowArgs>(args?: SelectSubset<T, MemoryPackItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemoryPackItemClient<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MemoryPackItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MemoryPackItems
     * const memoryPackItems = await prisma.memoryPackItem.findMany()
     * 
     * // Get first 10 MemoryPackItems
     * const memoryPackItems = await prisma.memoryPackItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memoryPackItemWithIdOnly = await prisma.memoryPackItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemoryPackItemFindManyArgs>(args?: SelectSubset<T, MemoryPackItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MemoryPackItem.
     * @param {MemoryPackItemCreateArgs} args - Arguments to create a MemoryPackItem.
     * @example
     * // Create one MemoryPackItem
     * const MemoryPackItem = await prisma.memoryPackItem.create({
     *   data: {
     *     // ... data to create a MemoryPackItem
     *   }
     * })
     * 
     */
    create<T extends MemoryPackItemCreateArgs>(args: SelectSubset<T, MemoryPackItemCreateArgs<ExtArgs>>): Prisma__MemoryPackItemClient<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MemoryPackItems.
     * @param {MemoryPackItemCreateManyArgs} args - Arguments to create many MemoryPackItems.
     * @example
     * // Create many MemoryPackItems
     * const memoryPackItem = await prisma.memoryPackItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemoryPackItemCreateManyArgs>(args?: SelectSubset<T, MemoryPackItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MemoryPackItems and returns the data saved in the database.
     * @param {MemoryPackItemCreateManyAndReturnArgs} args - Arguments to create many MemoryPackItems.
     * @example
     * // Create many MemoryPackItems
     * const memoryPackItem = await prisma.memoryPackItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MemoryPackItems and only return the `id`
     * const memoryPackItemWithIdOnly = await prisma.memoryPackItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemoryPackItemCreateManyAndReturnArgs>(args?: SelectSubset<T, MemoryPackItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MemoryPackItem.
     * @param {MemoryPackItemDeleteArgs} args - Arguments to delete one MemoryPackItem.
     * @example
     * // Delete one MemoryPackItem
     * const MemoryPackItem = await prisma.memoryPackItem.delete({
     *   where: {
     *     // ... filter to delete one MemoryPackItem
     *   }
     * })
     * 
     */
    delete<T extends MemoryPackItemDeleteArgs>(args: SelectSubset<T, MemoryPackItemDeleteArgs<ExtArgs>>): Prisma__MemoryPackItemClient<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MemoryPackItem.
     * @param {MemoryPackItemUpdateArgs} args - Arguments to update one MemoryPackItem.
     * @example
     * // Update one MemoryPackItem
     * const memoryPackItem = await prisma.memoryPackItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemoryPackItemUpdateArgs>(args: SelectSubset<T, MemoryPackItemUpdateArgs<ExtArgs>>): Prisma__MemoryPackItemClient<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MemoryPackItems.
     * @param {MemoryPackItemDeleteManyArgs} args - Arguments to filter MemoryPackItems to delete.
     * @example
     * // Delete a few MemoryPackItems
     * const { count } = await prisma.memoryPackItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemoryPackItemDeleteManyArgs>(args?: SelectSubset<T, MemoryPackItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryPackItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MemoryPackItems
     * const memoryPackItem = await prisma.memoryPackItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemoryPackItemUpdateManyArgs>(args: SelectSubset<T, MemoryPackItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryPackItems and returns the data updated in the database.
     * @param {MemoryPackItemUpdateManyAndReturnArgs} args - Arguments to update many MemoryPackItems.
     * @example
     * // Update many MemoryPackItems
     * const memoryPackItem = await prisma.memoryPackItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MemoryPackItems and only return the `id`
     * const memoryPackItemWithIdOnly = await prisma.memoryPackItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MemoryPackItemUpdateManyAndReturnArgs>(args: SelectSubset<T, MemoryPackItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MemoryPackItem.
     * @param {MemoryPackItemUpsertArgs} args - Arguments to update or create a MemoryPackItem.
     * @example
     * // Update or create a MemoryPackItem
     * const memoryPackItem = await prisma.memoryPackItem.upsert({
     *   create: {
     *     // ... data to create a MemoryPackItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MemoryPackItem we want to update
     *   }
     * })
     */
    upsert<T extends MemoryPackItemUpsertArgs>(args: SelectSubset<T, MemoryPackItemUpsertArgs<ExtArgs>>): Prisma__MemoryPackItemClient<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MemoryPackItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackItemCountArgs} args - Arguments to filter MemoryPackItems to count.
     * @example
     * // Count the number of MemoryPackItems
     * const count = await prisma.memoryPackItem.count({
     *   where: {
     *     // ... the filter for the MemoryPackItems we want to count
     *   }
     * })
    **/
    count<T extends MemoryPackItemCountArgs>(
      args?: Subset<T, MemoryPackItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemoryPackItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MemoryPackItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemoryPackItemAggregateArgs>(args: Subset<T, MemoryPackItemAggregateArgs>): Prisma.PrismaPromise<GetMemoryPackItemAggregateType<T>>

    /**
     * Group by MemoryPackItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryPackItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemoryPackItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemoryPackItemGroupByArgs['orderBy'] }
        : { orderBy?: MemoryPackItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemoryPackItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemoryPackItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MemoryPackItem model
   */
  readonly fields: MemoryPackItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MemoryPackItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemoryPackItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pack<T extends MemoryPackDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemoryPackDefaultArgs<ExtArgs>>): Prisma__MemoryPackClient<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    overrides<T extends MemoryPackItem$overridesArgs<ExtArgs> = {}>(args?: Subset<T, MemoryPackItem$overridesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MemoryPackItem model
   */
  interface MemoryPackItemFieldRefs {
    readonly id: FieldRef<"MemoryPackItem", 'String'>
    readonly packId: FieldRef<"MemoryPackItem", 'String'>
    readonly kind: FieldRef<"MemoryPackItem", 'String'>
    readonly subject: FieldRef<"MemoryPackItem", 'String'>
    readonly content: FieldRef<"MemoryPackItem", 'String'>
    readonly tags: FieldRef<"MemoryPackItem", 'String'>
    readonly createdAt: FieldRef<"MemoryPackItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MemoryPackItem findUnique
   */
  export type MemoryPackItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemInclude<ExtArgs> | null
    /**
     * Filter, which MemoryPackItem to fetch.
     */
    where: MemoryPackItemWhereUniqueInput
  }

  /**
   * MemoryPackItem findUniqueOrThrow
   */
  export type MemoryPackItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemInclude<ExtArgs> | null
    /**
     * Filter, which MemoryPackItem to fetch.
     */
    where: MemoryPackItemWhereUniqueInput
  }

  /**
   * MemoryPackItem findFirst
   */
  export type MemoryPackItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemInclude<ExtArgs> | null
    /**
     * Filter, which MemoryPackItem to fetch.
     */
    where?: MemoryPackItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryPackItems to fetch.
     */
    orderBy?: MemoryPackItemOrderByWithRelationInput | MemoryPackItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryPackItems.
     */
    cursor?: MemoryPackItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryPackItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryPackItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryPackItems.
     */
    distinct?: MemoryPackItemScalarFieldEnum | MemoryPackItemScalarFieldEnum[]
  }

  /**
   * MemoryPackItem findFirstOrThrow
   */
  export type MemoryPackItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemInclude<ExtArgs> | null
    /**
     * Filter, which MemoryPackItem to fetch.
     */
    where?: MemoryPackItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryPackItems to fetch.
     */
    orderBy?: MemoryPackItemOrderByWithRelationInput | MemoryPackItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryPackItems.
     */
    cursor?: MemoryPackItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryPackItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryPackItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryPackItems.
     */
    distinct?: MemoryPackItemScalarFieldEnum | MemoryPackItemScalarFieldEnum[]
  }

  /**
   * MemoryPackItem findMany
   */
  export type MemoryPackItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemInclude<ExtArgs> | null
    /**
     * Filter, which MemoryPackItems to fetch.
     */
    where?: MemoryPackItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryPackItems to fetch.
     */
    orderBy?: MemoryPackItemOrderByWithRelationInput | MemoryPackItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MemoryPackItems.
     */
    cursor?: MemoryPackItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryPackItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryPackItems.
     */
    skip?: number
    distinct?: MemoryPackItemScalarFieldEnum | MemoryPackItemScalarFieldEnum[]
  }

  /**
   * MemoryPackItem create
   */
  export type MemoryPackItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemInclude<ExtArgs> | null
    /**
     * The data needed to create a MemoryPackItem.
     */
    data: XOR<MemoryPackItemCreateInput, MemoryPackItemUncheckedCreateInput>
  }

  /**
   * MemoryPackItem createMany
   */
  export type MemoryPackItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MemoryPackItems.
     */
    data: MemoryPackItemCreateManyInput | MemoryPackItemCreateManyInput[]
  }

  /**
   * MemoryPackItem createManyAndReturn
   */
  export type MemoryPackItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * The data used to create many MemoryPackItems.
     */
    data: MemoryPackItemCreateManyInput | MemoryPackItemCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemoryPackItem update
   */
  export type MemoryPackItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemInclude<ExtArgs> | null
    /**
     * The data needed to update a MemoryPackItem.
     */
    data: XOR<MemoryPackItemUpdateInput, MemoryPackItemUncheckedUpdateInput>
    /**
     * Choose, which MemoryPackItem to update.
     */
    where: MemoryPackItemWhereUniqueInput
  }

  /**
   * MemoryPackItem updateMany
   */
  export type MemoryPackItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MemoryPackItems.
     */
    data: XOR<MemoryPackItemUpdateManyMutationInput, MemoryPackItemUncheckedUpdateManyInput>
    /**
     * Filter which MemoryPackItems to update
     */
    where?: MemoryPackItemWhereInput
    /**
     * Limit how many MemoryPackItems to update.
     */
    limit?: number
  }

  /**
   * MemoryPackItem updateManyAndReturn
   */
  export type MemoryPackItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * The data used to update MemoryPackItems.
     */
    data: XOR<MemoryPackItemUpdateManyMutationInput, MemoryPackItemUncheckedUpdateManyInput>
    /**
     * Filter which MemoryPackItems to update
     */
    where?: MemoryPackItemWhereInput
    /**
     * Limit how many MemoryPackItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemoryPackItem upsert
   */
  export type MemoryPackItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemInclude<ExtArgs> | null
    /**
     * The filter to search for the MemoryPackItem to update in case it exists.
     */
    where: MemoryPackItemWhereUniqueInput
    /**
     * In case the MemoryPackItem found by the `where` argument doesn't exist, create a new MemoryPackItem with this data.
     */
    create: XOR<MemoryPackItemCreateInput, MemoryPackItemUncheckedCreateInput>
    /**
     * In case the MemoryPackItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemoryPackItemUpdateInput, MemoryPackItemUncheckedUpdateInput>
  }

  /**
   * MemoryPackItem delete
   */
  export type MemoryPackItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemInclude<ExtArgs> | null
    /**
     * Filter which MemoryPackItem to delete.
     */
    where: MemoryPackItemWhereUniqueInput
  }

  /**
   * MemoryPackItem deleteMany
   */
  export type MemoryPackItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryPackItems to delete
     */
    where?: MemoryPackItemWhereInput
    /**
     * Limit how many MemoryPackItems to delete.
     */
    limit?: number
  }

  /**
   * MemoryPackItem.overrides
   */
  export type MemoryPackItem$overridesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideInclude<ExtArgs> | null
    where?: MemoryOverrideWhereInput
    orderBy?: MemoryOverrideOrderByWithRelationInput | MemoryOverrideOrderByWithRelationInput[]
    cursor?: MemoryOverrideWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryOverrideScalarFieldEnum | MemoryOverrideScalarFieldEnum[]
  }

  /**
   * MemoryPackItem without action
   */
  export type MemoryPackItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryPackItem
     */
    select?: MemoryPackItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryPackItem
     */
    omit?: MemoryPackItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryPackItemInclude<ExtArgs> | null
  }


  /**
   * Model MemoryTenant
   */

  export type AggregateMemoryTenant = {
    _count: MemoryTenantCountAggregateOutputType | null
    _min: MemoryTenantMinAggregateOutputType | null
    _max: MemoryTenantMaxAggregateOutputType | null
  }

  export type MemoryTenantMinAggregateOutputType = {
    id: string | null
    name: string | null
    brandSlug: string | null
    createdAt: Date | null
  }

  export type MemoryTenantMaxAggregateOutputType = {
    id: string | null
    name: string | null
    brandSlug: string | null
    createdAt: Date | null
  }

  export type MemoryTenantCountAggregateOutputType = {
    id: number
    name: number
    brandSlug: number
    createdAt: number
    _all: number
  }


  export type MemoryTenantMinAggregateInputType = {
    id?: true
    name?: true
    brandSlug?: true
    createdAt?: true
  }

  export type MemoryTenantMaxAggregateInputType = {
    id?: true
    name?: true
    brandSlug?: true
    createdAt?: true
  }

  export type MemoryTenantCountAggregateInputType = {
    id?: true
    name?: true
    brandSlug?: true
    createdAt?: true
    _all?: true
  }

  export type MemoryTenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryTenant to aggregate.
     */
    where?: MemoryTenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryTenants to fetch.
     */
    orderBy?: MemoryTenantOrderByWithRelationInput | MemoryTenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemoryTenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryTenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryTenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MemoryTenants
    **/
    _count?: true | MemoryTenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemoryTenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemoryTenantMaxAggregateInputType
  }

  export type GetMemoryTenantAggregateType<T extends MemoryTenantAggregateArgs> = {
        [P in keyof T & keyof AggregateMemoryTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemoryTenant[P]>
      : GetScalarType<T[P], AggregateMemoryTenant[P]>
  }




  export type MemoryTenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryTenantWhereInput
    orderBy?: MemoryTenantOrderByWithAggregationInput | MemoryTenantOrderByWithAggregationInput[]
    by: MemoryTenantScalarFieldEnum[] | MemoryTenantScalarFieldEnum
    having?: MemoryTenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemoryTenantCountAggregateInputType | true
    _min?: MemoryTenantMinAggregateInputType
    _max?: MemoryTenantMaxAggregateInputType
  }

  export type MemoryTenantGroupByOutputType = {
    id: string
    name: string
    brandSlug: string
    createdAt: Date
    _count: MemoryTenantCountAggregateOutputType | null
    _min: MemoryTenantMinAggregateOutputType | null
    _max: MemoryTenantMaxAggregateOutputType | null
  }

  type GetMemoryTenantGroupByPayload<T extends MemoryTenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemoryTenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemoryTenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemoryTenantGroupByOutputType[P]>
            : GetScalarType<T[P], MemoryTenantGroupByOutputType[P]>
        }
      >
    >


  export type MemoryTenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    brandSlug?: boolean
    createdAt?: boolean
    installs?: boolean | MemoryTenant$installsArgs<ExtArgs>
    overrides?: boolean | MemoryTenant$overridesArgs<ExtArgs>
    _count?: boolean | MemoryTenantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryTenant"]>

  export type MemoryTenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    brandSlug?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["memoryTenant"]>

  export type MemoryTenantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    brandSlug?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["memoryTenant"]>

  export type MemoryTenantSelectScalar = {
    id?: boolean
    name?: boolean
    brandSlug?: boolean
    createdAt?: boolean
  }

  export type MemoryTenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "brandSlug" | "createdAt", ExtArgs["result"]["memoryTenant"]>
  export type MemoryTenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    installs?: boolean | MemoryTenant$installsArgs<ExtArgs>
    overrides?: boolean | MemoryTenant$overridesArgs<ExtArgs>
    _count?: boolean | MemoryTenantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MemoryTenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type MemoryTenantIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $MemoryTenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MemoryTenant"
    objects: {
      installs: Prisma.$MemoryInstallPayload<ExtArgs>[]
      overrides: Prisma.$MemoryOverridePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      brandSlug: string
      createdAt: Date
    }, ExtArgs["result"]["memoryTenant"]>
    composites: {}
  }

  type MemoryTenantGetPayload<S extends boolean | null | undefined | MemoryTenantDefaultArgs> = $Result.GetResult<Prisma.$MemoryTenantPayload, S>

  type MemoryTenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemoryTenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemoryTenantCountAggregateInputType | true
    }

  export interface MemoryTenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MemoryTenant'], meta: { name: 'MemoryTenant' } }
    /**
     * Find zero or one MemoryTenant that matches the filter.
     * @param {MemoryTenantFindUniqueArgs} args - Arguments to find a MemoryTenant
     * @example
     * // Get one MemoryTenant
     * const memoryTenant = await prisma.memoryTenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemoryTenantFindUniqueArgs>(args: SelectSubset<T, MemoryTenantFindUniqueArgs<ExtArgs>>): Prisma__MemoryTenantClient<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MemoryTenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemoryTenantFindUniqueOrThrowArgs} args - Arguments to find a MemoryTenant
     * @example
     * // Get one MemoryTenant
     * const memoryTenant = await prisma.memoryTenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemoryTenantFindUniqueOrThrowArgs>(args: SelectSubset<T, MemoryTenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemoryTenantClient<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryTenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTenantFindFirstArgs} args - Arguments to find a MemoryTenant
     * @example
     * // Get one MemoryTenant
     * const memoryTenant = await prisma.memoryTenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemoryTenantFindFirstArgs>(args?: SelectSubset<T, MemoryTenantFindFirstArgs<ExtArgs>>): Prisma__MemoryTenantClient<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryTenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTenantFindFirstOrThrowArgs} args - Arguments to find a MemoryTenant
     * @example
     * // Get one MemoryTenant
     * const memoryTenant = await prisma.memoryTenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemoryTenantFindFirstOrThrowArgs>(args?: SelectSubset<T, MemoryTenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemoryTenantClient<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MemoryTenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MemoryTenants
     * const memoryTenants = await prisma.memoryTenant.findMany()
     * 
     * // Get first 10 MemoryTenants
     * const memoryTenants = await prisma.memoryTenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memoryTenantWithIdOnly = await prisma.memoryTenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemoryTenantFindManyArgs>(args?: SelectSubset<T, MemoryTenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MemoryTenant.
     * @param {MemoryTenantCreateArgs} args - Arguments to create a MemoryTenant.
     * @example
     * // Create one MemoryTenant
     * const MemoryTenant = await prisma.memoryTenant.create({
     *   data: {
     *     // ... data to create a MemoryTenant
     *   }
     * })
     * 
     */
    create<T extends MemoryTenantCreateArgs>(args: SelectSubset<T, MemoryTenantCreateArgs<ExtArgs>>): Prisma__MemoryTenantClient<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MemoryTenants.
     * @param {MemoryTenantCreateManyArgs} args - Arguments to create many MemoryTenants.
     * @example
     * // Create many MemoryTenants
     * const memoryTenant = await prisma.memoryTenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemoryTenantCreateManyArgs>(args?: SelectSubset<T, MemoryTenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MemoryTenants and returns the data saved in the database.
     * @param {MemoryTenantCreateManyAndReturnArgs} args - Arguments to create many MemoryTenants.
     * @example
     * // Create many MemoryTenants
     * const memoryTenant = await prisma.memoryTenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MemoryTenants and only return the `id`
     * const memoryTenantWithIdOnly = await prisma.memoryTenant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemoryTenantCreateManyAndReturnArgs>(args?: SelectSubset<T, MemoryTenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MemoryTenant.
     * @param {MemoryTenantDeleteArgs} args - Arguments to delete one MemoryTenant.
     * @example
     * // Delete one MemoryTenant
     * const MemoryTenant = await prisma.memoryTenant.delete({
     *   where: {
     *     // ... filter to delete one MemoryTenant
     *   }
     * })
     * 
     */
    delete<T extends MemoryTenantDeleteArgs>(args: SelectSubset<T, MemoryTenantDeleteArgs<ExtArgs>>): Prisma__MemoryTenantClient<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MemoryTenant.
     * @param {MemoryTenantUpdateArgs} args - Arguments to update one MemoryTenant.
     * @example
     * // Update one MemoryTenant
     * const memoryTenant = await prisma.memoryTenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemoryTenantUpdateArgs>(args: SelectSubset<T, MemoryTenantUpdateArgs<ExtArgs>>): Prisma__MemoryTenantClient<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MemoryTenants.
     * @param {MemoryTenantDeleteManyArgs} args - Arguments to filter MemoryTenants to delete.
     * @example
     * // Delete a few MemoryTenants
     * const { count } = await prisma.memoryTenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemoryTenantDeleteManyArgs>(args?: SelectSubset<T, MemoryTenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryTenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MemoryTenants
     * const memoryTenant = await prisma.memoryTenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemoryTenantUpdateManyArgs>(args: SelectSubset<T, MemoryTenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryTenants and returns the data updated in the database.
     * @param {MemoryTenantUpdateManyAndReturnArgs} args - Arguments to update many MemoryTenants.
     * @example
     * // Update many MemoryTenants
     * const memoryTenant = await prisma.memoryTenant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MemoryTenants and only return the `id`
     * const memoryTenantWithIdOnly = await prisma.memoryTenant.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MemoryTenantUpdateManyAndReturnArgs>(args: SelectSubset<T, MemoryTenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MemoryTenant.
     * @param {MemoryTenantUpsertArgs} args - Arguments to update or create a MemoryTenant.
     * @example
     * // Update or create a MemoryTenant
     * const memoryTenant = await prisma.memoryTenant.upsert({
     *   create: {
     *     // ... data to create a MemoryTenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MemoryTenant we want to update
     *   }
     * })
     */
    upsert<T extends MemoryTenantUpsertArgs>(args: SelectSubset<T, MemoryTenantUpsertArgs<ExtArgs>>): Prisma__MemoryTenantClient<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MemoryTenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTenantCountArgs} args - Arguments to filter MemoryTenants to count.
     * @example
     * // Count the number of MemoryTenants
     * const count = await prisma.memoryTenant.count({
     *   where: {
     *     // ... the filter for the MemoryTenants we want to count
     *   }
     * })
    **/
    count<T extends MemoryTenantCountArgs>(
      args?: Subset<T, MemoryTenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemoryTenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MemoryTenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemoryTenantAggregateArgs>(args: Subset<T, MemoryTenantAggregateArgs>): Prisma.PrismaPromise<GetMemoryTenantAggregateType<T>>

    /**
     * Group by MemoryTenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryTenantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemoryTenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemoryTenantGroupByArgs['orderBy'] }
        : { orderBy?: MemoryTenantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemoryTenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemoryTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MemoryTenant model
   */
  readonly fields: MemoryTenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MemoryTenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemoryTenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    installs<T extends MemoryTenant$installsArgs<ExtArgs> = {}>(args?: Subset<T, MemoryTenant$installsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    overrides<T extends MemoryTenant$overridesArgs<ExtArgs> = {}>(args?: Subset<T, MemoryTenant$overridesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MemoryTenant model
   */
  interface MemoryTenantFieldRefs {
    readonly id: FieldRef<"MemoryTenant", 'String'>
    readonly name: FieldRef<"MemoryTenant", 'String'>
    readonly brandSlug: FieldRef<"MemoryTenant", 'String'>
    readonly createdAt: FieldRef<"MemoryTenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MemoryTenant findUnique
   */
  export type MemoryTenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenant
     */
    select?: MemoryTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTenant
     */
    omit?: MemoryTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTenantInclude<ExtArgs> | null
    /**
     * Filter, which MemoryTenant to fetch.
     */
    where: MemoryTenantWhereUniqueInput
  }

  /**
   * MemoryTenant findUniqueOrThrow
   */
  export type MemoryTenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenant
     */
    select?: MemoryTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTenant
     */
    omit?: MemoryTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTenantInclude<ExtArgs> | null
    /**
     * Filter, which MemoryTenant to fetch.
     */
    where: MemoryTenantWhereUniqueInput
  }

  /**
   * MemoryTenant findFirst
   */
  export type MemoryTenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenant
     */
    select?: MemoryTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTenant
     */
    omit?: MemoryTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTenantInclude<ExtArgs> | null
    /**
     * Filter, which MemoryTenant to fetch.
     */
    where?: MemoryTenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryTenants to fetch.
     */
    orderBy?: MemoryTenantOrderByWithRelationInput | MemoryTenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryTenants.
     */
    cursor?: MemoryTenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryTenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryTenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryTenants.
     */
    distinct?: MemoryTenantScalarFieldEnum | MemoryTenantScalarFieldEnum[]
  }

  /**
   * MemoryTenant findFirstOrThrow
   */
  export type MemoryTenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenant
     */
    select?: MemoryTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTenant
     */
    omit?: MemoryTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTenantInclude<ExtArgs> | null
    /**
     * Filter, which MemoryTenant to fetch.
     */
    where?: MemoryTenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryTenants to fetch.
     */
    orderBy?: MemoryTenantOrderByWithRelationInput | MemoryTenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryTenants.
     */
    cursor?: MemoryTenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryTenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryTenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryTenants.
     */
    distinct?: MemoryTenantScalarFieldEnum | MemoryTenantScalarFieldEnum[]
  }

  /**
   * MemoryTenant findMany
   */
  export type MemoryTenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenant
     */
    select?: MemoryTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTenant
     */
    omit?: MemoryTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTenantInclude<ExtArgs> | null
    /**
     * Filter, which MemoryTenants to fetch.
     */
    where?: MemoryTenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryTenants to fetch.
     */
    orderBy?: MemoryTenantOrderByWithRelationInput | MemoryTenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MemoryTenants.
     */
    cursor?: MemoryTenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryTenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryTenants.
     */
    skip?: number
    distinct?: MemoryTenantScalarFieldEnum | MemoryTenantScalarFieldEnum[]
  }

  /**
   * MemoryTenant create
   */
  export type MemoryTenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenant
     */
    select?: MemoryTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTenant
     */
    omit?: MemoryTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTenantInclude<ExtArgs> | null
    /**
     * The data needed to create a MemoryTenant.
     */
    data: XOR<MemoryTenantCreateInput, MemoryTenantUncheckedCreateInput>
  }

  /**
   * MemoryTenant createMany
   */
  export type MemoryTenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MemoryTenants.
     */
    data: MemoryTenantCreateManyInput | MemoryTenantCreateManyInput[]
  }

  /**
   * MemoryTenant createManyAndReturn
   */
  export type MemoryTenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenant
     */
    select?: MemoryTenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTenant
     */
    omit?: MemoryTenantOmit<ExtArgs> | null
    /**
     * The data used to create many MemoryTenants.
     */
    data: MemoryTenantCreateManyInput | MemoryTenantCreateManyInput[]
  }

  /**
   * MemoryTenant update
   */
  export type MemoryTenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenant
     */
    select?: MemoryTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTenant
     */
    omit?: MemoryTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTenantInclude<ExtArgs> | null
    /**
     * The data needed to update a MemoryTenant.
     */
    data: XOR<MemoryTenantUpdateInput, MemoryTenantUncheckedUpdateInput>
    /**
     * Choose, which MemoryTenant to update.
     */
    where: MemoryTenantWhereUniqueInput
  }

  /**
   * MemoryTenant updateMany
   */
  export type MemoryTenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MemoryTenants.
     */
    data: XOR<MemoryTenantUpdateManyMutationInput, MemoryTenantUncheckedUpdateManyInput>
    /**
     * Filter which MemoryTenants to update
     */
    where?: MemoryTenantWhereInput
    /**
     * Limit how many MemoryTenants to update.
     */
    limit?: number
  }

  /**
   * MemoryTenant updateManyAndReturn
   */
  export type MemoryTenantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenant
     */
    select?: MemoryTenantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTenant
     */
    omit?: MemoryTenantOmit<ExtArgs> | null
    /**
     * The data used to update MemoryTenants.
     */
    data: XOR<MemoryTenantUpdateManyMutationInput, MemoryTenantUncheckedUpdateManyInput>
    /**
     * Filter which MemoryTenants to update
     */
    where?: MemoryTenantWhereInput
    /**
     * Limit how many MemoryTenants to update.
     */
    limit?: number
  }

  /**
   * MemoryTenant upsert
   */
  export type MemoryTenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenant
     */
    select?: MemoryTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTenant
     */
    omit?: MemoryTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTenantInclude<ExtArgs> | null
    /**
     * The filter to search for the MemoryTenant to update in case it exists.
     */
    where: MemoryTenantWhereUniqueInput
    /**
     * In case the MemoryTenant found by the `where` argument doesn't exist, create a new MemoryTenant with this data.
     */
    create: XOR<MemoryTenantCreateInput, MemoryTenantUncheckedCreateInput>
    /**
     * In case the MemoryTenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemoryTenantUpdateInput, MemoryTenantUncheckedUpdateInput>
  }

  /**
   * MemoryTenant delete
   */
  export type MemoryTenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenant
     */
    select?: MemoryTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTenant
     */
    omit?: MemoryTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTenantInclude<ExtArgs> | null
    /**
     * Filter which MemoryTenant to delete.
     */
    where: MemoryTenantWhereUniqueInput
  }

  /**
   * MemoryTenant deleteMany
   */
  export type MemoryTenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryTenants to delete
     */
    where?: MemoryTenantWhereInput
    /**
     * Limit how many MemoryTenants to delete.
     */
    limit?: number
  }

  /**
   * MemoryTenant.installs
   */
  export type MemoryTenant$installsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallInclude<ExtArgs> | null
    where?: MemoryInstallWhereInput
    orderBy?: MemoryInstallOrderByWithRelationInput | MemoryInstallOrderByWithRelationInput[]
    cursor?: MemoryInstallWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryInstallScalarFieldEnum | MemoryInstallScalarFieldEnum[]
  }

  /**
   * MemoryTenant.overrides
   */
  export type MemoryTenant$overridesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideInclude<ExtArgs> | null
    where?: MemoryOverrideWhereInput
    orderBy?: MemoryOverrideOrderByWithRelationInput | MemoryOverrideOrderByWithRelationInput[]
    cursor?: MemoryOverrideWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryOverrideScalarFieldEnum | MemoryOverrideScalarFieldEnum[]
  }

  /**
   * MemoryTenant without action
   */
  export type MemoryTenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryTenant
     */
    select?: MemoryTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryTenant
     */
    omit?: MemoryTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryTenantInclude<ExtArgs> | null
  }


  /**
   * Model MemoryInstall
   */

  export type AggregateMemoryInstall = {
    _count: MemoryInstallCountAggregateOutputType | null
    _min: MemoryInstallMinAggregateOutputType | null
    _max: MemoryInstallMaxAggregateOutputType | null
  }

  export type MemoryInstallMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    packId: string | null
    installedAt: Date | null
  }

  export type MemoryInstallMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    packId: string | null
    installedAt: Date | null
  }

  export type MemoryInstallCountAggregateOutputType = {
    id: number
    tenantId: number
    packId: number
    installedAt: number
    _all: number
  }


  export type MemoryInstallMinAggregateInputType = {
    id?: true
    tenantId?: true
    packId?: true
    installedAt?: true
  }

  export type MemoryInstallMaxAggregateInputType = {
    id?: true
    tenantId?: true
    packId?: true
    installedAt?: true
  }

  export type MemoryInstallCountAggregateInputType = {
    id?: true
    tenantId?: true
    packId?: true
    installedAt?: true
    _all?: true
  }

  export type MemoryInstallAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryInstall to aggregate.
     */
    where?: MemoryInstallWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryInstalls to fetch.
     */
    orderBy?: MemoryInstallOrderByWithRelationInput | MemoryInstallOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemoryInstallWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryInstalls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryInstalls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MemoryInstalls
    **/
    _count?: true | MemoryInstallCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemoryInstallMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemoryInstallMaxAggregateInputType
  }

  export type GetMemoryInstallAggregateType<T extends MemoryInstallAggregateArgs> = {
        [P in keyof T & keyof AggregateMemoryInstall]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemoryInstall[P]>
      : GetScalarType<T[P], AggregateMemoryInstall[P]>
  }




  export type MemoryInstallGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryInstallWhereInput
    orderBy?: MemoryInstallOrderByWithAggregationInput | MemoryInstallOrderByWithAggregationInput[]
    by: MemoryInstallScalarFieldEnum[] | MemoryInstallScalarFieldEnum
    having?: MemoryInstallScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemoryInstallCountAggregateInputType | true
    _min?: MemoryInstallMinAggregateInputType
    _max?: MemoryInstallMaxAggregateInputType
  }

  export type MemoryInstallGroupByOutputType = {
    id: string
    tenantId: string
    packId: string
    installedAt: Date
    _count: MemoryInstallCountAggregateOutputType | null
    _min: MemoryInstallMinAggregateOutputType | null
    _max: MemoryInstallMaxAggregateOutputType | null
  }

  type GetMemoryInstallGroupByPayload<T extends MemoryInstallGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemoryInstallGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemoryInstallGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemoryInstallGroupByOutputType[P]>
            : GetScalarType<T[P], MemoryInstallGroupByOutputType[P]>
        }
      >
    >


  export type MemoryInstallSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    packId?: boolean
    installedAt?: boolean
    tenant?: boolean | MemoryTenantDefaultArgs<ExtArgs>
    pack?: boolean | MemoryPackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryInstall"]>

  export type MemoryInstallSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    packId?: boolean
    installedAt?: boolean
    tenant?: boolean | MemoryTenantDefaultArgs<ExtArgs>
    pack?: boolean | MemoryPackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryInstall"]>

  export type MemoryInstallSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    packId?: boolean
    installedAt?: boolean
    tenant?: boolean | MemoryTenantDefaultArgs<ExtArgs>
    pack?: boolean | MemoryPackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryInstall"]>

  export type MemoryInstallSelectScalar = {
    id?: boolean
    tenantId?: boolean
    packId?: boolean
    installedAt?: boolean
  }

  export type MemoryInstallOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "packId" | "installedAt", ExtArgs["result"]["memoryInstall"]>
  export type MemoryInstallInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | MemoryTenantDefaultArgs<ExtArgs>
    pack?: boolean | MemoryPackDefaultArgs<ExtArgs>
  }
  export type MemoryInstallIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | MemoryTenantDefaultArgs<ExtArgs>
    pack?: boolean | MemoryPackDefaultArgs<ExtArgs>
  }
  export type MemoryInstallIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | MemoryTenantDefaultArgs<ExtArgs>
    pack?: boolean | MemoryPackDefaultArgs<ExtArgs>
  }

  export type $MemoryInstallPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MemoryInstall"
    objects: {
      tenant: Prisma.$MemoryTenantPayload<ExtArgs>
      pack: Prisma.$MemoryPackPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      packId: string
      installedAt: Date
    }, ExtArgs["result"]["memoryInstall"]>
    composites: {}
  }

  type MemoryInstallGetPayload<S extends boolean | null | undefined | MemoryInstallDefaultArgs> = $Result.GetResult<Prisma.$MemoryInstallPayload, S>

  type MemoryInstallCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemoryInstallFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemoryInstallCountAggregateInputType | true
    }

  export interface MemoryInstallDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MemoryInstall'], meta: { name: 'MemoryInstall' } }
    /**
     * Find zero or one MemoryInstall that matches the filter.
     * @param {MemoryInstallFindUniqueArgs} args - Arguments to find a MemoryInstall
     * @example
     * // Get one MemoryInstall
     * const memoryInstall = await prisma.memoryInstall.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemoryInstallFindUniqueArgs>(args: SelectSubset<T, MemoryInstallFindUniqueArgs<ExtArgs>>): Prisma__MemoryInstallClient<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MemoryInstall that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemoryInstallFindUniqueOrThrowArgs} args - Arguments to find a MemoryInstall
     * @example
     * // Get one MemoryInstall
     * const memoryInstall = await prisma.memoryInstall.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemoryInstallFindUniqueOrThrowArgs>(args: SelectSubset<T, MemoryInstallFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemoryInstallClient<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryInstall that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryInstallFindFirstArgs} args - Arguments to find a MemoryInstall
     * @example
     * // Get one MemoryInstall
     * const memoryInstall = await prisma.memoryInstall.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemoryInstallFindFirstArgs>(args?: SelectSubset<T, MemoryInstallFindFirstArgs<ExtArgs>>): Prisma__MemoryInstallClient<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryInstall that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryInstallFindFirstOrThrowArgs} args - Arguments to find a MemoryInstall
     * @example
     * // Get one MemoryInstall
     * const memoryInstall = await prisma.memoryInstall.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemoryInstallFindFirstOrThrowArgs>(args?: SelectSubset<T, MemoryInstallFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemoryInstallClient<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MemoryInstalls that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryInstallFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MemoryInstalls
     * const memoryInstalls = await prisma.memoryInstall.findMany()
     * 
     * // Get first 10 MemoryInstalls
     * const memoryInstalls = await prisma.memoryInstall.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memoryInstallWithIdOnly = await prisma.memoryInstall.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemoryInstallFindManyArgs>(args?: SelectSubset<T, MemoryInstallFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MemoryInstall.
     * @param {MemoryInstallCreateArgs} args - Arguments to create a MemoryInstall.
     * @example
     * // Create one MemoryInstall
     * const MemoryInstall = await prisma.memoryInstall.create({
     *   data: {
     *     // ... data to create a MemoryInstall
     *   }
     * })
     * 
     */
    create<T extends MemoryInstallCreateArgs>(args: SelectSubset<T, MemoryInstallCreateArgs<ExtArgs>>): Prisma__MemoryInstallClient<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MemoryInstalls.
     * @param {MemoryInstallCreateManyArgs} args - Arguments to create many MemoryInstalls.
     * @example
     * // Create many MemoryInstalls
     * const memoryInstall = await prisma.memoryInstall.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemoryInstallCreateManyArgs>(args?: SelectSubset<T, MemoryInstallCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MemoryInstalls and returns the data saved in the database.
     * @param {MemoryInstallCreateManyAndReturnArgs} args - Arguments to create many MemoryInstalls.
     * @example
     * // Create many MemoryInstalls
     * const memoryInstall = await prisma.memoryInstall.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MemoryInstalls and only return the `id`
     * const memoryInstallWithIdOnly = await prisma.memoryInstall.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemoryInstallCreateManyAndReturnArgs>(args?: SelectSubset<T, MemoryInstallCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MemoryInstall.
     * @param {MemoryInstallDeleteArgs} args - Arguments to delete one MemoryInstall.
     * @example
     * // Delete one MemoryInstall
     * const MemoryInstall = await prisma.memoryInstall.delete({
     *   where: {
     *     // ... filter to delete one MemoryInstall
     *   }
     * })
     * 
     */
    delete<T extends MemoryInstallDeleteArgs>(args: SelectSubset<T, MemoryInstallDeleteArgs<ExtArgs>>): Prisma__MemoryInstallClient<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MemoryInstall.
     * @param {MemoryInstallUpdateArgs} args - Arguments to update one MemoryInstall.
     * @example
     * // Update one MemoryInstall
     * const memoryInstall = await prisma.memoryInstall.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemoryInstallUpdateArgs>(args: SelectSubset<T, MemoryInstallUpdateArgs<ExtArgs>>): Prisma__MemoryInstallClient<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MemoryInstalls.
     * @param {MemoryInstallDeleteManyArgs} args - Arguments to filter MemoryInstalls to delete.
     * @example
     * // Delete a few MemoryInstalls
     * const { count } = await prisma.memoryInstall.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemoryInstallDeleteManyArgs>(args?: SelectSubset<T, MemoryInstallDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryInstalls.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryInstallUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MemoryInstalls
     * const memoryInstall = await prisma.memoryInstall.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemoryInstallUpdateManyArgs>(args: SelectSubset<T, MemoryInstallUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryInstalls and returns the data updated in the database.
     * @param {MemoryInstallUpdateManyAndReturnArgs} args - Arguments to update many MemoryInstalls.
     * @example
     * // Update many MemoryInstalls
     * const memoryInstall = await prisma.memoryInstall.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MemoryInstalls and only return the `id`
     * const memoryInstallWithIdOnly = await prisma.memoryInstall.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MemoryInstallUpdateManyAndReturnArgs>(args: SelectSubset<T, MemoryInstallUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MemoryInstall.
     * @param {MemoryInstallUpsertArgs} args - Arguments to update or create a MemoryInstall.
     * @example
     * // Update or create a MemoryInstall
     * const memoryInstall = await prisma.memoryInstall.upsert({
     *   create: {
     *     // ... data to create a MemoryInstall
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MemoryInstall we want to update
     *   }
     * })
     */
    upsert<T extends MemoryInstallUpsertArgs>(args: SelectSubset<T, MemoryInstallUpsertArgs<ExtArgs>>): Prisma__MemoryInstallClient<$Result.GetResult<Prisma.$MemoryInstallPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MemoryInstalls.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryInstallCountArgs} args - Arguments to filter MemoryInstalls to count.
     * @example
     * // Count the number of MemoryInstalls
     * const count = await prisma.memoryInstall.count({
     *   where: {
     *     // ... the filter for the MemoryInstalls we want to count
     *   }
     * })
    **/
    count<T extends MemoryInstallCountArgs>(
      args?: Subset<T, MemoryInstallCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemoryInstallCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MemoryInstall.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryInstallAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemoryInstallAggregateArgs>(args: Subset<T, MemoryInstallAggregateArgs>): Prisma.PrismaPromise<GetMemoryInstallAggregateType<T>>

    /**
     * Group by MemoryInstall.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryInstallGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemoryInstallGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemoryInstallGroupByArgs['orderBy'] }
        : { orderBy?: MemoryInstallGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemoryInstallGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemoryInstallGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MemoryInstall model
   */
  readonly fields: MemoryInstallFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MemoryInstall.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemoryInstallClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends MemoryTenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemoryTenantDefaultArgs<ExtArgs>>): Prisma__MemoryTenantClient<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    pack<T extends MemoryPackDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemoryPackDefaultArgs<ExtArgs>>): Prisma__MemoryPackClient<$Result.GetResult<Prisma.$MemoryPackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MemoryInstall model
   */
  interface MemoryInstallFieldRefs {
    readonly id: FieldRef<"MemoryInstall", 'String'>
    readonly tenantId: FieldRef<"MemoryInstall", 'String'>
    readonly packId: FieldRef<"MemoryInstall", 'String'>
    readonly installedAt: FieldRef<"MemoryInstall", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MemoryInstall findUnique
   */
  export type MemoryInstallFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallInclude<ExtArgs> | null
    /**
     * Filter, which MemoryInstall to fetch.
     */
    where: MemoryInstallWhereUniqueInput
  }

  /**
   * MemoryInstall findUniqueOrThrow
   */
  export type MemoryInstallFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallInclude<ExtArgs> | null
    /**
     * Filter, which MemoryInstall to fetch.
     */
    where: MemoryInstallWhereUniqueInput
  }

  /**
   * MemoryInstall findFirst
   */
  export type MemoryInstallFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallInclude<ExtArgs> | null
    /**
     * Filter, which MemoryInstall to fetch.
     */
    where?: MemoryInstallWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryInstalls to fetch.
     */
    orderBy?: MemoryInstallOrderByWithRelationInput | MemoryInstallOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryInstalls.
     */
    cursor?: MemoryInstallWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryInstalls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryInstalls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryInstalls.
     */
    distinct?: MemoryInstallScalarFieldEnum | MemoryInstallScalarFieldEnum[]
  }

  /**
   * MemoryInstall findFirstOrThrow
   */
  export type MemoryInstallFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallInclude<ExtArgs> | null
    /**
     * Filter, which MemoryInstall to fetch.
     */
    where?: MemoryInstallWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryInstalls to fetch.
     */
    orderBy?: MemoryInstallOrderByWithRelationInput | MemoryInstallOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryInstalls.
     */
    cursor?: MemoryInstallWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryInstalls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryInstalls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryInstalls.
     */
    distinct?: MemoryInstallScalarFieldEnum | MemoryInstallScalarFieldEnum[]
  }

  /**
   * MemoryInstall findMany
   */
  export type MemoryInstallFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallInclude<ExtArgs> | null
    /**
     * Filter, which MemoryInstalls to fetch.
     */
    where?: MemoryInstallWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryInstalls to fetch.
     */
    orderBy?: MemoryInstallOrderByWithRelationInput | MemoryInstallOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MemoryInstalls.
     */
    cursor?: MemoryInstallWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryInstalls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryInstalls.
     */
    skip?: number
    distinct?: MemoryInstallScalarFieldEnum | MemoryInstallScalarFieldEnum[]
  }

  /**
   * MemoryInstall create
   */
  export type MemoryInstallCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallInclude<ExtArgs> | null
    /**
     * The data needed to create a MemoryInstall.
     */
    data: XOR<MemoryInstallCreateInput, MemoryInstallUncheckedCreateInput>
  }

  /**
   * MemoryInstall createMany
   */
  export type MemoryInstallCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MemoryInstalls.
     */
    data: MemoryInstallCreateManyInput | MemoryInstallCreateManyInput[]
  }

  /**
   * MemoryInstall createManyAndReturn
   */
  export type MemoryInstallCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * The data used to create many MemoryInstalls.
     */
    data: MemoryInstallCreateManyInput | MemoryInstallCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemoryInstall update
   */
  export type MemoryInstallUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallInclude<ExtArgs> | null
    /**
     * The data needed to update a MemoryInstall.
     */
    data: XOR<MemoryInstallUpdateInput, MemoryInstallUncheckedUpdateInput>
    /**
     * Choose, which MemoryInstall to update.
     */
    where: MemoryInstallWhereUniqueInput
  }

  /**
   * MemoryInstall updateMany
   */
  export type MemoryInstallUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MemoryInstalls.
     */
    data: XOR<MemoryInstallUpdateManyMutationInput, MemoryInstallUncheckedUpdateManyInput>
    /**
     * Filter which MemoryInstalls to update
     */
    where?: MemoryInstallWhereInput
    /**
     * Limit how many MemoryInstalls to update.
     */
    limit?: number
  }

  /**
   * MemoryInstall updateManyAndReturn
   */
  export type MemoryInstallUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * The data used to update MemoryInstalls.
     */
    data: XOR<MemoryInstallUpdateManyMutationInput, MemoryInstallUncheckedUpdateManyInput>
    /**
     * Filter which MemoryInstalls to update
     */
    where?: MemoryInstallWhereInput
    /**
     * Limit how many MemoryInstalls to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemoryInstall upsert
   */
  export type MemoryInstallUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallInclude<ExtArgs> | null
    /**
     * The filter to search for the MemoryInstall to update in case it exists.
     */
    where: MemoryInstallWhereUniqueInput
    /**
     * In case the MemoryInstall found by the `where` argument doesn't exist, create a new MemoryInstall with this data.
     */
    create: XOR<MemoryInstallCreateInput, MemoryInstallUncheckedCreateInput>
    /**
     * In case the MemoryInstall was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemoryInstallUpdateInput, MemoryInstallUncheckedUpdateInput>
  }

  /**
   * MemoryInstall delete
   */
  export type MemoryInstallDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallInclude<ExtArgs> | null
    /**
     * Filter which MemoryInstall to delete.
     */
    where: MemoryInstallWhereUniqueInput
  }

  /**
   * MemoryInstall deleteMany
   */
  export type MemoryInstallDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryInstalls to delete
     */
    where?: MemoryInstallWhereInput
    /**
     * Limit how many MemoryInstalls to delete.
     */
    limit?: number
  }

  /**
   * MemoryInstall without action
   */
  export type MemoryInstallDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryInstall
     */
    select?: MemoryInstallSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryInstall
     */
    omit?: MemoryInstallOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInstallInclude<ExtArgs> | null
  }


  /**
   * Model MemoryOverride
   */

  export type AggregateMemoryOverride = {
    _count: MemoryOverrideCountAggregateOutputType | null
    _min: MemoryOverrideMinAggregateOutputType | null
    _max: MemoryOverrideMaxAggregateOutputType | null
  }

  export type MemoryOverrideMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    packItemId: string | null
    content: string | null
    tags: string | null
    createdAt: Date | null
  }

  export type MemoryOverrideMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    packItemId: string | null
    content: string | null
    tags: string | null
    createdAt: Date | null
  }

  export type MemoryOverrideCountAggregateOutputType = {
    id: number
    tenantId: number
    packItemId: number
    content: number
    tags: number
    createdAt: number
    _all: number
  }


  export type MemoryOverrideMinAggregateInputType = {
    id?: true
    tenantId?: true
    packItemId?: true
    content?: true
    tags?: true
    createdAt?: true
  }

  export type MemoryOverrideMaxAggregateInputType = {
    id?: true
    tenantId?: true
    packItemId?: true
    content?: true
    tags?: true
    createdAt?: true
  }

  export type MemoryOverrideCountAggregateInputType = {
    id?: true
    tenantId?: true
    packItemId?: true
    content?: true
    tags?: true
    createdAt?: true
    _all?: true
  }

  export type MemoryOverrideAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryOverride to aggregate.
     */
    where?: MemoryOverrideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryOverrides to fetch.
     */
    orderBy?: MemoryOverrideOrderByWithRelationInput | MemoryOverrideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemoryOverrideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryOverrides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryOverrides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MemoryOverrides
    **/
    _count?: true | MemoryOverrideCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemoryOverrideMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemoryOverrideMaxAggregateInputType
  }

  export type GetMemoryOverrideAggregateType<T extends MemoryOverrideAggregateArgs> = {
        [P in keyof T & keyof AggregateMemoryOverride]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemoryOverride[P]>
      : GetScalarType<T[P], AggregateMemoryOverride[P]>
  }




  export type MemoryOverrideGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryOverrideWhereInput
    orderBy?: MemoryOverrideOrderByWithAggregationInput | MemoryOverrideOrderByWithAggregationInput[]
    by: MemoryOverrideScalarFieldEnum[] | MemoryOverrideScalarFieldEnum
    having?: MemoryOverrideScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemoryOverrideCountAggregateInputType | true
    _min?: MemoryOverrideMinAggregateInputType
    _max?: MemoryOverrideMaxAggregateInputType
  }

  export type MemoryOverrideGroupByOutputType = {
    id: string
    tenantId: string
    packItemId: string
    content: string
    tags: string | null
    createdAt: Date
    _count: MemoryOverrideCountAggregateOutputType | null
    _min: MemoryOverrideMinAggregateOutputType | null
    _max: MemoryOverrideMaxAggregateOutputType | null
  }

  type GetMemoryOverrideGroupByPayload<T extends MemoryOverrideGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemoryOverrideGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemoryOverrideGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemoryOverrideGroupByOutputType[P]>
            : GetScalarType<T[P], MemoryOverrideGroupByOutputType[P]>
        }
      >
    >


  export type MemoryOverrideSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    packItemId?: boolean
    content?: boolean
    tags?: boolean
    createdAt?: boolean
    tenant?: boolean | MemoryTenantDefaultArgs<ExtArgs>
    packItem?: boolean | MemoryPackItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryOverride"]>

  export type MemoryOverrideSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    packItemId?: boolean
    content?: boolean
    tags?: boolean
    createdAt?: boolean
    tenant?: boolean | MemoryTenantDefaultArgs<ExtArgs>
    packItem?: boolean | MemoryPackItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryOverride"]>

  export type MemoryOverrideSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    packItemId?: boolean
    content?: boolean
    tags?: boolean
    createdAt?: boolean
    tenant?: boolean | MemoryTenantDefaultArgs<ExtArgs>
    packItem?: boolean | MemoryPackItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryOverride"]>

  export type MemoryOverrideSelectScalar = {
    id?: boolean
    tenantId?: boolean
    packItemId?: boolean
    content?: boolean
    tags?: boolean
    createdAt?: boolean
  }

  export type MemoryOverrideOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "packItemId" | "content" | "tags" | "createdAt", ExtArgs["result"]["memoryOverride"]>
  export type MemoryOverrideInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | MemoryTenantDefaultArgs<ExtArgs>
    packItem?: boolean | MemoryPackItemDefaultArgs<ExtArgs>
  }
  export type MemoryOverrideIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | MemoryTenantDefaultArgs<ExtArgs>
    packItem?: boolean | MemoryPackItemDefaultArgs<ExtArgs>
  }
  export type MemoryOverrideIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | MemoryTenantDefaultArgs<ExtArgs>
    packItem?: boolean | MemoryPackItemDefaultArgs<ExtArgs>
  }

  export type $MemoryOverridePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MemoryOverride"
    objects: {
      tenant: Prisma.$MemoryTenantPayload<ExtArgs>
      packItem: Prisma.$MemoryPackItemPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      packItemId: string
      content: string
      tags: string | null
      createdAt: Date
    }, ExtArgs["result"]["memoryOverride"]>
    composites: {}
  }

  type MemoryOverrideGetPayload<S extends boolean | null | undefined | MemoryOverrideDefaultArgs> = $Result.GetResult<Prisma.$MemoryOverridePayload, S>

  type MemoryOverrideCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemoryOverrideFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemoryOverrideCountAggregateInputType | true
    }

  export interface MemoryOverrideDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MemoryOverride'], meta: { name: 'MemoryOverride' } }
    /**
     * Find zero or one MemoryOverride that matches the filter.
     * @param {MemoryOverrideFindUniqueArgs} args - Arguments to find a MemoryOverride
     * @example
     * // Get one MemoryOverride
     * const memoryOverride = await prisma.memoryOverride.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemoryOverrideFindUniqueArgs>(args: SelectSubset<T, MemoryOverrideFindUniqueArgs<ExtArgs>>): Prisma__MemoryOverrideClient<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MemoryOverride that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemoryOverrideFindUniqueOrThrowArgs} args - Arguments to find a MemoryOverride
     * @example
     * // Get one MemoryOverride
     * const memoryOverride = await prisma.memoryOverride.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemoryOverrideFindUniqueOrThrowArgs>(args: SelectSubset<T, MemoryOverrideFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemoryOverrideClient<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryOverride that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryOverrideFindFirstArgs} args - Arguments to find a MemoryOverride
     * @example
     * // Get one MemoryOverride
     * const memoryOverride = await prisma.memoryOverride.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemoryOverrideFindFirstArgs>(args?: SelectSubset<T, MemoryOverrideFindFirstArgs<ExtArgs>>): Prisma__MemoryOverrideClient<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemoryOverride that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryOverrideFindFirstOrThrowArgs} args - Arguments to find a MemoryOverride
     * @example
     * // Get one MemoryOverride
     * const memoryOverride = await prisma.memoryOverride.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemoryOverrideFindFirstOrThrowArgs>(args?: SelectSubset<T, MemoryOverrideFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemoryOverrideClient<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MemoryOverrides that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryOverrideFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MemoryOverrides
     * const memoryOverrides = await prisma.memoryOverride.findMany()
     * 
     * // Get first 10 MemoryOverrides
     * const memoryOverrides = await prisma.memoryOverride.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memoryOverrideWithIdOnly = await prisma.memoryOverride.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemoryOverrideFindManyArgs>(args?: SelectSubset<T, MemoryOverrideFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MemoryOverride.
     * @param {MemoryOverrideCreateArgs} args - Arguments to create a MemoryOverride.
     * @example
     * // Create one MemoryOverride
     * const MemoryOverride = await prisma.memoryOverride.create({
     *   data: {
     *     // ... data to create a MemoryOverride
     *   }
     * })
     * 
     */
    create<T extends MemoryOverrideCreateArgs>(args: SelectSubset<T, MemoryOverrideCreateArgs<ExtArgs>>): Prisma__MemoryOverrideClient<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MemoryOverrides.
     * @param {MemoryOverrideCreateManyArgs} args - Arguments to create many MemoryOverrides.
     * @example
     * // Create many MemoryOverrides
     * const memoryOverride = await prisma.memoryOverride.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemoryOverrideCreateManyArgs>(args?: SelectSubset<T, MemoryOverrideCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MemoryOverrides and returns the data saved in the database.
     * @param {MemoryOverrideCreateManyAndReturnArgs} args - Arguments to create many MemoryOverrides.
     * @example
     * // Create many MemoryOverrides
     * const memoryOverride = await prisma.memoryOverride.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MemoryOverrides and only return the `id`
     * const memoryOverrideWithIdOnly = await prisma.memoryOverride.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemoryOverrideCreateManyAndReturnArgs>(args?: SelectSubset<T, MemoryOverrideCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MemoryOverride.
     * @param {MemoryOverrideDeleteArgs} args - Arguments to delete one MemoryOverride.
     * @example
     * // Delete one MemoryOverride
     * const MemoryOverride = await prisma.memoryOverride.delete({
     *   where: {
     *     // ... filter to delete one MemoryOverride
     *   }
     * })
     * 
     */
    delete<T extends MemoryOverrideDeleteArgs>(args: SelectSubset<T, MemoryOverrideDeleteArgs<ExtArgs>>): Prisma__MemoryOverrideClient<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MemoryOverride.
     * @param {MemoryOverrideUpdateArgs} args - Arguments to update one MemoryOverride.
     * @example
     * // Update one MemoryOverride
     * const memoryOverride = await prisma.memoryOverride.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemoryOverrideUpdateArgs>(args: SelectSubset<T, MemoryOverrideUpdateArgs<ExtArgs>>): Prisma__MemoryOverrideClient<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MemoryOverrides.
     * @param {MemoryOverrideDeleteManyArgs} args - Arguments to filter MemoryOverrides to delete.
     * @example
     * // Delete a few MemoryOverrides
     * const { count } = await prisma.memoryOverride.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemoryOverrideDeleteManyArgs>(args?: SelectSubset<T, MemoryOverrideDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryOverrides.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryOverrideUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MemoryOverrides
     * const memoryOverride = await prisma.memoryOverride.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemoryOverrideUpdateManyArgs>(args: SelectSubset<T, MemoryOverrideUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryOverrides and returns the data updated in the database.
     * @param {MemoryOverrideUpdateManyAndReturnArgs} args - Arguments to update many MemoryOverrides.
     * @example
     * // Update many MemoryOverrides
     * const memoryOverride = await prisma.memoryOverride.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MemoryOverrides and only return the `id`
     * const memoryOverrideWithIdOnly = await prisma.memoryOverride.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MemoryOverrideUpdateManyAndReturnArgs>(args: SelectSubset<T, MemoryOverrideUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MemoryOverride.
     * @param {MemoryOverrideUpsertArgs} args - Arguments to update or create a MemoryOverride.
     * @example
     * // Update or create a MemoryOverride
     * const memoryOverride = await prisma.memoryOverride.upsert({
     *   create: {
     *     // ... data to create a MemoryOverride
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MemoryOverride we want to update
     *   }
     * })
     */
    upsert<T extends MemoryOverrideUpsertArgs>(args: SelectSubset<T, MemoryOverrideUpsertArgs<ExtArgs>>): Prisma__MemoryOverrideClient<$Result.GetResult<Prisma.$MemoryOverridePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MemoryOverrides.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryOverrideCountArgs} args - Arguments to filter MemoryOverrides to count.
     * @example
     * // Count the number of MemoryOverrides
     * const count = await prisma.memoryOverride.count({
     *   where: {
     *     // ... the filter for the MemoryOverrides we want to count
     *   }
     * })
    **/
    count<T extends MemoryOverrideCountArgs>(
      args?: Subset<T, MemoryOverrideCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemoryOverrideCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MemoryOverride.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryOverrideAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemoryOverrideAggregateArgs>(args: Subset<T, MemoryOverrideAggregateArgs>): Prisma.PrismaPromise<GetMemoryOverrideAggregateType<T>>

    /**
     * Group by MemoryOverride.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryOverrideGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemoryOverrideGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemoryOverrideGroupByArgs['orderBy'] }
        : { orderBy?: MemoryOverrideGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemoryOverrideGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemoryOverrideGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MemoryOverride model
   */
  readonly fields: MemoryOverrideFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MemoryOverride.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemoryOverrideClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends MemoryTenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemoryTenantDefaultArgs<ExtArgs>>): Prisma__MemoryTenantClient<$Result.GetResult<Prisma.$MemoryTenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    packItem<T extends MemoryPackItemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemoryPackItemDefaultArgs<ExtArgs>>): Prisma__MemoryPackItemClient<$Result.GetResult<Prisma.$MemoryPackItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MemoryOverride model
   */
  interface MemoryOverrideFieldRefs {
    readonly id: FieldRef<"MemoryOverride", 'String'>
    readonly tenantId: FieldRef<"MemoryOverride", 'String'>
    readonly packItemId: FieldRef<"MemoryOverride", 'String'>
    readonly content: FieldRef<"MemoryOverride", 'String'>
    readonly tags: FieldRef<"MemoryOverride", 'String'>
    readonly createdAt: FieldRef<"MemoryOverride", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MemoryOverride findUnique
   */
  export type MemoryOverrideFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideInclude<ExtArgs> | null
    /**
     * Filter, which MemoryOverride to fetch.
     */
    where: MemoryOverrideWhereUniqueInput
  }

  /**
   * MemoryOverride findUniqueOrThrow
   */
  export type MemoryOverrideFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideInclude<ExtArgs> | null
    /**
     * Filter, which MemoryOverride to fetch.
     */
    where: MemoryOverrideWhereUniqueInput
  }

  /**
   * MemoryOverride findFirst
   */
  export type MemoryOverrideFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideInclude<ExtArgs> | null
    /**
     * Filter, which MemoryOverride to fetch.
     */
    where?: MemoryOverrideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryOverrides to fetch.
     */
    orderBy?: MemoryOverrideOrderByWithRelationInput | MemoryOverrideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryOverrides.
     */
    cursor?: MemoryOverrideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryOverrides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryOverrides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryOverrides.
     */
    distinct?: MemoryOverrideScalarFieldEnum | MemoryOverrideScalarFieldEnum[]
  }

  /**
   * MemoryOverride findFirstOrThrow
   */
  export type MemoryOverrideFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideInclude<ExtArgs> | null
    /**
     * Filter, which MemoryOverride to fetch.
     */
    where?: MemoryOverrideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryOverrides to fetch.
     */
    orderBy?: MemoryOverrideOrderByWithRelationInput | MemoryOverrideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryOverrides.
     */
    cursor?: MemoryOverrideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryOverrides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryOverrides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryOverrides.
     */
    distinct?: MemoryOverrideScalarFieldEnum | MemoryOverrideScalarFieldEnum[]
  }

  /**
   * MemoryOverride findMany
   */
  export type MemoryOverrideFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideInclude<ExtArgs> | null
    /**
     * Filter, which MemoryOverrides to fetch.
     */
    where?: MemoryOverrideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryOverrides to fetch.
     */
    orderBy?: MemoryOverrideOrderByWithRelationInput | MemoryOverrideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MemoryOverrides.
     */
    cursor?: MemoryOverrideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryOverrides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryOverrides.
     */
    skip?: number
    distinct?: MemoryOverrideScalarFieldEnum | MemoryOverrideScalarFieldEnum[]
  }

  /**
   * MemoryOverride create
   */
  export type MemoryOverrideCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideInclude<ExtArgs> | null
    /**
     * The data needed to create a MemoryOverride.
     */
    data: XOR<MemoryOverrideCreateInput, MemoryOverrideUncheckedCreateInput>
  }

  /**
   * MemoryOverride createMany
   */
  export type MemoryOverrideCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MemoryOverrides.
     */
    data: MemoryOverrideCreateManyInput | MemoryOverrideCreateManyInput[]
  }

  /**
   * MemoryOverride createManyAndReturn
   */
  export type MemoryOverrideCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * The data used to create many MemoryOverrides.
     */
    data: MemoryOverrideCreateManyInput | MemoryOverrideCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemoryOverride update
   */
  export type MemoryOverrideUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideInclude<ExtArgs> | null
    /**
     * The data needed to update a MemoryOverride.
     */
    data: XOR<MemoryOverrideUpdateInput, MemoryOverrideUncheckedUpdateInput>
    /**
     * Choose, which MemoryOverride to update.
     */
    where: MemoryOverrideWhereUniqueInput
  }

  /**
   * MemoryOverride updateMany
   */
  export type MemoryOverrideUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MemoryOverrides.
     */
    data: XOR<MemoryOverrideUpdateManyMutationInput, MemoryOverrideUncheckedUpdateManyInput>
    /**
     * Filter which MemoryOverrides to update
     */
    where?: MemoryOverrideWhereInput
    /**
     * Limit how many MemoryOverrides to update.
     */
    limit?: number
  }

  /**
   * MemoryOverride updateManyAndReturn
   */
  export type MemoryOverrideUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * The data used to update MemoryOverrides.
     */
    data: XOR<MemoryOverrideUpdateManyMutationInput, MemoryOverrideUncheckedUpdateManyInput>
    /**
     * Filter which MemoryOverrides to update
     */
    where?: MemoryOverrideWhereInput
    /**
     * Limit how many MemoryOverrides to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemoryOverride upsert
   */
  export type MemoryOverrideUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideInclude<ExtArgs> | null
    /**
     * The filter to search for the MemoryOverride to update in case it exists.
     */
    where: MemoryOverrideWhereUniqueInput
    /**
     * In case the MemoryOverride found by the `where` argument doesn't exist, create a new MemoryOverride with this data.
     */
    create: XOR<MemoryOverrideCreateInput, MemoryOverrideUncheckedCreateInput>
    /**
     * In case the MemoryOverride was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemoryOverrideUpdateInput, MemoryOverrideUncheckedUpdateInput>
  }

  /**
   * MemoryOverride delete
   */
  export type MemoryOverrideDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideInclude<ExtArgs> | null
    /**
     * Filter which MemoryOverride to delete.
     */
    where: MemoryOverrideWhereUniqueInput
  }

  /**
   * MemoryOverride deleteMany
   */
  export type MemoryOverrideDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryOverrides to delete
     */
    where?: MemoryOverrideWhereInput
    /**
     * Limit how many MemoryOverrides to delete.
     */
    limit?: number
  }

  /**
   * MemoryOverride without action
   */
  export type MemoryOverrideDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryOverride
     */
    select?: MemoryOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemoryOverride
     */
    omit?: MemoryOverrideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryOverrideInclude<ExtArgs> | null
  }


  /**
   * Model LearnedMemory
   */

  export type AggregateLearnedMemory = {
    _count: LearnedMemoryCountAggregateOutputType | null
    _avg: LearnedMemoryAvgAggregateOutputType | null
    _sum: LearnedMemorySumAggregateOutputType | null
    _min: LearnedMemoryMinAggregateOutputType | null
    _max: LearnedMemoryMaxAggregateOutputType | null
  }

  export type LearnedMemoryAvgAggregateOutputType = {
    importance: number | null
  }

  export type LearnedMemorySumAggregateOutputType = {
    importance: number | null
  }

  export type LearnedMemoryMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    userId: string | null
    kind: $Enums.MemoryKind | null
    subject: string | null
    content: string | null
    tags: string | null
    importance: number | null
    source: string | null
    createdAt: Date | null
    lastUsedAt: Date | null
    expireAt: Date | null
  }

  export type LearnedMemoryMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    userId: string | null
    kind: $Enums.MemoryKind | null
    subject: string | null
    content: string | null
    tags: string | null
    importance: number | null
    source: string | null
    createdAt: Date | null
    lastUsedAt: Date | null
    expireAt: Date | null
  }

  export type LearnedMemoryCountAggregateOutputType = {
    id: number
    tenantId: number
    userId: number
    kind: number
    subject: number
    content: number
    tags: number
    importance: number
    source: number
    createdAt: number
    lastUsedAt: number
    expireAt: number
    _all: number
  }


  export type LearnedMemoryAvgAggregateInputType = {
    importance?: true
  }

  export type LearnedMemorySumAggregateInputType = {
    importance?: true
  }

  export type LearnedMemoryMinAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    kind?: true
    subject?: true
    content?: true
    tags?: true
    importance?: true
    source?: true
    createdAt?: true
    lastUsedAt?: true
    expireAt?: true
  }

  export type LearnedMemoryMaxAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    kind?: true
    subject?: true
    content?: true
    tags?: true
    importance?: true
    source?: true
    createdAt?: true
    lastUsedAt?: true
    expireAt?: true
  }

  export type LearnedMemoryCountAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    kind?: true
    subject?: true
    content?: true
    tags?: true
    importance?: true
    source?: true
    createdAt?: true
    lastUsedAt?: true
    expireAt?: true
    _all?: true
  }

  export type LearnedMemoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LearnedMemory to aggregate.
     */
    where?: LearnedMemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearnedMemories to fetch.
     */
    orderBy?: LearnedMemoryOrderByWithRelationInput | LearnedMemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LearnedMemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearnedMemories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearnedMemories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LearnedMemories
    **/
    _count?: true | LearnedMemoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LearnedMemoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LearnedMemorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LearnedMemoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LearnedMemoryMaxAggregateInputType
  }

  export type GetLearnedMemoryAggregateType<T extends LearnedMemoryAggregateArgs> = {
        [P in keyof T & keyof AggregateLearnedMemory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLearnedMemory[P]>
      : GetScalarType<T[P], AggregateLearnedMemory[P]>
  }




  export type LearnedMemoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LearnedMemoryWhereInput
    orderBy?: LearnedMemoryOrderByWithAggregationInput | LearnedMemoryOrderByWithAggregationInput[]
    by: LearnedMemoryScalarFieldEnum[] | LearnedMemoryScalarFieldEnum
    having?: LearnedMemoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LearnedMemoryCountAggregateInputType | true
    _avg?: LearnedMemoryAvgAggregateInputType
    _sum?: LearnedMemorySumAggregateInputType
    _min?: LearnedMemoryMinAggregateInputType
    _max?: LearnedMemoryMaxAggregateInputType
  }

  export type LearnedMemoryGroupByOutputType = {
    id: string
    tenantId: string
    userId: string | null
    kind: $Enums.MemoryKind
    subject: string | null
    content: string
    tags: string | null
    importance: number
    source: string | null
    createdAt: Date
    lastUsedAt: Date | null
    expireAt: Date | null
    _count: LearnedMemoryCountAggregateOutputType | null
    _avg: LearnedMemoryAvgAggregateOutputType | null
    _sum: LearnedMemorySumAggregateOutputType | null
    _min: LearnedMemoryMinAggregateOutputType | null
    _max: LearnedMemoryMaxAggregateOutputType | null
  }

  type GetLearnedMemoryGroupByPayload<T extends LearnedMemoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LearnedMemoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LearnedMemoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LearnedMemoryGroupByOutputType[P]>
            : GetScalarType<T[P], LearnedMemoryGroupByOutputType[P]>
        }
      >
    >


  export type LearnedMemorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    kind?: boolean
    subject?: boolean
    content?: boolean
    tags?: boolean
    importance?: boolean
    source?: boolean
    createdAt?: boolean
    lastUsedAt?: boolean
    expireAt?: boolean
    user?: boolean | LearnedMemory$userArgs<ExtArgs>
  }, ExtArgs["result"]["learnedMemory"]>

  export type LearnedMemorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    kind?: boolean
    subject?: boolean
    content?: boolean
    tags?: boolean
    importance?: boolean
    source?: boolean
    createdAt?: boolean
    lastUsedAt?: boolean
    expireAt?: boolean
    user?: boolean | LearnedMemory$userArgs<ExtArgs>
  }, ExtArgs["result"]["learnedMemory"]>

  export type LearnedMemorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    kind?: boolean
    subject?: boolean
    content?: boolean
    tags?: boolean
    importance?: boolean
    source?: boolean
    createdAt?: boolean
    lastUsedAt?: boolean
    expireAt?: boolean
    user?: boolean | LearnedMemory$userArgs<ExtArgs>
  }, ExtArgs["result"]["learnedMemory"]>

  export type LearnedMemorySelectScalar = {
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    kind?: boolean
    subject?: boolean
    content?: boolean
    tags?: boolean
    importance?: boolean
    source?: boolean
    createdAt?: boolean
    lastUsedAt?: boolean
    expireAt?: boolean
  }

  export type LearnedMemoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "userId" | "kind" | "subject" | "content" | "tags" | "importance" | "source" | "createdAt" | "lastUsedAt" | "expireAt", ExtArgs["result"]["learnedMemory"]>
  export type LearnedMemoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | LearnedMemory$userArgs<ExtArgs>
  }
  export type LearnedMemoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | LearnedMemory$userArgs<ExtArgs>
  }
  export type LearnedMemoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | LearnedMemory$userArgs<ExtArgs>
  }

  export type $LearnedMemoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LearnedMemory"
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      userId: string | null
      kind: $Enums.MemoryKind
      subject: string | null
      content: string
      tags: string | null
      importance: number
      source: string | null
      createdAt: Date
      lastUsedAt: Date | null
      expireAt: Date | null
    }, ExtArgs["result"]["learnedMemory"]>
    composites: {}
  }

  type LearnedMemoryGetPayload<S extends boolean | null | undefined | LearnedMemoryDefaultArgs> = $Result.GetResult<Prisma.$LearnedMemoryPayload, S>

  type LearnedMemoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LearnedMemoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LearnedMemoryCountAggregateInputType | true
    }

  export interface LearnedMemoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LearnedMemory'], meta: { name: 'LearnedMemory' } }
    /**
     * Find zero or one LearnedMemory that matches the filter.
     * @param {LearnedMemoryFindUniqueArgs} args - Arguments to find a LearnedMemory
     * @example
     * // Get one LearnedMemory
     * const learnedMemory = await prisma.learnedMemory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LearnedMemoryFindUniqueArgs>(args: SelectSubset<T, LearnedMemoryFindUniqueArgs<ExtArgs>>): Prisma__LearnedMemoryClient<$Result.GetResult<Prisma.$LearnedMemoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LearnedMemory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LearnedMemoryFindUniqueOrThrowArgs} args - Arguments to find a LearnedMemory
     * @example
     * // Get one LearnedMemory
     * const learnedMemory = await prisma.learnedMemory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LearnedMemoryFindUniqueOrThrowArgs>(args: SelectSubset<T, LearnedMemoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LearnedMemoryClient<$Result.GetResult<Prisma.$LearnedMemoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LearnedMemory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearnedMemoryFindFirstArgs} args - Arguments to find a LearnedMemory
     * @example
     * // Get one LearnedMemory
     * const learnedMemory = await prisma.learnedMemory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LearnedMemoryFindFirstArgs>(args?: SelectSubset<T, LearnedMemoryFindFirstArgs<ExtArgs>>): Prisma__LearnedMemoryClient<$Result.GetResult<Prisma.$LearnedMemoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LearnedMemory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearnedMemoryFindFirstOrThrowArgs} args - Arguments to find a LearnedMemory
     * @example
     * // Get one LearnedMemory
     * const learnedMemory = await prisma.learnedMemory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LearnedMemoryFindFirstOrThrowArgs>(args?: SelectSubset<T, LearnedMemoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__LearnedMemoryClient<$Result.GetResult<Prisma.$LearnedMemoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LearnedMemories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearnedMemoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LearnedMemories
     * const learnedMemories = await prisma.learnedMemory.findMany()
     * 
     * // Get first 10 LearnedMemories
     * const learnedMemories = await prisma.learnedMemory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const learnedMemoryWithIdOnly = await prisma.learnedMemory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LearnedMemoryFindManyArgs>(args?: SelectSubset<T, LearnedMemoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearnedMemoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LearnedMemory.
     * @param {LearnedMemoryCreateArgs} args - Arguments to create a LearnedMemory.
     * @example
     * // Create one LearnedMemory
     * const LearnedMemory = await prisma.learnedMemory.create({
     *   data: {
     *     // ... data to create a LearnedMemory
     *   }
     * })
     * 
     */
    create<T extends LearnedMemoryCreateArgs>(args: SelectSubset<T, LearnedMemoryCreateArgs<ExtArgs>>): Prisma__LearnedMemoryClient<$Result.GetResult<Prisma.$LearnedMemoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LearnedMemories.
     * @param {LearnedMemoryCreateManyArgs} args - Arguments to create many LearnedMemories.
     * @example
     * // Create many LearnedMemories
     * const learnedMemory = await prisma.learnedMemory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LearnedMemoryCreateManyArgs>(args?: SelectSubset<T, LearnedMemoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LearnedMemories and returns the data saved in the database.
     * @param {LearnedMemoryCreateManyAndReturnArgs} args - Arguments to create many LearnedMemories.
     * @example
     * // Create many LearnedMemories
     * const learnedMemory = await prisma.learnedMemory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LearnedMemories and only return the `id`
     * const learnedMemoryWithIdOnly = await prisma.learnedMemory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LearnedMemoryCreateManyAndReturnArgs>(args?: SelectSubset<T, LearnedMemoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearnedMemoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LearnedMemory.
     * @param {LearnedMemoryDeleteArgs} args - Arguments to delete one LearnedMemory.
     * @example
     * // Delete one LearnedMemory
     * const LearnedMemory = await prisma.learnedMemory.delete({
     *   where: {
     *     // ... filter to delete one LearnedMemory
     *   }
     * })
     * 
     */
    delete<T extends LearnedMemoryDeleteArgs>(args: SelectSubset<T, LearnedMemoryDeleteArgs<ExtArgs>>): Prisma__LearnedMemoryClient<$Result.GetResult<Prisma.$LearnedMemoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LearnedMemory.
     * @param {LearnedMemoryUpdateArgs} args - Arguments to update one LearnedMemory.
     * @example
     * // Update one LearnedMemory
     * const learnedMemory = await prisma.learnedMemory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LearnedMemoryUpdateArgs>(args: SelectSubset<T, LearnedMemoryUpdateArgs<ExtArgs>>): Prisma__LearnedMemoryClient<$Result.GetResult<Prisma.$LearnedMemoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LearnedMemories.
     * @param {LearnedMemoryDeleteManyArgs} args - Arguments to filter LearnedMemories to delete.
     * @example
     * // Delete a few LearnedMemories
     * const { count } = await prisma.learnedMemory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LearnedMemoryDeleteManyArgs>(args?: SelectSubset<T, LearnedMemoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LearnedMemories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearnedMemoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LearnedMemories
     * const learnedMemory = await prisma.learnedMemory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LearnedMemoryUpdateManyArgs>(args: SelectSubset<T, LearnedMemoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LearnedMemories and returns the data updated in the database.
     * @param {LearnedMemoryUpdateManyAndReturnArgs} args - Arguments to update many LearnedMemories.
     * @example
     * // Update many LearnedMemories
     * const learnedMemory = await prisma.learnedMemory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LearnedMemories and only return the `id`
     * const learnedMemoryWithIdOnly = await prisma.learnedMemory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LearnedMemoryUpdateManyAndReturnArgs>(args: SelectSubset<T, LearnedMemoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearnedMemoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LearnedMemory.
     * @param {LearnedMemoryUpsertArgs} args - Arguments to update or create a LearnedMemory.
     * @example
     * // Update or create a LearnedMemory
     * const learnedMemory = await prisma.learnedMemory.upsert({
     *   create: {
     *     // ... data to create a LearnedMemory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LearnedMemory we want to update
     *   }
     * })
     */
    upsert<T extends LearnedMemoryUpsertArgs>(args: SelectSubset<T, LearnedMemoryUpsertArgs<ExtArgs>>): Prisma__LearnedMemoryClient<$Result.GetResult<Prisma.$LearnedMemoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LearnedMemories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearnedMemoryCountArgs} args - Arguments to filter LearnedMemories to count.
     * @example
     * // Count the number of LearnedMemories
     * const count = await prisma.learnedMemory.count({
     *   where: {
     *     // ... the filter for the LearnedMemories we want to count
     *   }
     * })
    **/
    count<T extends LearnedMemoryCountArgs>(
      args?: Subset<T, LearnedMemoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LearnedMemoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LearnedMemory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearnedMemoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LearnedMemoryAggregateArgs>(args: Subset<T, LearnedMemoryAggregateArgs>): Prisma.PrismaPromise<GetLearnedMemoryAggregateType<T>>

    /**
     * Group by LearnedMemory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearnedMemoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LearnedMemoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LearnedMemoryGroupByArgs['orderBy'] }
        : { orderBy?: LearnedMemoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LearnedMemoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLearnedMemoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LearnedMemory model
   */
  readonly fields: LearnedMemoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LearnedMemory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LearnedMemoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends LearnedMemory$userArgs<ExtArgs> = {}>(args?: Subset<T, LearnedMemory$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LearnedMemory model
   */
  interface LearnedMemoryFieldRefs {
    readonly id: FieldRef<"LearnedMemory", 'String'>
    readonly tenantId: FieldRef<"LearnedMemory", 'String'>
    readonly userId: FieldRef<"LearnedMemory", 'String'>
    readonly kind: FieldRef<"LearnedMemory", 'MemoryKind'>
    readonly subject: FieldRef<"LearnedMemory", 'String'>
    readonly content: FieldRef<"LearnedMemory", 'String'>
    readonly tags: FieldRef<"LearnedMemory", 'String'>
    readonly importance: FieldRef<"LearnedMemory", 'Int'>
    readonly source: FieldRef<"LearnedMemory", 'String'>
    readonly createdAt: FieldRef<"LearnedMemory", 'DateTime'>
    readonly lastUsedAt: FieldRef<"LearnedMemory", 'DateTime'>
    readonly expireAt: FieldRef<"LearnedMemory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LearnedMemory findUnique
   */
  export type LearnedMemoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryInclude<ExtArgs> | null
    /**
     * Filter, which LearnedMemory to fetch.
     */
    where: LearnedMemoryWhereUniqueInput
  }

  /**
   * LearnedMemory findUniqueOrThrow
   */
  export type LearnedMemoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryInclude<ExtArgs> | null
    /**
     * Filter, which LearnedMemory to fetch.
     */
    where: LearnedMemoryWhereUniqueInput
  }

  /**
   * LearnedMemory findFirst
   */
  export type LearnedMemoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryInclude<ExtArgs> | null
    /**
     * Filter, which LearnedMemory to fetch.
     */
    where?: LearnedMemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearnedMemories to fetch.
     */
    orderBy?: LearnedMemoryOrderByWithRelationInput | LearnedMemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LearnedMemories.
     */
    cursor?: LearnedMemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearnedMemories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearnedMemories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LearnedMemories.
     */
    distinct?: LearnedMemoryScalarFieldEnum | LearnedMemoryScalarFieldEnum[]
  }

  /**
   * LearnedMemory findFirstOrThrow
   */
  export type LearnedMemoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryInclude<ExtArgs> | null
    /**
     * Filter, which LearnedMemory to fetch.
     */
    where?: LearnedMemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearnedMemories to fetch.
     */
    orderBy?: LearnedMemoryOrderByWithRelationInput | LearnedMemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LearnedMemories.
     */
    cursor?: LearnedMemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearnedMemories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearnedMemories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LearnedMemories.
     */
    distinct?: LearnedMemoryScalarFieldEnum | LearnedMemoryScalarFieldEnum[]
  }

  /**
   * LearnedMemory findMany
   */
  export type LearnedMemoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryInclude<ExtArgs> | null
    /**
     * Filter, which LearnedMemories to fetch.
     */
    where?: LearnedMemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearnedMemories to fetch.
     */
    orderBy?: LearnedMemoryOrderByWithRelationInput | LearnedMemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LearnedMemories.
     */
    cursor?: LearnedMemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearnedMemories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearnedMemories.
     */
    skip?: number
    distinct?: LearnedMemoryScalarFieldEnum | LearnedMemoryScalarFieldEnum[]
  }

  /**
   * LearnedMemory create
   */
  export type LearnedMemoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryInclude<ExtArgs> | null
    /**
     * The data needed to create a LearnedMemory.
     */
    data: XOR<LearnedMemoryCreateInput, LearnedMemoryUncheckedCreateInput>
  }

  /**
   * LearnedMemory createMany
   */
  export type LearnedMemoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LearnedMemories.
     */
    data: LearnedMemoryCreateManyInput | LearnedMemoryCreateManyInput[]
  }

  /**
   * LearnedMemory createManyAndReturn
   */
  export type LearnedMemoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * The data used to create many LearnedMemories.
     */
    data: LearnedMemoryCreateManyInput | LearnedMemoryCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LearnedMemory update
   */
  export type LearnedMemoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryInclude<ExtArgs> | null
    /**
     * The data needed to update a LearnedMemory.
     */
    data: XOR<LearnedMemoryUpdateInput, LearnedMemoryUncheckedUpdateInput>
    /**
     * Choose, which LearnedMemory to update.
     */
    where: LearnedMemoryWhereUniqueInput
  }

  /**
   * LearnedMemory updateMany
   */
  export type LearnedMemoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LearnedMemories.
     */
    data: XOR<LearnedMemoryUpdateManyMutationInput, LearnedMemoryUncheckedUpdateManyInput>
    /**
     * Filter which LearnedMemories to update
     */
    where?: LearnedMemoryWhereInput
    /**
     * Limit how many LearnedMemories to update.
     */
    limit?: number
  }

  /**
   * LearnedMemory updateManyAndReturn
   */
  export type LearnedMemoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * The data used to update LearnedMemories.
     */
    data: XOR<LearnedMemoryUpdateManyMutationInput, LearnedMemoryUncheckedUpdateManyInput>
    /**
     * Filter which LearnedMemories to update
     */
    where?: LearnedMemoryWhereInput
    /**
     * Limit how many LearnedMemories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LearnedMemory upsert
   */
  export type LearnedMemoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryInclude<ExtArgs> | null
    /**
     * The filter to search for the LearnedMemory to update in case it exists.
     */
    where: LearnedMemoryWhereUniqueInput
    /**
     * In case the LearnedMemory found by the `where` argument doesn't exist, create a new LearnedMemory with this data.
     */
    create: XOR<LearnedMemoryCreateInput, LearnedMemoryUncheckedCreateInput>
    /**
     * In case the LearnedMemory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LearnedMemoryUpdateInput, LearnedMemoryUncheckedUpdateInput>
  }

  /**
   * LearnedMemory delete
   */
  export type LearnedMemoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryInclude<ExtArgs> | null
    /**
     * Filter which LearnedMemory to delete.
     */
    where: LearnedMemoryWhereUniqueInput
  }

  /**
   * LearnedMemory deleteMany
   */
  export type LearnedMemoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LearnedMemories to delete
     */
    where?: LearnedMemoryWhereInput
    /**
     * Limit how many LearnedMemories to delete.
     */
    limit?: number
  }

  /**
   * LearnedMemory.user
   */
  export type LearnedMemory$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * LearnedMemory without action
   */
  export type LearnedMemoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearnedMemory
     */
    select?: LearnedMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearnedMemory
     */
    omit?: LearnedMemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearnedMemoryInclude<ExtArgs> | null
  }


  /**
   * Model CaiaMemory
   */

  export type AggregateCaiaMemory = {
    _count: CaiaMemoryCountAggregateOutputType | null
    _min: CaiaMemoryMinAggregateOutputType | null
    _max: CaiaMemoryMaxAggregateOutputType | null
  }

  export type CaiaMemoryMinAggregateOutputType = {
    id: string | null
    scope: string | null
    key: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CaiaMemoryMaxAggregateOutputType = {
    id: string | null
    scope: string | null
    key: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CaiaMemoryCountAggregateOutputType = {
    id: number
    scope: number
    key: number
    value: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CaiaMemoryMinAggregateInputType = {
    id?: true
    scope?: true
    key?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CaiaMemoryMaxAggregateInputType = {
    id?: true
    scope?: true
    key?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CaiaMemoryCountAggregateInputType = {
    id?: true
    scope?: true
    key?: true
    value?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CaiaMemoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CaiaMemory to aggregate.
     */
    where?: CaiaMemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CaiaMemories to fetch.
     */
    orderBy?: CaiaMemoryOrderByWithRelationInput | CaiaMemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CaiaMemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CaiaMemories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CaiaMemories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CaiaMemories
    **/
    _count?: true | CaiaMemoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CaiaMemoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CaiaMemoryMaxAggregateInputType
  }

  export type GetCaiaMemoryAggregateType<T extends CaiaMemoryAggregateArgs> = {
        [P in keyof T & keyof AggregateCaiaMemory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCaiaMemory[P]>
      : GetScalarType<T[P], AggregateCaiaMemory[P]>
  }




  export type CaiaMemoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CaiaMemoryWhereInput
    orderBy?: CaiaMemoryOrderByWithAggregationInput | CaiaMemoryOrderByWithAggregationInput[]
    by: CaiaMemoryScalarFieldEnum[] | CaiaMemoryScalarFieldEnum
    having?: CaiaMemoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CaiaMemoryCountAggregateInputType | true
    _min?: CaiaMemoryMinAggregateInputType
    _max?: CaiaMemoryMaxAggregateInputType
  }

  export type CaiaMemoryGroupByOutputType = {
    id: string
    scope: string
    key: string
    value: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: CaiaMemoryCountAggregateOutputType | null
    _min: CaiaMemoryMinAggregateOutputType | null
    _max: CaiaMemoryMaxAggregateOutputType | null
  }

  type GetCaiaMemoryGroupByPayload<T extends CaiaMemoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CaiaMemoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CaiaMemoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CaiaMemoryGroupByOutputType[P]>
            : GetScalarType<T[P], CaiaMemoryGroupByOutputType[P]>
        }
      >
    >


  export type CaiaMemorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    scope?: boolean
    key?: boolean
    value?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["caiaMemory"]>

  export type CaiaMemorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    scope?: boolean
    key?: boolean
    value?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["caiaMemory"]>

  export type CaiaMemorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    scope?: boolean
    key?: boolean
    value?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["caiaMemory"]>

  export type CaiaMemorySelectScalar = {
    id?: boolean
    scope?: boolean
    key?: boolean
    value?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CaiaMemoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "scope" | "key" | "value" | "createdAt" | "updatedAt", ExtArgs["result"]["caiaMemory"]>

  export type $CaiaMemoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CaiaMemory"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      scope: string
      key: string
      value: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["caiaMemory"]>
    composites: {}
  }

  type CaiaMemoryGetPayload<S extends boolean | null | undefined | CaiaMemoryDefaultArgs> = $Result.GetResult<Prisma.$CaiaMemoryPayload, S>

  type CaiaMemoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CaiaMemoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CaiaMemoryCountAggregateInputType | true
    }

  export interface CaiaMemoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CaiaMemory'], meta: { name: 'CaiaMemory' } }
    /**
     * Find zero or one CaiaMemory that matches the filter.
     * @param {CaiaMemoryFindUniqueArgs} args - Arguments to find a CaiaMemory
     * @example
     * // Get one CaiaMemory
     * const caiaMemory = await prisma.caiaMemory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CaiaMemoryFindUniqueArgs>(args: SelectSubset<T, CaiaMemoryFindUniqueArgs<ExtArgs>>): Prisma__CaiaMemoryClient<$Result.GetResult<Prisma.$CaiaMemoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CaiaMemory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CaiaMemoryFindUniqueOrThrowArgs} args - Arguments to find a CaiaMemory
     * @example
     * // Get one CaiaMemory
     * const caiaMemory = await prisma.caiaMemory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CaiaMemoryFindUniqueOrThrowArgs>(args: SelectSubset<T, CaiaMemoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CaiaMemoryClient<$Result.GetResult<Prisma.$CaiaMemoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CaiaMemory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaiaMemoryFindFirstArgs} args - Arguments to find a CaiaMemory
     * @example
     * // Get one CaiaMemory
     * const caiaMemory = await prisma.caiaMemory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CaiaMemoryFindFirstArgs>(args?: SelectSubset<T, CaiaMemoryFindFirstArgs<ExtArgs>>): Prisma__CaiaMemoryClient<$Result.GetResult<Prisma.$CaiaMemoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CaiaMemory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaiaMemoryFindFirstOrThrowArgs} args - Arguments to find a CaiaMemory
     * @example
     * // Get one CaiaMemory
     * const caiaMemory = await prisma.caiaMemory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CaiaMemoryFindFirstOrThrowArgs>(args?: SelectSubset<T, CaiaMemoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__CaiaMemoryClient<$Result.GetResult<Prisma.$CaiaMemoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CaiaMemories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaiaMemoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CaiaMemories
     * const caiaMemories = await prisma.caiaMemory.findMany()
     * 
     * // Get first 10 CaiaMemories
     * const caiaMemories = await prisma.caiaMemory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const caiaMemoryWithIdOnly = await prisma.caiaMemory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CaiaMemoryFindManyArgs>(args?: SelectSubset<T, CaiaMemoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CaiaMemoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CaiaMemory.
     * @param {CaiaMemoryCreateArgs} args - Arguments to create a CaiaMemory.
     * @example
     * // Create one CaiaMemory
     * const CaiaMemory = await prisma.caiaMemory.create({
     *   data: {
     *     // ... data to create a CaiaMemory
     *   }
     * })
     * 
     */
    create<T extends CaiaMemoryCreateArgs>(args: SelectSubset<T, CaiaMemoryCreateArgs<ExtArgs>>): Prisma__CaiaMemoryClient<$Result.GetResult<Prisma.$CaiaMemoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CaiaMemories.
     * @param {CaiaMemoryCreateManyArgs} args - Arguments to create many CaiaMemories.
     * @example
     * // Create many CaiaMemories
     * const caiaMemory = await prisma.caiaMemory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CaiaMemoryCreateManyArgs>(args?: SelectSubset<T, CaiaMemoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CaiaMemories and returns the data saved in the database.
     * @param {CaiaMemoryCreateManyAndReturnArgs} args - Arguments to create many CaiaMemories.
     * @example
     * // Create many CaiaMemories
     * const caiaMemory = await prisma.caiaMemory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CaiaMemories and only return the `id`
     * const caiaMemoryWithIdOnly = await prisma.caiaMemory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CaiaMemoryCreateManyAndReturnArgs>(args?: SelectSubset<T, CaiaMemoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CaiaMemoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CaiaMemory.
     * @param {CaiaMemoryDeleteArgs} args - Arguments to delete one CaiaMemory.
     * @example
     * // Delete one CaiaMemory
     * const CaiaMemory = await prisma.caiaMemory.delete({
     *   where: {
     *     // ... filter to delete one CaiaMemory
     *   }
     * })
     * 
     */
    delete<T extends CaiaMemoryDeleteArgs>(args: SelectSubset<T, CaiaMemoryDeleteArgs<ExtArgs>>): Prisma__CaiaMemoryClient<$Result.GetResult<Prisma.$CaiaMemoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CaiaMemory.
     * @param {CaiaMemoryUpdateArgs} args - Arguments to update one CaiaMemory.
     * @example
     * // Update one CaiaMemory
     * const caiaMemory = await prisma.caiaMemory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CaiaMemoryUpdateArgs>(args: SelectSubset<T, CaiaMemoryUpdateArgs<ExtArgs>>): Prisma__CaiaMemoryClient<$Result.GetResult<Prisma.$CaiaMemoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CaiaMemories.
     * @param {CaiaMemoryDeleteManyArgs} args - Arguments to filter CaiaMemories to delete.
     * @example
     * // Delete a few CaiaMemories
     * const { count } = await prisma.caiaMemory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CaiaMemoryDeleteManyArgs>(args?: SelectSubset<T, CaiaMemoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CaiaMemories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaiaMemoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CaiaMemories
     * const caiaMemory = await prisma.caiaMemory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CaiaMemoryUpdateManyArgs>(args: SelectSubset<T, CaiaMemoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CaiaMemories and returns the data updated in the database.
     * @param {CaiaMemoryUpdateManyAndReturnArgs} args - Arguments to update many CaiaMemories.
     * @example
     * // Update many CaiaMemories
     * const caiaMemory = await prisma.caiaMemory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CaiaMemories and only return the `id`
     * const caiaMemoryWithIdOnly = await prisma.caiaMemory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CaiaMemoryUpdateManyAndReturnArgs>(args: SelectSubset<T, CaiaMemoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CaiaMemoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CaiaMemory.
     * @param {CaiaMemoryUpsertArgs} args - Arguments to update or create a CaiaMemory.
     * @example
     * // Update or create a CaiaMemory
     * const caiaMemory = await prisma.caiaMemory.upsert({
     *   create: {
     *     // ... data to create a CaiaMemory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CaiaMemory we want to update
     *   }
     * })
     */
    upsert<T extends CaiaMemoryUpsertArgs>(args: SelectSubset<T, CaiaMemoryUpsertArgs<ExtArgs>>): Prisma__CaiaMemoryClient<$Result.GetResult<Prisma.$CaiaMemoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CaiaMemories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaiaMemoryCountArgs} args - Arguments to filter CaiaMemories to count.
     * @example
     * // Count the number of CaiaMemories
     * const count = await prisma.caiaMemory.count({
     *   where: {
     *     // ... the filter for the CaiaMemories we want to count
     *   }
     * })
    **/
    count<T extends CaiaMemoryCountArgs>(
      args?: Subset<T, CaiaMemoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CaiaMemoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CaiaMemory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaiaMemoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CaiaMemoryAggregateArgs>(args: Subset<T, CaiaMemoryAggregateArgs>): Prisma.PrismaPromise<GetCaiaMemoryAggregateType<T>>

    /**
     * Group by CaiaMemory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaiaMemoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CaiaMemoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CaiaMemoryGroupByArgs['orderBy'] }
        : { orderBy?: CaiaMemoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CaiaMemoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCaiaMemoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CaiaMemory model
   */
  readonly fields: CaiaMemoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CaiaMemory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CaiaMemoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CaiaMemory model
   */
  interface CaiaMemoryFieldRefs {
    readonly id: FieldRef<"CaiaMemory", 'String'>
    readonly scope: FieldRef<"CaiaMemory", 'String'>
    readonly key: FieldRef<"CaiaMemory", 'String'>
    readonly value: FieldRef<"CaiaMemory", 'Json'>
    readonly createdAt: FieldRef<"CaiaMemory", 'DateTime'>
    readonly updatedAt: FieldRef<"CaiaMemory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CaiaMemory findUnique
   */
  export type CaiaMemoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaiaMemory
     */
    select?: CaiaMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaiaMemory
     */
    omit?: CaiaMemoryOmit<ExtArgs> | null
    /**
     * Filter, which CaiaMemory to fetch.
     */
    where: CaiaMemoryWhereUniqueInput
  }

  /**
   * CaiaMemory findUniqueOrThrow
   */
  export type CaiaMemoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaiaMemory
     */
    select?: CaiaMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaiaMemory
     */
    omit?: CaiaMemoryOmit<ExtArgs> | null
    /**
     * Filter, which CaiaMemory to fetch.
     */
    where: CaiaMemoryWhereUniqueInput
  }

  /**
   * CaiaMemory findFirst
   */
  export type CaiaMemoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaiaMemory
     */
    select?: CaiaMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaiaMemory
     */
    omit?: CaiaMemoryOmit<ExtArgs> | null
    /**
     * Filter, which CaiaMemory to fetch.
     */
    where?: CaiaMemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CaiaMemories to fetch.
     */
    orderBy?: CaiaMemoryOrderByWithRelationInput | CaiaMemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CaiaMemories.
     */
    cursor?: CaiaMemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CaiaMemories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CaiaMemories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CaiaMemories.
     */
    distinct?: CaiaMemoryScalarFieldEnum | CaiaMemoryScalarFieldEnum[]
  }

  /**
   * CaiaMemory findFirstOrThrow
   */
  export type CaiaMemoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaiaMemory
     */
    select?: CaiaMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaiaMemory
     */
    omit?: CaiaMemoryOmit<ExtArgs> | null
    /**
     * Filter, which CaiaMemory to fetch.
     */
    where?: CaiaMemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CaiaMemories to fetch.
     */
    orderBy?: CaiaMemoryOrderByWithRelationInput | CaiaMemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CaiaMemories.
     */
    cursor?: CaiaMemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CaiaMemories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CaiaMemories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CaiaMemories.
     */
    distinct?: CaiaMemoryScalarFieldEnum | CaiaMemoryScalarFieldEnum[]
  }

  /**
   * CaiaMemory findMany
   */
  export type CaiaMemoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaiaMemory
     */
    select?: CaiaMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaiaMemory
     */
    omit?: CaiaMemoryOmit<ExtArgs> | null
    /**
     * Filter, which CaiaMemories to fetch.
     */
    where?: CaiaMemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CaiaMemories to fetch.
     */
    orderBy?: CaiaMemoryOrderByWithRelationInput | CaiaMemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CaiaMemories.
     */
    cursor?: CaiaMemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CaiaMemories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CaiaMemories.
     */
    skip?: number
    distinct?: CaiaMemoryScalarFieldEnum | CaiaMemoryScalarFieldEnum[]
  }

  /**
   * CaiaMemory create
   */
  export type CaiaMemoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaiaMemory
     */
    select?: CaiaMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaiaMemory
     */
    omit?: CaiaMemoryOmit<ExtArgs> | null
    /**
     * The data needed to create a CaiaMemory.
     */
    data: XOR<CaiaMemoryCreateInput, CaiaMemoryUncheckedCreateInput>
  }

  /**
   * CaiaMemory createMany
   */
  export type CaiaMemoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CaiaMemories.
     */
    data: CaiaMemoryCreateManyInput | CaiaMemoryCreateManyInput[]
  }

  /**
   * CaiaMemory createManyAndReturn
   */
  export type CaiaMemoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaiaMemory
     */
    select?: CaiaMemorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CaiaMemory
     */
    omit?: CaiaMemoryOmit<ExtArgs> | null
    /**
     * The data used to create many CaiaMemories.
     */
    data: CaiaMemoryCreateManyInput | CaiaMemoryCreateManyInput[]
  }

  /**
   * CaiaMemory update
   */
  export type CaiaMemoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaiaMemory
     */
    select?: CaiaMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaiaMemory
     */
    omit?: CaiaMemoryOmit<ExtArgs> | null
    /**
     * The data needed to update a CaiaMemory.
     */
    data: XOR<CaiaMemoryUpdateInput, CaiaMemoryUncheckedUpdateInput>
    /**
     * Choose, which CaiaMemory to update.
     */
    where: CaiaMemoryWhereUniqueInput
  }

  /**
   * CaiaMemory updateMany
   */
  export type CaiaMemoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CaiaMemories.
     */
    data: XOR<CaiaMemoryUpdateManyMutationInput, CaiaMemoryUncheckedUpdateManyInput>
    /**
     * Filter which CaiaMemories to update
     */
    where?: CaiaMemoryWhereInput
    /**
     * Limit how many CaiaMemories to update.
     */
    limit?: number
  }

  /**
   * CaiaMemory updateManyAndReturn
   */
  export type CaiaMemoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaiaMemory
     */
    select?: CaiaMemorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CaiaMemory
     */
    omit?: CaiaMemoryOmit<ExtArgs> | null
    /**
     * The data used to update CaiaMemories.
     */
    data: XOR<CaiaMemoryUpdateManyMutationInput, CaiaMemoryUncheckedUpdateManyInput>
    /**
     * Filter which CaiaMemories to update
     */
    where?: CaiaMemoryWhereInput
    /**
     * Limit how many CaiaMemories to update.
     */
    limit?: number
  }

  /**
   * CaiaMemory upsert
   */
  export type CaiaMemoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaiaMemory
     */
    select?: CaiaMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaiaMemory
     */
    omit?: CaiaMemoryOmit<ExtArgs> | null
    /**
     * The filter to search for the CaiaMemory to update in case it exists.
     */
    where: CaiaMemoryWhereUniqueInput
    /**
     * In case the CaiaMemory found by the `where` argument doesn't exist, create a new CaiaMemory with this data.
     */
    create: XOR<CaiaMemoryCreateInput, CaiaMemoryUncheckedCreateInput>
    /**
     * In case the CaiaMemory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CaiaMemoryUpdateInput, CaiaMemoryUncheckedUpdateInput>
  }

  /**
   * CaiaMemory delete
   */
  export type CaiaMemoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaiaMemory
     */
    select?: CaiaMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaiaMemory
     */
    omit?: CaiaMemoryOmit<ExtArgs> | null
    /**
     * Filter which CaiaMemory to delete.
     */
    where: CaiaMemoryWhereUniqueInput
  }

  /**
   * CaiaMemory deleteMany
   */
  export type CaiaMemoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CaiaMemories to delete
     */
    where?: CaiaMemoryWhereInput
    /**
     * Limit how many CaiaMemories to delete.
     */
    limit?: number
  }

  /**
   * CaiaMemory without action
   */
  export type CaiaMemoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaiaMemory
     */
    select?: CaiaMemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CaiaMemory
     */
    omit?: CaiaMemoryOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    displayName: 'displayName',
    role: 'role',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const CimsMessageScalarFieldEnum: {
    id: 'id',
    threadId: 'threadId',
    channel: 'channel',
    direction: 'direction',
    body: 'body',
    mediaUrl: 'mediaUrl',
    meta: 'meta',
    createdAt: 'createdAt',
    senderUserId: 'senderUserId'
  };

  export type CimsMessageScalarFieldEnum = (typeof CimsMessageScalarFieldEnum)[keyof typeof CimsMessageScalarFieldEnum]


  export const WorkfocusTaskScalarFieldEnum: {
    id: 'id',
    ownerUserId: 'ownerUserId',
    bucket: 'bucket',
    title: 'title',
    status: 'status',
    dueAt: 'dueAt',
    meta: 'meta',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WorkfocusTaskScalarFieldEnum = (typeof WorkfocusTaskScalarFieldEnum)[keyof typeof WorkfocusTaskScalarFieldEnum]


  export const MemoryVendorScalarFieldEnum: {
    id: 'id',
    name: 'name',
    website: 'website',
    createdAt: 'createdAt'
  };

  export type MemoryVendorScalarFieldEnum = (typeof MemoryVendorScalarFieldEnum)[keyof typeof MemoryVendorScalarFieldEnum]


  export const MemoryPackScalarFieldEnum: {
    id: 'id',
    vendorId: 'vendorId',
    slug: 'slug',
    version: 'version',
    title: 'title',
    notes: 'notes',
    signature: 'signature',
    createdAt: 'createdAt'
  };

  export type MemoryPackScalarFieldEnum = (typeof MemoryPackScalarFieldEnum)[keyof typeof MemoryPackScalarFieldEnum]


  export const MemoryPackItemScalarFieldEnum: {
    id: 'id',
    packId: 'packId',
    kind: 'kind',
    subject: 'subject',
    content: 'content',
    tags: 'tags',
    createdAt: 'createdAt'
  };

  export type MemoryPackItemScalarFieldEnum = (typeof MemoryPackItemScalarFieldEnum)[keyof typeof MemoryPackItemScalarFieldEnum]


  export const MemoryTenantScalarFieldEnum: {
    id: 'id',
    name: 'name',
    brandSlug: 'brandSlug',
    createdAt: 'createdAt'
  };

  export type MemoryTenantScalarFieldEnum = (typeof MemoryTenantScalarFieldEnum)[keyof typeof MemoryTenantScalarFieldEnum]


  export const MemoryInstallScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    packId: 'packId',
    installedAt: 'installedAt'
  };

  export type MemoryInstallScalarFieldEnum = (typeof MemoryInstallScalarFieldEnum)[keyof typeof MemoryInstallScalarFieldEnum]


  export const MemoryOverrideScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    packItemId: 'packItemId',
    content: 'content',
    tags: 'tags',
    createdAt: 'createdAt'
  };

  export type MemoryOverrideScalarFieldEnum = (typeof MemoryOverrideScalarFieldEnum)[keyof typeof MemoryOverrideScalarFieldEnum]


  export const LearnedMemoryScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    userId: 'userId',
    kind: 'kind',
    subject: 'subject',
    content: 'content',
    tags: 'tags',
    importance: 'importance',
    source: 'source',
    createdAt: 'createdAt',
    lastUsedAt: 'lastUsedAt',
    expireAt: 'expireAt'
  };

  export type LearnedMemoryScalarFieldEnum = (typeof LearnedMemoryScalarFieldEnum)[keyof typeof LearnedMemoryScalarFieldEnum]


  export const CaiaMemoryScalarFieldEnum: {
    id: 'id',
    scope: 'scope',
    key: 'key',
    value: 'value',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CaiaMemoryScalarFieldEnum = (typeof CaiaMemoryScalarFieldEnum)[keyof typeof CaiaMemoryScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'MemoryKind'
   */
  export type EnumMemoryKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MemoryKind'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    displayName?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    messages?: CimsMessageListRelationFilter
    tasks?: WorkfocusTaskListRelationFilter
    learnedMemories?: LearnedMemoryListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    displayName?: SortOrderInput | SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    messages?: CimsMessageOrderByRelationAggregateInput
    tasks?: WorkfocusTaskOrderByRelationAggregateInput
    learnedMemories?: LearnedMemoryOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    displayName?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    messages?: CimsMessageListRelationFilter
    tasks?: WorkfocusTaskListRelationFilter
    learnedMemories?: LearnedMemoryListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    displayName?: SortOrderInput | SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    displayName?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type CimsMessageWhereInput = {
    AND?: CimsMessageWhereInput | CimsMessageWhereInput[]
    OR?: CimsMessageWhereInput[]
    NOT?: CimsMessageWhereInput | CimsMessageWhereInput[]
    id?: StringFilter<"CimsMessage"> | string
    threadId?: StringNullableFilter<"CimsMessage"> | string | null
    channel?: StringFilter<"CimsMessage"> | string
    direction?: StringFilter<"CimsMessage"> | string
    body?: StringNullableFilter<"CimsMessage"> | string | null
    mediaUrl?: StringNullableFilter<"CimsMessage"> | string | null
    meta?: JsonFilter<"CimsMessage">
    createdAt?: DateTimeFilter<"CimsMessage"> | Date | string
    senderUserId?: StringNullableFilter<"CimsMessage"> | string | null
    sender?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type CimsMessageOrderByWithRelationInput = {
    id?: SortOrder
    threadId?: SortOrderInput | SortOrder
    channel?: SortOrder
    direction?: SortOrder
    body?: SortOrderInput | SortOrder
    mediaUrl?: SortOrderInput | SortOrder
    meta?: SortOrder
    createdAt?: SortOrder
    senderUserId?: SortOrderInput | SortOrder
    sender?: UserOrderByWithRelationInput
  }

  export type CimsMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CimsMessageWhereInput | CimsMessageWhereInput[]
    OR?: CimsMessageWhereInput[]
    NOT?: CimsMessageWhereInput | CimsMessageWhereInput[]
    threadId?: StringNullableFilter<"CimsMessage"> | string | null
    channel?: StringFilter<"CimsMessage"> | string
    direction?: StringFilter<"CimsMessage"> | string
    body?: StringNullableFilter<"CimsMessage"> | string | null
    mediaUrl?: StringNullableFilter<"CimsMessage"> | string | null
    meta?: JsonFilter<"CimsMessage">
    createdAt?: DateTimeFilter<"CimsMessage"> | Date | string
    senderUserId?: StringNullableFilter<"CimsMessage"> | string | null
    sender?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id">

  export type CimsMessageOrderByWithAggregationInput = {
    id?: SortOrder
    threadId?: SortOrderInput | SortOrder
    channel?: SortOrder
    direction?: SortOrder
    body?: SortOrderInput | SortOrder
    mediaUrl?: SortOrderInput | SortOrder
    meta?: SortOrder
    createdAt?: SortOrder
    senderUserId?: SortOrderInput | SortOrder
    _count?: CimsMessageCountOrderByAggregateInput
    _max?: CimsMessageMaxOrderByAggregateInput
    _min?: CimsMessageMinOrderByAggregateInput
  }

  export type CimsMessageScalarWhereWithAggregatesInput = {
    AND?: CimsMessageScalarWhereWithAggregatesInput | CimsMessageScalarWhereWithAggregatesInput[]
    OR?: CimsMessageScalarWhereWithAggregatesInput[]
    NOT?: CimsMessageScalarWhereWithAggregatesInput | CimsMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CimsMessage"> | string
    threadId?: StringNullableWithAggregatesFilter<"CimsMessage"> | string | null
    channel?: StringWithAggregatesFilter<"CimsMessage"> | string
    direction?: StringWithAggregatesFilter<"CimsMessage"> | string
    body?: StringNullableWithAggregatesFilter<"CimsMessage"> | string | null
    mediaUrl?: StringNullableWithAggregatesFilter<"CimsMessage"> | string | null
    meta?: JsonWithAggregatesFilter<"CimsMessage">
    createdAt?: DateTimeWithAggregatesFilter<"CimsMessage"> | Date | string
    senderUserId?: StringNullableWithAggregatesFilter<"CimsMessage"> | string | null
  }

  export type WorkfocusTaskWhereInput = {
    AND?: WorkfocusTaskWhereInput | WorkfocusTaskWhereInput[]
    OR?: WorkfocusTaskWhereInput[]
    NOT?: WorkfocusTaskWhereInput | WorkfocusTaskWhereInput[]
    id?: StringFilter<"WorkfocusTask"> | string
    ownerUserId?: StringNullableFilter<"WorkfocusTask"> | string | null
    bucket?: StringFilter<"WorkfocusTask"> | string
    title?: StringFilter<"WorkfocusTask"> | string
    status?: StringFilter<"WorkfocusTask"> | string
    dueAt?: DateTimeNullableFilter<"WorkfocusTask"> | Date | string | null
    meta?: JsonFilter<"WorkfocusTask">
    createdAt?: DateTimeFilter<"WorkfocusTask"> | Date | string
    updatedAt?: DateTimeFilter<"WorkfocusTask"> | Date | string
    owner?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type WorkfocusTaskOrderByWithRelationInput = {
    id?: SortOrder
    ownerUserId?: SortOrderInput | SortOrder
    bucket?: SortOrder
    title?: SortOrder
    status?: SortOrder
    dueAt?: SortOrderInput | SortOrder
    meta?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    owner?: UserOrderByWithRelationInput
  }

  export type WorkfocusTaskWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WorkfocusTaskWhereInput | WorkfocusTaskWhereInput[]
    OR?: WorkfocusTaskWhereInput[]
    NOT?: WorkfocusTaskWhereInput | WorkfocusTaskWhereInput[]
    ownerUserId?: StringNullableFilter<"WorkfocusTask"> | string | null
    bucket?: StringFilter<"WorkfocusTask"> | string
    title?: StringFilter<"WorkfocusTask"> | string
    status?: StringFilter<"WorkfocusTask"> | string
    dueAt?: DateTimeNullableFilter<"WorkfocusTask"> | Date | string | null
    meta?: JsonFilter<"WorkfocusTask">
    createdAt?: DateTimeFilter<"WorkfocusTask"> | Date | string
    updatedAt?: DateTimeFilter<"WorkfocusTask"> | Date | string
    owner?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id">

  export type WorkfocusTaskOrderByWithAggregationInput = {
    id?: SortOrder
    ownerUserId?: SortOrderInput | SortOrder
    bucket?: SortOrder
    title?: SortOrder
    status?: SortOrder
    dueAt?: SortOrderInput | SortOrder
    meta?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WorkfocusTaskCountOrderByAggregateInput
    _max?: WorkfocusTaskMaxOrderByAggregateInput
    _min?: WorkfocusTaskMinOrderByAggregateInput
  }

  export type WorkfocusTaskScalarWhereWithAggregatesInput = {
    AND?: WorkfocusTaskScalarWhereWithAggregatesInput | WorkfocusTaskScalarWhereWithAggregatesInput[]
    OR?: WorkfocusTaskScalarWhereWithAggregatesInput[]
    NOT?: WorkfocusTaskScalarWhereWithAggregatesInput | WorkfocusTaskScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WorkfocusTask"> | string
    ownerUserId?: StringNullableWithAggregatesFilter<"WorkfocusTask"> | string | null
    bucket?: StringWithAggregatesFilter<"WorkfocusTask"> | string
    title?: StringWithAggregatesFilter<"WorkfocusTask"> | string
    status?: StringWithAggregatesFilter<"WorkfocusTask"> | string
    dueAt?: DateTimeNullableWithAggregatesFilter<"WorkfocusTask"> | Date | string | null
    meta?: JsonWithAggregatesFilter<"WorkfocusTask">
    createdAt?: DateTimeWithAggregatesFilter<"WorkfocusTask"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WorkfocusTask"> | Date | string
  }

  export type MemoryVendorWhereInput = {
    AND?: MemoryVendorWhereInput | MemoryVendorWhereInput[]
    OR?: MemoryVendorWhereInput[]
    NOT?: MemoryVendorWhereInput | MemoryVendorWhereInput[]
    id?: StringFilter<"MemoryVendor"> | string
    name?: StringFilter<"MemoryVendor"> | string
    website?: StringNullableFilter<"MemoryVendor"> | string | null
    createdAt?: DateTimeFilter<"MemoryVendor"> | Date | string
    packs?: MemoryPackListRelationFilter
  }

  export type MemoryVendorOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    website?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    packs?: MemoryPackOrderByRelationAggregateInput
  }

  export type MemoryVendorWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MemoryVendorWhereInput | MemoryVendorWhereInput[]
    OR?: MemoryVendorWhereInput[]
    NOT?: MemoryVendorWhereInput | MemoryVendorWhereInput[]
    name?: StringFilter<"MemoryVendor"> | string
    website?: StringNullableFilter<"MemoryVendor"> | string | null
    createdAt?: DateTimeFilter<"MemoryVendor"> | Date | string
    packs?: MemoryPackListRelationFilter
  }, "id">

  export type MemoryVendorOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    website?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: MemoryVendorCountOrderByAggregateInput
    _max?: MemoryVendorMaxOrderByAggregateInput
    _min?: MemoryVendorMinOrderByAggregateInput
  }

  export type MemoryVendorScalarWhereWithAggregatesInput = {
    AND?: MemoryVendorScalarWhereWithAggregatesInput | MemoryVendorScalarWhereWithAggregatesInput[]
    OR?: MemoryVendorScalarWhereWithAggregatesInput[]
    NOT?: MemoryVendorScalarWhereWithAggregatesInput | MemoryVendorScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MemoryVendor"> | string
    name?: StringWithAggregatesFilter<"MemoryVendor"> | string
    website?: StringNullableWithAggregatesFilter<"MemoryVendor"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MemoryVendor"> | Date | string
  }

  export type MemoryPackWhereInput = {
    AND?: MemoryPackWhereInput | MemoryPackWhereInput[]
    OR?: MemoryPackWhereInput[]
    NOT?: MemoryPackWhereInput | MemoryPackWhereInput[]
    id?: StringFilter<"MemoryPack"> | string
    vendorId?: StringFilter<"MemoryPack"> | string
    slug?: StringFilter<"MemoryPack"> | string
    version?: StringFilter<"MemoryPack"> | string
    title?: StringFilter<"MemoryPack"> | string
    notes?: StringNullableFilter<"MemoryPack"> | string | null
    signature?: StringNullableFilter<"MemoryPack"> | string | null
    createdAt?: DateTimeFilter<"MemoryPack"> | Date | string
    vendor?: XOR<MemoryVendorScalarRelationFilter, MemoryVendorWhereInput>
    items?: MemoryPackItemListRelationFilter
    installs?: MemoryInstallListRelationFilter
  }

  export type MemoryPackOrderByWithRelationInput = {
    id?: SortOrder
    vendorId?: SortOrder
    slug?: SortOrder
    version?: SortOrder
    title?: SortOrder
    notes?: SortOrderInput | SortOrder
    signature?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    vendor?: MemoryVendorOrderByWithRelationInput
    items?: MemoryPackItemOrderByRelationAggregateInput
    installs?: MemoryInstallOrderByRelationAggregateInput
  }

  export type MemoryPackWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    vendorId_slug_version?: MemoryPackVendorIdSlugVersionCompoundUniqueInput
    AND?: MemoryPackWhereInput | MemoryPackWhereInput[]
    OR?: MemoryPackWhereInput[]
    NOT?: MemoryPackWhereInput | MemoryPackWhereInput[]
    vendorId?: StringFilter<"MemoryPack"> | string
    slug?: StringFilter<"MemoryPack"> | string
    version?: StringFilter<"MemoryPack"> | string
    title?: StringFilter<"MemoryPack"> | string
    notes?: StringNullableFilter<"MemoryPack"> | string | null
    signature?: StringNullableFilter<"MemoryPack"> | string | null
    createdAt?: DateTimeFilter<"MemoryPack"> | Date | string
    vendor?: XOR<MemoryVendorScalarRelationFilter, MemoryVendorWhereInput>
    items?: MemoryPackItemListRelationFilter
    installs?: MemoryInstallListRelationFilter
  }, "id" | "vendorId_slug_version">

  export type MemoryPackOrderByWithAggregationInput = {
    id?: SortOrder
    vendorId?: SortOrder
    slug?: SortOrder
    version?: SortOrder
    title?: SortOrder
    notes?: SortOrderInput | SortOrder
    signature?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: MemoryPackCountOrderByAggregateInput
    _max?: MemoryPackMaxOrderByAggregateInput
    _min?: MemoryPackMinOrderByAggregateInput
  }

  export type MemoryPackScalarWhereWithAggregatesInput = {
    AND?: MemoryPackScalarWhereWithAggregatesInput | MemoryPackScalarWhereWithAggregatesInput[]
    OR?: MemoryPackScalarWhereWithAggregatesInput[]
    NOT?: MemoryPackScalarWhereWithAggregatesInput | MemoryPackScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MemoryPack"> | string
    vendorId?: StringWithAggregatesFilter<"MemoryPack"> | string
    slug?: StringWithAggregatesFilter<"MemoryPack"> | string
    version?: StringWithAggregatesFilter<"MemoryPack"> | string
    title?: StringWithAggregatesFilter<"MemoryPack"> | string
    notes?: StringNullableWithAggregatesFilter<"MemoryPack"> | string | null
    signature?: StringNullableWithAggregatesFilter<"MemoryPack"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MemoryPack"> | Date | string
  }

  export type MemoryPackItemWhereInput = {
    AND?: MemoryPackItemWhereInput | MemoryPackItemWhereInput[]
    OR?: MemoryPackItemWhereInput[]
    NOT?: MemoryPackItemWhereInput | MemoryPackItemWhereInput[]
    id?: StringFilter<"MemoryPackItem"> | string
    packId?: StringFilter<"MemoryPackItem"> | string
    kind?: StringFilter<"MemoryPackItem"> | string
    subject?: StringNullableFilter<"MemoryPackItem"> | string | null
    content?: StringFilter<"MemoryPackItem"> | string
    tags?: StringNullableFilter<"MemoryPackItem"> | string | null
    createdAt?: DateTimeFilter<"MemoryPackItem"> | Date | string
    pack?: XOR<MemoryPackScalarRelationFilter, MemoryPackWhereInput>
    overrides?: MemoryOverrideListRelationFilter
  }

  export type MemoryPackItemOrderByWithRelationInput = {
    id?: SortOrder
    packId?: SortOrder
    kind?: SortOrder
    subject?: SortOrderInput | SortOrder
    content?: SortOrder
    tags?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    pack?: MemoryPackOrderByWithRelationInput
    overrides?: MemoryOverrideOrderByRelationAggregateInput
  }

  export type MemoryPackItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MemoryPackItemWhereInput | MemoryPackItemWhereInput[]
    OR?: MemoryPackItemWhereInput[]
    NOT?: MemoryPackItemWhereInput | MemoryPackItemWhereInput[]
    packId?: StringFilter<"MemoryPackItem"> | string
    kind?: StringFilter<"MemoryPackItem"> | string
    subject?: StringNullableFilter<"MemoryPackItem"> | string | null
    content?: StringFilter<"MemoryPackItem"> | string
    tags?: StringNullableFilter<"MemoryPackItem"> | string | null
    createdAt?: DateTimeFilter<"MemoryPackItem"> | Date | string
    pack?: XOR<MemoryPackScalarRelationFilter, MemoryPackWhereInput>
    overrides?: MemoryOverrideListRelationFilter
  }, "id">

  export type MemoryPackItemOrderByWithAggregationInput = {
    id?: SortOrder
    packId?: SortOrder
    kind?: SortOrder
    subject?: SortOrderInput | SortOrder
    content?: SortOrder
    tags?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: MemoryPackItemCountOrderByAggregateInput
    _max?: MemoryPackItemMaxOrderByAggregateInput
    _min?: MemoryPackItemMinOrderByAggregateInput
  }

  export type MemoryPackItemScalarWhereWithAggregatesInput = {
    AND?: MemoryPackItemScalarWhereWithAggregatesInput | MemoryPackItemScalarWhereWithAggregatesInput[]
    OR?: MemoryPackItemScalarWhereWithAggregatesInput[]
    NOT?: MemoryPackItemScalarWhereWithAggregatesInput | MemoryPackItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MemoryPackItem"> | string
    packId?: StringWithAggregatesFilter<"MemoryPackItem"> | string
    kind?: StringWithAggregatesFilter<"MemoryPackItem"> | string
    subject?: StringNullableWithAggregatesFilter<"MemoryPackItem"> | string | null
    content?: StringWithAggregatesFilter<"MemoryPackItem"> | string
    tags?: StringNullableWithAggregatesFilter<"MemoryPackItem"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MemoryPackItem"> | Date | string
  }

  export type MemoryTenantWhereInput = {
    AND?: MemoryTenantWhereInput | MemoryTenantWhereInput[]
    OR?: MemoryTenantWhereInput[]
    NOT?: MemoryTenantWhereInput | MemoryTenantWhereInput[]
    id?: StringFilter<"MemoryTenant"> | string
    name?: StringFilter<"MemoryTenant"> | string
    brandSlug?: StringFilter<"MemoryTenant"> | string
    createdAt?: DateTimeFilter<"MemoryTenant"> | Date | string
    installs?: MemoryInstallListRelationFilter
    overrides?: MemoryOverrideListRelationFilter
  }

  export type MemoryTenantOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    brandSlug?: SortOrder
    createdAt?: SortOrder
    installs?: MemoryInstallOrderByRelationAggregateInput
    overrides?: MemoryOverrideOrderByRelationAggregateInput
  }

  export type MemoryTenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    brandSlug?: string
    AND?: MemoryTenantWhereInput | MemoryTenantWhereInput[]
    OR?: MemoryTenantWhereInput[]
    NOT?: MemoryTenantWhereInput | MemoryTenantWhereInput[]
    name?: StringFilter<"MemoryTenant"> | string
    createdAt?: DateTimeFilter<"MemoryTenant"> | Date | string
    installs?: MemoryInstallListRelationFilter
    overrides?: MemoryOverrideListRelationFilter
  }, "id" | "brandSlug">

  export type MemoryTenantOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    brandSlug?: SortOrder
    createdAt?: SortOrder
    _count?: MemoryTenantCountOrderByAggregateInput
    _max?: MemoryTenantMaxOrderByAggregateInput
    _min?: MemoryTenantMinOrderByAggregateInput
  }

  export type MemoryTenantScalarWhereWithAggregatesInput = {
    AND?: MemoryTenantScalarWhereWithAggregatesInput | MemoryTenantScalarWhereWithAggregatesInput[]
    OR?: MemoryTenantScalarWhereWithAggregatesInput[]
    NOT?: MemoryTenantScalarWhereWithAggregatesInput | MemoryTenantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MemoryTenant"> | string
    name?: StringWithAggregatesFilter<"MemoryTenant"> | string
    brandSlug?: StringWithAggregatesFilter<"MemoryTenant"> | string
    createdAt?: DateTimeWithAggregatesFilter<"MemoryTenant"> | Date | string
  }

  export type MemoryInstallWhereInput = {
    AND?: MemoryInstallWhereInput | MemoryInstallWhereInput[]
    OR?: MemoryInstallWhereInput[]
    NOT?: MemoryInstallWhereInput | MemoryInstallWhereInput[]
    id?: StringFilter<"MemoryInstall"> | string
    tenantId?: StringFilter<"MemoryInstall"> | string
    packId?: StringFilter<"MemoryInstall"> | string
    installedAt?: DateTimeFilter<"MemoryInstall"> | Date | string
    tenant?: XOR<MemoryTenantScalarRelationFilter, MemoryTenantWhereInput>
    pack?: XOR<MemoryPackScalarRelationFilter, MemoryPackWhereInput>
  }

  export type MemoryInstallOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packId?: SortOrder
    installedAt?: SortOrder
    tenant?: MemoryTenantOrderByWithRelationInput
    pack?: MemoryPackOrderByWithRelationInput
  }

  export type MemoryInstallWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_packId?: MemoryInstallTenantIdPackIdCompoundUniqueInput
    AND?: MemoryInstallWhereInput | MemoryInstallWhereInput[]
    OR?: MemoryInstallWhereInput[]
    NOT?: MemoryInstallWhereInput | MemoryInstallWhereInput[]
    tenantId?: StringFilter<"MemoryInstall"> | string
    packId?: StringFilter<"MemoryInstall"> | string
    installedAt?: DateTimeFilter<"MemoryInstall"> | Date | string
    tenant?: XOR<MemoryTenantScalarRelationFilter, MemoryTenantWhereInput>
    pack?: XOR<MemoryPackScalarRelationFilter, MemoryPackWhereInput>
  }, "id" | "tenantId_packId">

  export type MemoryInstallOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packId?: SortOrder
    installedAt?: SortOrder
    _count?: MemoryInstallCountOrderByAggregateInput
    _max?: MemoryInstallMaxOrderByAggregateInput
    _min?: MemoryInstallMinOrderByAggregateInput
  }

  export type MemoryInstallScalarWhereWithAggregatesInput = {
    AND?: MemoryInstallScalarWhereWithAggregatesInput | MemoryInstallScalarWhereWithAggregatesInput[]
    OR?: MemoryInstallScalarWhereWithAggregatesInput[]
    NOT?: MemoryInstallScalarWhereWithAggregatesInput | MemoryInstallScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MemoryInstall"> | string
    tenantId?: StringWithAggregatesFilter<"MemoryInstall"> | string
    packId?: StringWithAggregatesFilter<"MemoryInstall"> | string
    installedAt?: DateTimeWithAggregatesFilter<"MemoryInstall"> | Date | string
  }

  export type MemoryOverrideWhereInput = {
    AND?: MemoryOverrideWhereInput | MemoryOverrideWhereInput[]
    OR?: MemoryOverrideWhereInput[]
    NOT?: MemoryOverrideWhereInput | MemoryOverrideWhereInput[]
    id?: StringFilter<"MemoryOverride"> | string
    tenantId?: StringFilter<"MemoryOverride"> | string
    packItemId?: StringFilter<"MemoryOverride"> | string
    content?: StringFilter<"MemoryOverride"> | string
    tags?: StringNullableFilter<"MemoryOverride"> | string | null
    createdAt?: DateTimeFilter<"MemoryOverride"> | Date | string
    tenant?: XOR<MemoryTenantScalarRelationFilter, MemoryTenantWhereInput>
    packItem?: XOR<MemoryPackItemScalarRelationFilter, MemoryPackItemWhereInput>
  }

  export type MemoryOverrideOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packItemId?: SortOrder
    content?: SortOrder
    tags?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    tenant?: MemoryTenantOrderByWithRelationInput
    packItem?: MemoryPackItemOrderByWithRelationInput
  }

  export type MemoryOverrideWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_packItemId?: MemoryOverrideTenantIdPackItemIdCompoundUniqueInput
    AND?: MemoryOverrideWhereInput | MemoryOverrideWhereInput[]
    OR?: MemoryOverrideWhereInput[]
    NOT?: MemoryOverrideWhereInput | MemoryOverrideWhereInput[]
    tenantId?: StringFilter<"MemoryOverride"> | string
    packItemId?: StringFilter<"MemoryOverride"> | string
    content?: StringFilter<"MemoryOverride"> | string
    tags?: StringNullableFilter<"MemoryOverride"> | string | null
    createdAt?: DateTimeFilter<"MemoryOverride"> | Date | string
    tenant?: XOR<MemoryTenantScalarRelationFilter, MemoryTenantWhereInput>
    packItem?: XOR<MemoryPackItemScalarRelationFilter, MemoryPackItemWhereInput>
  }, "id" | "tenantId_packItemId">

  export type MemoryOverrideOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packItemId?: SortOrder
    content?: SortOrder
    tags?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: MemoryOverrideCountOrderByAggregateInput
    _max?: MemoryOverrideMaxOrderByAggregateInput
    _min?: MemoryOverrideMinOrderByAggregateInput
  }

  export type MemoryOverrideScalarWhereWithAggregatesInput = {
    AND?: MemoryOverrideScalarWhereWithAggregatesInput | MemoryOverrideScalarWhereWithAggregatesInput[]
    OR?: MemoryOverrideScalarWhereWithAggregatesInput[]
    NOT?: MemoryOverrideScalarWhereWithAggregatesInput | MemoryOverrideScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MemoryOverride"> | string
    tenantId?: StringWithAggregatesFilter<"MemoryOverride"> | string
    packItemId?: StringWithAggregatesFilter<"MemoryOverride"> | string
    content?: StringWithAggregatesFilter<"MemoryOverride"> | string
    tags?: StringNullableWithAggregatesFilter<"MemoryOverride"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MemoryOverride"> | Date | string
  }

  export type LearnedMemoryWhereInput = {
    AND?: LearnedMemoryWhereInput | LearnedMemoryWhereInput[]
    OR?: LearnedMemoryWhereInput[]
    NOT?: LearnedMemoryWhereInput | LearnedMemoryWhereInput[]
    id?: StringFilter<"LearnedMemory"> | string
    tenantId?: StringFilter<"LearnedMemory"> | string
    userId?: StringNullableFilter<"LearnedMemory"> | string | null
    kind?: EnumMemoryKindFilter<"LearnedMemory"> | $Enums.MemoryKind
    subject?: StringNullableFilter<"LearnedMemory"> | string | null
    content?: StringFilter<"LearnedMemory"> | string
    tags?: StringNullableFilter<"LearnedMemory"> | string | null
    importance?: IntFilter<"LearnedMemory"> | number
    source?: StringNullableFilter<"LearnedMemory"> | string | null
    createdAt?: DateTimeFilter<"LearnedMemory"> | Date | string
    lastUsedAt?: DateTimeNullableFilter<"LearnedMemory"> | Date | string | null
    expireAt?: DateTimeNullableFilter<"LearnedMemory"> | Date | string | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type LearnedMemoryOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrderInput | SortOrder
    kind?: SortOrder
    subject?: SortOrderInput | SortOrder
    content?: SortOrder
    tags?: SortOrderInput | SortOrder
    importance?: SortOrder
    source?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    lastUsedAt?: SortOrderInput | SortOrder
    expireAt?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type LearnedMemoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LearnedMemoryWhereInput | LearnedMemoryWhereInput[]
    OR?: LearnedMemoryWhereInput[]
    NOT?: LearnedMemoryWhereInput | LearnedMemoryWhereInput[]
    tenantId?: StringFilter<"LearnedMemory"> | string
    userId?: StringNullableFilter<"LearnedMemory"> | string | null
    kind?: EnumMemoryKindFilter<"LearnedMemory"> | $Enums.MemoryKind
    subject?: StringNullableFilter<"LearnedMemory"> | string | null
    content?: StringFilter<"LearnedMemory"> | string
    tags?: StringNullableFilter<"LearnedMemory"> | string | null
    importance?: IntFilter<"LearnedMemory"> | number
    source?: StringNullableFilter<"LearnedMemory"> | string | null
    createdAt?: DateTimeFilter<"LearnedMemory"> | Date | string
    lastUsedAt?: DateTimeNullableFilter<"LearnedMemory"> | Date | string | null
    expireAt?: DateTimeNullableFilter<"LearnedMemory"> | Date | string | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id">

  export type LearnedMemoryOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrderInput | SortOrder
    kind?: SortOrder
    subject?: SortOrderInput | SortOrder
    content?: SortOrder
    tags?: SortOrderInput | SortOrder
    importance?: SortOrder
    source?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    lastUsedAt?: SortOrderInput | SortOrder
    expireAt?: SortOrderInput | SortOrder
    _count?: LearnedMemoryCountOrderByAggregateInput
    _avg?: LearnedMemoryAvgOrderByAggregateInput
    _max?: LearnedMemoryMaxOrderByAggregateInput
    _min?: LearnedMemoryMinOrderByAggregateInput
    _sum?: LearnedMemorySumOrderByAggregateInput
  }

  export type LearnedMemoryScalarWhereWithAggregatesInput = {
    AND?: LearnedMemoryScalarWhereWithAggregatesInput | LearnedMemoryScalarWhereWithAggregatesInput[]
    OR?: LearnedMemoryScalarWhereWithAggregatesInput[]
    NOT?: LearnedMemoryScalarWhereWithAggregatesInput | LearnedMemoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LearnedMemory"> | string
    tenantId?: StringWithAggregatesFilter<"LearnedMemory"> | string
    userId?: StringNullableWithAggregatesFilter<"LearnedMemory"> | string | null
    kind?: EnumMemoryKindWithAggregatesFilter<"LearnedMemory"> | $Enums.MemoryKind
    subject?: StringNullableWithAggregatesFilter<"LearnedMemory"> | string | null
    content?: StringWithAggregatesFilter<"LearnedMemory"> | string
    tags?: StringNullableWithAggregatesFilter<"LearnedMemory"> | string | null
    importance?: IntWithAggregatesFilter<"LearnedMemory"> | number
    source?: StringNullableWithAggregatesFilter<"LearnedMemory"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"LearnedMemory"> | Date | string
    lastUsedAt?: DateTimeNullableWithAggregatesFilter<"LearnedMemory"> | Date | string | null
    expireAt?: DateTimeNullableWithAggregatesFilter<"LearnedMemory"> | Date | string | null
  }

  export type CaiaMemoryWhereInput = {
    AND?: CaiaMemoryWhereInput | CaiaMemoryWhereInput[]
    OR?: CaiaMemoryWhereInput[]
    NOT?: CaiaMemoryWhereInput | CaiaMemoryWhereInput[]
    id?: StringFilter<"CaiaMemory"> | string
    scope?: StringFilter<"CaiaMemory"> | string
    key?: StringFilter<"CaiaMemory"> | string
    value?: JsonFilter<"CaiaMemory">
    createdAt?: DateTimeFilter<"CaiaMemory"> | Date | string
    updatedAt?: DateTimeFilter<"CaiaMemory"> | Date | string
  }

  export type CaiaMemoryOrderByWithRelationInput = {
    id?: SortOrder
    scope?: SortOrder
    key?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CaiaMemoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    scope_key?: CaiaMemoryScopeKeyCompoundUniqueInput
    AND?: CaiaMemoryWhereInput | CaiaMemoryWhereInput[]
    OR?: CaiaMemoryWhereInput[]
    NOT?: CaiaMemoryWhereInput | CaiaMemoryWhereInput[]
    scope?: StringFilter<"CaiaMemory"> | string
    key?: StringFilter<"CaiaMemory"> | string
    value?: JsonFilter<"CaiaMemory">
    createdAt?: DateTimeFilter<"CaiaMemory"> | Date | string
    updatedAt?: DateTimeFilter<"CaiaMemory"> | Date | string
  }, "id" | "scope_key">

  export type CaiaMemoryOrderByWithAggregationInput = {
    id?: SortOrder
    scope?: SortOrder
    key?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CaiaMemoryCountOrderByAggregateInput
    _max?: CaiaMemoryMaxOrderByAggregateInput
    _min?: CaiaMemoryMinOrderByAggregateInput
  }

  export type CaiaMemoryScalarWhereWithAggregatesInput = {
    AND?: CaiaMemoryScalarWhereWithAggregatesInput | CaiaMemoryScalarWhereWithAggregatesInput[]
    OR?: CaiaMemoryScalarWhereWithAggregatesInput[]
    NOT?: CaiaMemoryScalarWhereWithAggregatesInput | CaiaMemoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CaiaMemory"> | string
    scope?: StringWithAggregatesFilter<"CaiaMemory"> | string
    key?: StringWithAggregatesFilter<"CaiaMemory"> | string
    value?: JsonWithAggregatesFilter<"CaiaMemory">
    createdAt?: DateTimeWithAggregatesFilter<"CaiaMemory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CaiaMemory"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    displayName?: string | null
    role?: string
    createdAt?: Date | string
    messages?: CimsMessageCreateNestedManyWithoutSenderInput
    tasks?: WorkfocusTaskCreateNestedManyWithoutOwnerInput
    learnedMemories?: LearnedMemoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    displayName?: string | null
    role?: string
    createdAt?: Date | string
    messages?: CimsMessageUncheckedCreateNestedManyWithoutSenderInput
    tasks?: WorkfocusTaskUncheckedCreateNestedManyWithoutOwnerInput
    learnedMemories?: LearnedMemoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: CimsMessageUpdateManyWithoutSenderNestedInput
    tasks?: WorkfocusTaskUpdateManyWithoutOwnerNestedInput
    learnedMemories?: LearnedMemoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: CimsMessageUncheckedUpdateManyWithoutSenderNestedInput
    tasks?: WorkfocusTaskUncheckedUpdateManyWithoutOwnerNestedInput
    learnedMemories?: LearnedMemoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    displayName?: string | null
    role?: string
    createdAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CimsMessageCreateInput = {
    id?: string
    threadId?: string | null
    channel: string
    direction: string
    body?: string | null
    mediaUrl?: string | null
    meta: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    sender?: UserCreateNestedOneWithoutMessagesInput
  }

  export type CimsMessageUncheckedCreateInput = {
    id?: string
    threadId?: string | null
    channel: string
    direction: string
    body?: string | null
    mediaUrl?: string | null
    meta: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    senderUserId?: string | null
  }

  export type CimsMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    mediaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sender?: UserUpdateOneWithoutMessagesNestedInput
  }

  export type CimsMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    mediaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    senderUserId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CimsMessageCreateManyInput = {
    id?: string
    threadId?: string | null
    channel: string
    direction: string
    body?: string | null
    mediaUrl?: string | null
    meta: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    senderUserId?: string | null
  }

  export type CimsMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    mediaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CimsMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    mediaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    senderUserId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WorkfocusTaskCreateInput = {
    id?: string
    bucket: string
    title: string
    status?: string
    dueAt?: Date | string | null
    meta: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    owner?: UserCreateNestedOneWithoutTasksInput
  }

  export type WorkfocusTaskUncheckedCreateInput = {
    id?: string
    ownerUserId?: string | null
    bucket: string
    title: string
    status?: string
    dueAt?: Date | string | null
    meta: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WorkfocusTaskUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucket?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    dueAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneWithoutTasksNestedInput
  }

  export type WorkfocusTaskUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerUserId?: NullableStringFieldUpdateOperationsInput | string | null
    bucket?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    dueAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkfocusTaskCreateManyInput = {
    id?: string
    ownerUserId?: string | null
    bucket: string
    title: string
    status?: string
    dueAt?: Date | string | null
    meta: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WorkfocusTaskUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucket?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    dueAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkfocusTaskUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerUserId?: NullableStringFieldUpdateOperationsInput | string | null
    bucket?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    dueAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryVendorCreateInput = {
    id?: string
    name: string
    website?: string | null
    createdAt?: Date | string
    packs?: MemoryPackCreateNestedManyWithoutVendorInput
  }

  export type MemoryVendorUncheckedCreateInput = {
    id?: string
    name: string
    website?: string | null
    createdAt?: Date | string
    packs?: MemoryPackUncheckedCreateNestedManyWithoutVendorInput
  }

  export type MemoryVendorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    website?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packs?: MemoryPackUpdateManyWithoutVendorNestedInput
  }

  export type MemoryVendorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    website?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packs?: MemoryPackUncheckedUpdateManyWithoutVendorNestedInput
  }

  export type MemoryVendorCreateManyInput = {
    id?: string
    name: string
    website?: string | null
    createdAt?: Date | string
  }

  export type MemoryVendorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    website?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryVendorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    website?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryPackCreateInput = {
    id?: string
    slug: string
    version: string
    title: string
    notes?: string | null
    signature?: string | null
    createdAt?: Date | string
    vendor: MemoryVendorCreateNestedOneWithoutPacksInput
    items?: MemoryPackItemCreateNestedManyWithoutPackInput
    installs?: MemoryInstallCreateNestedManyWithoutPackInput
  }

  export type MemoryPackUncheckedCreateInput = {
    id?: string
    vendorId: string
    slug: string
    version: string
    title: string
    notes?: string | null
    signature?: string | null
    createdAt?: Date | string
    items?: MemoryPackItemUncheckedCreateNestedManyWithoutPackInput
    installs?: MemoryInstallUncheckedCreateNestedManyWithoutPackInput
  }

  export type MemoryPackUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vendor?: MemoryVendorUpdateOneRequiredWithoutPacksNestedInput
    items?: MemoryPackItemUpdateManyWithoutPackNestedInput
    installs?: MemoryInstallUpdateManyWithoutPackNestedInput
  }

  export type MemoryPackUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    vendorId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: MemoryPackItemUncheckedUpdateManyWithoutPackNestedInput
    installs?: MemoryInstallUncheckedUpdateManyWithoutPackNestedInput
  }

  export type MemoryPackCreateManyInput = {
    id?: string
    vendorId: string
    slug: string
    version: string
    title: string
    notes?: string | null
    signature?: string | null
    createdAt?: Date | string
  }

  export type MemoryPackUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryPackUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    vendorId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryPackItemCreateInput = {
    id?: string
    kind: string
    subject?: string | null
    content: string
    tags?: string | null
    createdAt?: Date | string
    pack: MemoryPackCreateNestedOneWithoutItemsInput
    overrides?: MemoryOverrideCreateNestedManyWithoutPackItemInput
  }

  export type MemoryPackItemUncheckedCreateInput = {
    id?: string
    packId: string
    kind: string
    subject?: string | null
    content: string
    tags?: string | null
    createdAt?: Date | string
    overrides?: MemoryOverrideUncheckedCreateNestedManyWithoutPackItemInput
  }

  export type MemoryPackItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pack?: MemoryPackUpdateOneRequiredWithoutItemsNestedInput
    overrides?: MemoryOverrideUpdateManyWithoutPackItemNestedInput
  }

  export type MemoryPackItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    packId?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    overrides?: MemoryOverrideUncheckedUpdateManyWithoutPackItemNestedInput
  }

  export type MemoryPackItemCreateManyInput = {
    id?: string
    packId: string
    kind: string
    subject?: string | null
    content: string
    tags?: string | null
    createdAt?: Date | string
  }

  export type MemoryPackItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryPackItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    packId?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryTenantCreateInput = {
    id?: string
    name: string
    brandSlug: string
    createdAt?: Date | string
    installs?: MemoryInstallCreateNestedManyWithoutTenantInput
    overrides?: MemoryOverrideCreateNestedManyWithoutTenantInput
  }

  export type MemoryTenantUncheckedCreateInput = {
    id?: string
    name: string
    brandSlug: string
    createdAt?: Date | string
    installs?: MemoryInstallUncheckedCreateNestedManyWithoutTenantInput
    overrides?: MemoryOverrideUncheckedCreateNestedManyWithoutTenantInput
  }

  export type MemoryTenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brandSlug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    installs?: MemoryInstallUpdateManyWithoutTenantNestedInput
    overrides?: MemoryOverrideUpdateManyWithoutTenantNestedInput
  }

  export type MemoryTenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brandSlug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    installs?: MemoryInstallUncheckedUpdateManyWithoutTenantNestedInput
    overrides?: MemoryOverrideUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type MemoryTenantCreateManyInput = {
    id?: string
    name: string
    brandSlug: string
    createdAt?: Date | string
  }

  export type MemoryTenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brandSlug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryTenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brandSlug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryInstallCreateInput = {
    id?: string
    installedAt?: Date | string
    tenant: MemoryTenantCreateNestedOneWithoutInstallsInput
    pack: MemoryPackCreateNestedOneWithoutInstallsInput
  }

  export type MemoryInstallUncheckedCreateInput = {
    id?: string
    tenantId: string
    packId: string
    installedAt?: Date | string
  }

  export type MemoryInstallUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    installedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: MemoryTenantUpdateOneRequiredWithoutInstallsNestedInput
    pack?: MemoryPackUpdateOneRequiredWithoutInstallsNestedInput
  }

  export type MemoryInstallUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packId?: StringFieldUpdateOperationsInput | string
    installedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryInstallCreateManyInput = {
    id?: string
    tenantId: string
    packId: string
    installedAt?: Date | string
  }

  export type MemoryInstallUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    installedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryInstallUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packId?: StringFieldUpdateOperationsInput | string
    installedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryOverrideCreateInput = {
    id?: string
    content: string
    tags?: string | null
    createdAt?: Date | string
    tenant: MemoryTenantCreateNestedOneWithoutOverridesInput
    packItem: MemoryPackItemCreateNestedOneWithoutOverridesInput
  }

  export type MemoryOverrideUncheckedCreateInput = {
    id?: string
    tenantId: string
    packItemId: string
    content: string
    tags?: string | null
    createdAt?: Date | string
  }

  export type MemoryOverrideUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: MemoryTenantUpdateOneRequiredWithoutOverridesNestedInput
    packItem?: MemoryPackItemUpdateOneRequiredWithoutOverridesNestedInput
  }

  export type MemoryOverrideUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packItemId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryOverrideCreateManyInput = {
    id?: string
    tenantId: string
    packItemId: string
    content: string
    tags?: string | null
    createdAt?: Date | string
  }

  export type MemoryOverrideUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryOverrideUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packItemId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearnedMemoryCreateInput = {
    id?: string
    tenantId: string
    kind: $Enums.MemoryKind
    subject?: string | null
    content: string
    tags?: string | null
    importance?: number
    source?: string | null
    createdAt?: Date | string
    lastUsedAt?: Date | string | null
    expireAt?: Date | string | null
    user?: UserCreateNestedOneWithoutLearnedMemoriesInput
  }

  export type LearnedMemoryUncheckedCreateInput = {
    id?: string
    tenantId: string
    userId?: string | null
    kind: $Enums.MemoryKind
    subject?: string | null
    content: string
    tags?: string | null
    importance?: number
    source?: string | null
    createdAt?: Date | string
    lastUsedAt?: Date | string | null
    expireAt?: Date | string | null
  }

  export type LearnedMemoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: EnumMemoryKindFieldUpdateOperationsInput | $Enums.MemoryKind
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    importance?: IntFieldUpdateOperationsInput | number
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expireAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneWithoutLearnedMemoriesNestedInput
  }

  export type LearnedMemoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: EnumMemoryKindFieldUpdateOperationsInput | $Enums.MemoryKind
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    importance?: IntFieldUpdateOperationsInput | number
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expireAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LearnedMemoryCreateManyInput = {
    id?: string
    tenantId: string
    userId?: string | null
    kind: $Enums.MemoryKind
    subject?: string | null
    content: string
    tags?: string | null
    importance?: number
    source?: string | null
    createdAt?: Date | string
    lastUsedAt?: Date | string | null
    expireAt?: Date | string | null
  }

  export type LearnedMemoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: EnumMemoryKindFieldUpdateOperationsInput | $Enums.MemoryKind
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    importance?: IntFieldUpdateOperationsInput | number
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expireAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LearnedMemoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: EnumMemoryKindFieldUpdateOperationsInput | $Enums.MemoryKind
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    importance?: IntFieldUpdateOperationsInput | number
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expireAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CaiaMemoryCreateInput = {
    id?: string
    scope: string
    key: string
    value: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CaiaMemoryUncheckedCreateInput = {
    id?: string
    scope: string
    key: string
    value: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CaiaMemoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CaiaMemoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CaiaMemoryCreateManyInput = {
    id?: string
    scope: string
    key: string
    value: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CaiaMemoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CaiaMemoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CimsMessageListRelationFilter = {
    every?: CimsMessageWhereInput
    some?: CimsMessageWhereInput
    none?: CimsMessageWhereInput
  }

  export type WorkfocusTaskListRelationFilter = {
    every?: WorkfocusTaskWhereInput
    some?: WorkfocusTaskWhereInput
    none?: WorkfocusTaskWhereInput
  }

  export type LearnedMemoryListRelationFilter = {
    every?: LearnedMemoryWhereInput
    some?: LearnedMemoryWhereInput
    none?: LearnedMemoryWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CimsMessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WorkfocusTaskOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LearnedMemoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    displayName?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    displayName?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    displayName?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type CimsMessageCountOrderByAggregateInput = {
    id?: SortOrder
    threadId?: SortOrder
    channel?: SortOrder
    direction?: SortOrder
    body?: SortOrder
    mediaUrl?: SortOrder
    meta?: SortOrder
    createdAt?: SortOrder
    senderUserId?: SortOrder
  }

  export type CimsMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    threadId?: SortOrder
    channel?: SortOrder
    direction?: SortOrder
    body?: SortOrder
    mediaUrl?: SortOrder
    createdAt?: SortOrder
    senderUserId?: SortOrder
  }

  export type CimsMessageMinOrderByAggregateInput = {
    id?: SortOrder
    threadId?: SortOrder
    channel?: SortOrder
    direction?: SortOrder
    body?: SortOrder
    mediaUrl?: SortOrder
    createdAt?: SortOrder
    senderUserId?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type WorkfocusTaskCountOrderByAggregateInput = {
    id?: SortOrder
    ownerUserId?: SortOrder
    bucket?: SortOrder
    title?: SortOrder
    status?: SortOrder
    dueAt?: SortOrder
    meta?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WorkfocusTaskMaxOrderByAggregateInput = {
    id?: SortOrder
    ownerUserId?: SortOrder
    bucket?: SortOrder
    title?: SortOrder
    status?: SortOrder
    dueAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WorkfocusTaskMinOrderByAggregateInput = {
    id?: SortOrder
    ownerUserId?: SortOrder
    bucket?: SortOrder
    title?: SortOrder
    status?: SortOrder
    dueAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type MemoryPackListRelationFilter = {
    every?: MemoryPackWhereInput
    some?: MemoryPackWhereInput
    none?: MemoryPackWhereInput
  }

  export type MemoryPackOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MemoryVendorCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    website?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryVendorMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    website?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryVendorMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    website?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryVendorScalarRelationFilter = {
    is?: MemoryVendorWhereInput
    isNot?: MemoryVendorWhereInput
  }

  export type MemoryPackItemListRelationFilter = {
    every?: MemoryPackItemWhereInput
    some?: MemoryPackItemWhereInput
    none?: MemoryPackItemWhereInput
  }

  export type MemoryInstallListRelationFilter = {
    every?: MemoryInstallWhereInput
    some?: MemoryInstallWhereInput
    none?: MemoryInstallWhereInput
  }

  export type MemoryPackItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MemoryInstallOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MemoryPackVendorIdSlugVersionCompoundUniqueInput = {
    vendorId: string
    slug: string
    version: string
  }

  export type MemoryPackCountOrderByAggregateInput = {
    id?: SortOrder
    vendorId?: SortOrder
    slug?: SortOrder
    version?: SortOrder
    title?: SortOrder
    notes?: SortOrder
    signature?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryPackMaxOrderByAggregateInput = {
    id?: SortOrder
    vendorId?: SortOrder
    slug?: SortOrder
    version?: SortOrder
    title?: SortOrder
    notes?: SortOrder
    signature?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryPackMinOrderByAggregateInput = {
    id?: SortOrder
    vendorId?: SortOrder
    slug?: SortOrder
    version?: SortOrder
    title?: SortOrder
    notes?: SortOrder
    signature?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryPackScalarRelationFilter = {
    is?: MemoryPackWhereInput
    isNot?: MemoryPackWhereInput
  }

  export type MemoryOverrideListRelationFilter = {
    every?: MemoryOverrideWhereInput
    some?: MemoryOverrideWhereInput
    none?: MemoryOverrideWhereInput
  }

  export type MemoryOverrideOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MemoryPackItemCountOrderByAggregateInput = {
    id?: SortOrder
    packId?: SortOrder
    kind?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryPackItemMaxOrderByAggregateInput = {
    id?: SortOrder
    packId?: SortOrder
    kind?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryPackItemMinOrderByAggregateInput = {
    id?: SortOrder
    packId?: SortOrder
    kind?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryTenantCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    brandSlug?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryTenantMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    brandSlug?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryTenantMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    brandSlug?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryTenantScalarRelationFilter = {
    is?: MemoryTenantWhereInput
    isNot?: MemoryTenantWhereInput
  }

  export type MemoryInstallTenantIdPackIdCompoundUniqueInput = {
    tenantId: string
    packId: string
  }

  export type MemoryInstallCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packId?: SortOrder
    installedAt?: SortOrder
  }

  export type MemoryInstallMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packId?: SortOrder
    installedAt?: SortOrder
  }

  export type MemoryInstallMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packId?: SortOrder
    installedAt?: SortOrder
  }

  export type MemoryPackItemScalarRelationFilter = {
    is?: MemoryPackItemWhereInput
    isNot?: MemoryPackItemWhereInput
  }

  export type MemoryOverrideTenantIdPackItemIdCompoundUniqueInput = {
    tenantId: string
    packItemId: string
  }

  export type MemoryOverrideCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packItemId?: SortOrder
    content?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryOverrideMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packItemId?: SortOrder
    content?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
  }

  export type MemoryOverrideMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packItemId?: SortOrder
    content?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumMemoryKindFilter<$PrismaModel = never> = {
    equals?: $Enums.MemoryKind | EnumMemoryKindFieldRefInput<$PrismaModel>
    in?: $Enums.MemoryKind[]
    notIn?: $Enums.MemoryKind[]
    not?: NestedEnumMemoryKindFilter<$PrismaModel> | $Enums.MemoryKind
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type LearnedMemoryCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    kind?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    tags?: SortOrder
    importance?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    lastUsedAt?: SortOrder
    expireAt?: SortOrder
  }

  export type LearnedMemoryAvgOrderByAggregateInput = {
    importance?: SortOrder
  }

  export type LearnedMemoryMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    kind?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    tags?: SortOrder
    importance?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    lastUsedAt?: SortOrder
    expireAt?: SortOrder
  }

  export type LearnedMemoryMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    kind?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    tags?: SortOrder
    importance?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    lastUsedAt?: SortOrder
    expireAt?: SortOrder
  }

  export type LearnedMemorySumOrderByAggregateInput = {
    importance?: SortOrder
  }

  export type EnumMemoryKindWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MemoryKind | EnumMemoryKindFieldRefInput<$PrismaModel>
    in?: $Enums.MemoryKind[]
    notIn?: $Enums.MemoryKind[]
    not?: NestedEnumMemoryKindWithAggregatesFilter<$PrismaModel> | $Enums.MemoryKind
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMemoryKindFilter<$PrismaModel>
    _max?: NestedEnumMemoryKindFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type CaiaMemoryScopeKeyCompoundUniqueInput = {
    scope: string
    key: string
  }

  export type CaiaMemoryCountOrderByAggregateInput = {
    id?: SortOrder
    scope?: SortOrder
    key?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CaiaMemoryMaxOrderByAggregateInput = {
    id?: SortOrder
    scope?: SortOrder
    key?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CaiaMemoryMinOrderByAggregateInput = {
    id?: SortOrder
    scope?: SortOrder
    key?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CimsMessageCreateNestedManyWithoutSenderInput = {
    create?: XOR<CimsMessageCreateWithoutSenderInput, CimsMessageUncheckedCreateWithoutSenderInput> | CimsMessageCreateWithoutSenderInput[] | CimsMessageUncheckedCreateWithoutSenderInput[]
    connectOrCreate?: CimsMessageCreateOrConnectWithoutSenderInput | CimsMessageCreateOrConnectWithoutSenderInput[]
    createMany?: CimsMessageCreateManySenderInputEnvelope
    connect?: CimsMessageWhereUniqueInput | CimsMessageWhereUniqueInput[]
  }

  export type WorkfocusTaskCreateNestedManyWithoutOwnerInput = {
    create?: XOR<WorkfocusTaskCreateWithoutOwnerInput, WorkfocusTaskUncheckedCreateWithoutOwnerInput> | WorkfocusTaskCreateWithoutOwnerInput[] | WorkfocusTaskUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: WorkfocusTaskCreateOrConnectWithoutOwnerInput | WorkfocusTaskCreateOrConnectWithoutOwnerInput[]
    createMany?: WorkfocusTaskCreateManyOwnerInputEnvelope
    connect?: WorkfocusTaskWhereUniqueInput | WorkfocusTaskWhereUniqueInput[]
  }

  export type LearnedMemoryCreateNestedManyWithoutUserInput = {
    create?: XOR<LearnedMemoryCreateWithoutUserInput, LearnedMemoryUncheckedCreateWithoutUserInput> | LearnedMemoryCreateWithoutUserInput[] | LearnedMemoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LearnedMemoryCreateOrConnectWithoutUserInput | LearnedMemoryCreateOrConnectWithoutUserInput[]
    createMany?: LearnedMemoryCreateManyUserInputEnvelope
    connect?: LearnedMemoryWhereUniqueInput | LearnedMemoryWhereUniqueInput[]
  }

  export type CimsMessageUncheckedCreateNestedManyWithoutSenderInput = {
    create?: XOR<CimsMessageCreateWithoutSenderInput, CimsMessageUncheckedCreateWithoutSenderInput> | CimsMessageCreateWithoutSenderInput[] | CimsMessageUncheckedCreateWithoutSenderInput[]
    connectOrCreate?: CimsMessageCreateOrConnectWithoutSenderInput | CimsMessageCreateOrConnectWithoutSenderInput[]
    createMany?: CimsMessageCreateManySenderInputEnvelope
    connect?: CimsMessageWhereUniqueInput | CimsMessageWhereUniqueInput[]
  }

  export type WorkfocusTaskUncheckedCreateNestedManyWithoutOwnerInput = {
    create?: XOR<WorkfocusTaskCreateWithoutOwnerInput, WorkfocusTaskUncheckedCreateWithoutOwnerInput> | WorkfocusTaskCreateWithoutOwnerInput[] | WorkfocusTaskUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: WorkfocusTaskCreateOrConnectWithoutOwnerInput | WorkfocusTaskCreateOrConnectWithoutOwnerInput[]
    createMany?: WorkfocusTaskCreateManyOwnerInputEnvelope
    connect?: WorkfocusTaskWhereUniqueInput | WorkfocusTaskWhereUniqueInput[]
  }

  export type LearnedMemoryUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<LearnedMemoryCreateWithoutUserInput, LearnedMemoryUncheckedCreateWithoutUserInput> | LearnedMemoryCreateWithoutUserInput[] | LearnedMemoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LearnedMemoryCreateOrConnectWithoutUserInput | LearnedMemoryCreateOrConnectWithoutUserInput[]
    createMany?: LearnedMemoryCreateManyUserInputEnvelope
    connect?: LearnedMemoryWhereUniqueInput | LearnedMemoryWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CimsMessageUpdateManyWithoutSenderNestedInput = {
    create?: XOR<CimsMessageCreateWithoutSenderInput, CimsMessageUncheckedCreateWithoutSenderInput> | CimsMessageCreateWithoutSenderInput[] | CimsMessageUncheckedCreateWithoutSenderInput[]
    connectOrCreate?: CimsMessageCreateOrConnectWithoutSenderInput | CimsMessageCreateOrConnectWithoutSenderInput[]
    upsert?: CimsMessageUpsertWithWhereUniqueWithoutSenderInput | CimsMessageUpsertWithWhereUniqueWithoutSenderInput[]
    createMany?: CimsMessageCreateManySenderInputEnvelope
    set?: CimsMessageWhereUniqueInput | CimsMessageWhereUniqueInput[]
    disconnect?: CimsMessageWhereUniqueInput | CimsMessageWhereUniqueInput[]
    delete?: CimsMessageWhereUniqueInput | CimsMessageWhereUniqueInput[]
    connect?: CimsMessageWhereUniqueInput | CimsMessageWhereUniqueInput[]
    update?: CimsMessageUpdateWithWhereUniqueWithoutSenderInput | CimsMessageUpdateWithWhereUniqueWithoutSenderInput[]
    updateMany?: CimsMessageUpdateManyWithWhereWithoutSenderInput | CimsMessageUpdateManyWithWhereWithoutSenderInput[]
    deleteMany?: CimsMessageScalarWhereInput | CimsMessageScalarWhereInput[]
  }

  export type WorkfocusTaskUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<WorkfocusTaskCreateWithoutOwnerInput, WorkfocusTaskUncheckedCreateWithoutOwnerInput> | WorkfocusTaskCreateWithoutOwnerInput[] | WorkfocusTaskUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: WorkfocusTaskCreateOrConnectWithoutOwnerInput | WorkfocusTaskCreateOrConnectWithoutOwnerInput[]
    upsert?: WorkfocusTaskUpsertWithWhereUniqueWithoutOwnerInput | WorkfocusTaskUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: WorkfocusTaskCreateManyOwnerInputEnvelope
    set?: WorkfocusTaskWhereUniqueInput | WorkfocusTaskWhereUniqueInput[]
    disconnect?: WorkfocusTaskWhereUniqueInput | WorkfocusTaskWhereUniqueInput[]
    delete?: WorkfocusTaskWhereUniqueInput | WorkfocusTaskWhereUniqueInput[]
    connect?: WorkfocusTaskWhereUniqueInput | WorkfocusTaskWhereUniqueInput[]
    update?: WorkfocusTaskUpdateWithWhereUniqueWithoutOwnerInput | WorkfocusTaskUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: WorkfocusTaskUpdateManyWithWhereWithoutOwnerInput | WorkfocusTaskUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: WorkfocusTaskScalarWhereInput | WorkfocusTaskScalarWhereInput[]
  }

  export type LearnedMemoryUpdateManyWithoutUserNestedInput = {
    create?: XOR<LearnedMemoryCreateWithoutUserInput, LearnedMemoryUncheckedCreateWithoutUserInput> | LearnedMemoryCreateWithoutUserInput[] | LearnedMemoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LearnedMemoryCreateOrConnectWithoutUserInput | LearnedMemoryCreateOrConnectWithoutUserInput[]
    upsert?: LearnedMemoryUpsertWithWhereUniqueWithoutUserInput | LearnedMemoryUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: LearnedMemoryCreateManyUserInputEnvelope
    set?: LearnedMemoryWhereUniqueInput | LearnedMemoryWhereUniqueInput[]
    disconnect?: LearnedMemoryWhereUniqueInput | LearnedMemoryWhereUniqueInput[]
    delete?: LearnedMemoryWhereUniqueInput | LearnedMemoryWhereUniqueInput[]
    connect?: LearnedMemoryWhereUniqueInput | LearnedMemoryWhereUniqueInput[]
    update?: LearnedMemoryUpdateWithWhereUniqueWithoutUserInput | LearnedMemoryUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: LearnedMemoryUpdateManyWithWhereWithoutUserInput | LearnedMemoryUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: LearnedMemoryScalarWhereInput | LearnedMemoryScalarWhereInput[]
  }

  export type CimsMessageUncheckedUpdateManyWithoutSenderNestedInput = {
    create?: XOR<CimsMessageCreateWithoutSenderInput, CimsMessageUncheckedCreateWithoutSenderInput> | CimsMessageCreateWithoutSenderInput[] | CimsMessageUncheckedCreateWithoutSenderInput[]
    connectOrCreate?: CimsMessageCreateOrConnectWithoutSenderInput | CimsMessageCreateOrConnectWithoutSenderInput[]
    upsert?: CimsMessageUpsertWithWhereUniqueWithoutSenderInput | CimsMessageUpsertWithWhereUniqueWithoutSenderInput[]
    createMany?: CimsMessageCreateManySenderInputEnvelope
    set?: CimsMessageWhereUniqueInput | CimsMessageWhereUniqueInput[]
    disconnect?: CimsMessageWhereUniqueInput | CimsMessageWhereUniqueInput[]
    delete?: CimsMessageWhereUniqueInput | CimsMessageWhereUniqueInput[]
    connect?: CimsMessageWhereUniqueInput | CimsMessageWhereUniqueInput[]
    update?: CimsMessageUpdateWithWhereUniqueWithoutSenderInput | CimsMessageUpdateWithWhereUniqueWithoutSenderInput[]
    updateMany?: CimsMessageUpdateManyWithWhereWithoutSenderInput | CimsMessageUpdateManyWithWhereWithoutSenderInput[]
    deleteMany?: CimsMessageScalarWhereInput | CimsMessageScalarWhereInput[]
  }

  export type WorkfocusTaskUncheckedUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<WorkfocusTaskCreateWithoutOwnerInput, WorkfocusTaskUncheckedCreateWithoutOwnerInput> | WorkfocusTaskCreateWithoutOwnerInput[] | WorkfocusTaskUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: WorkfocusTaskCreateOrConnectWithoutOwnerInput | WorkfocusTaskCreateOrConnectWithoutOwnerInput[]
    upsert?: WorkfocusTaskUpsertWithWhereUniqueWithoutOwnerInput | WorkfocusTaskUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: WorkfocusTaskCreateManyOwnerInputEnvelope
    set?: WorkfocusTaskWhereUniqueInput | WorkfocusTaskWhereUniqueInput[]
    disconnect?: WorkfocusTaskWhereUniqueInput | WorkfocusTaskWhereUniqueInput[]
    delete?: WorkfocusTaskWhereUniqueInput | WorkfocusTaskWhereUniqueInput[]
    connect?: WorkfocusTaskWhereUniqueInput | WorkfocusTaskWhereUniqueInput[]
    update?: WorkfocusTaskUpdateWithWhereUniqueWithoutOwnerInput | WorkfocusTaskUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: WorkfocusTaskUpdateManyWithWhereWithoutOwnerInput | WorkfocusTaskUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: WorkfocusTaskScalarWhereInput | WorkfocusTaskScalarWhereInput[]
  }

  export type LearnedMemoryUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<LearnedMemoryCreateWithoutUserInput, LearnedMemoryUncheckedCreateWithoutUserInput> | LearnedMemoryCreateWithoutUserInput[] | LearnedMemoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LearnedMemoryCreateOrConnectWithoutUserInput | LearnedMemoryCreateOrConnectWithoutUserInput[]
    upsert?: LearnedMemoryUpsertWithWhereUniqueWithoutUserInput | LearnedMemoryUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: LearnedMemoryCreateManyUserInputEnvelope
    set?: LearnedMemoryWhereUniqueInput | LearnedMemoryWhereUniqueInput[]
    disconnect?: LearnedMemoryWhereUniqueInput | LearnedMemoryWhereUniqueInput[]
    delete?: LearnedMemoryWhereUniqueInput | LearnedMemoryWhereUniqueInput[]
    connect?: LearnedMemoryWhereUniqueInput | LearnedMemoryWhereUniqueInput[]
    update?: LearnedMemoryUpdateWithWhereUniqueWithoutUserInput | LearnedMemoryUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: LearnedMemoryUpdateManyWithWhereWithoutUserInput | LearnedMemoryUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: LearnedMemoryScalarWhereInput | LearnedMemoryScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutMessagesInput = {
    create?: XOR<UserCreateWithoutMessagesInput, UserUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: UserCreateOrConnectWithoutMessagesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneWithoutMessagesNestedInput = {
    create?: XOR<UserCreateWithoutMessagesInput, UserUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: UserCreateOrConnectWithoutMessagesInput
    upsert?: UserUpsertWithoutMessagesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMessagesInput, UserUpdateWithoutMessagesInput>, UserUncheckedUpdateWithoutMessagesInput>
  }

  export type UserCreateNestedOneWithoutTasksInput = {
    create?: XOR<UserCreateWithoutTasksInput, UserUncheckedCreateWithoutTasksInput>
    connectOrCreate?: UserCreateOrConnectWithoutTasksInput
    connect?: UserWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneWithoutTasksNestedInput = {
    create?: XOR<UserCreateWithoutTasksInput, UserUncheckedCreateWithoutTasksInput>
    connectOrCreate?: UserCreateOrConnectWithoutTasksInput
    upsert?: UserUpsertWithoutTasksInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTasksInput, UserUpdateWithoutTasksInput>, UserUncheckedUpdateWithoutTasksInput>
  }

  export type MemoryPackCreateNestedManyWithoutVendorInput = {
    create?: XOR<MemoryPackCreateWithoutVendorInput, MemoryPackUncheckedCreateWithoutVendorInput> | MemoryPackCreateWithoutVendorInput[] | MemoryPackUncheckedCreateWithoutVendorInput[]
    connectOrCreate?: MemoryPackCreateOrConnectWithoutVendorInput | MemoryPackCreateOrConnectWithoutVendorInput[]
    createMany?: MemoryPackCreateManyVendorInputEnvelope
    connect?: MemoryPackWhereUniqueInput | MemoryPackWhereUniqueInput[]
  }

  export type MemoryPackUncheckedCreateNestedManyWithoutVendorInput = {
    create?: XOR<MemoryPackCreateWithoutVendorInput, MemoryPackUncheckedCreateWithoutVendorInput> | MemoryPackCreateWithoutVendorInput[] | MemoryPackUncheckedCreateWithoutVendorInput[]
    connectOrCreate?: MemoryPackCreateOrConnectWithoutVendorInput | MemoryPackCreateOrConnectWithoutVendorInput[]
    createMany?: MemoryPackCreateManyVendorInputEnvelope
    connect?: MemoryPackWhereUniqueInput | MemoryPackWhereUniqueInput[]
  }

  export type MemoryPackUpdateManyWithoutVendorNestedInput = {
    create?: XOR<MemoryPackCreateWithoutVendorInput, MemoryPackUncheckedCreateWithoutVendorInput> | MemoryPackCreateWithoutVendorInput[] | MemoryPackUncheckedCreateWithoutVendorInput[]
    connectOrCreate?: MemoryPackCreateOrConnectWithoutVendorInput | MemoryPackCreateOrConnectWithoutVendorInput[]
    upsert?: MemoryPackUpsertWithWhereUniqueWithoutVendorInput | MemoryPackUpsertWithWhereUniqueWithoutVendorInput[]
    createMany?: MemoryPackCreateManyVendorInputEnvelope
    set?: MemoryPackWhereUniqueInput | MemoryPackWhereUniqueInput[]
    disconnect?: MemoryPackWhereUniqueInput | MemoryPackWhereUniqueInput[]
    delete?: MemoryPackWhereUniqueInput | MemoryPackWhereUniqueInput[]
    connect?: MemoryPackWhereUniqueInput | MemoryPackWhereUniqueInput[]
    update?: MemoryPackUpdateWithWhereUniqueWithoutVendorInput | MemoryPackUpdateWithWhereUniqueWithoutVendorInput[]
    updateMany?: MemoryPackUpdateManyWithWhereWithoutVendorInput | MemoryPackUpdateManyWithWhereWithoutVendorInput[]
    deleteMany?: MemoryPackScalarWhereInput | MemoryPackScalarWhereInput[]
  }

  export type MemoryPackUncheckedUpdateManyWithoutVendorNestedInput = {
    create?: XOR<MemoryPackCreateWithoutVendorInput, MemoryPackUncheckedCreateWithoutVendorInput> | MemoryPackCreateWithoutVendorInput[] | MemoryPackUncheckedCreateWithoutVendorInput[]
    connectOrCreate?: MemoryPackCreateOrConnectWithoutVendorInput | MemoryPackCreateOrConnectWithoutVendorInput[]
    upsert?: MemoryPackUpsertWithWhereUniqueWithoutVendorInput | MemoryPackUpsertWithWhereUniqueWithoutVendorInput[]
    createMany?: MemoryPackCreateManyVendorInputEnvelope
    set?: MemoryPackWhereUniqueInput | MemoryPackWhereUniqueInput[]
    disconnect?: MemoryPackWhereUniqueInput | MemoryPackWhereUniqueInput[]
    delete?: MemoryPackWhereUniqueInput | MemoryPackWhereUniqueInput[]
    connect?: MemoryPackWhereUniqueInput | MemoryPackWhereUniqueInput[]
    update?: MemoryPackUpdateWithWhereUniqueWithoutVendorInput | MemoryPackUpdateWithWhereUniqueWithoutVendorInput[]
    updateMany?: MemoryPackUpdateManyWithWhereWithoutVendorInput | MemoryPackUpdateManyWithWhereWithoutVendorInput[]
    deleteMany?: MemoryPackScalarWhereInput | MemoryPackScalarWhereInput[]
  }

  export type MemoryVendorCreateNestedOneWithoutPacksInput = {
    create?: XOR<MemoryVendorCreateWithoutPacksInput, MemoryVendorUncheckedCreateWithoutPacksInput>
    connectOrCreate?: MemoryVendorCreateOrConnectWithoutPacksInput
    connect?: MemoryVendorWhereUniqueInput
  }

  export type MemoryPackItemCreateNestedManyWithoutPackInput = {
    create?: XOR<MemoryPackItemCreateWithoutPackInput, MemoryPackItemUncheckedCreateWithoutPackInput> | MemoryPackItemCreateWithoutPackInput[] | MemoryPackItemUncheckedCreateWithoutPackInput[]
    connectOrCreate?: MemoryPackItemCreateOrConnectWithoutPackInput | MemoryPackItemCreateOrConnectWithoutPackInput[]
    createMany?: MemoryPackItemCreateManyPackInputEnvelope
    connect?: MemoryPackItemWhereUniqueInput | MemoryPackItemWhereUniqueInput[]
  }

  export type MemoryInstallCreateNestedManyWithoutPackInput = {
    create?: XOR<MemoryInstallCreateWithoutPackInput, MemoryInstallUncheckedCreateWithoutPackInput> | MemoryInstallCreateWithoutPackInput[] | MemoryInstallUncheckedCreateWithoutPackInput[]
    connectOrCreate?: MemoryInstallCreateOrConnectWithoutPackInput | MemoryInstallCreateOrConnectWithoutPackInput[]
    createMany?: MemoryInstallCreateManyPackInputEnvelope
    connect?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
  }

  export type MemoryPackItemUncheckedCreateNestedManyWithoutPackInput = {
    create?: XOR<MemoryPackItemCreateWithoutPackInput, MemoryPackItemUncheckedCreateWithoutPackInput> | MemoryPackItemCreateWithoutPackInput[] | MemoryPackItemUncheckedCreateWithoutPackInput[]
    connectOrCreate?: MemoryPackItemCreateOrConnectWithoutPackInput | MemoryPackItemCreateOrConnectWithoutPackInput[]
    createMany?: MemoryPackItemCreateManyPackInputEnvelope
    connect?: MemoryPackItemWhereUniqueInput | MemoryPackItemWhereUniqueInput[]
  }

  export type MemoryInstallUncheckedCreateNestedManyWithoutPackInput = {
    create?: XOR<MemoryInstallCreateWithoutPackInput, MemoryInstallUncheckedCreateWithoutPackInput> | MemoryInstallCreateWithoutPackInput[] | MemoryInstallUncheckedCreateWithoutPackInput[]
    connectOrCreate?: MemoryInstallCreateOrConnectWithoutPackInput | MemoryInstallCreateOrConnectWithoutPackInput[]
    createMany?: MemoryInstallCreateManyPackInputEnvelope
    connect?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
  }

  export type MemoryVendorUpdateOneRequiredWithoutPacksNestedInput = {
    create?: XOR<MemoryVendorCreateWithoutPacksInput, MemoryVendorUncheckedCreateWithoutPacksInput>
    connectOrCreate?: MemoryVendorCreateOrConnectWithoutPacksInput
    upsert?: MemoryVendorUpsertWithoutPacksInput
    connect?: MemoryVendorWhereUniqueInput
    update?: XOR<XOR<MemoryVendorUpdateToOneWithWhereWithoutPacksInput, MemoryVendorUpdateWithoutPacksInput>, MemoryVendorUncheckedUpdateWithoutPacksInput>
  }

  export type MemoryPackItemUpdateManyWithoutPackNestedInput = {
    create?: XOR<MemoryPackItemCreateWithoutPackInput, MemoryPackItemUncheckedCreateWithoutPackInput> | MemoryPackItemCreateWithoutPackInput[] | MemoryPackItemUncheckedCreateWithoutPackInput[]
    connectOrCreate?: MemoryPackItemCreateOrConnectWithoutPackInput | MemoryPackItemCreateOrConnectWithoutPackInput[]
    upsert?: MemoryPackItemUpsertWithWhereUniqueWithoutPackInput | MemoryPackItemUpsertWithWhereUniqueWithoutPackInput[]
    createMany?: MemoryPackItemCreateManyPackInputEnvelope
    set?: MemoryPackItemWhereUniqueInput | MemoryPackItemWhereUniqueInput[]
    disconnect?: MemoryPackItemWhereUniqueInput | MemoryPackItemWhereUniqueInput[]
    delete?: MemoryPackItemWhereUniqueInput | MemoryPackItemWhereUniqueInput[]
    connect?: MemoryPackItemWhereUniqueInput | MemoryPackItemWhereUniqueInput[]
    update?: MemoryPackItemUpdateWithWhereUniqueWithoutPackInput | MemoryPackItemUpdateWithWhereUniqueWithoutPackInput[]
    updateMany?: MemoryPackItemUpdateManyWithWhereWithoutPackInput | MemoryPackItemUpdateManyWithWhereWithoutPackInput[]
    deleteMany?: MemoryPackItemScalarWhereInput | MemoryPackItemScalarWhereInput[]
  }

  export type MemoryInstallUpdateManyWithoutPackNestedInput = {
    create?: XOR<MemoryInstallCreateWithoutPackInput, MemoryInstallUncheckedCreateWithoutPackInput> | MemoryInstallCreateWithoutPackInput[] | MemoryInstallUncheckedCreateWithoutPackInput[]
    connectOrCreate?: MemoryInstallCreateOrConnectWithoutPackInput | MemoryInstallCreateOrConnectWithoutPackInput[]
    upsert?: MemoryInstallUpsertWithWhereUniqueWithoutPackInput | MemoryInstallUpsertWithWhereUniqueWithoutPackInput[]
    createMany?: MemoryInstallCreateManyPackInputEnvelope
    set?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    disconnect?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    delete?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    connect?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    update?: MemoryInstallUpdateWithWhereUniqueWithoutPackInput | MemoryInstallUpdateWithWhereUniqueWithoutPackInput[]
    updateMany?: MemoryInstallUpdateManyWithWhereWithoutPackInput | MemoryInstallUpdateManyWithWhereWithoutPackInput[]
    deleteMany?: MemoryInstallScalarWhereInput | MemoryInstallScalarWhereInput[]
  }

  export type MemoryPackItemUncheckedUpdateManyWithoutPackNestedInput = {
    create?: XOR<MemoryPackItemCreateWithoutPackInput, MemoryPackItemUncheckedCreateWithoutPackInput> | MemoryPackItemCreateWithoutPackInput[] | MemoryPackItemUncheckedCreateWithoutPackInput[]
    connectOrCreate?: MemoryPackItemCreateOrConnectWithoutPackInput | MemoryPackItemCreateOrConnectWithoutPackInput[]
    upsert?: MemoryPackItemUpsertWithWhereUniqueWithoutPackInput | MemoryPackItemUpsertWithWhereUniqueWithoutPackInput[]
    createMany?: MemoryPackItemCreateManyPackInputEnvelope
    set?: MemoryPackItemWhereUniqueInput | MemoryPackItemWhereUniqueInput[]
    disconnect?: MemoryPackItemWhereUniqueInput | MemoryPackItemWhereUniqueInput[]
    delete?: MemoryPackItemWhereUniqueInput | MemoryPackItemWhereUniqueInput[]
    connect?: MemoryPackItemWhereUniqueInput | MemoryPackItemWhereUniqueInput[]
    update?: MemoryPackItemUpdateWithWhereUniqueWithoutPackInput | MemoryPackItemUpdateWithWhereUniqueWithoutPackInput[]
    updateMany?: MemoryPackItemUpdateManyWithWhereWithoutPackInput | MemoryPackItemUpdateManyWithWhereWithoutPackInput[]
    deleteMany?: MemoryPackItemScalarWhereInput | MemoryPackItemScalarWhereInput[]
  }

  export type MemoryInstallUncheckedUpdateManyWithoutPackNestedInput = {
    create?: XOR<MemoryInstallCreateWithoutPackInput, MemoryInstallUncheckedCreateWithoutPackInput> | MemoryInstallCreateWithoutPackInput[] | MemoryInstallUncheckedCreateWithoutPackInput[]
    connectOrCreate?: MemoryInstallCreateOrConnectWithoutPackInput | MemoryInstallCreateOrConnectWithoutPackInput[]
    upsert?: MemoryInstallUpsertWithWhereUniqueWithoutPackInput | MemoryInstallUpsertWithWhereUniqueWithoutPackInput[]
    createMany?: MemoryInstallCreateManyPackInputEnvelope
    set?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    disconnect?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    delete?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    connect?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    update?: MemoryInstallUpdateWithWhereUniqueWithoutPackInput | MemoryInstallUpdateWithWhereUniqueWithoutPackInput[]
    updateMany?: MemoryInstallUpdateManyWithWhereWithoutPackInput | MemoryInstallUpdateManyWithWhereWithoutPackInput[]
    deleteMany?: MemoryInstallScalarWhereInput | MemoryInstallScalarWhereInput[]
  }

  export type MemoryPackCreateNestedOneWithoutItemsInput = {
    create?: XOR<MemoryPackCreateWithoutItemsInput, MemoryPackUncheckedCreateWithoutItemsInput>
    connectOrCreate?: MemoryPackCreateOrConnectWithoutItemsInput
    connect?: MemoryPackWhereUniqueInput
  }

  export type MemoryOverrideCreateNestedManyWithoutPackItemInput = {
    create?: XOR<MemoryOverrideCreateWithoutPackItemInput, MemoryOverrideUncheckedCreateWithoutPackItemInput> | MemoryOverrideCreateWithoutPackItemInput[] | MemoryOverrideUncheckedCreateWithoutPackItemInput[]
    connectOrCreate?: MemoryOverrideCreateOrConnectWithoutPackItemInput | MemoryOverrideCreateOrConnectWithoutPackItemInput[]
    createMany?: MemoryOverrideCreateManyPackItemInputEnvelope
    connect?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
  }

  export type MemoryOverrideUncheckedCreateNestedManyWithoutPackItemInput = {
    create?: XOR<MemoryOverrideCreateWithoutPackItemInput, MemoryOverrideUncheckedCreateWithoutPackItemInput> | MemoryOverrideCreateWithoutPackItemInput[] | MemoryOverrideUncheckedCreateWithoutPackItemInput[]
    connectOrCreate?: MemoryOverrideCreateOrConnectWithoutPackItemInput | MemoryOverrideCreateOrConnectWithoutPackItemInput[]
    createMany?: MemoryOverrideCreateManyPackItemInputEnvelope
    connect?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
  }

  export type MemoryPackUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<MemoryPackCreateWithoutItemsInput, MemoryPackUncheckedCreateWithoutItemsInput>
    connectOrCreate?: MemoryPackCreateOrConnectWithoutItemsInput
    upsert?: MemoryPackUpsertWithoutItemsInput
    connect?: MemoryPackWhereUniqueInput
    update?: XOR<XOR<MemoryPackUpdateToOneWithWhereWithoutItemsInput, MemoryPackUpdateWithoutItemsInput>, MemoryPackUncheckedUpdateWithoutItemsInput>
  }

  export type MemoryOverrideUpdateManyWithoutPackItemNestedInput = {
    create?: XOR<MemoryOverrideCreateWithoutPackItemInput, MemoryOverrideUncheckedCreateWithoutPackItemInput> | MemoryOverrideCreateWithoutPackItemInput[] | MemoryOverrideUncheckedCreateWithoutPackItemInput[]
    connectOrCreate?: MemoryOverrideCreateOrConnectWithoutPackItemInput | MemoryOverrideCreateOrConnectWithoutPackItemInput[]
    upsert?: MemoryOverrideUpsertWithWhereUniqueWithoutPackItemInput | MemoryOverrideUpsertWithWhereUniqueWithoutPackItemInput[]
    createMany?: MemoryOverrideCreateManyPackItemInputEnvelope
    set?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    disconnect?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    delete?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    connect?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    update?: MemoryOverrideUpdateWithWhereUniqueWithoutPackItemInput | MemoryOverrideUpdateWithWhereUniqueWithoutPackItemInput[]
    updateMany?: MemoryOverrideUpdateManyWithWhereWithoutPackItemInput | MemoryOverrideUpdateManyWithWhereWithoutPackItemInput[]
    deleteMany?: MemoryOverrideScalarWhereInput | MemoryOverrideScalarWhereInput[]
  }

  export type MemoryOverrideUncheckedUpdateManyWithoutPackItemNestedInput = {
    create?: XOR<MemoryOverrideCreateWithoutPackItemInput, MemoryOverrideUncheckedCreateWithoutPackItemInput> | MemoryOverrideCreateWithoutPackItemInput[] | MemoryOverrideUncheckedCreateWithoutPackItemInput[]
    connectOrCreate?: MemoryOverrideCreateOrConnectWithoutPackItemInput | MemoryOverrideCreateOrConnectWithoutPackItemInput[]
    upsert?: MemoryOverrideUpsertWithWhereUniqueWithoutPackItemInput | MemoryOverrideUpsertWithWhereUniqueWithoutPackItemInput[]
    createMany?: MemoryOverrideCreateManyPackItemInputEnvelope
    set?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    disconnect?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    delete?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    connect?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    update?: MemoryOverrideUpdateWithWhereUniqueWithoutPackItemInput | MemoryOverrideUpdateWithWhereUniqueWithoutPackItemInput[]
    updateMany?: MemoryOverrideUpdateManyWithWhereWithoutPackItemInput | MemoryOverrideUpdateManyWithWhereWithoutPackItemInput[]
    deleteMany?: MemoryOverrideScalarWhereInput | MemoryOverrideScalarWhereInput[]
  }

  export type MemoryInstallCreateNestedManyWithoutTenantInput = {
    create?: XOR<MemoryInstallCreateWithoutTenantInput, MemoryInstallUncheckedCreateWithoutTenantInput> | MemoryInstallCreateWithoutTenantInput[] | MemoryInstallUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: MemoryInstallCreateOrConnectWithoutTenantInput | MemoryInstallCreateOrConnectWithoutTenantInput[]
    createMany?: MemoryInstallCreateManyTenantInputEnvelope
    connect?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
  }

  export type MemoryOverrideCreateNestedManyWithoutTenantInput = {
    create?: XOR<MemoryOverrideCreateWithoutTenantInput, MemoryOverrideUncheckedCreateWithoutTenantInput> | MemoryOverrideCreateWithoutTenantInput[] | MemoryOverrideUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: MemoryOverrideCreateOrConnectWithoutTenantInput | MemoryOverrideCreateOrConnectWithoutTenantInput[]
    createMany?: MemoryOverrideCreateManyTenantInputEnvelope
    connect?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
  }

  export type MemoryInstallUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<MemoryInstallCreateWithoutTenantInput, MemoryInstallUncheckedCreateWithoutTenantInput> | MemoryInstallCreateWithoutTenantInput[] | MemoryInstallUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: MemoryInstallCreateOrConnectWithoutTenantInput | MemoryInstallCreateOrConnectWithoutTenantInput[]
    createMany?: MemoryInstallCreateManyTenantInputEnvelope
    connect?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
  }

  export type MemoryOverrideUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<MemoryOverrideCreateWithoutTenantInput, MemoryOverrideUncheckedCreateWithoutTenantInput> | MemoryOverrideCreateWithoutTenantInput[] | MemoryOverrideUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: MemoryOverrideCreateOrConnectWithoutTenantInput | MemoryOverrideCreateOrConnectWithoutTenantInput[]
    createMany?: MemoryOverrideCreateManyTenantInputEnvelope
    connect?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
  }

  export type MemoryInstallUpdateManyWithoutTenantNestedInput = {
    create?: XOR<MemoryInstallCreateWithoutTenantInput, MemoryInstallUncheckedCreateWithoutTenantInput> | MemoryInstallCreateWithoutTenantInput[] | MemoryInstallUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: MemoryInstallCreateOrConnectWithoutTenantInput | MemoryInstallCreateOrConnectWithoutTenantInput[]
    upsert?: MemoryInstallUpsertWithWhereUniqueWithoutTenantInput | MemoryInstallUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: MemoryInstallCreateManyTenantInputEnvelope
    set?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    disconnect?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    delete?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    connect?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    update?: MemoryInstallUpdateWithWhereUniqueWithoutTenantInput | MemoryInstallUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: MemoryInstallUpdateManyWithWhereWithoutTenantInput | MemoryInstallUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: MemoryInstallScalarWhereInput | MemoryInstallScalarWhereInput[]
  }

  export type MemoryOverrideUpdateManyWithoutTenantNestedInput = {
    create?: XOR<MemoryOverrideCreateWithoutTenantInput, MemoryOverrideUncheckedCreateWithoutTenantInput> | MemoryOverrideCreateWithoutTenantInput[] | MemoryOverrideUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: MemoryOverrideCreateOrConnectWithoutTenantInput | MemoryOverrideCreateOrConnectWithoutTenantInput[]
    upsert?: MemoryOverrideUpsertWithWhereUniqueWithoutTenantInput | MemoryOverrideUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: MemoryOverrideCreateManyTenantInputEnvelope
    set?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    disconnect?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    delete?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    connect?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    update?: MemoryOverrideUpdateWithWhereUniqueWithoutTenantInput | MemoryOverrideUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: MemoryOverrideUpdateManyWithWhereWithoutTenantInput | MemoryOverrideUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: MemoryOverrideScalarWhereInput | MemoryOverrideScalarWhereInput[]
  }

  export type MemoryInstallUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<MemoryInstallCreateWithoutTenantInput, MemoryInstallUncheckedCreateWithoutTenantInput> | MemoryInstallCreateWithoutTenantInput[] | MemoryInstallUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: MemoryInstallCreateOrConnectWithoutTenantInput | MemoryInstallCreateOrConnectWithoutTenantInput[]
    upsert?: MemoryInstallUpsertWithWhereUniqueWithoutTenantInput | MemoryInstallUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: MemoryInstallCreateManyTenantInputEnvelope
    set?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    disconnect?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    delete?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    connect?: MemoryInstallWhereUniqueInput | MemoryInstallWhereUniqueInput[]
    update?: MemoryInstallUpdateWithWhereUniqueWithoutTenantInput | MemoryInstallUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: MemoryInstallUpdateManyWithWhereWithoutTenantInput | MemoryInstallUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: MemoryInstallScalarWhereInput | MemoryInstallScalarWhereInput[]
  }

  export type MemoryOverrideUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<MemoryOverrideCreateWithoutTenantInput, MemoryOverrideUncheckedCreateWithoutTenantInput> | MemoryOverrideCreateWithoutTenantInput[] | MemoryOverrideUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: MemoryOverrideCreateOrConnectWithoutTenantInput | MemoryOverrideCreateOrConnectWithoutTenantInput[]
    upsert?: MemoryOverrideUpsertWithWhereUniqueWithoutTenantInput | MemoryOverrideUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: MemoryOverrideCreateManyTenantInputEnvelope
    set?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    disconnect?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    delete?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    connect?: MemoryOverrideWhereUniqueInput | MemoryOverrideWhereUniqueInput[]
    update?: MemoryOverrideUpdateWithWhereUniqueWithoutTenantInput | MemoryOverrideUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: MemoryOverrideUpdateManyWithWhereWithoutTenantInput | MemoryOverrideUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: MemoryOverrideScalarWhereInput | MemoryOverrideScalarWhereInput[]
  }

  export type MemoryTenantCreateNestedOneWithoutInstallsInput = {
    create?: XOR<MemoryTenantCreateWithoutInstallsInput, MemoryTenantUncheckedCreateWithoutInstallsInput>
    connectOrCreate?: MemoryTenantCreateOrConnectWithoutInstallsInput
    connect?: MemoryTenantWhereUniqueInput
  }

  export type MemoryPackCreateNestedOneWithoutInstallsInput = {
    create?: XOR<MemoryPackCreateWithoutInstallsInput, MemoryPackUncheckedCreateWithoutInstallsInput>
    connectOrCreate?: MemoryPackCreateOrConnectWithoutInstallsInput
    connect?: MemoryPackWhereUniqueInput
  }

  export type MemoryTenantUpdateOneRequiredWithoutInstallsNestedInput = {
    create?: XOR<MemoryTenantCreateWithoutInstallsInput, MemoryTenantUncheckedCreateWithoutInstallsInput>
    connectOrCreate?: MemoryTenantCreateOrConnectWithoutInstallsInput
    upsert?: MemoryTenantUpsertWithoutInstallsInput
    connect?: MemoryTenantWhereUniqueInput
    update?: XOR<XOR<MemoryTenantUpdateToOneWithWhereWithoutInstallsInput, MemoryTenantUpdateWithoutInstallsInput>, MemoryTenantUncheckedUpdateWithoutInstallsInput>
  }

  export type MemoryPackUpdateOneRequiredWithoutInstallsNestedInput = {
    create?: XOR<MemoryPackCreateWithoutInstallsInput, MemoryPackUncheckedCreateWithoutInstallsInput>
    connectOrCreate?: MemoryPackCreateOrConnectWithoutInstallsInput
    upsert?: MemoryPackUpsertWithoutInstallsInput
    connect?: MemoryPackWhereUniqueInput
    update?: XOR<XOR<MemoryPackUpdateToOneWithWhereWithoutInstallsInput, MemoryPackUpdateWithoutInstallsInput>, MemoryPackUncheckedUpdateWithoutInstallsInput>
  }

  export type MemoryTenantCreateNestedOneWithoutOverridesInput = {
    create?: XOR<MemoryTenantCreateWithoutOverridesInput, MemoryTenantUncheckedCreateWithoutOverridesInput>
    connectOrCreate?: MemoryTenantCreateOrConnectWithoutOverridesInput
    connect?: MemoryTenantWhereUniqueInput
  }

  export type MemoryPackItemCreateNestedOneWithoutOverridesInput = {
    create?: XOR<MemoryPackItemCreateWithoutOverridesInput, MemoryPackItemUncheckedCreateWithoutOverridesInput>
    connectOrCreate?: MemoryPackItemCreateOrConnectWithoutOverridesInput
    connect?: MemoryPackItemWhereUniqueInput
  }

  export type MemoryTenantUpdateOneRequiredWithoutOverridesNestedInput = {
    create?: XOR<MemoryTenantCreateWithoutOverridesInput, MemoryTenantUncheckedCreateWithoutOverridesInput>
    connectOrCreate?: MemoryTenantCreateOrConnectWithoutOverridesInput
    upsert?: MemoryTenantUpsertWithoutOverridesInput
    connect?: MemoryTenantWhereUniqueInput
    update?: XOR<XOR<MemoryTenantUpdateToOneWithWhereWithoutOverridesInput, MemoryTenantUpdateWithoutOverridesInput>, MemoryTenantUncheckedUpdateWithoutOverridesInput>
  }

  export type MemoryPackItemUpdateOneRequiredWithoutOverridesNestedInput = {
    create?: XOR<MemoryPackItemCreateWithoutOverridesInput, MemoryPackItemUncheckedCreateWithoutOverridesInput>
    connectOrCreate?: MemoryPackItemCreateOrConnectWithoutOverridesInput
    upsert?: MemoryPackItemUpsertWithoutOverridesInput
    connect?: MemoryPackItemWhereUniqueInput
    update?: XOR<XOR<MemoryPackItemUpdateToOneWithWhereWithoutOverridesInput, MemoryPackItemUpdateWithoutOverridesInput>, MemoryPackItemUncheckedUpdateWithoutOverridesInput>
  }

  export type UserCreateNestedOneWithoutLearnedMemoriesInput = {
    create?: XOR<UserCreateWithoutLearnedMemoriesInput, UserUncheckedCreateWithoutLearnedMemoriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutLearnedMemoriesInput
    connect?: UserWhereUniqueInput
  }

  export type EnumMemoryKindFieldUpdateOperationsInput = {
    set?: $Enums.MemoryKind
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneWithoutLearnedMemoriesNestedInput = {
    create?: XOR<UserCreateWithoutLearnedMemoriesInput, UserUncheckedCreateWithoutLearnedMemoriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutLearnedMemoriesInput
    upsert?: UserUpsertWithoutLearnedMemoriesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutLearnedMemoriesInput, UserUpdateWithoutLearnedMemoriesInput>, UserUncheckedUpdateWithoutLearnedMemoriesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumMemoryKindFilter<$PrismaModel = never> = {
    equals?: $Enums.MemoryKind | EnumMemoryKindFieldRefInput<$PrismaModel>
    in?: $Enums.MemoryKind[]
    notIn?: $Enums.MemoryKind[]
    not?: NestedEnumMemoryKindFilter<$PrismaModel> | $Enums.MemoryKind
  }

  export type NestedEnumMemoryKindWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MemoryKind | EnumMemoryKindFieldRefInput<$PrismaModel>
    in?: $Enums.MemoryKind[]
    notIn?: $Enums.MemoryKind[]
    not?: NestedEnumMemoryKindWithAggregatesFilter<$PrismaModel> | $Enums.MemoryKind
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMemoryKindFilter<$PrismaModel>
    _max?: NestedEnumMemoryKindFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type CimsMessageCreateWithoutSenderInput = {
    id?: string
    threadId?: string | null
    channel: string
    direction: string
    body?: string | null
    mediaUrl?: string | null
    meta: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type CimsMessageUncheckedCreateWithoutSenderInput = {
    id?: string
    threadId?: string | null
    channel: string
    direction: string
    body?: string | null
    mediaUrl?: string | null
    meta: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type CimsMessageCreateOrConnectWithoutSenderInput = {
    where: CimsMessageWhereUniqueInput
    create: XOR<CimsMessageCreateWithoutSenderInput, CimsMessageUncheckedCreateWithoutSenderInput>
  }

  export type CimsMessageCreateManySenderInputEnvelope = {
    data: CimsMessageCreateManySenderInput | CimsMessageCreateManySenderInput[]
  }

  export type WorkfocusTaskCreateWithoutOwnerInput = {
    id?: string
    bucket: string
    title: string
    status?: string
    dueAt?: Date | string | null
    meta: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WorkfocusTaskUncheckedCreateWithoutOwnerInput = {
    id?: string
    bucket: string
    title: string
    status?: string
    dueAt?: Date | string | null
    meta: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WorkfocusTaskCreateOrConnectWithoutOwnerInput = {
    where: WorkfocusTaskWhereUniqueInput
    create: XOR<WorkfocusTaskCreateWithoutOwnerInput, WorkfocusTaskUncheckedCreateWithoutOwnerInput>
  }

  export type WorkfocusTaskCreateManyOwnerInputEnvelope = {
    data: WorkfocusTaskCreateManyOwnerInput | WorkfocusTaskCreateManyOwnerInput[]
  }

  export type LearnedMemoryCreateWithoutUserInput = {
    id?: string
    tenantId: string
    kind: $Enums.MemoryKind
    subject?: string | null
    content: string
    tags?: string | null
    importance?: number
    source?: string | null
    createdAt?: Date | string
    lastUsedAt?: Date | string | null
    expireAt?: Date | string | null
  }

  export type LearnedMemoryUncheckedCreateWithoutUserInput = {
    id?: string
    tenantId: string
    kind: $Enums.MemoryKind
    subject?: string | null
    content: string
    tags?: string | null
    importance?: number
    source?: string | null
    createdAt?: Date | string
    lastUsedAt?: Date | string | null
    expireAt?: Date | string | null
  }

  export type LearnedMemoryCreateOrConnectWithoutUserInput = {
    where: LearnedMemoryWhereUniqueInput
    create: XOR<LearnedMemoryCreateWithoutUserInput, LearnedMemoryUncheckedCreateWithoutUserInput>
  }

  export type LearnedMemoryCreateManyUserInputEnvelope = {
    data: LearnedMemoryCreateManyUserInput | LearnedMemoryCreateManyUserInput[]
  }

  export type CimsMessageUpsertWithWhereUniqueWithoutSenderInput = {
    where: CimsMessageWhereUniqueInput
    update: XOR<CimsMessageUpdateWithoutSenderInput, CimsMessageUncheckedUpdateWithoutSenderInput>
    create: XOR<CimsMessageCreateWithoutSenderInput, CimsMessageUncheckedCreateWithoutSenderInput>
  }

  export type CimsMessageUpdateWithWhereUniqueWithoutSenderInput = {
    where: CimsMessageWhereUniqueInput
    data: XOR<CimsMessageUpdateWithoutSenderInput, CimsMessageUncheckedUpdateWithoutSenderInput>
  }

  export type CimsMessageUpdateManyWithWhereWithoutSenderInput = {
    where: CimsMessageScalarWhereInput
    data: XOR<CimsMessageUpdateManyMutationInput, CimsMessageUncheckedUpdateManyWithoutSenderInput>
  }

  export type CimsMessageScalarWhereInput = {
    AND?: CimsMessageScalarWhereInput | CimsMessageScalarWhereInput[]
    OR?: CimsMessageScalarWhereInput[]
    NOT?: CimsMessageScalarWhereInput | CimsMessageScalarWhereInput[]
    id?: StringFilter<"CimsMessage"> | string
    threadId?: StringNullableFilter<"CimsMessage"> | string | null
    channel?: StringFilter<"CimsMessage"> | string
    direction?: StringFilter<"CimsMessage"> | string
    body?: StringNullableFilter<"CimsMessage"> | string | null
    mediaUrl?: StringNullableFilter<"CimsMessage"> | string | null
    meta?: JsonFilter<"CimsMessage">
    createdAt?: DateTimeFilter<"CimsMessage"> | Date | string
    senderUserId?: StringNullableFilter<"CimsMessage"> | string | null
  }

  export type WorkfocusTaskUpsertWithWhereUniqueWithoutOwnerInput = {
    where: WorkfocusTaskWhereUniqueInput
    update: XOR<WorkfocusTaskUpdateWithoutOwnerInput, WorkfocusTaskUncheckedUpdateWithoutOwnerInput>
    create: XOR<WorkfocusTaskCreateWithoutOwnerInput, WorkfocusTaskUncheckedCreateWithoutOwnerInput>
  }

  export type WorkfocusTaskUpdateWithWhereUniqueWithoutOwnerInput = {
    where: WorkfocusTaskWhereUniqueInput
    data: XOR<WorkfocusTaskUpdateWithoutOwnerInput, WorkfocusTaskUncheckedUpdateWithoutOwnerInput>
  }

  export type WorkfocusTaskUpdateManyWithWhereWithoutOwnerInput = {
    where: WorkfocusTaskScalarWhereInput
    data: XOR<WorkfocusTaskUpdateManyMutationInput, WorkfocusTaskUncheckedUpdateManyWithoutOwnerInput>
  }

  export type WorkfocusTaskScalarWhereInput = {
    AND?: WorkfocusTaskScalarWhereInput | WorkfocusTaskScalarWhereInput[]
    OR?: WorkfocusTaskScalarWhereInput[]
    NOT?: WorkfocusTaskScalarWhereInput | WorkfocusTaskScalarWhereInput[]
    id?: StringFilter<"WorkfocusTask"> | string
    ownerUserId?: StringNullableFilter<"WorkfocusTask"> | string | null
    bucket?: StringFilter<"WorkfocusTask"> | string
    title?: StringFilter<"WorkfocusTask"> | string
    status?: StringFilter<"WorkfocusTask"> | string
    dueAt?: DateTimeNullableFilter<"WorkfocusTask"> | Date | string | null
    meta?: JsonFilter<"WorkfocusTask">
    createdAt?: DateTimeFilter<"WorkfocusTask"> | Date | string
    updatedAt?: DateTimeFilter<"WorkfocusTask"> | Date | string
  }

  export type LearnedMemoryUpsertWithWhereUniqueWithoutUserInput = {
    where: LearnedMemoryWhereUniqueInput
    update: XOR<LearnedMemoryUpdateWithoutUserInput, LearnedMemoryUncheckedUpdateWithoutUserInput>
    create: XOR<LearnedMemoryCreateWithoutUserInput, LearnedMemoryUncheckedCreateWithoutUserInput>
  }

  export type LearnedMemoryUpdateWithWhereUniqueWithoutUserInput = {
    where: LearnedMemoryWhereUniqueInput
    data: XOR<LearnedMemoryUpdateWithoutUserInput, LearnedMemoryUncheckedUpdateWithoutUserInput>
  }

  export type LearnedMemoryUpdateManyWithWhereWithoutUserInput = {
    where: LearnedMemoryScalarWhereInput
    data: XOR<LearnedMemoryUpdateManyMutationInput, LearnedMemoryUncheckedUpdateManyWithoutUserInput>
  }

  export type LearnedMemoryScalarWhereInput = {
    AND?: LearnedMemoryScalarWhereInput | LearnedMemoryScalarWhereInput[]
    OR?: LearnedMemoryScalarWhereInput[]
    NOT?: LearnedMemoryScalarWhereInput | LearnedMemoryScalarWhereInput[]
    id?: StringFilter<"LearnedMemory"> | string
    tenantId?: StringFilter<"LearnedMemory"> | string
    userId?: StringNullableFilter<"LearnedMemory"> | string | null
    kind?: EnumMemoryKindFilter<"LearnedMemory"> | $Enums.MemoryKind
    subject?: StringNullableFilter<"LearnedMemory"> | string | null
    content?: StringFilter<"LearnedMemory"> | string
    tags?: StringNullableFilter<"LearnedMemory"> | string | null
    importance?: IntFilter<"LearnedMemory"> | number
    source?: StringNullableFilter<"LearnedMemory"> | string | null
    createdAt?: DateTimeFilter<"LearnedMemory"> | Date | string
    lastUsedAt?: DateTimeNullableFilter<"LearnedMemory"> | Date | string | null
    expireAt?: DateTimeNullableFilter<"LearnedMemory"> | Date | string | null
  }

  export type UserCreateWithoutMessagesInput = {
    id?: string
    email: string
    displayName?: string | null
    role?: string
    createdAt?: Date | string
    tasks?: WorkfocusTaskCreateNestedManyWithoutOwnerInput
    learnedMemories?: LearnedMemoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMessagesInput = {
    id?: string
    email: string
    displayName?: string | null
    role?: string
    createdAt?: Date | string
    tasks?: WorkfocusTaskUncheckedCreateNestedManyWithoutOwnerInput
    learnedMemories?: LearnedMemoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMessagesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMessagesInput, UserUncheckedCreateWithoutMessagesInput>
  }

  export type UserUpsertWithoutMessagesInput = {
    update: XOR<UserUpdateWithoutMessagesInput, UserUncheckedUpdateWithoutMessagesInput>
    create: XOR<UserCreateWithoutMessagesInput, UserUncheckedCreateWithoutMessagesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMessagesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMessagesInput, UserUncheckedUpdateWithoutMessagesInput>
  }

  export type UserUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: WorkfocusTaskUpdateManyWithoutOwnerNestedInput
    learnedMemories?: LearnedMemoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: WorkfocusTaskUncheckedUpdateManyWithoutOwnerNestedInput
    learnedMemories?: LearnedMemoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutTasksInput = {
    id?: string
    email: string
    displayName?: string | null
    role?: string
    createdAt?: Date | string
    messages?: CimsMessageCreateNestedManyWithoutSenderInput
    learnedMemories?: LearnedMemoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTasksInput = {
    id?: string
    email: string
    displayName?: string | null
    role?: string
    createdAt?: Date | string
    messages?: CimsMessageUncheckedCreateNestedManyWithoutSenderInput
    learnedMemories?: LearnedMemoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTasksInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTasksInput, UserUncheckedCreateWithoutTasksInput>
  }

  export type UserUpsertWithoutTasksInput = {
    update: XOR<UserUpdateWithoutTasksInput, UserUncheckedUpdateWithoutTasksInput>
    create: XOR<UserCreateWithoutTasksInput, UserUncheckedCreateWithoutTasksInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTasksInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTasksInput, UserUncheckedUpdateWithoutTasksInput>
  }

  export type UserUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: CimsMessageUpdateManyWithoutSenderNestedInput
    learnedMemories?: LearnedMemoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: CimsMessageUncheckedUpdateManyWithoutSenderNestedInput
    learnedMemories?: LearnedMemoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type MemoryPackCreateWithoutVendorInput = {
    id?: string
    slug: string
    version: string
    title: string
    notes?: string | null
    signature?: string | null
    createdAt?: Date | string
    items?: MemoryPackItemCreateNestedManyWithoutPackInput
    installs?: MemoryInstallCreateNestedManyWithoutPackInput
  }

  export type MemoryPackUncheckedCreateWithoutVendorInput = {
    id?: string
    slug: string
    version: string
    title: string
    notes?: string | null
    signature?: string | null
    createdAt?: Date | string
    items?: MemoryPackItemUncheckedCreateNestedManyWithoutPackInput
    installs?: MemoryInstallUncheckedCreateNestedManyWithoutPackInput
  }

  export type MemoryPackCreateOrConnectWithoutVendorInput = {
    where: MemoryPackWhereUniqueInput
    create: XOR<MemoryPackCreateWithoutVendorInput, MemoryPackUncheckedCreateWithoutVendorInput>
  }

  export type MemoryPackCreateManyVendorInputEnvelope = {
    data: MemoryPackCreateManyVendorInput | MemoryPackCreateManyVendorInput[]
  }

  export type MemoryPackUpsertWithWhereUniqueWithoutVendorInput = {
    where: MemoryPackWhereUniqueInput
    update: XOR<MemoryPackUpdateWithoutVendorInput, MemoryPackUncheckedUpdateWithoutVendorInput>
    create: XOR<MemoryPackCreateWithoutVendorInput, MemoryPackUncheckedCreateWithoutVendorInput>
  }

  export type MemoryPackUpdateWithWhereUniqueWithoutVendorInput = {
    where: MemoryPackWhereUniqueInput
    data: XOR<MemoryPackUpdateWithoutVendorInput, MemoryPackUncheckedUpdateWithoutVendorInput>
  }

  export type MemoryPackUpdateManyWithWhereWithoutVendorInput = {
    where: MemoryPackScalarWhereInput
    data: XOR<MemoryPackUpdateManyMutationInput, MemoryPackUncheckedUpdateManyWithoutVendorInput>
  }

  export type MemoryPackScalarWhereInput = {
    AND?: MemoryPackScalarWhereInput | MemoryPackScalarWhereInput[]
    OR?: MemoryPackScalarWhereInput[]
    NOT?: MemoryPackScalarWhereInput | MemoryPackScalarWhereInput[]
    id?: StringFilter<"MemoryPack"> | string
    vendorId?: StringFilter<"MemoryPack"> | string
    slug?: StringFilter<"MemoryPack"> | string
    version?: StringFilter<"MemoryPack"> | string
    title?: StringFilter<"MemoryPack"> | string
    notes?: StringNullableFilter<"MemoryPack"> | string | null
    signature?: StringNullableFilter<"MemoryPack"> | string | null
    createdAt?: DateTimeFilter<"MemoryPack"> | Date | string
  }

  export type MemoryVendorCreateWithoutPacksInput = {
    id?: string
    name: string
    website?: string | null
    createdAt?: Date | string
  }

  export type MemoryVendorUncheckedCreateWithoutPacksInput = {
    id?: string
    name: string
    website?: string | null
    createdAt?: Date | string
  }

  export type MemoryVendorCreateOrConnectWithoutPacksInput = {
    where: MemoryVendorWhereUniqueInput
    create: XOR<MemoryVendorCreateWithoutPacksInput, MemoryVendorUncheckedCreateWithoutPacksInput>
  }

  export type MemoryPackItemCreateWithoutPackInput = {
    id?: string
    kind: string
    subject?: string | null
    content: string
    tags?: string | null
    createdAt?: Date | string
    overrides?: MemoryOverrideCreateNestedManyWithoutPackItemInput
  }

  export type MemoryPackItemUncheckedCreateWithoutPackInput = {
    id?: string
    kind: string
    subject?: string | null
    content: string
    tags?: string | null
    createdAt?: Date | string
    overrides?: MemoryOverrideUncheckedCreateNestedManyWithoutPackItemInput
  }

  export type MemoryPackItemCreateOrConnectWithoutPackInput = {
    where: MemoryPackItemWhereUniqueInput
    create: XOR<MemoryPackItemCreateWithoutPackInput, MemoryPackItemUncheckedCreateWithoutPackInput>
  }

  export type MemoryPackItemCreateManyPackInputEnvelope = {
    data: MemoryPackItemCreateManyPackInput | MemoryPackItemCreateManyPackInput[]
  }

  export type MemoryInstallCreateWithoutPackInput = {
    id?: string
    installedAt?: Date | string
    tenant: MemoryTenantCreateNestedOneWithoutInstallsInput
  }

  export type MemoryInstallUncheckedCreateWithoutPackInput = {
    id?: string
    tenantId: string
    installedAt?: Date | string
  }

  export type MemoryInstallCreateOrConnectWithoutPackInput = {
    where: MemoryInstallWhereUniqueInput
    create: XOR<MemoryInstallCreateWithoutPackInput, MemoryInstallUncheckedCreateWithoutPackInput>
  }

  export type MemoryInstallCreateManyPackInputEnvelope = {
    data: MemoryInstallCreateManyPackInput | MemoryInstallCreateManyPackInput[]
  }

  export type MemoryVendorUpsertWithoutPacksInput = {
    update: XOR<MemoryVendorUpdateWithoutPacksInput, MemoryVendorUncheckedUpdateWithoutPacksInput>
    create: XOR<MemoryVendorCreateWithoutPacksInput, MemoryVendorUncheckedCreateWithoutPacksInput>
    where?: MemoryVendorWhereInput
  }

  export type MemoryVendorUpdateToOneWithWhereWithoutPacksInput = {
    where?: MemoryVendorWhereInput
    data: XOR<MemoryVendorUpdateWithoutPacksInput, MemoryVendorUncheckedUpdateWithoutPacksInput>
  }

  export type MemoryVendorUpdateWithoutPacksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    website?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryVendorUncheckedUpdateWithoutPacksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    website?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryPackItemUpsertWithWhereUniqueWithoutPackInput = {
    where: MemoryPackItemWhereUniqueInput
    update: XOR<MemoryPackItemUpdateWithoutPackInput, MemoryPackItemUncheckedUpdateWithoutPackInput>
    create: XOR<MemoryPackItemCreateWithoutPackInput, MemoryPackItemUncheckedCreateWithoutPackInput>
  }

  export type MemoryPackItemUpdateWithWhereUniqueWithoutPackInput = {
    where: MemoryPackItemWhereUniqueInput
    data: XOR<MemoryPackItemUpdateWithoutPackInput, MemoryPackItemUncheckedUpdateWithoutPackInput>
  }

  export type MemoryPackItemUpdateManyWithWhereWithoutPackInput = {
    where: MemoryPackItemScalarWhereInput
    data: XOR<MemoryPackItemUpdateManyMutationInput, MemoryPackItemUncheckedUpdateManyWithoutPackInput>
  }

  export type MemoryPackItemScalarWhereInput = {
    AND?: MemoryPackItemScalarWhereInput | MemoryPackItemScalarWhereInput[]
    OR?: MemoryPackItemScalarWhereInput[]
    NOT?: MemoryPackItemScalarWhereInput | MemoryPackItemScalarWhereInput[]
    id?: StringFilter<"MemoryPackItem"> | string
    packId?: StringFilter<"MemoryPackItem"> | string
    kind?: StringFilter<"MemoryPackItem"> | string
    subject?: StringNullableFilter<"MemoryPackItem"> | string | null
    content?: StringFilter<"MemoryPackItem"> | string
    tags?: StringNullableFilter<"MemoryPackItem"> | string | null
    createdAt?: DateTimeFilter<"MemoryPackItem"> | Date | string
  }

  export type MemoryInstallUpsertWithWhereUniqueWithoutPackInput = {
    where: MemoryInstallWhereUniqueInput
    update: XOR<MemoryInstallUpdateWithoutPackInput, MemoryInstallUncheckedUpdateWithoutPackInput>
    create: XOR<MemoryInstallCreateWithoutPackInput, MemoryInstallUncheckedCreateWithoutPackInput>
  }

  export type MemoryInstallUpdateWithWhereUniqueWithoutPackInput = {
    where: MemoryInstallWhereUniqueInput
    data: XOR<MemoryInstallUpdateWithoutPackInput, MemoryInstallUncheckedUpdateWithoutPackInput>
  }

  export type MemoryInstallUpdateManyWithWhereWithoutPackInput = {
    where: MemoryInstallScalarWhereInput
    data: XOR<MemoryInstallUpdateManyMutationInput, MemoryInstallUncheckedUpdateManyWithoutPackInput>
  }

  export type MemoryInstallScalarWhereInput = {
    AND?: MemoryInstallScalarWhereInput | MemoryInstallScalarWhereInput[]
    OR?: MemoryInstallScalarWhereInput[]
    NOT?: MemoryInstallScalarWhereInput | MemoryInstallScalarWhereInput[]
    id?: StringFilter<"MemoryInstall"> | string
    tenantId?: StringFilter<"MemoryInstall"> | string
    packId?: StringFilter<"MemoryInstall"> | string
    installedAt?: DateTimeFilter<"MemoryInstall"> | Date | string
  }

  export type MemoryPackCreateWithoutItemsInput = {
    id?: string
    slug: string
    version: string
    title: string
    notes?: string | null
    signature?: string | null
    createdAt?: Date | string
    vendor: MemoryVendorCreateNestedOneWithoutPacksInput
    installs?: MemoryInstallCreateNestedManyWithoutPackInput
  }

  export type MemoryPackUncheckedCreateWithoutItemsInput = {
    id?: string
    vendorId: string
    slug: string
    version: string
    title: string
    notes?: string | null
    signature?: string | null
    createdAt?: Date | string
    installs?: MemoryInstallUncheckedCreateNestedManyWithoutPackInput
  }

  export type MemoryPackCreateOrConnectWithoutItemsInput = {
    where: MemoryPackWhereUniqueInput
    create: XOR<MemoryPackCreateWithoutItemsInput, MemoryPackUncheckedCreateWithoutItemsInput>
  }

  export type MemoryOverrideCreateWithoutPackItemInput = {
    id?: string
    content: string
    tags?: string | null
    createdAt?: Date | string
    tenant: MemoryTenantCreateNestedOneWithoutOverridesInput
  }

  export type MemoryOverrideUncheckedCreateWithoutPackItemInput = {
    id?: string
    tenantId: string
    content: string
    tags?: string | null
    createdAt?: Date | string
  }

  export type MemoryOverrideCreateOrConnectWithoutPackItemInput = {
    where: MemoryOverrideWhereUniqueInput
    create: XOR<MemoryOverrideCreateWithoutPackItemInput, MemoryOverrideUncheckedCreateWithoutPackItemInput>
  }

  export type MemoryOverrideCreateManyPackItemInputEnvelope = {
    data: MemoryOverrideCreateManyPackItemInput | MemoryOverrideCreateManyPackItemInput[]
  }

  export type MemoryPackUpsertWithoutItemsInput = {
    update: XOR<MemoryPackUpdateWithoutItemsInput, MemoryPackUncheckedUpdateWithoutItemsInput>
    create: XOR<MemoryPackCreateWithoutItemsInput, MemoryPackUncheckedCreateWithoutItemsInput>
    where?: MemoryPackWhereInput
  }

  export type MemoryPackUpdateToOneWithWhereWithoutItemsInput = {
    where?: MemoryPackWhereInput
    data: XOR<MemoryPackUpdateWithoutItemsInput, MemoryPackUncheckedUpdateWithoutItemsInput>
  }

  export type MemoryPackUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vendor?: MemoryVendorUpdateOneRequiredWithoutPacksNestedInput
    installs?: MemoryInstallUpdateManyWithoutPackNestedInput
  }

  export type MemoryPackUncheckedUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    vendorId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    installs?: MemoryInstallUncheckedUpdateManyWithoutPackNestedInput
  }

  export type MemoryOverrideUpsertWithWhereUniqueWithoutPackItemInput = {
    where: MemoryOverrideWhereUniqueInput
    update: XOR<MemoryOverrideUpdateWithoutPackItemInput, MemoryOverrideUncheckedUpdateWithoutPackItemInput>
    create: XOR<MemoryOverrideCreateWithoutPackItemInput, MemoryOverrideUncheckedCreateWithoutPackItemInput>
  }

  export type MemoryOverrideUpdateWithWhereUniqueWithoutPackItemInput = {
    where: MemoryOverrideWhereUniqueInput
    data: XOR<MemoryOverrideUpdateWithoutPackItemInput, MemoryOverrideUncheckedUpdateWithoutPackItemInput>
  }

  export type MemoryOverrideUpdateManyWithWhereWithoutPackItemInput = {
    where: MemoryOverrideScalarWhereInput
    data: XOR<MemoryOverrideUpdateManyMutationInput, MemoryOverrideUncheckedUpdateManyWithoutPackItemInput>
  }

  export type MemoryOverrideScalarWhereInput = {
    AND?: MemoryOverrideScalarWhereInput | MemoryOverrideScalarWhereInput[]
    OR?: MemoryOverrideScalarWhereInput[]
    NOT?: MemoryOverrideScalarWhereInput | MemoryOverrideScalarWhereInput[]
    id?: StringFilter<"MemoryOverride"> | string
    tenantId?: StringFilter<"MemoryOverride"> | string
    packItemId?: StringFilter<"MemoryOverride"> | string
    content?: StringFilter<"MemoryOverride"> | string
    tags?: StringNullableFilter<"MemoryOverride"> | string | null
    createdAt?: DateTimeFilter<"MemoryOverride"> | Date | string
  }

  export type MemoryInstallCreateWithoutTenantInput = {
    id?: string
    installedAt?: Date | string
    pack: MemoryPackCreateNestedOneWithoutInstallsInput
  }

  export type MemoryInstallUncheckedCreateWithoutTenantInput = {
    id?: string
    packId: string
    installedAt?: Date | string
  }

  export type MemoryInstallCreateOrConnectWithoutTenantInput = {
    where: MemoryInstallWhereUniqueInput
    create: XOR<MemoryInstallCreateWithoutTenantInput, MemoryInstallUncheckedCreateWithoutTenantInput>
  }

  export type MemoryInstallCreateManyTenantInputEnvelope = {
    data: MemoryInstallCreateManyTenantInput | MemoryInstallCreateManyTenantInput[]
  }

  export type MemoryOverrideCreateWithoutTenantInput = {
    id?: string
    content: string
    tags?: string | null
    createdAt?: Date | string
    packItem: MemoryPackItemCreateNestedOneWithoutOverridesInput
  }

  export type MemoryOverrideUncheckedCreateWithoutTenantInput = {
    id?: string
    packItemId: string
    content: string
    tags?: string | null
    createdAt?: Date | string
  }

  export type MemoryOverrideCreateOrConnectWithoutTenantInput = {
    where: MemoryOverrideWhereUniqueInput
    create: XOR<MemoryOverrideCreateWithoutTenantInput, MemoryOverrideUncheckedCreateWithoutTenantInput>
  }

  export type MemoryOverrideCreateManyTenantInputEnvelope = {
    data: MemoryOverrideCreateManyTenantInput | MemoryOverrideCreateManyTenantInput[]
  }

  export type MemoryInstallUpsertWithWhereUniqueWithoutTenantInput = {
    where: MemoryInstallWhereUniqueInput
    update: XOR<MemoryInstallUpdateWithoutTenantInput, MemoryInstallUncheckedUpdateWithoutTenantInput>
    create: XOR<MemoryInstallCreateWithoutTenantInput, MemoryInstallUncheckedCreateWithoutTenantInput>
  }

  export type MemoryInstallUpdateWithWhereUniqueWithoutTenantInput = {
    where: MemoryInstallWhereUniqueInput
    data: XOR<MemoryInstallUpdateWithoutTenantInput, MemoryInstallUncheckedUpdateWithoutTenantInput>
  }

  export type MemoryInstallUpdateManyWithWhereWithoutTenantInput = {
    where: MemoryInstallScalarWhereInput
    data: XOR<MemoryInstallUpdateManyMutationInput, MemoryInstallUncheckedUpdateManyWithoutTenantInput>
  }

  export type MemoryOverrideUpsertWithWhereUniqueWithoutTenantInput = {
    where: MemoryOverrideWhereUniqueInput
    update: XOR<MemoryOverrideUpdateWithoutTenantInput, MemoryOverrideUncheckedUpdateWithoutTenantInput>
    create: XOR<MemoryOverrideCreateWithoutTenantInput, MemoryOverrideUncheckedCreateWithoutTenantInput>
  }

  export type MemoryOverrideUpdateWithWhereUniqueWithoutTenantInput = {
    where: MemoryOverrideWhereUniqueInput
    data: XOR<MemoryOverrideUpdateWithoutTenantInput, MemoryOverrideUncheckedUpdateWithoutTenantInput>
  }

  export type MemoryOverrideUpdateManyWithWhereWithoutTenantInput = {
    where: MemoryOverrideScalarWhereInput
    data: XOR<MemoryOverrideUpdateManyMutationInput, MemoryOverrideUncheckedUpdateManyWithoutTenantInput>
  }

  export type MemoryTenantCreateWithoutInstallsInput = {
    id?: string
    name: string
    brandSlug: string
    createdAt?: Date | string
    overrides?: MemoryOverrideCreateNestedManyWithoutTenantInput
  }

  export type MemoryTenantUncheckedCreateWithoutInstallsInput = {
    id?: string
    name: string
    brandSlug: string
    createdAt?: Date | string
    overrides?: MemoryOverrideUncheckedCreateNestedManyWithoutTenantInput
  }

  export type MemoryTenantCreateOrConnectWithoutInstallsInput = {
    where: MemoryTenantWhereUniqueInput
    create: XOR<MemoryTenantCreateWithoutInstallsInput, MemoryTenantUncheckedCreateWithoutInstallsInput>
  }

  export type MemoryPackCreateWithoutInstallsInput = {
    id?: string
    slug: string
    version: string
    title: string
    notes?: string | null
    signature?: string | null
    createdAt?: Date | string
    vendor: MemoryVendorCreateNestedOneWithoutPacksInput
    items?: MemoryPackItemCreateNestedManyWithoutPackInput
  }

  export type MemoryPackUncheckedCreateWithoutInstallsInput = {
    id?: string
    vendorId: string
    slug: string
    version: string
    title: string
    notes?: string | null
    signature?: string | null
    createdAt?: Date | string
    items?: MemoryPackItemUncheckedCreateNestedManyWithoutPackInput
  }

  export type MemoryPackCreateOrConnectWithoutInstallsInput = {
    where: MemoryPackWhereUniqueInput
    create: XOR<MemoryPackCreateWithoutInstallsInput, MemoryPackUncheckedCreateWithoutInstallsInput>
  }

  export type MemoryTenantUpsertWithoutInstallsInput = {
    update: XOR<MemoryTenantUpdateWithoutInstallsInput, MemoryTenantUncheckedUpdateWithoutInstallsInput>
    create: XOR<MemoryTenantCreateWithoutInstallsInput, MemoryTenantUncheckedCreateWithoutInstallsInput>
    where?: MemoryTenantWhereInput
  }

  export type MemoryTenantUpdateToOneWithWhereWithoutInstallsInput = {
    where?: MemoryTenantWhereInput
    data: XOR<MemoryTenantUpdateWithoutInstallsInput, MemoryTenantUncheckedUpdateWithoutInstallsInput>
  }

  export type MemoryTenantUpdateWithoutInstallsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brandSlug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    overrides?: MemoryOverrideUpdateManyWithoutTenantNestedInput
  }

  export type MemoryTenantUncheckedUpdateWithoutInstallsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brandSlug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    overrides?: MemoryOverrideUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type MemoryPackUpsertWithoutInstallsInput = {
    update: XOR<MemoryPackUpdateWithoutInstallsInput, MemoryPackUncheckedUpdateWithoutInstallsInput>
    create: XOR<MemoryPackCreateWithoutInstallsInput, MemoryPackUncheckedCreateWithoutInstallsInput>
    where?: MemoryPackWhereInput
  }

  export type MemoryPackUpdateToOneWithWhereWithoutInstallsInput = {
    where?: MemoryPackWhereInput
    data: XOR<MemoryPackUpdateWithoutInstallsInput, MemoryPackUncheckedUpdateWithoutInstallsInput>
  }

  export type MemoryPackUpdateWithoutInstallsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vendor?: MemoryVendorUpdateOneRequiredWithoutPacksNestedInput
    items?: MemoryPackItemUpdateManyWithoutPackNestedInput
  }

  export type MemoryPackUncheckedUpdateWithoutInstallsInput = {
    id?: StringFieldUpdateOperationsInput | string
    vendorId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: MemoryPackItemUncheckedUpdateManyWithoutPackNestedInput
  }

  export type MemoryTenantCreateWithoutOverridesInput = {
    id?: string
    name: string
    brandSlug: string
    createdAt?: Date | string
    installs?: MemoryInstallCreateNestedManyWithoutTenantInput
  }

  export type MemoryTenantUncheckedCreateWithoutOverridesInput = {
    id?: string
    name: string
    brandSlug: string
    createdAt?: Date | string
    installs?: MemoryInstallUncheckedCreateNestedManyWithoutTenantInput
  }

  export type MemoryTenantCreateOrConnectWithoutOverridesInput = {
    where: MemoryTenantWhereUniqueInput
    create: XOR<MemoryTenantCreateWithoutOverridesInput, MemoryTenantUncheckedCreateWithoutOverridesInput>
  }

  export type MemoryPackItemCreateWithoutOverridesInput = {
    id?: string
    kind: string
    subject?: string | null
    content: string
    tags?: string | null
    createdAt?: Date | string
    pack: MemoryPackCreateNestedOneWithoutItemsInput
  }

  export type MemoryPackItemUncheckedCreateWithoutOverridesInput = {
    id?: string
    packId: string
    kind: string
    subject?: string | null
    content: string
    tags?: string | null
    createdAt?: Date | string
  }

  export type MemoryPackItemCreateOrConnectWithoutOverridesInput = {
    where: MemoryPackItemWhereUniqueInput
    create: XOR<MemoryPackItemCreateWithoutOverridesInput, MemoryPackItemUncheckedCreateWithoutOverridesInput>
  }

  export type MemoryTenantUpsertWithoutOverridesInput = {
    update: XOR<MemoryTenantUpdateWithoutOverridesInput, MemoryTenantUncheckedUpdateWithoutOverridesInput>
    create: XOR<MemoryTenantCreateWithoutOverridesInput, MemoryTenantUncheckedCreateWithoutOverridesInput>
    where?: MemoryTenantWhereInput
  }

  export type MemoryTenantUpdateToOneWithWhereWithoutOverridesInput = {
    where?: MemoryTenantWhereInput
    data: XOR<MemoryTenantUpdateWithoutOverridesInput, MemoryTenantUncheckedUpdateWithoutOverridesInput>
  }

  export type MemoryTenantUpdateWithoutOverridesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brandSlug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    installs?: MemoryInstallUpdateManyWithoutTenantNestedInput
  }

  export type MemoryTenantUncheckedUpdateWithoutOverridesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brandSlug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    installs?: MemoryInstallUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type MemoryPackItemUpsertWithoutOverridesInput = {
    update: XOR<MemoryPackItemUpdateWithoutOverridesInput, MemoryPackItemUncheckedUpdateWithoutOverridesInput>
    create: XOR<MemoryPackItemCreateWithoutOverridesInput, MemoryPackItemUncheckedCreateWithoutOverridesInput>
    where?: MemoryPackItemWhereInput
  }

  export type MemoryPackItemUpdateToOneWithWhereWithoutOverridesInput = {
    where?: MemoryPackItemWhereInput
    data: XOR<MemoryPackItemUpdateWithoutOverridesInput, MemoryPackItemUncheckedUpdateWithoutOverridesInput>
  }

  export type MemoryPackItemUpdateWithoutOverridesInput = {
    id?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pack?: MemoryPackUpdateOneRequiredWithoutItemsNestedInput
  }

  export type MemoryPackItemUncheckedUpdateWithoutOverridesInput = {
    id?: StringFieldUpdateOperationsInput | string
    packId?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutLearnedMemoriesInput = {
    id?: string
    email: string
    displayName?: string | null
    role?: string
    createdAt?: Date | string
    messages?: CimsMessageCreateNestedManyWithoutSenderInput
    tasks?: WorkfocusTaskCreateNestedManyWithoutOwnerInput
  }

  export type UserUncheckedCreateWithoutLearnedMemoriesInput = {
    id?: string
    email: string
    displayName?: string | null
    role?: string
    createdAt?: Date | string
    messages?: CimsMessageUncheckedCreateNestedManyWithoutSenderInput
    tasks?: WorkfocusTaskUncheckedCreateNestedManyWithoutOwnerInput
  }

  export type UserCreateOrConnectWithoutLearnedMemoriesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutLearnedMemoriesInput, UserUncheckedCreateWithoutLearnedMemoriesInput>
  }

  export type UserUpsertWithoutLearnedMemoriesInput = {
    update: XOR<UserUpdateWithoutLearnedMemoriesInput, UserUncheckedUpdateWithoutLearnedMemoriesInput>
    create: XOR<UserCreateWithoutLearnedMemoriesInput, UserUncheckedCreateWithoutLearnedMemoriesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutLearnedMemoriesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutLearnedMemoriesInput, UserUncheckedUpdateWithoutLearnedMemoriesInput>
  }

  export type UserUpdateWithoutLearnedMemoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: CimsMessageUpdateManyWithoutSenderNestedInput
    tasks?: WorkfocusTaskUpdateManyWithoutOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutLearnedMemoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: CimsMessageUncheckedUpdateManyWithoutSenderNestedInput
    tasks?: WorkfocusTaskUncheckedUpdateManyWithoutOwnerNestedInput
  }

  export type CimsMessageCreateManySenderInput = {
    id?: string
    threadId?: string | null
    channel: string
    direction: string
    body?: string | null
    mediaUrl?: string | null
    meta: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type WorkfocusTaskCreateManyOwnerInput = {
    id?: string
    bucket: string
    title: string
    status?: string
    dueAt?: Date | string | null
    meta: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LearnedMemoryCreateManyUserInput = {
    id?: string
    tenantId: string
    kind: $Enums.MemoryKind
    subject?: string | null
    content: string
    tags?: string | null
    importance?: number
    source?: string | null
    createdAt?: Date | string
    lastUsedAt?: Date | string | null
    expireAt?: Date | string | null
  }

  export type CimsMessageUpdateWithoutSenderInput = {
    id?: StringFieldUpdateOperationsInput | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    mediaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CimsMessageUncheckedUpdateWithoutSenderInput = {
    id?: StringFieldUpdateOperationsInput | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    mediaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CimsMessageUncheckedUpdateManyWithoutSenderInput = {
    id?: StringFieldUpdateOperationsInput | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    mediaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkfocusTaskUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucket?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    dueAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkfocusTaskUncheckedUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucket?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    dueAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkfocusTaskUncheckedUpdateManyWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucket?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    dueAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    meta?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearnedMemoryUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: EnumMemoryKindFieldUpdateOperationsInput | $Enums.MemoryKind
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    importance?: IntFieldUpdateOperationsInput | number
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expireAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LearnedMemoryUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: EnumMemoryKindFieldUpdateOperationsInput | $Enums.MemoryKind
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    importance?: IntFieldUpdateOperationsInput | number
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expireAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LearnedMemoryUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: EnumMemoryKindFieldUpdateOperationsInput | $Enums.MemoryKind
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    importance?: IntFieldUpdateOperationsInput | number
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expireAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MemoryPackCreateManyVendorInput = {
    id?: string
    slug: string
    version: string
    title: string
    notes?: string | null
    signature?: string | null
    createdAt?: Date | string
  }

  export type MemoryPackUpdateWithoutVendorInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: MemoryPackItemUpdateManyWithoutPackNestedInput
    installs?: MemoryInstallUpdateManyWithoutPackNestedInput
  }

  export type MemoryPackUncheckedUpdateWithoutVendorInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: MemoryPackItemUncheckedUpdateManyWithoutPackNestedInput
    installs?: MemoryInstallUncheckedUpdateManyWithoutPackNestedInput
  }

  export type MemoryPackUncheckedUpdateManyWithoutVendorInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryPackItemCreateManyPackInput = {
    id?: string
    kind: string
    subject?: string | null
    content: string
    tags?: string | null
    createdAt?: Date | string
  }

  export type MemoryInstallCreateManyPackInput = {
    id?: string
    tenantId: string
    installedAt?: Date | string
  }

  export type MemoryPackItemUpdateWithoutPackInput = {
    id?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    overrides?: MemoryOverrideUpdateManyWithoutPackItemNestedInput
  }

  export type MemoryPackItemUncheckedUpdateWithoutPackInput = {
    id?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    overrides?: MemoryOverrideUncheckedUpdateManyWithoutPackItemNestedInput
  }

  export type MemoryPackItemUncheckedUpdateManyWithoutPackInput = {
    id?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryInstallUpdateWithoutPackInput = {
    id?: StringFieldUpdateOperationsInput | string
    installedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: MemoryTenantUpdateOneRequiredWithoutInstallsNestedInput
  }

  export type MemoryInstallUncheckedUpdateWithoutPackInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    installedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryInstallUncheckedUpdateManyWithoutPackInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    installedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryOverrideCreateManyPackItemInput = {
    id?: string
    tenantId: string
    content: string
    tags?: string | null
    createdAt?: Date | string
  }

  export type MemoryOverrideUpdateWithoutPackItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: MemoryTenantUpdateOneRequiredWithoutOverridesNestedInput
  }

  export type MemoryOverrideUncheckedUpdateWithoutPackItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryOverrideUncheckedUpdateManyWithoutPackItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryInstallCreateManyTenantInput = {
    id?: string
    packId: string
    installedAt?: Date | string
  }

  export type MemoryOverrideCreateManyTenantInput = {
    id?: string
    packItemId: string
    content: string
    tags?: string | null
    createdAt?: Date | string
  }

  export type MemoryInstallUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    installedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pack?: MemoryPackUpdateOneRequiredWithoutInstallsNestedInput
  }

  export type MemoryInstallUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    packId?: StringFieldUpdateOperationsInput | string
    installedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryInstallUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    packId?: StringFieldUpdateOperationsInput | string
    installedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryOverrideUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packItem?: MemoryPackItemUpdateOneRequiredWithoutOverridesNestedInput
  }

  export type MemoryOverrideUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    packItemId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemoryOverrideUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    packItemId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    tags?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}

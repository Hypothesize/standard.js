export declare type Primitive = number | string | bigint | boolean | symbol;
export declare type ObjectLiteral<TValue = unknown, TKey extends string = string> = {
    [key in TKey]: TValue;
};
export declare type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends Record<string, unknown> ? RecursivePartial<T[P]> : T[P];
};
export declare type ArrayElementType<T> = T extends (infer U)[] ? U : T;
declare type UnwrapIterable1<T> = T extends Iterable<infer X> ? X : T;
declare type UnwrapIterable2<T> = T extends Iterable<infer X> ? UnwrapIterable1<X> : T;
declare type UnwrapIterable3<T> = T extends Iterable<infer X> ? UnwrapIterable2<X> : T;
export declare type UnwrapNestedIterable<T> = T extends Iterable<infer X> ? UnwrapIterable3<X> : T;
export declare type Tuple<X, Y> = [X, Y];
export declare const Tuple: new <X, Y>(x: X, y: Y) => [X, Y];
export declare type Zip<A extends ReadonlyArray<unknown>> = {
    [K in keyof A]: A[K] extends Iterable<infer T> ? T : never;
};
/** Returns -1 if a is smaller than b; 0 if a & b are equal, and 1 if a is bigger than b */
export declare type Ranker<X = unknown> = (a: X, b: X) => number;
/** Returns true if a and b are equal, otherwise returne false */
export declare type Comparer<X = unknown> = (a: X, b: X) => boolean;
export declare type Projector<X = unknown, Y = unknown> = (value: X) => Y;
export declare type ProjectorIndexed<X = unknown, Y = unknown, I = unknown> = (value: X, indexOrKey: I) => Y;
export declare type Predicate<X = unknown> = (value: X) => boolean;
export declare type Reducer<X = unknown, Y = unknown> = (prev: Y, current: X) => Y;
export declare type ReducerIndexed<X = unknown, Y = unknown, I = unknown> = (prev: Y, current: X, indexOrKey: I) => Y;
/** Lazy collection of elements accessed sequentially, not known in advance */
export declare class stdSequence<X> implements Iterable<X> {
    constructor(iterable: Iterable<X>);
    protected _iterable: Iterable<X>;
    protected ctor(iterable: Iterable<X>): this;
    [Symbol.iterator](): Iterator<X>;
    /** Convert to another iterable container type */
    to<C extends Iterable<X>>(container: {
        (items: Iterable<X>): C;
    }): C;
    take(n: number): this;
    skip(n: number): this;
    first(): X | undefined;
    last(): X | undefined;
    filter(predicate: Predicate<X>): this;
    map<Y>(projector: Projector<X, Y>): stdSequence<Y>;
    reduce<Y>(initial: Y, reducer: Reducer<X, Y>): stdSequence<Y>;
    forEach(action: Projector<X>): void;
    /** Generate sequence of integers */
    static integers(args: {
        from: number;
        to: number;
    } | {
        from: number;
        direction: "upwards" | "downwards";
    }): stdSequence<number>;
}
export declare class stdTupleSequence<T> extends stdSequence<[string, T]> {
    toDictionary<X>(): stdObject<Record<string, T>>;
}
/** Set of elements, known in advance, without any order */
export declare class stdSet<X> extends stdSequence<X> {
    constructor(elements: Iterable<X>);
    protected _set?: globalThis.Set<X>;
    protected readonly core: {
        readonly set: Set<X>;
        readonly iterable: Iterable<X>;
    };
    protected ctor(iterable: Iterable<X>): this;
    get size(): number;
    get length(): number;
    /** Synonym of this.contains */
    has(value: X): boolean;
    /** Synonym of this.contains */
    includes(value: X): boolean;
    /** Returns true if this array contains an element equal to value */
    contains(value: X): boolean;
    some(predicate: Predicate<X>): boolean;
    every(predicate: Predicate<X>): boolean;
    map<Y>(projector: Projector<X, Y>): stdSet<Y>;
    /** Get unique items in this array
     * ToDo: Implement use of comparer in the include() call
     */
    unique(comparer?: Comparer<X>): this;
    union(collections: Iterable<X>[]): this;
    intersection(collections: globalThis.Array<X>[]): this;
    except(collections: globalThis.Array<X>[]): Iterable<X>;
    complement(universe: Iterable<X>): Iterable<X>;
    sort(comparer?: Ranker<X>): stdArray<X>;
    sortDescending(comparer?: Ranker<X>): stdArray<X>;
}
/** Eager, ordered, material collection */
export declare class stdArray<X> extends stdSet<X> {
    constructor(elements: Iterable<X>);
    private _array?;
    private _map?;
    ctor(elements: Iterable<X>): this;
    protected readonly core: {
        map: Map<number, X>;
        array: X[];
        set: Set<X>;
        iterable: Iterable<X>;
    };
    get length(): number;
    get size(): number;
    get(index: number): X | undefined;
    get(indices: Iterable<number>): (X | undefined)[];
    get(...indices: number[]): (X | undefined)[];
    /** Get the indexes where a value occurs or a certain predicate/condition is met */
    indexesOf(args: ({
        value: X;
    } | {
        predicate: Predicate<X>;
    })): stdArray<number>;
    entries(): stdArray<[number, X]>;
    /** Returns new array containing this array's elements in reverse order */
    reverse(): this;
    /** Get last element (or last element to satisfy an optional predicate) of this collection
     * @param func Optional predicate to filter elements
     * @returns Last element as defined above, or <undefined> if such an element is not found
     */
    last(predicate?: Predicate<X>): X | undefined;
    map<Y>(projector: Projector<X, Y>): stdArray<Y>;
}
export declare class stdArrayNumeric extends stdArray<number> {
    ctor(iterable: Iterable<number>): this;
    static fromRange(from: number, to: number, opts?: {
        mode: "width";
        width: number;
    } | {
        mode: "count";
        count: number;
    }): stdArrayNumeric;
    min(): number | undefined;
    max(): number | undefined;
    map(projector: Projector<number, number>): stdArrayNumeric;
    map<Y>(projector: Projector<number, Y>): stdArray<Y>;
    mean(exclusions?: {
        excludedIndices: number[];
        meanOriginal?: number;
    }): number;
    variance(mean?: number, forSample?: boolean): number | undefined;
    deviation(args?: {
        mean?: number | {
            excludeIndices: number[];
        };
        forSample: boolean;
    }): number | undefined;
    median(): number | undefined;
    interQuartileRange(): number | undefined;
    sum(): number;
}
/** Eager, un-ordered, material, indexed associative collection */
export declare class stdObject<T extends Record<string, unknown>> implements Iterable<Tuple<keyof T, T[keyof T]>> {
    private readonly obj;
    constructor(obj: T);
    static fromKeyValues<K extends string, V>(keyValues: Iterable<Tuple<K, V>>): stdObject<Record<K, V>>;
    static fromArray<X>(arr: X[]): stdObject<Record<string, X>>;
    [Symbol.iterator](): IterableIterator<Tuple<keyof T, T[keyof T]>>;
    asObject(): Readonly<T>;
    get size(): number;
    /** TODO: Memoize this method? */
    keys(): (keyof T)[];
    /** TODO: Memoize this method? */
    values(): T[keyof T][];
    /** Check whether this dictionary contains a specific key or value */
    has(arg: {
        key: keyof T;
    } | {
        value: T[keyof T];
    }): boolean;
    /** TODO: Memoize this method? */
    entries(): Tuple<keyof T, T[keyof T]>[];
    pick<K extends keyof T>(...keys: K[]): stdObject<Pick<T, K>>;
    omit<K extends keyof T>(...keys: K[]): stdObject<Pick<T, Exclude<keyof T, K>>>;
    map<Y>(projector: ProjectorIndexed<T[keyof T], Y, keyof T>): stdObject<Record<string, Y>>;
    reduce<Y>(initial: Y, reducer: ReducerIndexed<T[keyof T], Y, keyof T>): Y;
    get(selector: keyof T): Readonly<T>[keyof T];
    getAll(selector: Iterable<keyof T>): stdSet<Readonly<T>[keyof T]>;
    /** Get the indexes where a value occurs or a certain predicate/condition is met */
    indexesOf(args: ({
        value: T[keyof T];
    } | {
        predicate: Predicate<T[keyof T]>;
    })): (keyof T)[];
}
export declare function take<T>(iterable: Iterable<T>, n: number): Iterable<T>;
export declare function skip<T>(iterable: Iterable<T>, n: number): Iterable<T>;
export declare function reduce<X, Y>(iterable: Iterable<X>, initial: Y, reducer: Reducer<X, Y>): Iterable<Y>;
export declare function map<X, Y>(iterable: Iterable<X>, projector: Projector<X, Y>): Iterable<Y>;
export declare function filter<T>(iterable: Iterable<T>, predicate: Predicate<T>): Iterable<T>;
export declare function some<T>(iterable: Iterable<T>, predicate: Predicate<T>): boolean;
export declare function every<T>(iterable: Iterable<T>, predicate: Predicate<T>): boolean;
/** Turns n iterables into an iterable of n-tuples
 * The shortest iterable determines the length of the result
 */
export declare function zip<T extends readonly any[]>(...iterables: T): IterableIterator<Zip<T>>;
export declare function forEach<T>(iterable: Iterable<T>, action: Projector<T>): void;
export declare function unique<T>(iterable: Iterable<T>): Iterable<T>;
export declare function union<T>(collections: globalThis.Array<Iterable<T>>): Iterable<T>;
export declare function intersection<T>(collections: ArrayLike<T>[]): Iterable<T>;
export declare function except<T>(src: Iterable<T>, exclusions: ArrayLike<T>[]): Iterable<T>;
export declare function complement<T>(target: ArrayLike<T>, universe: Iterable<T>): Iterable<T>;
export declare function indexesOf<K, V>(collection: Iterable<Tuple<K, V>>, target: ({
    value: V;
} | {
    predicate: Predicate<V>;
})): Iterable<K>;
export declare function chunk<T>(arr: Iterable<T>, chunkSize: number): Iterable<T[]>;
export declare function first<T>(iterable: Iterable<T>): T | undefined;
export declare function last<T>(iterable: Iterable<T>): T | undefined;
export declare function sum(iterable: Iterable<number>): number;
export declare function flatten<X>(target: Iterable<X>): Iterable<UnwrapNestedIterable<X>>;
export declare function compare<T>(x: T, y: T, comparer?: Projector<T, unknown>, tryNumeric?: boolean): number;
export declare function getRanker<T>(args: {
    projector: Projector<T, unknown>;
    tryNumeric?: boolean;
    reverse?: boolean;
}): Ranker<T>;
export declare function getComparer<T>(projector: Projector<T, unknown>, tryNumeric?: boolean, reverse?: boolean): Comparer<T>;
export declare function hasValue(value: unknown): boolean;
export {};

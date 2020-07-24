"use strict";
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable fp/no-unused-expression */
/* eslint-disable fp/no-get-set */
/* eslint-disable fp/no-class */
/* eslint-disable brace-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable fp/no-rest-parameters */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable fp/no-mutation */
/* eslint-disable fp/no-loops */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasValue = exports.getComparer = exports.getRanker = exports.compare = exports.flatten = exports.sum = exports.last = exports.first = exports.chunk = exports.indexesOf = exports.complement = exports.except = exports.intersection = exports.union = exports.unique = exports.forEach = exports.zip = exports.every = exports.some = exports.filter = exports.map = exports.reduce = exports.skip = exports.take = exports.stdObject = exports.stdArrayNumeric = exports.stdArray = exports.stdSet = exports.stdTupleSequence = exports.stdSequence = exports.Tuple = void 0;
const number_1 = require("./number");
exports.Tuple = class {
    constructor(x, y) {
        return [x, y];
    }
};
/*
export namespace Collection {
    export interface Enumerable<X> extends Iterable<X> {
        take: (n: number) => Enumerable<X>
        skip: (n: number) => Enumerable<X>
        filter: (predicate: Predicate<X>) => Enumerable<X>

        map<Y extends [S, Z], Z, S extends string>(projector: Projector<X, Y>): Enumerable<[S, Z]>
        map<Y>(projector: Projector<X, Y>): Enumerable<Y> //Y extends [string, infer Z] ? Enumerable<[string, Z]> : Enumerable<Y>

        reduce: <Y>(initial: Y, reducer: Reducer<X, Y>) => Enumerable<Y>
        forEach: (action: Projector<X>) => void

        first(): X | undefined

        materialize(): MaterialExtended<X>
    }
    export interface Material<X> extends Enumerable<X> {
        size: number
        some(predicate: Predicate<X>): boolean
        every(predicate: Predicate<X>): boolean
    }
    export interface MaterialExtended<X> extends Material<X> {
        unique(comparer: Comparer<X>): Material<X>
        union(...collections: Material<X>[]): Material<X>
        intersection(...collections: Material<X>[]): Material<X>
        except(...collections: Material<X>[]): Material<X>
        complement(universe: Iterable<X>): Material<X>

        sort(comparer?: Ranker<X>): Ordered<X>
        sortDescending(comparer?: Ranker<X>): Ordered<X>

        //has(value: X): boolean
        contains(value: X): boolean
        //includes(value: X): boolean
    }
    export interface Indexed<K, V> {
        get(index: K): V | undefined
        get(indices: K[]): (V | undefined)[]
        get(...indices: K[]): (V | undefined)[]
        get(selector: K | K[]): undefined | V | V[]

        indexesOf(value: V): Enumerable<K>
        indexesOf(value: V, mode: "as-value"): Enumerable<K>
        indexesOf(value: Predicate<V>, mode: "as-predicate"): Enumerable<K>
    }
    export interface IndexedExtended<K, V> extends Indexed<K, V> {
        keys(): Material<K>
        hasKey(key: K): boolean

        values(): Material<V>
        hasValue(value: V): boolean

        //indexOf(args: ({ value: V } | { block: Iterable<V> } | { predicate: Predicate<V> }) & { fromIndex?: number, fromEnd?: boolean }): K
    }
    export interface Ordered<T> extends MaterialExtended<T>, Indexed<number, T> {
        last(): T | undefined
        reverse(): Ordered<T>

        //indexOfRange(range: Iterable<number>, fromIndex?: number, fromEnd?: boolean): number
    }
}
*/
/** Lazy collection of elements accessed sequentially, not known in advance */
class stdSequence {
    // eslint-disable-next-line fp/no-nil
    constructor(iterable) { this._iterable = iterable; }
    ctor(iterable) { return new stdSequence(iterable); }
    [Symbol.iterator]() { return this._iterable[Symbol.iterator](); }
    /** Convert to another iterable container type */
    to(container) { return container([...this]); }
    take(n) { return this.ctor(take(this, n)); }
    skip(n) { return this.ctor(skip(this, n)); }
    first() { return first(this); }
    last() { return last(this); }
    filter(predicate) { return this.ctor(filter(this, predicate)); }
    map(projector) { return new stdSequence(map(this, projector)); }
    reduce(initial, reducer) { return new stdSequence(reduce(this, initial, reducer)); }
    forEach(action) { return forEach(this, action); }
    /** Generate sequence of integers */
    static integers(args) {
        return new stdSequence((function* () {
            // eslint-disable-next-line fp/no-let
            let num = args.from;
            do {
                yield ("to" in args ? args.to >= args.from : args.direction === "upwards") ? num++ : num--;
            } while ("direction" in args || args.from !== args.to);
        })());
    }
}
exports.stdSequence = stdSequence;
class stdTupleSequence extends stdSequence {
    toDictionary() {
        return stdObject.fromKeyValues([...this]);
    }
}
exports.stdTupleSequence = stdTupleSequence;
/** Set of elements, known in advance, without any order */
class stdSet extends stdSequence {
    constructor(elements /*, protected opts?: { comparer?: Comparer<X>, ranker?: Ranker<X> }*/) {
        super(elements);
        this._set = undefined;
        this.core = ((me) => {
            return {
                get set() {
                    if (me._set === undefined) {
                        // set is created from array for performance reasons
                        me._set = new global.Set(global.Array.isArray(me._iterable)
                            ? me._iterable
                            : [...me._iterable]);
                    }
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return me._set;
                },
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                get iterable() { return me._iterable; },
            };
        })(this);
    }
    ctor(iterable) { return new stdSet(iterable); }
    get size() { return this.core.set.size; }
    get length() { return this.size; }
    /** Synonym of this.contains */
    has(value) { return this.contains(value); }
    /** Synonym of this.contains */
    includes(value) { return this.contains(value); }
    /** Returns true if this array contains an element equal to value */
    contains(value) { return this.core.set.has(value); }
    some(predicate) { return some(this, predicate); }
    every(predicate) { return every(this, predicate); }
    map(projector) { return new stdSet(map(this, projector)); }
    /** Get unique items in this array
     * ToDo: Implement use of comparer in the include() call
     */
    unique(comparer) { return this.ctor(unique(this)); }
    union(collections) { return this.ctor(union([this, ...collections])); }
    intersection(collections) { return this.ctor(intersection(collections)); }
    except(collections) { return this.ctor(except(this, collections)); }
    complement(universe) { return complement([...this], universe); }
    // eslint-disable-next-line fp/no-mutating-methods
    sort(comparer) { return new stdArray([...this].sort(comparer)); }
    // eslint-disable-next-line fp/no-mutating-methods
    sortDescending(comparer) { return new stdArray([...this].sort(comparer).reverse()); }
}
exports.stdSet = stdSet;
/** Eager, ordered, material collection */
class stdArray extends stdSet {
    constructor(elements) {
        super(elements);
        this._array = undefined;
        this._map = undefined;
        this.core = ((me) => {
            return Object.assign(Object.assign({}, super.core), { get map() {
                    if (me._map === undefined) {
                        me._map = new global.Map([...me._iterable].entries());
                    }
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return me._map;
                },
                get array() {
                    if (me._array === undefined) {
                        me._array = global.Array.from([...me._iterable]);
                    }
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return me._array;
                } });
        })(this);
    }
    ctor(elements) { return new stdArray(elements); }
    get length() { return this.core.array.length; }
    get size() { return this.length; }
    get(selection) {
        if (typeof selection === "number") {
            return this.core.array[selection];
        }
        else {
            console.warn(`Array get() selection arg type: ${typeof selection}`);
            //console.assert(Object__.isIterable(selection), `Array get() selection arg not iterable`)
            return [...selection].map(index => this.core.array[index]);
        }
    }
    /** Get the indexes where a value occurs or a certain predicate/condition is met */
    indexesOf(args) {
        return 'value' in args
            ? this.entries().filter(kv => kv[1] === args.value).map(kv => kv[0])
            : this.entries().filter(kv => args.predicate(kv[1]) === true).map(kv => kv[0]);
    }
    entries() { return new stdArray(this.core.array.entries()); }
    /** Returns new array containing this array's elements in reverse order */
    // eslint-disable-next-line fp/no-mutating-methods
    reverse() { return this.ctor([...this].reverse()); }
    /** Get last element (or last element to satisfy an optional predicate) of this collection
     * @param func Optional predicate to filter elements
     * @returns Last element as defined above, or <undefined> if such an element is not found
     */
    last(predicate) {
        const arr = this.core.array;
        if (!predicate)
            return arr[this.size - 1];
        else
            // eslint-disable-next-line fp/no-mutating-methods
            return arr.reverse().find(predicate);
    }
    map(projector) { return new stdArray(map(this, projector)); }
}
exports.stdArray = stdArray;
class stdArrayNumeric extends stdArray {
    ctor(iterable) { return new stdArrayNumeric(iterable); }
    static fromRange(from, to, opts) {
        if (opts) {
            if (opts.mode === "width" && opts.width <= 0)
                throw new Error("width must be positive non-zero number");
            if (opts.mode === "count" && opts.count <= 0)
                throw new Error("count must be positive non-zero number");
        }
        const diff = to - from;
        const sign = to >= from ? 1 : -1;
        const delta = opts === undefined
            ? sign
            : opts.mode === "width"
                ? (opts.width * sign)
                : diff / opts.count;
        const length = Math.floor(diff / delta) + 1;
        const arr = new global.Array();
        // eslint-disable-next-line fp/no-let
        for (let value = from; arr.length < length; value += delta) {
            // eslint-disable-next-line fp/no-mutating-methods
            arr.push(value);
        }
        return new stdArrayNumeric(arr);
    }
    /*static fromRange(from: number, to: number): ArrayNumeric {
        let _difference = to - from;
        let _length = Math.abs(_difference);
        let _sign = _difference / _length;
        let _index = 0;
        let _value = from;
        let _arr = new Vector<number>([_length])
        while (true) {
            _arr[_index++] = _value;
            if (_value === to)
                break;
            _value += _sign;
        }
        return new ArrayNumeric(_arr)
    }*/
    min() {
        // eslint-disable-next-line fp/no-let
        let _min = undefined;
        for (const element of this) {
            if (_min === undefined || (_min !== element && element < _min))
                _min = element;
        }
        return _min;
    }
    max() {
        // eslint-disable-next-line fp/no-let
        let _min = undefined;
        for (const element of this) {
            if (_min === undefined || (_min !== element && element > _min))
                _min = element;
        }
        return _min;
    }
    map(projector) {
        // eslint-disable-next-line fp/no-let
        let notNumeric = false;
        const newArr = map(this, val => {
            const newVal = projector(val);
            if (typeof newVal !== "number" && typeof newVal !== "bigint")
                notNumeric = true;
            return newVal;
        });
        return notNumeric
            ? new stdArray(newArr)
            : new stdArrayNumeric(newArr);
    }
    mean(exclusions) {
        if (exclusions) {
            if (exclusions.meanOriginal) {
                const len = this.size;
                const validExcludedValues = new stdArrayNumeric(exclusions.excludedIndices.filter(index => number_1.stdNumber.isNumber(this.get(index))));
                const excludedSum = validExcludedValues.sum();
                const excludedLen = validExcludedValues.size;
                return (exclusions.meanOriginal - (1.0 * excludedSum / len)) * (1.0 * len / (len - excludedLen));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const arr = [...this].filter((item, index) => !exclusions.excludedIndices.includes(index));
                return new stdArrayNumeric(arr).mean();
            }
        }
        else {
            return this.sum() / this.size;
        }
    }
    variance(mean, forSample = true) {
        if (this.size === 1)
            return 0;
        const _mean = mean || this.mean();
        if (_mean === undefined)
            return undefined;
        return this.map(datum => Math.pow(datum - _mean, 2)).sum() / (this.size - (forSample ? 1 : 0));
    }
    deviation(args) {
        const forSample = args && args.forSample === false ? false : true;
        const excludedIndices = args && typeof args.mean === "object"
            ? args.mean.excludeIndices
            : undefined;
        const mean = args && typeof args.mean === "number"
            ? args.mean
            : this.mean(excludedIndices ? { excludedIndices: excludedIndices } : undefined);
        const variance = this.variance(mean, forSample);
        return variance ? Math.sqrt(variance) : undefined;
    }
    // eslint-disable-next-line fp/no-nil
    median() {
        // eslint-disable-next-line fp/no-mutating-methods
        const _ordered = this.sort();
        if (_ordered.size % 2 === 1) {
            return _ordered.get(Math.floor(this.size / 2));
        }
        else {
            // eslint-disable-next-line no-shadow, @typescript-eslint/no-non-null-assertion
            const first = _ordered.get(Math.floor(_ordered.size / 2) - 1);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const second = _ordered.get(Math.floor(_ordered.size / 2));
            return (first + second) / 2;
        }
    }
    interQuartileRange() {
        // eslint-disable-next-line fp/no-mutating-methods
        const sortedList = this.sort();
        const percentile25 = sortedList.get(Math.floor(0.25 * sortedList.size));
        const percentile75 = sortedList.get(Math.ceil(0.75 * sortedList.size));
        return percentile25 && percentile75 ? percentile75 - percentile25 : undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sum() { return this.reduce(0, (x, y) => x + y).last(); }
}
exports.stdArrayNumeric = stdArrayNumeric;
/** Eager, un-ordered, material, indexed associative collection */
class stdObject {
    constructor(obj) { this.obj = Object.freeze(Object.assign({}, obj)); }
    static fromKeyValues(keyValues) {
        const obj = {};
        for (const kv of keyValues)
            obj[kv[0]] = kv[1];
        return new stdObject(obj);
    }
    static fromArray(arr) {
        return stdObject.fromKeyValues(arr.map((elt, i) => new exports.Tuple(i.toString(), elt)));
    }
    [Symbol.iterator]() { return this.entries()[Symbol.iterator](); }
    asObject() { return Object.assign({}, this.obj); }
    get size() { return this.keys().length; }
    /** TODO: Memoize this method? */
    keys() { return Object.keys(this.obj); }
    /** TODO: Memoize this method? */
    values() { return Object.values(this.obj); }
    /** Check whether this dictionary contains a specific key or value */
    has(arg) {
        return "key" in arg
            ? this.keys().includes(arg.key)
            : this.values().includes(arg.value);
    }
    /** TODO: Memoize this method? */
    entries() { return Object.entries(this.obj); }
    pick(...keys) {
        const result = {};
        keys.forEach(k => result[k] = this.obj[k]);
        return new stdObject(result);
    }
    omit(...keys) {
        const result = this.asObject();
        // eslint-disable-next-line fp/no-delete
        keys.forEach(k => delete result[k]);
        return new stdObject(result);
    }
    map(projector) {
        const keyValues = this.entries().map(kv => new exports.Tuple(String(kv[0]), projector(kv[1], kv[0])));
        return stdObject.fromKeyValues(keyValues);
    }
    reduce(initial, reducer) {
        return this.entries().reduce((prev, curr) => reducer(prev, curr[1], curr[0]), initial);
    }
    get(selector) { return this.obj[selector]; }
    getAll(selector) { return new stdSet(map(selector, index => this.obj[index])); }
    /** Get the indexes where a value occurs or a certain predicate/condition is met */
    indexesOf(args) {
        return 'value' in args
            ? this.entries().filter(kv => kv[1] === args.value).map(kv => kv[0])
            : this.entries().filter(kv => args.predicate(kv[1]) === true).map(kv => kv[0]);
    }
}
exports.stdObject = stdObject;
//#region Iterable/Collection functions
function* take(iterable, n) {
    if (typeof n !== "number")
        throw new Error(`Invalid type ${typeof n} for argument "n"\nMust be number`);
    if (n < 0)
        throw new Error(`Invalid value ${n} for argument "n"\nMust be zero or positive number`);
    if (n > 0) {
        for (const element of iterable) {
            yield element;
            if (--n <= 0)
                break;
        }
    }
}
exports.take = take;
function* skip(iterable, n) {
    if (typeof n !== "number")
        throw new Error(`Invalid type ${typeof n} for argument "n"\nMust be number`);
    if (n < 0)
        throw new Error(`Invalid value ${n} for argument "n"\nMust be zero or positive number`);
    for (const element of iterable) {
        if (n === 0)
            yield element;
        else
            n--;
    }
}
exports.skip = skip;
function* reduce(iterable, initial, reducer) {
    for (const element of iterable) {
        initial = reducer(initial, element);
        yield initial;
    }
}
exports.reduce = reduce;
function* map(iterable, projector) {
    for (const element of iterable) {
        yield projector(element);
    }
}
exports.map = map;
function* filter(iterable, predicate) {
    for (const element of iterable) {
        if (predicate(element))
            yield element;
        else
            continue;
    }
}
exports.filter = filter;
function some(iterable, predicate) {
    for (const elt of iterable) {
        if (predicate(elt) === true)
            return true;
    }
    return false;
}
exports.some = some;
function every(iterable, predicate) {
    for (const elt of iterable) {
        if (predicate(elt) === false)
            return false;
    }
    return true;
}
exports.every = every;
/** Turns n iterables into an iterable of n-tuples
 * The shortest iterable determines the length of the result
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function zip(...iterables) {
    console.assert(iterables.every(iter => typeof iter[Symbol.iterator] === "function"));
    const iterators = iterables.map(i => i[Symbol.iterator]());
    // eslint-disable-next-line fp/no-let
    let done = false;
    return {
        [Symbol.iterator]() { return this; },
        next() {
            if (!done) {
                const items = iterators.map(i => i.next());
                done = items.some(item => item.done);
                if (!done) {
                    return { value: items.map(i => i.value), done: false };
                }
                // Done for the first time: close all iterators
                for (const iterator of iterators) {
                    if (iterator.return)
                        iterator.return();
                }
            }
            // We are done
            return { done: true, value: [] };
        }
    };
}
exports.zip = zip;
function forEach(iterable, action) {
    for (const element of iterable) {
        action(element);
    }
}
exports.forEach = forEach;
function unique(iterable) {
    return (function* (iter) {
        const arr = [];
        for (const element of iter) {
            if (!arr.includes(element)) {
                // eslint-disable-next-line fp/no-mutating-methods
                arr.push(element);
                yield element;
            }
        }
    })(iterable);
}
exports.unique = unique;
function union(collections) {
    return unique((function* () {
        for (const collection of collections) {
            for (const element of collection) {
                yield element;
            }
        }
    })());
}
exports.union = union;
function intersection(collections) {
    throw new Error(`Not Implemented`);
}
exports.intersection = intersection;
function except(src, exclusions) {
    throw new Error(`Not Implemented`);
}
exports.except = except;
function complement(target, universe) {
    throw new Error(`Not Implemented`);
}
exports.complement = complement;
function indexesOf(collection, target) {
    return 'value' in target
        ? map(filter(collection, kv => kv[1] === target.value), kv => kv[0])
        : map(filter(collection, kv => target.predicate(kv[1])), kv => kv[0]);
}
exports.indexesOf = indexesOf;
function* chunk(arr, chunkSize) {
    const batch = [...take(arr, chunkSize)];
    if (batch.length) {
        yield batch;
        yield* chunk(skip(arr, chunkSize), chunkSize);
    }
}
exports.chunk = chunk;
function first(iterable) {
    for (const element of iterable) {
        return element;
    }
}
exports.first = first;
function last(iterable) {
    // eslint-disable-next-line fp/no-let
    let result = undefined;
    for (const element of iterable) {
        result = element;
    }
    return result;
}
exports.last = last;
function sum(iterable) {
    var _a;
    return (_a = last(reduce(iterable, 0, (prev, curr) => prev + curr))) !== null && _a !== void 0 ? _a : 0;
}
exports.sum = sum;
function* flatten(target) {
    for (const element of target) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (hasValue(element) && typeof element[Symbol.iterator] === 'function')
            yield* flatten(element);
        else
            yield element;
    }
}
exports.flatten = flatten;
//#endregion
//#region Comparison Functions
function compare(x, y, comparer, tryNumeric = false) {
    // eslint-disable-next-line fp/no-let
    let _x = comparer ? comparer(x) : x;
    // eslint-disable-next-line fp/no-let
    let _y = comparer ? comparer(y) : y;
    if (typeof _x === "string" && typeof _y === "string") {
        if (tryNumeric === true) {
            const __x = parseFloat(_x);
            const __y = parseFloat(_y);
            if ((!Number.isNaN(__x)) && (!Number.isNaN(__y))) {
                return __x - __y;
            }
        }
        return new Intl.Collator().compare(_x || "", _y || "");
    }
    else if (typeof _x === "number" && typeof _y === "number") {
        return (_x || 0) - (_y || 0);
    }
    else if (_x instanceof Date && _y instanceof Date) {
        _x = _x || new Date();
        _y = _y || new Date();
        if (_x > _y)
            return 1;
        else if (_x === _y)
            return 0;
        else
            return -1;
    }
    else
        return _x === _y ? 0 : 1;
}
exports.compare = compare;
function getRanker(args) {
    //console.log(`generating comparer, try numeric is ${tryNumeric}, reversed is ${reverse} `)
    return (x, y) => {
        return compare(x, y, args.projector, args.tryNumeric) * (args.reverse === true ? -1 : 1);
    };
}
exports.getRanker = getRanker;
function getComparer(projector, tryNumeric = false, reverse = false) {
    //console.log(`generating comparer, try numeric is ${tryNumeric}, reversed is ${reverse} `)
    return (x, y) => {
        return compare(x, y, projector, tryNumeric) === 0;
    };
}
exports.getComparer = getComparer;
//#endregion
//#region General functions
function hasValue(value) {
    if (typeof value === "undefined")
        return false;
    if (value === undefined)
        return false;
    if (value === null)
        return false;
    const str = String(value);
    if (str.trim().length === 0)
        return false;
    if (/^\s*$/.test(str))
        return false;
    //if(str.replace(/\s/g,"") == "") return false
    return true;
}
exports.hasValue = hasValue;
//#endregion
//# sourceMappingURL=core.js.map
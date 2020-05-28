import * as assert from 'assert'

//export const coreFunctions = { take, skip, filter, map, reduce, zip }

export function take<T>(iterable: Iterable<T>, n: number): Iterable<T> {
	return (function* (iterable: Iterable<T>) {
		for (const element of iterable) {
			if (n-- <= 0) break // closes iterable
			yield element
		}
	}(iterable))
}
export function skip<T>(iterable: Iterable<T>, n: number): Iterable<T> {
	return (function* (iterable: Iterable<T>) {
		for (const element of iterable) {
			if (n-- > 0) continue
			yield element
		}
	}(iterable))
}
export function filter<T>(iterable: Iterable<T>, predicate: Predicate<T>): Iterable<T> {
	return (function* (iterable: Iterable<T>) {
		for (const element of iterable) {
			if (predicate(element))
				yield element
			else
				continue
		}
	})(iterable)
}
export function map<X, Y>(iterable: Iterable<X>, projector: Projector<X, Y>): Iterable<Y> {
	return (function* (iterable: Iterable<X>) {
		for (const element of iterable) {
			yield projector(element)
		}
	})(iterable)
}
export function reduce<X, Y>(iterable: Iterable<X>, initial: Y, reducer: Reducer<X, Y>): Iterable<Y> {
	return (function* (iterable: Iterable<X>) {
		for (const element of iterable) {
			initial = reducer(initial, element)
			yield initial
		}
	}(iterable))
}
/** Turns n iterables into an iterable of n-tuples (encoded as arrays of length n).
 * The shortest iterable determines the length of the result
 */
export function zip<A, B>(iter1: Iterable<A>, iter2: Iterable<B>): IterableIterator<Tuple<A, B>>
export function zip<T extends any[]>(...iterables: Iterable<ArrayElementType<T>>[]): IterableIterator<T> {
	let iterators = iterables.map(i => i[Symbol.iterator]());
	let done = false;
	return {
		[Symbol.iterator]() { return this },
		next() {
			if (!done) {
				let items = iterators.map(i => i.next())
				done = items.some(item => item.done)
				if (!done) {
					return { value: items.map(i => i.value) as T, done: false }
				}
				// Done for the first time: close all iterators
				for (let iterator of iterators) {
					if (iterator.return)
						iterator.return()
				}
			}
			// We are done
			return { done: true, value: [] as any as T }
		}
	}
}
export function forEach<T>(iterable: Iterable<T>, action: Projector<T>) {
	for (const element of iterable) {
		action(element)
	}
}

export function compare<T>(x: T, y: T, comparer?: Projector<T, any>, tryNumeric: boolean = false): number {
	let _x: any = comparer ? comparer(x) : x
	let _y: any = comparer ? comparer(y) : y

	if (typeof _x === "string" && typeof _y === "string") {

		if (tryNumeric === true) {
			let __x = parseFloat(_x);
			let __y = parseFloat(_y);
			if ((!Number.isNaN(__x)) && (!Number.isNaN(__y))) {
				return __x - __y
			}
		}

		return new Intl.Collator().compare(_x || "", _y || "");
	}
	else if (typeof _x === "number" && typeof _y === "number") {
		return (_x || 0) - (_y || 0);
	}
	else if (_x instanceof Date && _y instanceof Date) {
		_x = _x || new Date()
		_y = _y || new Date()
		if (_x > _y)
			return 1;
		else if (_x === _y)
			return 0;
		else
			return -1;
	}
	else
		return _x === _y ? 0 : 1
}
export function getRanker<T>(projector: Projector<T, any>, tryNumeric: boolean = false, reverse: boolean = false): Ranker<T> {
	//console.log(`generating comparer, try numeric is ${tryNumeric}, reversed is ${reverse} `)
	return (x: T, y: T) => {
		return compare(x, y, projector, tryNumeric) * (reverse === true ? -1 : 1)
	}
}
export function getComparer<T>(projector: Projector<T, any>, tryNumeric: boolean = false, reverse: boolean = false): Comparer<T> {
	//console.log(`generating comparer, try numeric is ${tryNumeric}, reversed is ${reverse} `)
	return (x: T, y: T) => {
		return compare(x, y, projector, tryNumeric) === 0
	}
}

export const Tuple = class <X, Y>  { constructor(x: X, y: Y) { return [x, y] as Tuple<X, Y> } } as { new <X, Y>(x: X, y: Y): [X, Y] }


export namespace Collection {
	/** Enumerable (possibly lazy) collection */
	/*
	export interface Enumerable<X> extends Iterable<X> {
		take: (n: number) => Enumerable<X>
		skip: (n: number) => Enumerable<X>
		filter: (predicate: Predicate<X>) => Enumerable<X>

		map<Y extends [S, Z], Z, S extends string>(projector: Projector<X, Y>): Enumerable<[S, Z]>
		map<Y>(projector: Projector<X, Y>): Enumerable<Y> //Y extends [string, infer Z] ? Enumerable<[string, Z]> : Enumerable<Y>

		reduce: <Y>(initial: Y, reducer: Reducer<X, Y>) => Enumerable<Y>
		forEach: (action: Projector<X>) => void

		first(): X | undefined

	}
	*/
	export abstract class Enumerable<X> implements Iterable<X> {
		abstract ctor(iterable: Iterable<X>): this
		abstract [Symbol.iterator](): Iterator<X>


		/** Convert to another iterable container type */
		to<C extends Iterable<X>>(container: { (items: Iterable<X>): C }) { return container([...this]) }

		take(n: number) { return this.ctor(take(this, n)) }
		first(): X | undefined { return [...this.take(1)][0] }
		skip(n: number) { return this.ctor(skip(this, n)) }
		filter(predicate: Predicate<X>) { return this.ctor(filter(this, predicate)) }
		forEach(action: Projector<X>) { return forEach(this, action) }

	}

	/** Concrete/Eager collection */
	export abstract class Material<T> extends Enumerable<T> {
		abstract length: number

		some(predicate: Predicate<T>): boolean {
			for (let elt of this) { if (predicate(elt) === true) return true }
			return false;
		}
		every(predicate: Predicate<T>): boolean {
			for (let elt of this) { if (predicate(elt) === false) return false }
			return true
		}

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
		get<C extends Iterable<V | undefined> = Array<V>>(indices: Iterable<K>, container?: (items: Iterable<V | undefined>) => C): C
		get(...indices: K[]): (V | undefined)[]
		get(selector: K | K[]): undefined | V | V[]

		/** Get the indexes where a value occurs or a certain predicate/condition is met */
		indexesOf<C extends Iterable<K> = Array<K>>(args:
			({ value: V } | { predicate: Predicate<V> }) &
			{ container?: (items: Iterable<K>) => C }
		): C

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
		reverse(): this

		//indexOfRange(range: Iterable<number>, fromIndex?: number, fromEnd?: boolean): number
	}
}

export type Primitive = number | string /*| boolean*/ | Date
export type ObjectLiteral<TValue = any, TKey extends string = string> = { [key in TKey]: TValue }
export type Tuple<X, Y> = [X, Y]

/** Returns -1 if a is smaller than b; 0 if a & b are equal, and 1 if a is bigger than b */
export type Ranker<X = any> = (a: X, b: X) => number
/** Returns true if a and b are equal, otherwise returns false */
export type Comparer<X = any> = (a: X, b: X) => boolean
export type Projector<X = any, Y = any> = (value: X) => Y;
export type Predicate<X = any> = (value: X) => boolean;
export type Reducer<X = any, Y = any> = (prev: Y, current: X) => Y;

export type ArrayElementType<T> = T extends (infer U)[] ? U : T
export type RecursivePartial<T> = { [P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> : T[P] }
//type RecursiveRequired<T> = { [P in keyof T]-?: Required<T[P]> }
type ArgsType<F extends (...x: any[]) => any> = F extends (...x: infer A) => any ? A : never;

//#region Tests
describe("String", () => {
	it("should check whether is a whitespace or not", () => {
		//const inputString = "";

		//assert.equal(new String__(inputString).isWhiteSpace(), true);
	});
})
//#endregion
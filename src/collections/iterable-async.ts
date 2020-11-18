/* eslint-disable no-shadow */
/* eslint-disable fp/no-rest-parameters */
/* eslint-disable fp/no-loops */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable brace-style */
/* eslint-disable fp/no-unused-expression */
/* eslint-disable fp/no-mutation */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable init-declarations */
/* eslint-disable fp/no-let */

import * as assert from "assert"
import { Tuple, TypeGuard, hasValue } from "../utility"
import { map, integers, isIterable } from "./iterable"
import { Predicate, PredicateAsync, Projector, ProjectorAsync, Reducer, ReducerAsync } from "../functional"

export type ZipAsync<A extends ReadonlyArray<unknown>> = { [K in keyof A]: A[K] extends AsyncIterable<infer T> | Iterable<infer T> ? T : never }
export type AsyncOptions = ({ mode: "parallel", resultOrder: "completion" | "original" } | { mode: "serial" })

/** AsyncIterable type guard */
export function isAsyncIterable<T, _>(val: AsyncIterable<T> | _): val is _ extends AsyncIterable<infer X> ? never : AsyncIterable<T> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return hasValue(val) && typeof (val as any)[Symbol.asyncIterator] === "function"
}

function from<X>(items: Promise<X>[], strategy: AsyncOptions) {
	const mapped = items.map((item, index) => item.then(result => new Tuple(index, result)))

	async function* parallelByCompletion(_items: Promise<[number, X]>[]): AsyncIterable<X> {
		const result = await Promise.race(_items)
		yield result[1]
		yield* parallelByCompletion(_items.filter((_, index) => index != result[0]))
	}

	switch (strategy.mode) {
		case "parallel": {
			if (strategy.resultOrder === "completion") {
				return parallelByCompletion(mapped)
			}
			else {
				//...;
			}
		}
	}
}

export async function toArrayAsync<T>(iterable: Iterable<T> | AsyncIterable<T>) {
	const arr = [] as Array<T>
	for await (const element of iterable) {
		// eslint-disable-next-line fp/no-mutating-methods
		arr.push(element)
	}
	return arr
}

export async function* indexedAsync<T>(items: Iterable<T> | AsyncIterable<T>, from = 0) {
	yield* zipAsync(integers({ from, direction: "upwards" }), items)
}

/** Turns n (possible async) iterables into an async iterable of n-tuples
 * The shortest iterable determines the length of the resulting iterable
 */
export async function* zipAsync<T extends readonly (AsyncIterable<unknown> | Iterable<unknown>)[]>(...iterables: T): AsyncIterable<ZipAsync<T>> {
	// console.assert(iterables.every(iter => isAsyncIterable(iter)))

	//const iterators = iterables.map(i => i[Symbol.asyncIterator]() as AsyncIterator<unknown>)
	const iters = iterables.map(arg =>
		isIterable(arg)
			? arg[Symbol.iterator]()
			: arg[Symbol.asyncIterator]())
	const itersDone = iters.map(iter => ({ done: false as boolean | undefined, iter }))

	try {
		while (true) {
			const results = map(iters, iter => iter.next())
			// eslint-disable-next-line no-await-in-loop
			const syncResults = await Promise.all(results)

			const zipped = new Array(iters.length)

			let i = 0
			let allDone = true as boolean | undefined
			let done = false as boolean | undefined
			for (const result of syncResults) {
				allDone = allDone && result.done
				done = done || result.done
				itersDone[i].done = result.done
				zipped[i] = result.value
				i++
			}

			if (done) break
			yield zipped as any as ZipAsync<T>
			if (allDone) break
		}
	}
	finally {
		for (const { iter, done } of itersDone) {
			// eslint-disable-next-line no-await-in-loop
			if (!done && typeof iter.return === 'function') await iter.return()
		}
	}
	// eslint-disable-next-line fp/no-let
	/*let done = false
	return {
		[Symbol.asyncIterator]() { return this },
		async next() {
			if (!done) {
				const items = await Promise.all(iterators.map(i => i.next()))
				// eslint-disable-next-line fp/no-mutation
				done = items.some(item => item.done)
				if (!done) {
					return { value: items.map(i => i.value) as unknown as Zip<T>, done: false }
				}
				// Done for the first time: close all iterators
				for (const iterator of iterators) {
					if (iterator.return)
						iterator.return()
				}
			}
			// We are done
			return { done: true, value: [] as unknown as T }
		}
	}*/
}

export async function* mapAsync<X, Y>(items: Iterable<X> | AsyncIterable<X>, projector: ProjectorAsync<X, Y>) {
	const zipped = zipAsync(integers({ from: 0, direction: "upwards" }), items)
	for await (const element of zipped) {
		yield projector(element[1], element[0])
	}
}

export async function containsAsync<A>(iterable: Iterable<A> | AsyncIterable<A>, value: A) {
	for await (const x of iterable) {
		if (x === value) return true
	}
	return false
}

export async function* takeAsync<T>(iterable: Iterable<T> | AsyncIterable<T>, n: number): AsyncIterable<T> {
	if (typeof n !== "number")
		throw new Error(`take(): Invalid type ${typeof n} for argument "n"\nMust be number`)
	if (n < 0) {
		console.warn(`Warning: Negative value ${n} passed to argument <n> of take()`)
		return
	}

	if (n > 0) {
		for await (const element of iterable) {
			yield element
			if (--n <= 0) break
		}
	}
}

export async function* skipAsync<T>(iterable: Iterable<T> | AsyncIterable<T>, n: number): AsyncIterable<T> {
	if (typeof n !== "number")
		throw new Error(`Invalid type ${typeof n} for argument "n"\nMust be number`)
	if (n < 0) {
		// console.warn(`Warning: Negative value ${n} passed to argument <n> of skip()`)
		return
	}

	for await (const element of iterable) {
		if (n === 0)
			yield element
		else
			n--
	}
}

export async function* reduceAsync<X, Y>(iterable: Iterable<X> | AsyncIterable<X>, initial: Y, reducer: Reducer<X, Y> | ReducerAsync<X, Y>): AsyncIterable<Y> {
	for await (const tuple of indexedAsync(iterable)) {
		initial = await reducer(initial, tuple[1], tuple[0])
		yield initial
	}
}

export async function forEachAsync<T>(iterable: Iterable<T> | AsyncIterable<T>, action: Projector<T> | ProjectorAsync<T>) {
	for await (const tuple of indexedAsync(iterable)) {
		// eslint-disable-next-line fp/no-unused-expression
		action(tuple[1], tuple[0])
	}
}

export async function firstAsync<T>(items: Iterable<T> | AsyncIterable<T>, predicate?: Predicate<T> | PredicateAsync<T>): Promise<T | undefined> {
	for await (const tuple of indexedAsync(items)) {
		if (predicate === undefined || predicate(tuple[1], tuple[0]))
			return tuple[1]
	}
	return undefined
}

export async function lastAsync<T>(collection: AsyncIterable<T> | Iterable<T> | ArrayLike<T> | { length: number, get: (index: number) => T }, predicate?: PredicateAsync<T>): Promise<T | undefined> {
	if ("length" in collection) { // Array-like-specific implementation of last() for better performance using direct elements access
		const accessor = (i: number) => ("get" in collection) ? collection.get(i) : collection[i]
		for (let i = collection.length - 1; i >= 0; i--) {
			const element = accessor(i)
			if (predicate === undefined || predicate(element, i))
				return element
		}
		return undefined
	}
	else {
		assert(isAsyncIterable(collection))
		// eslint-disable-next-line fp/no-let
		let _last = undefined as T | undefined
		const iterable = predicate === undefined ? collection : filterAsync(collection, predicate)
		for await (const element of iterable) {
			_last = element
		}
		return _last
	}
}

export async function someAsync<T>(iter: Iterable<T> | AsyncIterable<T>, predicate: Predicate<T> | PredicateAsync<T>) {
	for await (const tuple of indexedAsync(iter)) {
		if (predicate(tuple[1], tuple[0]) === true) return true
	}
	return false
}

export async function everyAsync<T>(items: Iterable<T> | AsyncIterable<T>, predicate: Predicate<T> | PredicateAsync<T>) {
	for await (const tuple of indexedAsync(items)) {
		if (predicate(tuple[1], tuple[0]) === false) return false
	}
	return true
}

export function filterAsync<X>(iterable: Iterable<X> | AsyncIterable<X>, predicate: PredicateAsync<X, number>): AsyncIterable<X>
export function filterAsync<X, X1 extends X>(iterable: Iterable<X> | AsyncIterable<X>, predicate: TypeGuard<X, X1>): AsyncIterable<X1>
export async function* filterAsync<X, X1 extends X>(iterable: Iterable<X> | AsyncIterable<X>, predicate: PredicateAsync<X, number> | TypeGuard<X, X1>) {
	for await (const tuple of indexedAsync(iterable)) {
		if (await predicate(tuple[1], tuple[0]))
			yield tuple[1]
		else
			continue
	}
}

/*async function mapDictAsync<X, Y, I>(projection: AsyncProjector<X, Y, I>) {
	var _map = new Dictionary<T>()
	let promisesArr = this.entries()
		.map(entry => projection(entry[1]!, entry[0]))

	let resolvedArr = await Promise.all(promisesArr)
	return new Dictionary(resolvedArr);
}*/

// export async function* filterAsync<T>(iterable: AsyncIterable<T>, predicate: PredicateAsync<T>, options: { concurrency: number }) {
// 	let c = 0

// 	const mapped = new ParallelRunner(
// 		iterable[Symbol.asyncIterator](),
// 		async item => ({ item, value: await func(item, c++) }),
// 		concurrency,
// 	)

// 	for await (const item of mapped) {
// 		if (item.value) {
// 			yield item.item
// 		}
// 	}
// }


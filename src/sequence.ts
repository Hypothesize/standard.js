
import * as assert from 'assert'
import { Dictionary } from './dictionary'

import { zip, map, reduce, Collection, ArrayElementType, Ranker, Predicate, Projector, Reducer, Comparer, Tuple, Primitive } from './shared'


//const Array = items => Array.from(items)

/** Enumerable readonly sequence of values, lazy by default */
export class Sequence<T> extends Collection.Enumerable<T> {
	private values: Iterable<T>

	static get [Symbol.species]() { return Sequence }
	constructor(iterable: Iterable<T>) { super(); this.values = iterable }
	ctor(iterable: Iterable<T>): this { return new Sequence(iterable) as this }

	[Symbol.iterator]() { return this.values[Symbol.iterator]() }

	indexed(): Sequence<Tuple<number, T>> {
		return new Sequence(zip((function* () { let counter = 0; while (true) yield counter++ })(), this))
	}

	map<Y>(projector: Projector<T, Y>): Sequence<Y> { return new Sequence<Y>(map(this, projector)) }
	reduce<Y>(initial: Y, reducer: Reducer<T, Y>): Sequence<Y> { return new Sequence<Y>(reduce(this, initial, reducer)) }

	/** Turns n iterables into an iterable of n-tuples (encoded as arrays of length n).
	 * The shortest iterable determines the length of the result
	 */
	static zip<A, B>(a: Iterable<A>, b: Iterable<B>): IterableIterator<[A, B]>
	static zip<T extends any[]>(...iterables: Iterable<ArrayElementType<T>>[]): IterableIterator<T> {
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

}
export class TupleSequence<T> extends Sequence<[string, T]> {
	toDictionary<X>() {
		return new Dictionary([...this])
	}
}


//#region Tests
describe("String", () => {
	it("should check whether is a whitespace or not", () => {
		//assert.equal(new String__(inputString).isWhiteSpace(), true);
	});
})
//#endregion
import * as assert from 'assert'
import { map, reduce, forEach, Ranker, Predicate, Projector, Reducer, Collection } from './shared'
import { ArrayNumeric, Array__ } from './array'


/** Un-ordered and materialized read-only collection */
export class Set__<T> extends Collection.Enumerable<T> implements Collection.Material<T> {
	private _set: Set<T>

	constructor(items: Iterable<T>) { super(); this._set = new Set([...items]) }
	[Symbol.iterator]() { return this._set[Symbol.iterator]() }
	ctor(iterable: Iterable<T>): this { return new Set__(iterable) as this }

	materialize() { return new Array__(this) }
	get length() { return this._set.size }
	get size() { return this._set.size }

	first() { return this._set.values[0] }

	/** Sorts set in ascending order
	 * @param ranker function used to compare each elements
	 */
	sort(ranker?: Ranker<T>, options?: { tryNumeric?: boolean }) {
		return new Array__([...this].sort(ranker))
	}
	/** Sorts array in descending order
	 * @param ranker function used to compare each elements
	 */
	sortDescending(ranker?: Ranker<T>, options?: { tryNumeric?: boolean }) {
		return new Array__([...this].sort(ranker)).reverse()
	}
	some(predicate: Predicate<T>): boolean { return [...this].some(predicate) }
	every(predicate: Predicate<T>): boolean { return [...this].every(predicate) }
	unique(): Set__<T> { return new Set__(([...this] as any as Collection.Material<T>)) }
	contains(value: T): boolean { return this._set.has(value) }
	union(...collections: Collection.Material<T>[]): Set__<T> { throw new Error('Not implemented') }
	intersection(...collections: Collection.Material<T>[]): Set__<T> { throw new Error('Not implemented') }
	except(...collections: Collection.Material<T>[]): Set__<T> { throw new Error('Not implemented') }
	complement(universe: Iterable<T>): Set__<T> { throw new Error('Not implemented') }

	map<Y>(projector: Projector<T, Y>): Set__<Y> { return new Set__(map(this, projector)) }
	reduce<Y>(initial: Y, reducer: Reducer<T, Y>): Set__<Y> { return new Set__(reduce(this, initial, reducer)) }
}


//#region Tests
if (process.env.TESTING) {
	describe("Array", () => {
		/*
		before(async () => {
			const jsDOM = (await import("jsdom")).JSDOM
			const myGlobal = global as NodeJS.Global & {
				document: Document,
				window: Window,
				navigator: Navigator
			}
			(function () {
				const jsDom = new jsDOM()
				myGlobal.window = jsDom.window
				myGlobal.document = jsDom.window.document
				myGlobal.navigator = jsDom.window.navigator
				//Enzyme.configure({ adapter: new Adapter() })
			})()
		})
		*/

		describe("", () => {
			it("should ...", () => {
				assert.equal(1, true);
			})
		})
	})
}

//#endregion
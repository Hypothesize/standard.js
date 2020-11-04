/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable brace-style */
import { Predicate, Projector, Ranker } from "../../functional"
import { min, max, sum } from "../../statistical"
import { unique, map } from "../iterable"
import { Sequence } from "./sequence"
import { Set } from "./set"


/** Eager, ordered, material collection */
export class Array<X> extends Set<X> {
	constructor(elements: Iterable<X>) {
		// eslint-disable-next-line fp/no-unused-expression
		super(elements)
	}
	private _array?: globalThis.Array<X> = undefined
	private _map?: Map<number, X> = undefined

	ctor(elements: Iterable<X>): this {
		return new Array(elements) as this
	}
	protected readonly core = ((me: this) => {
		return {
			...super.core,
			get map() {
				if (me._map === undefined) {
					// eslint-disable-next-line fp/no-mutation
					me._map = new globalThis.Map([...me._iterable].entries())
				}
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return me._map!
			},
			get array() {
				if (me._array === undefined) {
					// eslint-disable-next-line fp/no-mutation
					me._array = globalThis.Array.from([...me._iterable])
				}
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return me._array!
			}
		}
	})(this)

	get length() { return this.core.array.length }
	get size() { return this.length }

	get(index: number): X
	get(indices: Iterable<number>): X[]
	get(selection: number | Iterable<number>) {
		if (typeof selection === "number") {
			if (selection < 0 || selection >= this.length)
				throw new Error(`Array index ${selection} out of bounds`)
			return this.core.array[selection] as X
		}
		else {
			// eslint-disable-next-line fp/no-unused-expression
			console.warn(`Array get() selection arg type: ${typeof selection}`)
			return [...selection].map(index => this.get(index))
		}
	}

	/** Get the indexes where a value occurs or a certain predicate/condition is met */
	indexesOf(args: ({ value: X } | { predicate: Predicate<X> })) {
		return 'value' in args
			? this.entries().filter(kv => kv[1] === args.value).map(kv => kv[0])
			: this.entries().filter(kv => args.predicate(kv[1], kv[0]) === true).map(kv => kv[0])
	}

	entries() { return new Array(this.core.array.entries()) }

	/** Get unique items in this array
	 * ToDo: Implement use of comparer in the include() call
	 */
	unique() { return this.ctor(unique(this)) }

	/** Returns new array containing this array's elements in reverse order */
	// eslint-disable-next-line fp/no-mutating-methods
	reverse() { return this.ctor([...this].reverse()) }

	/** Array-specific implementation of map() */
	map<Y>(projector: Projector<X, Y>) { return new Array<Y>(map(this, projector)) }

	min(ranker: Ranker<X>) { return min([...this], ranker) }
	max(ranker: Ranker<X>) { return max([...this], ranker) }

	removeSliceCounted(index: number, count: number) {
		// eslint-disable-next-line fp/no-mutating-methods
		return this.ctor([...this].splice(index, count))
	}
	removeSliceDelimited(fromIndex: number, toIndex: number) {
		// eslint-disable-next-line fp/no-mutating-methods
		return this.ctor([...this].splice(fromIndex, toIndex - fromIndex + 1))
	}
}

export class ArrayNumeric extends Array<number> {
	ctor(iterable: Iterable<number>): this { return new ArrayNumeric(iterable) as this }

	static fromRange(from: number, to: number, opts?: { mode: "width", width: number } | { mode: "count", count: number }) {
		return new ArrayNumeric(Sequence.fromRange(from, to, opts))
	}

	sum() { return sum([...this]) }

	map(projector: Projector<number, number>): ArrayNumeric
	map<Y>(projector: Projector<number, Y>): Array<Y>
	map<Y>(projector: Projector<number, number> | Projector<number, Y>): ArrayNumeric | Array<Y> {
		// eslint-disable-next-line fp/no-let
		let notNumeric = false
		const newArr = map<number, number | Y>(this, (val, index) => {
			const newVal = projector(val, index)
			if (typeof newVal !== "number" && typeof newVal !== "bigint")
				// eslint-disable-next-line fp/no-mutation
				notNumeric = true
			return newVal
		})

		return notNumeric
			? new Array(newArr as Iterable<Y>)
			: new ArrayNumeric(newArr as Iterable<number>)
	}
}

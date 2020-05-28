
import * as assert from 'assert'
//import { Sequence } from './sequence'
import { Object__ } from './object'
import { Map__ } from './dictionary'
import { Set__ } from './set'
import { Number__ } from './number'
import { zip, map, reduce, Collection, Ranker, Predicate, Projector, Reducer, Comparer, Tuple, Primitive } from './shared'

//const arrayCreator: { (items: Iterable<number>): C }  = (i => Array.from(i))

/** Ordered and materialized read-only collection */
export class Array__<T> extends Collection.Enumerable<T> implements Collection.Ordered<T> {
	private _arr: T[]

	constructor(arg?: Iterable<T> | number) {
		super()
		this._arr = typeof arg === "number"
			? new global.Array(arg)
			: [...arg || []]
	}
	ctor(iterable: Iterable<T>): this { return new Array__(iterable) as this }
	[Symbol.iterator]() { return this._arr[Symbol.iterator]() }

	get length() { return this._arr.length }
	get size() { return this.length }

	indexed(): Array__<Tuple<number, T>> {
		return new Array__(zip((function* () { let counter = 0; while (true) yield counter++ })(), this))
	}

	static equals<T>(x: Array__<T>, y: Array__<T>, comparer?: Comparer<T>): boolean | undefined {
		if (!x && !y) return true
		if (!x || !y) return false
		if (x.length !== y.length) return false

		let _comparer = comparer || ((x, y) => x === y)
		for (let index = 0; index < x.length; index++) {
			if (_comparer(x.get(index)!, y.get(index)!) === false)
				return false
		}
		return true
	}

	get(index: number): T | undefined
	get(indices: Iterable<number>): (T | undefined)[]
	get(...indices: number[]): (T | undefined)[]
	get(selection: number | Iterable<number>) {
		if (typeof selection === "number") {
			return this._arr[selection] as (T | undefined)
		}
		else {
			console.warn(`Array get() selection arg type: ${typeof selection}`)
			//console.assert(Object__.isIterable(selection), `Array get() selection arg not iterable`)
			return [...selection].map(index => this._arr[index] as (T | undefined))
		}
	}

	set(...keyValues: { value: T, index: number }[]): Array__<T> {
		let arr = [...this]
		keyValues.forEach(keyValue => {
			if (arr.length > keyValue.index) {
				arr[keyValue.index] = keyValue.value
			}
		})
		return new Array__(arr)
	}
	merge(...keyValues: { value: Partial<T>, index: number }[]): Array__<T> {
		let arr = [...this]
		keyValues.forEach(keyValue => {
			if (keyValue.index >= 0 && arr.length > keyValue.index) {
				arr[keyValue.index] = Object__.merge(arr[keyValue.index], keyValue.value)
			}
		})
		return new Array__(arr)
	}
	removeItems(hasher: Projector<T, Primitive>, ...itemsToRemove: T[]): Array__<T> {
		let itemsToRemoveMapped = itemsToRemove.map(hasher)
		return this.filter(item => !itemsToRemoveMapped.includes(hasher(item)))
	}
	removeIndices(indices: number[]): Array__<T> {
		let index = 0
		return this.filter(item => !indices.includes(index++))
	}
	removeSliceCounted(index: number, count: number) { return this.ctor([...this].splice(index, count)) }
	removeSliceDelimited(fromIndex: number, toIndex: number): Array__<T> { return this.ctor([...this].splice(fromIndex, toIndex - fromIndex + 1)) }

	insert(index: number, ...items: T[]): Array__<T> {
		let x = new Array__([""]).indexesOf({ value: "hello" })

		let arr = [...this]
		return this.ctor([...arr.slice(0, index), ...items, ...arr.slice(index)])
	}

	/** Get the indexes where a value occurs or a certain condition is met */
	indexesOf<C extends Iterable<number> = Array<number>>(args:
		(
			({ value: T } | { predicate: Predicate<T> }) &
			{ container?: (items: Iterable<number>) => C }
		)): C {

		let container: { (items: Iterable<number>): C } = args.container ?? (i => Array.from(i) as unknown as C)
		return container('value' in args
			? (function* (_self: Array__<T>) {
				let val = args.value
				for (let i = _self._arr.indexOf(val); i >= 0; i = _self._arr.indexOf(val, i + 1)) {
					yield i
				}

			})(this)

			: (function* (_self: Array__<T>) {
				let _length = _self._arr.length
				for (let i = 0; i < _length; i++) {
					if ((args.predicate)(_self._arr[i]))
						yield i
				}
			})(this)
		)
	}

	join(separator: string): string {
		return [...this].join(separator)
	}

	/** Get 1st element (or 1st element to satisfy an optional predicate) of collection
	 * @param func Optional predicate to filter elements
	 * @returns First element as defined above, or <undefined> if such an element is not found
	 */
	first(predicate?: Predicate<T>): T | undefined {
		if (!predicate)
			return this.get(0)
		else
			return this._arr.find(predicate)
	}

	/** Get last element (or last element to satisfy an optional predicate) of this collection
	 * @param func Optional predicate to filter elements
	 * @returns Last element as defined above, or <undefined> if such an element is not found
	 */
	last(predicate?: Predicate<T>): T | undefined {
		if (!predicate)
			return this.get(this.length - 1)
		else
			return this._arr.reverse().find(predicate)
	}

	/** Returns new array containing this array's elements in reverse order */
	reverse() { return this.ctor([...this].reverse()) }

	//hasKey(key: number): boolean { return this._arr.length > key }
	//keys(): Iterable<number> { return this._arr.keys() }
	//entries(): Array__<[number, T]> { return this.ctor(this._arr.entries()) }
	//values(): Iterable<T> { return this._arr.values() }

	some(predicate: Predicate<T>): boolean { return this._arr.some(predicate) }
	every(predicate: Predicate<T>): boolean { return this._arr.every(predicate) }
	/** Sorts array in ascending order
	 * @param comparer function used to compare each elements
	 */
	sort(comparer?: Ranker<T>, options?: { tryNumeric?: boolean }) { return this.ctor(this._arr.sort(comparer)) }

	/** Sorts array in descending order
	 * @param comparer function used to compare each elements
	 */
	sortDescending(comparer?: Ranker<T>, options?: { tryNumeric?: boolean }) { return this.sort(comparer).reverse() }
	unique(comparer?: Comparer<T>): Set__<T> {
		let arr: T[] = []
		for (let item of this) {
			if (!arr.includes(item))
				arr.push(item)
		}

		return new Set__(arr)
	}

	has(value: T): boolean { return this._arr.indexOf(value) >= 0 }
	contains(value: T): boolean { return this._arr.indexOf(value) >= 0 }
	includes(value: T): boolean { return this._arr.indexOf(value) >= 0 }

	static flatten<X>(target: any[]): Array__<X> {
		if (target.length === 0)
			return new Array__<X>([])

		let result: X[] = []
		for (let val of target) {
			result = result.concat(Array.isArray(val)
				? Array__.flatten(val)
				: val
			)
		}

		return new Array__<X>(result)
	}
	flatten<X>(): Array__<X> {
		if (this.length === 0)
			return new Array__<X>([])

		let result: X[] = []
		for (let val of this) {
			result = [...result.concat(Array.isArray(val)
				? Array__.flatten(val as any)
				: val as any
			)]
		}

		return new Array__<X>(result)
	}

	map<Y>(projector: Projector<T, Y>): Array__<Y> { return new Array__(map(this, projector)) }
	reduce<Y>(initial: Y, reducer: Reducer<T, Y>): Array__<Y> { return new Array__(reduce(this, initial, reducer)) }

	union(...collections: Collection.Material<T>[]): Array__<T> { return this.ctor([]) }
	intersection(...collections: Collection.Material<T>[]): Array__<T> { return this.ctor([]) }

	except(...collections: Collection.Material<T>[]): Array__<T> { return this.ctor([]) }
	complement(universe: Iterable<T>): Array__<T> { return this.ctor([]) }

	isDuplicated(value: T): boolean {
		return this.indexesOf({ value, container: items => new Array__(items) }).skip(1).first() !== undefined
	}
	frequencies(): Map__<T, number> { return Map__.fromFrequencies(this) }
	frequenciesPercentScaled(): Map__<T, number> {
		return this.frequencies().map(freq => freq * 100 / this.length)
	}
	frequency(item: T): number { return this.filter(_item => _item === item).length }
	mode(): T | undefined {
		const freqs = this.frequencies().sort(x => x)
		return freqs.getArray()[freqs.length - 1][0]
	}
	median() {
		return this.sort().get(this.length / 2)
	}
	min(ranker?: Ranker<T>): T | undefined {
		const _ranker = ranker || ((a, b) => (a > b) ? 1 : a == b ? 0 : -1)
		let _min = this.first()
		if (_min !== undefined)
			for (let element of this.skip(1)) {
				if (_min !== element && _ranker(element, _min) < 0)
					_min = element
			}
		return _min
	}
	max(ranker?: Ranker<T>): T | undefined {
		const _ranker = ranker || ((a, b) => (a > b) ? 1 : a == b ? 0 : -1)
		let _min = this.first()
		if (_min !== undefined)
			for (let element of this.skip(1)) {
				if (_min !== element && _ranker(element, _min) > 0)
					_min = element
			}
		return _min
	}

	firstQuartile(): T { throw new Error(`Not implemented`) }
	thirdQuartile(): T { throw new Error(`Not implemented`) }

}
export class ArrayNumeric extends Array__<number> {
	ctor(iterable: Iterable<number>): this { return new ArrayNumeric(iterable) as this }

	static fromRange(from: number, to: number, opts?: { mode: "width", width: number } | { mode: "count", count: number }): ArrayNumeric {
		if (opts) {
			if (opts.mode === "width" && opts.width <= 0) throw new Error("width must be positive non-zero number")
			if (opts.mode === "count" && opts.count <= 0) throw new Error("count must be positive non-zero number")
		}

		let diff = to - from
		let sign = to >= from ? 1 : -1
		let delta = opts === undefined
			? sign
			: opts.mode === "width"
				? (opts.width * sign)
				: diff / opts.count


		let length = Math.floor(diff / delta) + 1

		let arr = new global.Array<number>()
		for (var value = from; arr.length < length; value += delta) {
			arr.push(value)
		}

		return new ArrayNumeric(arr)
	}

	/*static fromRange(from: number, to: number): ArrayNumeric {
		let _difference = to - from;
		let _length = Math.abs(_difference);
		let _sign = _difference / _length;
		let _index = 0;
		let _value = from;
		let _arr = new Array__<number>([_length])
		while (true) {
			_arr[_index++] = _value;
			if (_value === to)
				break;
			_value += _sign;
		}
		return new ArrayNumeric(_arr)
	}*/

	min(): number | undefined {
		let _min: number | undefined = undefined
		for (let element of this) {
			if (_min === undefined || (_min !== element && element < _min))
				_min = element
		}
		return _min
	}
	max(): number | undefined {
		let _min: number | undefined = undefined
		for (let element of this) {
			if (_min === undefined || (_min !== element && element > _min))
				_min = element
		}
		return _min
	}

	map(projector: Projector<number, number>): ArrayNumeric
	map<Y>(projector: Projector<number, Y>): Array__<Y>
	map<Y>(projector: Projector<number, number> | Projector<number, Y>): ArrayNumeric | Array__<Y> {
		let notNumeric = false;
		let newArr = map<number, number | Y>(this, val => {
			let newVal = projector(val)
			if (typeof newVal !== "number" && typeof newVal !== "bigint")
				notNumeric = true
			return newVal
		})

		return notNumeric
			? new Array__(newArr as Iterable<Y>)
			: new ArrayNumeric(newArr as Iterable<number>)
	}

	reduce(initial: number, reducer: Reducer<number, number>): ArrayNumeric
	reduce<Y>(initial: Y, reducer: Reducer<number, Y>): Array__<Y>
	reduce<Y>(initial: number | Y, reducer: (Reducer<number, number>) | (Reducer<number, Y>)): ArrayNumeric | Array__<Y> {
		let notNumeric = false
		let newArr = reduce<number | Y, number | Y>(this, initial, (prev, curr) => {
			let newVal = (reducer as Reducer<number | Y, number | Y>)(prev, curr)
			if (typeof newVal !== "number" && typeof newVal !== "bigint")
				notNumeric = true
			return newVal
		})

		return notNumeric
			? new Array__(newArr as Iterable<Y>)
			: new ArrayNumeric(newArr as Iterable<number>)
	}

	mean(exclusions?: { excludedIndices: number[], meanOriginal?: number }): number {
		if (exclusions) {
			if (exclusions.meanOriginal) {
				const len = this.length
				const validExcludedValues = new ArrayNumeric(exclusions.excludedIndices.filter(index => Number__.isNumber(this.get(index))))
				const excludedSum = validExcludedValues.sum()
				const excludedLen = validExcludedValues.length
				return (exclusions.meanOriginal - (1.0 * excludedSum / len)) * (1.0 * len / (len - excludedLen))
			}
			else {
				let arr = [...this].filter((item, index) => !exclusions.excludedIndices.includes(index!))
				return new ArrayNumeric(arr).mean()
			}
		}
		else {
			return this.sum() / this.length
		}
	}
	variance(mean?: number, forSample = true): number | undefined {
		if (this.length === 1)
			return 0

		const _mean = mean || this.mean()
		if (_mean === undefined)
			return undefined

		return this.map(datum => Math.pow(datum - _mean, 2)).sum() / (this.length - (forSample ? 1 : 0))
	}
	deviation(args?: { mean?: number | { excludeIndices: number[] }, forSample: boolean }): number | undefined {
		const forSample = args && args.forSample === false ? false : true
		const excludedIndices = args && typeof args.mean === "object"
			? args.mean.excludeIndices
			: undefined
		const mean = args && typeof args.mean === "number"
			? args.mean
			: this.mean(excludedIndices ? { excludedIndices: excludedIndices } : undefined)

		let variance = this.variance(mean, forSample)
		return variance ? Math.sqrt(variance) : undefined
	}
	median(): number | undefined {
		let _ordered = this.sort();
		if (_ordered.length % 2 === 1) {
			return _ordered.get(Math.floor(this.length / 2))
		}
		else {
			const first = _ordered.get(Math.floor(_ordered.length / 2) - 1)!
			const second = _ordered.get(Math.floor(_ordered.length / 2))!
			return (first + second) / 2
		}
	}
	interQuartileRange() {
		const sortedList = this.sort()
		const percentile25 = sortedList.get(Math.floor(0.25 * sortedList.length))
		const percentile75 = sortedList.get(Math.ceil(0.75 * sortedList.length))
		return percentile25 && percentile75 ? percentile75 - percentile25 : undefined
	}
	sum() {
		return this.reduce(0, (x, y) => x + y).last()!
	}

	removeRange(from: number, to: number, mapper: Projector<number, Primitive>) {
		throw new Error("removeRange() invalid operation on a general array")
	}
}

declare var global: NodeJS.Global & { document: Document, window: Window, navigator: Navigator }

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
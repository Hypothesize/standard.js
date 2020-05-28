
import * as assert from 'assert'
import { compare, ObjectLiteral, Collection, Ranker, Predicate, Projector, Reducer, Comparer, Tuple, Primitive } from './shared'



function fromKeyValues<T, K extends string = string>(keyValues: Tuple<K, T>[]) {
	let obj = {} as ObjectLiteral<T, K>
	keyValues.forEach(kvp => { obj[kvp[0]] = kvp[1] })
	return obj
}
function entries() {

}

/** Un-ordered, materialized, and indexed read-only collection */
export class Dictionary<V, K extends string = string> extends Collection.Enumerable<[K, V]> implements Collection.IndexedExtended<K, V> {
	private readonly _obj: Readonly<ObjectLiteral<V, K>>

	constructor(kvs?: Iterable<[K, V]>) {
		super()
		this._obj = kvs ? fromKeyValues([...kvs]) : {} as Readonly<ObjectLiteral<V, K>>
	}
	ctor(iterable: Iterable<[K, V]>): this { return new Dictionary(iterable) as this }

	static fromObject<T, K extends string>(obj: ObjectLiteral<T, K>): Dictionary<T, K> {
		if (!obj)
			throw new Error(`Obj argument missing in Dictionary.fromObject(...)`)
		return new Dictionary(Object.keys(obj).map((key, index) => new Tuple(key as K, (obj as any)[key])))
	}
	static fromArray<T>(arr: T[]) {
		return new Dictionary(arr.map((element, index) => new Tuple(index.toString(), element)))
	}
	static fromKeys<T>(arr: any[], defaultVal: T) {
		return new Dictionary(arr.map((element, index) => new Tuple(element.toString() as string, defaultVal)))
	}
	static fromProjection<K extends string, V, T = any>(
		items: Iterable<T>,
		keysProjector: Projector<T, K>,
		valuesProjector: Projector<T, V>) {
		return new Dictionary<V, K>([...items].map(item => {
			let key = keysProjector(item) //as K
			let value = valuesProjector(item) //as V
			return new Tuple(key, value)
		}))
	}

	[Symbol.iterator]() { return Object.entries<V>(this._obj).map(keyval => keyval as [K, V])[Symbol.iterator]() }

	get size() { return this.keys().length }

	get(index: K): V | undefined
	get(indices: K[]): (V | undefined)[]
	get(...indices: K[]): V[]
	get(selector: K | K[]): undefined | V | (V | undefined)[] {
		try {
			if (global.Array.isArray(selector))
				return selector.map(index => this.get(index))
			else
				return this._obj[selector]
		}
		catch (e) {
			console.error(`Error in Dictionary.get(); selection is: ${selector}; typeof selection is: ${typeof selector}`)
			throw e
		}
	}

	set(...keyValues: [K, V][]): Dictionary<V, K> { return new Dictionary([...this.entries(), ...keyValues]) }

	indexesOf<C extends Iterable<K>>(args:
		({ value: V } | { predicate: Predicate<V> }) &
		{ container?: (items: Iterable<K>) => C }) {

		let container: { (items: Iterable<K>): C } = args.container ?? (i => Array.from(i) as unknown as C)
		return container((function* (_self: Dictionary<V, K>) {
			let keys = Object.keys(_self._obj) as K[]
			let length = keys.length
			for (let i = 0; i < length; i++) {
				let canYield = 'predicate' in args
					? (args.predicate)(_self._obj[keys[i]])
					: (args.value) === _self._obj[keys[i]]
				if (canYield)
					yield keys[i]
			}
		})(this))
	}

	entries<C extends Iterable<[K, V]> = Array<[K, V]>>(container?: (items: Iterable<[K, V]>) => C): C {
		return (container ?? (i => Array.from(i) as unknown as C))(Object.entries(this._obj) as [K, V][])
	}

	keys<C extends Iterable<K> = Array<K>>(container?: (items: Iterable<K>) => C): C {
		return (container ?? (i => Array.from(i) as unknown as C))(Object.keys(this._obj) as K[])
	}
	hasKey(key: K) { return this.keys().includes(key) }

	values<C extends Iterable<V> = Array<V>>(container?: (items: Iterable<V>) => C): C {
		return (container ?? (i => Array.from(i) as unknown as C))(Object.values(this._obj) as V[])
	}
	hasValue(value: V) { return this.values().includes(value) }

	map<K1 extends string, V1>(projector: Projector<[K, V], [K1, V1]>): Dictionary<V1, K1> {
		return new Dictionary(this.entries().map(projector))
	}
	reduce<Y>(initial: Y, reducer: Reducer<[K, V], Y>) {
		return this.entries().reduce(reducer, initial)
	}

	asObject(): ObjectLiteral<V, K> {
		let _obj = {} as ObjectLiteral<V, string>
		Object.keys(this._obj).forEach(key => {
			_obj[key] = this._obj[key] as any
		})
		return _obj
	}
}

export class Map__<K = any, V = any> extends global.Map<K, V> /*implements Collection.Indexed<K, V>*/ {
	private _comparer?: Comparer<V>

	constructor(items?: Iterable<Tuple<K, V>>, comparer?: Comparer<V>) {
		super([...items || []].map(tuple => [tuple[0], tuple[1]] as [K, V]))
		this._comparer = comparer
	}

	static fromProjection<K, V, T = any>(items: Iterable<T>, keysProjector?: Projector<T, K>, valuesProjector?: Projector<T, V>): Map__<K, V> {
		return new Map__<K, V>([...items].map(item => {
			let key = (keysProjector ? keysProjector(item) : item) as K
			let value = (valuesProjector ? valuesProjector(item) : item) as V
			return new Tuple(key, value)
		}))
	}
	static fromKeys<T>(keys: Iterable<T>, seed?: any): Map__<T, any> {
		return new Map__<T, any>([...keys].map(_key => new Tuple(_key, seed)))
	}
	static fromObject<V, K extends string>(obj: ObjectLiteral<V, K>) {
		if (!obj)
			return new Map__<K, V>()
		return Object.keys(obj).reduce((map, key) => map.set(key as K, obj[key]), new Map__<K, V>());
	}
	static fromFrequencies<T>(items: Iterable<T>): Map__<T, number> {
		let freqs = new Map__<T, number>(); //semi-colon required at end of this statement
		[...items].forEach(item => {
			freqs.set(item, (freqs.get(item) || 0) + 1)
		})
		return freqs
	}

	get length(): number {
		return [...this.keys()].length;
	}

	asObject() {
		let obj = {} as ObjectLiteral<V, string>
		this.forEach((value, key) => {
			if (key)
				obj[new String(key).toString()] = value
		})
		return obj
	}
	getArray() {
		return [...this.keys()].map(key => [key, this.get(key) as V] as Tuple<K, V>)
	}

	clone(): Map__<K, V> {
		return new Map__([...this.entries()], this._comparer)
	}
	deepClone() {
		throw new Error("Not implemented")
	}

	intersection(other: Map__<K, V>, valuesComparer?: Comparer<V>) {
		if (!other)
			return new Map__<K, V>()

		let _comparer = valuesComparer || this._comparer;
		return this
			.filter((value, key) =>
				other.has(key) && (_comparer
					? (_comparer(other.get(key)!, value) === true)
					: (other.get(key) === value)))
	}

	equals(
		other: Map__<K, V>,
		valuesComparer?: Comparer<V>): boolean {

		if (!other)
			return false
		let _comparer = valuesComparer || this._comparer;
		return this.length === other.length && this.intersection(other, _comparer).length === this.length
	}

	map<T>(projection: Projector<V, T>): Map__<K, T> {
		var _map = new Map__()
			; (this as any as Map<K, V>).forEach((_value, _key) => {
				_map.set(_key, projection(_value))
			})
		return _map
	}
	sort(projection: Projector<V, Primitive>): Map__<K, V> {
		return new Map__([...this.getArray()]
			.sort((x, y) =>
				compare(x[1], y[1], value => projection(value))
			))
	}

	/*async mapAsync<T>(projection: AsyncProjector<V, T, K>): Promise<Map__<K, T>> {
		var _map = new Map__<K, T>();
		let promisesArr = this.getArray()
			.map(entry => projection(entry[1]!, entry[0]))

		let resolvedArr = await Promise.all(promisesArr)
		return new Map__(resolvedArr);
	}*/

	filter(predicate: (value: V, key: K) => boolean): Map__<K, V> {

		let arr: Tuple<K, V>[] = [];
		for (let entry of this.entries()) {
			if (predicate(entry[1], entry[0]) === true)
				arr.push(new Tuple(entry[0], entry[1]))
		}
		return new Map__<K, V>(arr);
	}
	every(predicate: (value: V, key: K) => any): boolean {
		for (let entry of this.entries()) {
			if (predicate(entry[1], entry[0]) === false)
				return false;
		}
		return true;
	}
	some(predicate: (value: V, key: K) => any): boolean {
		for (let entry of this.entries()) {
			if (predicate(entry[1], entry[0]) === true)
				return true;
		}
		return false;
	}
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
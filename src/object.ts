
import { cloneDeep, mergeWith } from "lodash"
import * as assert from 'assert'
import { Dictionary } from './dictionary'
import { Set__ } from './set'

import { RecursivePartial, ArrayElementType, ObjectLiteral, Ranker, Predicate, Projector, Reducer, Comparer, Tuple, Primitive } from './shared'


export class Object__ extends global.Object {
	static keys<T extends object>(obj: T): (keyof T)[]
	static keys<K extends string = string>(obj: ObjectLiteral<any, K>): K[]
	static keys<K extends string = string>(obj: {}): string[]
	static keys<K extends string = string>(obj: {} | ObjectLiteral<any, K>) {
		return super.keys(obj) //as K[]
	}

	//static values<T extends object>(obj: T): any[]
	static values<V>(obj: Readonly<ObjectLiteral<V>>): V[]
	static values<V>(obj: ObjectLiteral<V>): V[] {
		return super.values(obj) //as K[]
	}

	static map<X, Y>(obj: ObjectLiteral<X>, projector: Projector<[string, X], Y>) {
		return Dictionary.fromObject(obj).map(x => new Tuple(x[0], projector(x))).asObject()
	}

	static omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
		let result = obj
		keys.forEach(k => delete result[k])
		return result
	}

	static pick<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
		let result = {} as Pick<T, K>
		keys.forEach(k => result[k] = obj[k])
		return result
	}

	static clone<T>(value: T/*, maxDepth: number = 7, depth: number = 0*/): T {
		return cloneDeep(value)
	}

	static hasValue(value: any): boolean {
		if (typeof value === "undefined") return false;
		if (value === undefined) return false;
		if (value === null) return false;

		let str = value.toString() as string
		if (str.trim().length === 0) return false;
		if (/^\s*$/.test(str)) return false
		//if(str.replace(/\s/g,"") == "") return false
		return true
	}

	static shallowEquals(obj1: any, obj2: any, ignoreUnmatchedProps = false) {
		// let x = typeof obj1

		if (typeof obj1 !== typeof obj2) {
			return false
		}
		else if (typeof obj1 === "function") {
			return obj1.toString() === obj2.toString()
		}
		else if (typeof obj1 !== "object") {
			return obj1 === obj2
		}
		else {
			let keysToCheck = ignoreUnmatchedProps
				? new Set__(Object.keys(obj1)).intersection(new Set__(Object.keys(obj2)))
				: new Set__(Object.keys(obj1)).union(new Set__(Object.keys(obj2)))

			return keysToCheck.every(key => obj1[key] === obj2[key])
		}
	}

	static fromKeyValues<T, K extends string = string>(keyValues: Tuple<K, T>[]) {
		let obj = {} as ObjectLiteral<T, K>
		keyValues.forEach(kvp => {
			obj[kvp[0]] = kvp[1]
		})

		return obj
	}

	static entries<V, K extends string = string>(obj: ObjectLiteral<V, K>) {
		return Object__.keys(obj).map((key, index) => new Tuple(key, obj[key]))
	}

	static merge<X>(target: X, source: RecursivePartial<X> | undefined | null): X
	static merge<X>(target: X, source: Partial<X> | undefined | null): X
	static merge<X>(target: Partial<X> | undefined | null, source: X): X
	static merge<X>(target: X, source: undefined | null): X
	static merge<X>(target: undefined | null, source: X): X
	static merge<X, Y>(target: X, source: Y): X & Y
	/** Merges source onto target; Returns new object only if resulting content different from both target and source */
	static merge<X, Y>(target: X, source: Y): X | Y | X & Y {
		if (target === null || target === undefined)
			return source as Y
		//return Object__.clone(source) as Y
		else if (source === null || source === undefined)
			// return target as X
			return Object__.clone(target) as X
		else if (typeof source !== "object" || typeof target !== "object")
			// return source as Y
			return Object__.clone(source) as Y
		else {
			let result = Object__.clone(target)
			// let result = { ...target as any as object } as X
			return mergeWith(result, source, (objValue: any, srcValue: any) => {
				if (global.Array.isArray(objValue)) {
					if (srcValue === undefined)
						return objValue
					else
						return srcValue
				}
			})

			// => { 'a': [1, 3], 'b': [2, 4] }

			// for (var srcKey in source) {
			//     let merged = false
			//     for (var tgtKey in result) {
			//         if (srcKey.toString() === tgtKey.toString()) {

			//             try {
			//                 result[tgtKey] = Object__.merge(result[tgtKey], source[srcKey])
			//                 merged = true
			//             }
			//             catch (e) {
			//                 console.error(`Object.merge: Error merging key "${tgtKey}": ${e}`)
			//                 throw e
			//             }
			//         }
			//     }

			//     if (merged === false)
			//         (result as any)[srcKey] = source[srcKey]
			// }
			// return result
		}
	}

	static mergeAll<X = any>(...objects: (Partial<X>)[]): X
	static mergeAll(...objects: any[]): any {
		return this.merge(objects[0], this.mergeAll(...objects.slice(1)))
	}

	static isIterable(val: any) {
		return val !== null && val !== undefined && typeof val[Symbol.iterator] === 'function'
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



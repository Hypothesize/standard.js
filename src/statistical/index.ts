/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-shadow */
/* eslint-disable brace-style */
import { reduce, last, filter, map, sort } from "../collections/iterable"
import { Ranker } from "../functional"
import { Tuple, isNumber } from "../utility"

export function min(vector: Iterable<number>): number | undefined
export function min<T>(vector: Iterable<T>, ranker: Ranker<T>): T | undefined
export function min<T>(vector: Iterable<T> | Iterable<number>, ranker?: Ranker<unknown>) {
	// eslint-disable-next-line fp/no-let
	let min = undefined
	// eslint-disable-next-line fp/no-loops
	for (const x of vector) {
		if (min === undefined || (ranker && ranker(x, min) < 0) || (!ranker && x < min))
			// eslint-disable-next-line fp/no-mutation
			min = x
	}

	return min
}

export function max<T>(vector: Iterable<number>): number | undefined
export function max<T>(vector: Iterable<T>, ranker: Ranker<T>): T | undefined
export function max(vector: Iterable<unknown>, ranker?: Ranker<unknown>) {
	if (ranker) {
		return last(reduce(
			vector,
			undefined as unknown,
			(prev, curr) => (prev === undefined || (ranker(curr, prev) > 0)) ? curr : prev
		))
	}
	else {
		return last(reduce(
			vector as Iterable<number>,
			undefined as number | undefined,
			(prev, curr) => (prev === undefined || curr > prev) ? curr : prev
		))
	}
}

export function sum(vector: number[]): number {
	return last(reduce(vector, 0, (x, y) => x + y)) || 0
}

export function mean(vector: number[], opts?:
	{
		excludedIndices: number[],
		original?: number
	}): number | undefined {

	const len = vector.length
	if (len === 0) return undefined

	if (opts) {
		if (opts.original) {
			const validExcludedValues = opts.excludedIndices
				.filter(index => isNumber(vector[index]))
				.map(index => vector[index])
			const excludedSum = sum(validExcludedValues)
			const excludedLen = validExcludedValues.length
			return (opts.original - (1.0 * excludedSum / len)) * (1.0 * len / (len - excludedLen))
		}
		else {
			return mean(vector.filter((item, index) => !opts.excludedIndices.includes(index)))
		}
	}
	else {
		return sum(vector) / len
	}
}

export function variance(vector: number[], opts?:
	{
		mean?: number | {
			excludedIndices: number[],
			original?: number
		},
		forSample?: boolean /* default true*/
	}): number | undefined {

	const len = vector.length
	if (len === 1) return 0
	if (len === 0) return undefined

	const _mean = typeof opts?.mean === "number"
		? opts.mean
		: mean(vector, opts?.mean)

	return _mean !== undefined
		? sum(vector.map(datum => Math.pow(datum - _mean, 2))) / (len - ((opts?.forSample ?? true) ? 1 : 0))
		: undefined
}

export function deviation(vector: number[], opts?:
	{
		mean?: number | {
			excludedIndices: number[],
			original?: number
		},
		forSample?: boolean /* default true*/
	}): number | undefined {

	const _variance = variance(vector, opts)
	return _variance !== undefined ? Math.sqrt(_variance) : undefined
}

/** Returns the median of an array
 * If no ranker is passed, all values should have the same type (otherwise an error will be thrown), and will be ranked accordingly.
 * If a ranker is passed as a type, all values will be parsed as that type (an error will be thrown if it cannot be)
 * If a ranker is passed as a function, the function will be used on the values, no matter their type
 * If mutable is true, there won't be a duplication of the passed array, which is faster but leaves the passed array mutated.
 */
export function median<T extends number | string | Date>(vector: Array<T>, ranker?: "number" | "string" | "date" | Ranker<T>, mutable?: boolean): T | undefined {
	if (vector.length === 0) { return undefined }

	const implicitRankingType = ranker === undefined
		? vector[0] instanceof Date
			? "date"
			: typeof vector[0]
		: undefined

	const explicitRankingType = ranker && typeof ranker !== "function"
		? ranker
		: undefined

	switch (implicitRankingType) {
		case "number":
		case "bigint": {
			vector.forEach(val => {
				if (!["bigint", "number"].includes(typeof val)) {
					throw new Error(`Value ${val} was not of type number, like the first value`)
				}
			})
			break
		}
		case "string": {
			vector.forEach(val => {
				if (typeof val !== "string") {
					throw new Error(`At least one value was of type string, like the first value`)
				}
			})
			break
		}
		case "date": {
			vector.forEach(val => {
				if (!(val instanceof Date)) {
					throw new Error(`At least one value was of type Date, like the first value`)
				}
			})
			break
		}
		case undefined: {
			break // If we don't use an implicit sorting type, we don't verify the similarity of value types
		}
		default: {
			throw new Error(`Type '${implicitRankingType}' not supported`)
		}
	}

	switch (explicitRankingType) {
		case "number": {
			vector.forEach(val => {
				if (val.toString === undefined || isNaN(parseFloat(val.toString()))) {
					throw new Error(`Value '${val}' was not parseable to a number`)
				}
			})
			break
		}
		case "string": {
			vector.forEach(val => {
				if (val.toString === undefined) {
					throw new Error(`Value ${val} least one value was not parseable to a string`)
				}
			})
			break
		}
		case "date": {
			vector.forEach(val => {
				if (isNaN(new Date(val).getTime())) {
					throw new Error(`Value ${val} least one value was not parseable to a date`)
				}
			})
			break
		}
		case undefined:
		default: {
			break // If we don't use an explicit sorting type, we don't verify the parseability of value types
		}
	}

	const rankingType = explicitRankingType || implicitRankingType

	const sortingMethod = typeof ranker === "function"
		? ranker
		: rankingType === "string"
			? (a: T, b: T) => { return a.toString() > b.toString() ? 1 : -1 }
			: rankingType === "number"
				? (a: T, b: T) => {
					return parseFloat(a.toString()) > parseFloat(b.toString()) ? 1 : -1
				}
				: rankingType === "date"
					? (a: T, b: T) => {
						return new Date(a) > new Date(b) ? 1 : -1
					}
					: undefined

	const _ordered = mutable === true
		// eslint-disable-next-line fp/no-mutating-methods
		? vector.sort(sortingMethod)
		// eslint-disable-next-line fp/no-mutating-methods
		: [...vector].sort(sortingMethod)

	if (_ordered.length % 2 === 1) {
		return _ordered[Math.floor(vector.length / 2)]
	}
	else {
		// eslint-disable-next-line no-shadow, @typescript-eslint/no-non-null-assertion
		const first = _ordered[Math.floor(_ordered.length / 2) - 1]
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const second = _ordered[Math.floor(_ordered.length / 2)]

		switch (rankingType) {
			case "bigint":
			case "number": {
				const numericalFirst = parseFloat(first.toString())
				const numericalSecond = parseFloat(second.toString())

				return ((numericalFirst + numericalSecond) / 2) as T
			}
			case "date": {
				const numericalFirst = new Date(first).getTime()
				const numericalSecond = new Date(second).getTime()
				return new Date(((numericalFirst + numericalSecond) / 2)) as T
			}
			case "string":
			default: {
				return first
			}
		}

	}
}

export function firstQuartile<T>(vector: Array<T>, ranker?: Ranker<T>) {
	const sortedList = sort(vector, ranker)
	return sortedList[Math.floor(0.25 * sortedList.length)]
}

export function thirdQuartile<T>(vector: Array<T>, ranker?: Ranker<T>) {
	const sortedList = sort(vector, ranker)
	return sortedList[Math.ceil(0.75 * sortedList.length) - 1]
}

/**
 * Computes the mode of a set of values. It returns an array of all the modes found
 */
export function multiMode<T>(vector: Array<T>): T[] {
	if (vector.length === 0) return []

	return (vector.reduce((accu, curr) => {
		const freqsMap = accu.freqsMap
		freqsMap.set(curr, (freqsMap.get(curr) || 0) + 1)

		const maxCount = freqsMap.get(curr)! > accu.maxCount
			? freqsMap.get(curr)!
			: accu.maxCount
		const modes = freqsMap.get(curr) === accu.maxCount
			? [...accu.modes, curr]
			: freqsMap.get(curr)! > accu.maxCount
				? [curr]
				: accu.modes

		return { freqsMap, maxCount, modes }
	}, { freqsMap: new globalThis.Map<T, number>(), maxCount: 1, modes: [] as T[] })).modes
}

/**
 * Computes the mode of a set of values. It uses the "multimode" function but instead of
 * returning an array of values, it will pick the middle one after sorting the modes array
 */
export function mode<T>(vector: Array<T>): T | undefined {
	if (vector.length === 0) return undefined

	// eslint-disable-next-line fp/no-mutating-methods
	const modes = multiMode(vector).sort()
	const index = modes.length % 2 === 0
		? (modes.length / 2) - 1
		: Math.floor(modes.length / 2)

	return modes[index]
}

export function interQuartileRange(vector: number[]) {
	// eslint-disable-next-line fp/no-mutating-methods
	const percentile25 = firstQuartile(vector, (a, b) => { return a > b ? 1 : -1 })
	const percentile75 = thirdQuartile(vector, (a, b) => { return a > b ? 1 : -1 })
	return percentile25 && percentile75 ? percentile75 - percentile25 : undefined
}

export function frequencies<T>(vector: Array<T>): globalThis.Map<T, number> {
	const freqs = new globalThis.Map<T, number>(); //semi-colon required at end of this statement
	// eslint-disable-next-line fp/no-unused-expression
	[...vector].forEach(item => {
		// eslint-disable-next-line fp/no-unused-expression
		freqs.set(item, (freqs.get(item) || 0) + 1)
	})
	return freqs
}

export function frequenciesPercentScaled<T>(vector: Array<T>): globalThis.Map<T, number> {
	return new globalThis.Map(map(frequencies(vector), freq => new Tuple(freq[0], freq[1] * 100 / [...vector].length)))
}

export function frequency<T>(vector: Iterable<T>, item: T): number {
	return [...filter(vector, _item => _item === item)].length
}
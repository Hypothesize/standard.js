/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-shadow */
/* eslint-disable brace-style */
import { Tuple, isNumber } from "../utility"
import { reduce, lastOrDefault, filter, map } from "../collections/combinators"
import { Ranker } from "../functional"

export function min(vector: Iterable<number>): number | undefined
export function min<T>(vector: Iterable<T>, ranker: Ranker<T>): T | undefined
export function min<T>(vector: Iterable<T> | Iterable<number>, ranker?: Ranker<unknown>) {

	let min = undefined as T | number | undefined

	for (const x of vector) {
		if (min === undefined || (ranker && ranker(x, (min as T | number)) < 0) || (!ranker && x < (min as T | number)))
			min = x
	}

	return min
}

export function max<T>(vector: Iterable<number>): number | undefined
export function max<T>(vector: Iterable<T>, ranker: Ranker<T>): T | undefined
export function max(vector: Iterable<unknown>, ranker?: Ranker<unknown>) {
	if (ranker) {
		return lastOrDefault(reduce(
			vector,
			undefined as unknown,
			(prev, curr) => (prev === undefined || (ranker(curr, prev) > 0)) ? curr : prev
		))
	}
	else {
		return lastOrDefault(reduce(
			vector as Iterable<number>,
			undefined as number | undefined,
			(prev, curr) => (prev === undefined || curr > prev) ? curr : prev
		))
	}
}

export function sum(vector: number[]): number {
	return lastOrDefault(reduce(vector, 0, (x, y) => x + y), { defaultValue: 0 })
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

/** Returns the median of an array, alphabetically by default 
 * @param vector A sorted array
 * @returns The median value of the input array
*/
export function median<T>(vector: Array<T>): T | undefined {
	if (vector.length % 2 === 1) {
		return vector[Math.floor(vector.length / 2)]
	}
	else {
		// eslint-disable-next-line no-shadow, @typescript-eslint/no-non-null-assertion
		const first = vector[Math.floor(vector.length / 2) - 1]
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const second = vector[Math.floor(vector.length / 2)]
		return (typeof first === "number" && typeof second === "number")
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			? ((first + second) / 2) as any as T
			: first
	}
}

export function firstQuartile<T>(vector: Array<T>) {
	return vector[Math.floor(0.25 * vector.length)]
}

export function thirdQuartile<T>(vector: Array<T>) {
	return vector[Math.ceil(0.75 * vector.length) - 1]
}

/** Computes the mode of a set of values. It uses the "multimode" function but instead of
 * returning an array of values, it will pick the middle one after sorting the modes array
 * @param vector A sorted array of values
 * @returns The mode of the input array
 */
export function mode<T>(vector: Array<T>): T | undefined {
	if (vector.length === 0) return undefined

	const modes = multiMode(vector).sort()
	const index = modes.length % 2 === 0
		? (modes.length / 2) - 1
		: Math.floor(modes.length / 2)

	return modes[index]
}

/** Computes the mode of a sorted array of values. It returns an array of all the modes found 
 * @param vector A sorted array
 * @returns A sorted array of the modes
*/
export function multiMode<T>(vector: Array<T>): T[] {
	if (vector.length === 0) {
		return [] // Return an empty array for an empty input array
	}
	let modes: Array<T> = []
	let currentMode = vector[0]
	let currentCount = 1
	let maxCount = 1

	for (let i = 1; i < vector.length; i++) {
		if (vector[i] === vector[i - 1]) {
			currentCount++
		} else {
			if (currentCount > maxCount) {
				modes = [currentMode]
				maxCount = currentCount
			} else if (currentCount === maxCount) {
				modes.push(currentMode)
			}
			currentMode = vector[i]
			currentCount = 1
		}
	}

	// Check the last element
	if (currentCount > maxCount) {
		modes = [currentMode]
	} else if (currentCount === maxCount) {
		modes.push(currentMode)
	}

	return modes
}
/**
 * Computes the interquartile range of an array
 * @param vector A sorted array
 * @returns The interquartile range of the input array
 */
export function interQuartileRange(vector: number[]) {

	const percentile25 = firstQuartile(vector)
	const percentile75 = thirdQuartile(vector)
	return percentile25 && percentile75 ? percentile75 - percentile25 : undefined
}

export function frequencies<T>(vector: Array<T>): globalThis.Map<T, number> {
	const freqs = new globalThis.Map<T, number>(); //semi-colon required at end of this statement

	[...vector].forEach(item => {

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

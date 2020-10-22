/* eslint-disable no-shadow */
/* eslint-disable brace-style */
import { reduce, last, filter, map, sort } from "../collections/iterable"
import { Projector, Ranker } from "../functional"
import { Tuple, isNumber } from "../utility"

export function min<T>(vector: Iterable<number>): number | undefined
export function min<T>(vector: Iterable<T>, projector: Projector<T, number, number>): T | undefined
export function min(vector: Iterable<unknown>, projector?: Projector<unknown, number, number>): unknown | undefined {
	return last(
		reduce(
			(projector ? map(vector, projector) : vector) as Iterable<number>,
			undefined as number | undefined,
			(prev, curr) => (prev === undefined || curr < prev) ? curr : prev
		)
	)
}

export function max<T>(vector: Iterable<number>): number | undefined
export function max<T>(vector: Iterable<T>, projector: Projector<T, number, number>): T | undefined
export function max(vector: Iterable<unknown>, projector?: Projector<unknown, number, number>) {
	return last(
		reduce(
			(projector
				? map(vector, projector)
				: vector
			) as Iterable<number>,
			undefined as number | undefined,
			(prev, curr) => (prev === undefined || curr > prev) ? curr : prev
		)
	)
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
	if (len === 0)
		return undefined

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
	if (len === 0)
		return undefined
	// if (len === 1)
	// 	return 0

	const _mean = typeof opts?.mean === "number"
		? opts.mean
		: mean(vector, opts?.mean)

	return _mean
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
	return _variance ? Math.sqrt(_variance) : undefined
}

export function median<T>(vector: Array<T>): T | undefined {
	// eslint-disable-next-line fp/no-mutating-methods
	const _ordered = vector.sort()
	if (_ordered.length % 2 === 1) {
		return _ordered[Math.floor(vector.length / 2)]
	}
	else {
		// eslint-disable-next-line no-shadow, @typescript-eslint/no-non-null-assertion
		const first = _ordered[Math.floor(_ordered.length / 2) - 1]
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const second = _ordered[Math.floor(_ordered.length / 2)]
		return (typeof first === "number" && typeof second === "number")
			? ((first + second) / 2) as any as T
			: first
	}
}

export function firstQuartile<T>(vector: Array<T>, comparer?: Ranker<T>) {
	const sortedList = sort(vector, comparer)
	return sortedList[Math.floor(0.25 * sortedList.length)]
}

export function thirdQuartile<T>(vector: Array<T>, comparer?: Ranker<T>) {
	const sortedList = sort(vector, comparer)
	return sortedList[Math.ceil(0.75 * sortedList.length) - 1]
}

export function mode<T>(vector: Array<T>): T | undefined {
	const freqs = sort([...frequencies(vector).entries()], (x => x[1]))
	return last(freqs)![0]
}

export function interQuartileRange(vector: number[]) {
	// eslint-disable-next-line fp/no-mutating-methods
	const sortedList = vector.sort()
	const percentile25 = sortedList[Math.floor(0.25 * sortedList.length)]
	const percentile75 = sortedList[Math.ceil(0.75 * sortedList.length)]
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
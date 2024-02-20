import * as assert from "assert"
import {
	min, max, sum, mean,
	median, mode, multiMode, variance, deviation, firstQuartile, thirdQuartile, interQuartileRange,
	frequencies
} from "../dist/stats"

describe('Stats', function () {
	describe('min()', function () {
		it('returns <undefined> for an empty array', function () {
			const actual = min([])
			const expected = undefined

			assert.deepStrictEqual(actual, expected)
		})

		it('uses numeric order for numbers', function () {
			const actual = min([10, 3, 8, 1, 2, 7,])
			const expected = 1
			assert.deepStrictEqual(actual, expected)
		})

		it('treats negatives as smaller than zero', function () {
			const actual = min([19, 3, -8, 2, 7,])
			const expected = -8
			assert.deepStrictEqual(actual, expected)
		})

		it('works for floats', function () {
			const actual = min([3.2, 8.4, 1.001, 2, 7, 1.0000001])
			const expected = 1.0000001
			assert.deepStrictEqual(actual, expected)
		})
	})

	describe('max()', function () {
		it('returns <undefined> for an empty array', function () {
			const actual = max([])
			const expected = undefined

			assert.deepStrictEqual(actual, expected)
		})

		it('uses numeric order for numbers', function () {
			const actual = max([10, 3, 8.3, 1, 2, 7,])
			const expected = 10
			assert.deepStrictEqual(actual, expected)
		})

		it('treats negatives as smaller than zero', function () {
			const actual = max([0, 0, -8])
			const expected = 0
			assert.deepStrictEqual(actual, expected)
		})

		it('works for floats', function () {
			const actual = max([3.2, 8.4, 1.001, 2, 7, 1.0000001])
			const expected = 8.4
			assert.deepStrictEqual(actual, expected)
		})
	})

	describe('FirstQuartile', function () {
		it('returns <undefined> for an empty array', function () {
			const actual = firstQuartile([])
			const expected = undefined

			assert.deepStrictEqual(actual, expected)
		})

		it('works with strings', function () {
			const actual = firstQuartile(["Blue", "Blue", "Blue", "Green", "Green", "Orange", "Red", "Yellow"])
			const expected = "Blue"

			assert.deepStrictEqual(actual, expected)
		})

		it('works with numbers', function () {
			const actual = firstQuartile([1, 1, 1, 2, 2, 2, 3, 4, 5, 6, 7, 8, 99, 99])
			const expected = 2

			assert.deepStrictEqual(actual, expected)
		})

	})

	describe('ThirdQuartile', function () {
		it('returns <undefined> for an empty array', function () {
			const actual = thirdQuartile([])
			const expected = undefined

			assert.deepStrictEqual(actual, expected)
		})

		it('works with strings', function () {
			const actual = thirdQuartile(["Blue", "Blue", "Blue", "Green", "Green", "Orange", "Red", "Yellow"])
			const expected = "Orange"

			assert.deepStrictEqual(actual, expected)
		})

		it('works with numbers', function () {
			const actual = thirdQuartile([1, 1, 1, 2, 2, 2, 3, 4, 5, 6, 7, 8, 99, 99])
			const expected = 7

			assert.deepStrictEqual(actual, expected)
		})
	})

	describe('IQR', function () {
		it('returns the IQR for an array of numbers', function () {
			const actual = interQuartileRange([1, 2, 3, 4, 5, 10, 10, 10, 20, 21])
			const expected = 7

			assert.deepStrictEqual(actual, expected)
		})
	})

	describe('sum()', function () {
		it('returns 0 for an empty array', function () {
			const actual = sum([])
			const expected = 0

			assert.deepStrictEqual(actual, expected)
		})

		it('works for negatives and positives', function () {
			const actual = sum([10, 0, -10, 7])
			const expected = 7
			assert.deepStrictEqual(actual, expected)
		})

	})

	describe('median', function () {
		it('returns <undefined> for an empty array', function () {
			const actual = median([])
			const expected = undefined

			assert.deepStrictEqual(actual, expected)
		})

		it('work with strings', function () {
			const actual = median(["Blue", "Blue", "Blue", "Green", "Green", "Orange", "Red", "Yellow"])
			const expected = "Green"

			assert.deepStrictEqual(actual, expected)
		})

		/*it('sort numerically by default', function () {
			const actual = median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
			const expected = median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], "alphabetical")
	
			assert.deepStrictEqual(actual, expected)
		})*/

		/*it('work with numbers sorted alphabetically', function () {
			const actual = median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
			const expected = 18
	
			assert.deepStrictEqual(actual, expected)
		})*/

		/*it('work with numbers sorted numerically if the option is passed', function () {
			const actual = median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], "numerical")
			const expected = 10.5
	
			assert.deepStrictEqual(actual, expected)
		})*/
	})

	describe('mode()', function () {
		it('returns undefined when passed an empty array', function () {
			const actual = mode([])
			const expected = undefined
			assert.deepStrictEqual(actual, expected)
		})

		it('ignores null values when calculating the mode', function () {
			const actual = mode([2, 3, null, 4, 5, 5, 5, 6, null, 7, 7, 13, null, 14, 23, null, 45, 45])
			const expected = 5

			assert.deepStrictEqual(actual, expected)
		})

		it('returns the single mode when passed an array of different repeated values', function () {
			const actual = mode([2, 3, 3, 4, 5, 5, 5, 6, 6, 7, 7, 13, 13, 14, 23, 43, 45, 45])
			const expected = 5

			assert.deepStrictEqual(actual, expected)
		})

		it('returns the median mode when passed an array with three modes', function () {
			const actual = mode([3, 3, 3, 5, 5, 5, 6, 6, 6, 7])
			const expected = 5

			assert.deepStrictEqual(actual, expected)
		})

		it('returns the median value when passed an array with every element having the same frequency', function () {
			const actual = mode([1, 2, 3, 4])
			const expected = 2

			assert.deepStrictEqual(actual, expected)
		})

		it('returns the mode when passed an array containing values of mixed types', function () {
			const actual = mode([2, 2, 'a', 'a', 'a', 'v', 'v'])
			const expected = 'a'

			assert.deepStrictEqual(actual, expected)
		})

		it('returns the mode when passed an array of strings', function () {
			const actual = mode(["Blue", "Blue", "Blue", "Green", "Green", "Orange", "Red", "Yellow"])
			const expected = "Blue"

			assert.deepStrictEqual(actual, expected)
		})
	})

	describe('multiMode()', function () {
		it('returns an empty array when passed an empty vector', function () {
			const actual = multiMode([])
			const expected = [] as string[]
			assert.deepStrictEqual(actual, expected)
		})
		
		it('ignores null values when calculating the modes', function () {
			const actual = multiMode([3, 3, 3, 5, 5, 5, 5, null, 6, 6, 6, 7, null])
			const expected = [5]

			assert.deepStrictEqual(actual, expected)
		})

		it('returns an array with a single mode when passed an array of with a single mode', function () {
			const actual = multiMode([3, 3, 3, 5, 5, 5, 5, 6, 6, 6, 7])
			const expected = [5]

			assert.deepStrictEqual(actual, expected)
		})

		it('returns an array with multiple modes when passed an array of with three modes', function () {
			const actual = multiMode([3, 3, 3, 5, 5, 5, 6, 6, 6, 7])
			const expected = [3, 5, 6]

			assert.deepStrictEqual(actual, expected)
		})

		it('returns the same array when passed an array with every element having the same occurrences', function () {
			const actual = multiMode([1, 2, 3, 4, 5])
			const expected = [1, 2, 3, 4, 5]

			assert.deepStrictEqual(actual, expected)
		})
		
		it('returns an array of all the possible modes when passed an array containing mixed types', function () {
			const actual = multiMode([2, 2, 'a', 'a', 'v', 'v'])
			const expected = [2, 'a', 'v']

			assert.deepStrictEqual(actual, expected)
		})

		it('returns an array of all the possible modes when passed an array with only strings', function () {
			const actual = multiMode(["Blue", "Blue", "Blue", "Green", "Green", "Green", "Orange", "Red", "Yellow"])
			const expected = ["Blue", "Green"]

			assert.deepStrictEqual(actual, expected)
		})
	})

	describe('mean', function () {
		it('returns <undefined> for an empty array', function () {
			const actual = mean([])
			const expected = undefined

			assert.deepStrictEqual(actual, expected)
		})

		it('returns the mean of a numerical array', function () {
			const actual = mean([3, 3, 3, 5, 5, 5, 6, 6, 6, 7])
			const expected = 4.9

			assert.deepStrictEqual(actual, expected)
		})
	})

	describe('variance', function () {
		it('returns <undefined> for an empty array', function () {
			const actual = variance([])
			const expected = undefined

			assert.deepStrictEqual(actual, expected)
		})

		it('returns the variance of a numerical array', function () {
			const actual = variance([3, 3, 3, 5, 5, 5, 6, 6, 6, 7])
			const expected = 2.0999999999999996

			assert.deepStrictEqual(actual, expected)
		})

		it('returns the variance of a numerical array using the given mean', function () {
			const actual = variance([3, 3, 3, 5, 5, 5, 6, 6, 6, 7], { mean: 1 })
			const expected = 19

			assert.deepStrictEqual(actual, expected)
		})
	})

	describe('deviation', function () {
		it('returns <undefined> for an empty array', function () {
			const actual = deviation([])
			const expected = undefined

			assert.deepStrictEqual(actual, expected)
		})

		it('returns the deviation of a numerical array', function () {
			const actual = deviation([3, 3, 3, 5, 5, 5, 6, 6, 6, 7])
			const expected = 1.4491376746189437

			assert.deepStrictEqual(actual, expected)
		})

		it('returns the deviation of a numerical array using the given mean', function () {
			const actual = deviation([3, 3, 3, 5, 5, 5, 6, 6, 6, 7], { mean: 1 })
			const expected = 4.358898943540674

			assert.deepStrictEqual(actual, expected)
		})
	})

	describe('frequencies', function () {
		it('returns <undefined> for an empty array', function () {
			const actual = frequencies([])
			const expected = new Map()

			assert.deepStrictEqual(actual, expected)
		})

		it('returns the frequencies of a numerical array', function () {
			const actual = frequencies([3, 3, 3, 5, 5, 5, 6, 6, 6, 7])
			const expected = new Map()
			expected.set(3, 3)
			expected.set(5, 3)
			expected.set(6, 3)
			expected.set(7, 1)
			assert.deepStrictEqual(actual, expected)
		})
	})
})
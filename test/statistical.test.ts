/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable fp/no-unused-expression */

// import mocha from "mocha"
import * as assert from "assert"
import {
	min, max, sum, mean,
	median, mode, multiMode, variance, deviation, firstQuartile, thirdQuartile, interQuartileRange,
	frequencies
} from "../dist/statistical"


describe('min()', function () {
	it('should return <undefined> for an empty array', function () {
		const actual = min([])
		const expected = undefined

		assert.deepStrictEqual(actual, expected)
	})

	it('should use numeric order for numbers', function () {
		const actual = min([10, 3, 8, 1, 2, 7,])
		const expected = 1
		assert.deepStrictEqual(actual, expected)
	})

	it('should treat negatives as smaller than zero', function () {
		const actual = min([19, 3, -8, 2, 7,])
		const expected = -8
		assert.deepStrictEqual(actual, expected)
	})

	it('should work for floats', function () {
		const actual = min([3.2, 8.4, 1.001, 2, 7, 1.0000001])
		const expected = 1.0000001
		assert.deepStrictEqual(actual, expected)
	})
})

describe('max()', function () {
	it('should return <undefined> for an empty array', function () {
		const actual = max([])
		const expected = undefined

		assert.deepStrictEqual(actual, expected)
	})

	it('should use numeric order for numbers', function () {
		const actual = max([10, 3, 8.3, 1, 2, 7,])
		const expected = 10
		assert.deepStrictEqual(actual, expected)
	})

	it('should treat negatives as smaller than zero', function () {
		const actual = max([0, 0, -8])
		const expected = 0
		assert.deepStrictEqual(actual, expected)
	})

	it('should work for floats', function () {
		const actual = max([3.2, 8.4, 1.001, 2, 7, 1.0000001])
		const expected = 8.4
		assert.deepStrictEqual(actual, expected)
	})
})

describe('median', function () {
	it('should return <undefined> for an empty array', function () {
		const actual = median([])
		const expected = undefined

		assert.deepStrictEqual(actual, expected)
	})

	it('should find the median of an array of strings', function () {
		const actual = median(["Blue", "Green", "Green", "Orange", "Red", "Yellow", "Blue", "Green", "Blue", "Blue"])
		const expected = "Green"

		assert.deepStrictEqual(actual, expected)
	})

	it('should sort string alphabetically by default', function () {
		const actual = median(["Blue", "Green", "Green", "Orange", "Red", "Yellow", "Blue", "Green", "Blue", "Blue"])
		const expected = median(["Blue", "Green", "Green", "Orange", "Red", "Yellow", "Blue", "Green", "Blue", "Blue"], "string")

		assert.deepStrictEqual(actual, expected)
	})

	it('should sort numbers numerically by default', function () {
		const actual = median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
		const expected = 10.5

		assert.deepStrictEqual(actual, expected)
	})

	it('should sort numbers numerically if they are explicitely considered numbers', function () {
		const actual = median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], "number")
		const expected = 10.5

		assert.deepStrictEqual(actual, expected)
	})

	it('should sort numbers chronologically if they are explicitely considered dates', function () {
		const actual = median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], "date")
		const expected = 10.5

		assert.deepStrictEqual(actual, expected)
	})

	it('should sort numbers alphabetically if they are explicitely considered as strings', function () {
		const actual = median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], "string")
		const expected = 18

		assert.deepStrictEqual(actual, expected)
	})

	it('should sort dates chronologically by default', function () {
		const actual = median([new Date("2010-01-01"), new Date("2010-01-02"), new Date("2010-01-03"), new Date("2010-01-04"), new Date("2010-01-05")])
		const expected = new Date("2010-01-03")

		assert.deepStrictEqual(actual, expected)
	})

	it('should sort dates chronologically if treated explicitely as dates', function () {
		const actual = median([new Date("2010-01-01"), new Date("2010-01-02"), new Date("2010-01-03"), new Date("2010-01-04"), new Date("2010-01-05")], "date")
		const expected = new Date("2010-01-03")

		assert.deepStrictEqual(actual, expected)
	})

	it('should sort dates chronologically if treated explicitely as numbers', function () {
		const actual = median([new Date("2010-01-01"), new Date("2010-01-02"), new Date("2010-01-03"), new Date("2010-01-04"), new Date("2010-01-05")], "number")
		const expected = new Date("2010-01-03") // Sun Jan 03...

		assert.deepStrictEqual(actual, expected)
	})

	it('should sort dates alphabetically if treated explicitely as strings', function () {
		const actual = median([new Date("2010-01-01"), new Date("2010-01-02"), new Date("2010-01-03"), new Date("2010-01-04"), new Date("2010-01-05")], "string")
		const expected = new Date("2010-01-02") // Sat Jan 02...
		assert.deepStrictEqual(actual, expected)
	})

	it('should sort values according to an explicitely passed sorting function', function () {
		const sortByMonth = (a: Date, b: Date) => {
			return a.toLocaleString('default', { month: 'long' }) > b.toLocaleString('default', { month: 'long' }) ? 1 : -1
		}
		const actual = median([new Date("2010-01-01"), new Date("2010-02-01"), new Date("2010-03-01"), new Date("2010-04-01"), new Date("2010-05-01")], undefined, sortByMonth)
		const expected = new Date("2010-01-01") // Fri Jan 01...
		assert.deepStrictEqual(actual, expected)
	})

})

describe('FirstQuartile', function () {
	it('should return <undefined> for an empty array', function () {
		const actual = firstQuartile([])
		const expected = undefined

		assert.deepStrictEqual(actual, expected)
	})

	it('should work with strings', function () {
		const actual = firstQuartile(["Blue", "Green", "Green", "Orange", "Red", "Yellow", "Blue", "Green", "Blue", "Blue"])
		const expected = "Blue"

		assert.deepStrictEqual(actual, expected)
	})

	it('should work with numbers (sorted alphabetically)', function () {
		const actual = firstQuartile([1, 1, 1, 2, 2, 2, 3, 4, 5, 6, 7, 8, 99, 99, 1, 2, 3])
		const expected = 2

		assert.deepStrictEqual(actual, expected)
	})

	it('should  sort the input array alphabetically by default', function () {
		const actual = firstQuartile([1, 10, 10, 10, 2, 20, 21, 3, 4, 5])
		const expected = 10

		assert.deepStrictEqual(actual, expected)
	})

	it('should accept a ranker function, for instance to sort the input array numerically', function () {
		const actual = firstQuartile([1, 10, 10, 10, 2, 20, 21, 3, 4, 5], (a, b) => {
			return a > b ? 1 : -1
		})
		const expected = 3

		assert.deepStrictEqual(actual, expected)
	})
})

describe('ThirdQuartile', function () {
	it('should return <undefined> for an empty array', function () {
		const actual = thirdQuartile([])
		const expected = undefined

		assert.deepStrictEqual(actual, expected)
	})

	it('should work with strings', function () {
		const actual = thirdQuartile(["Blue", "Green", "Green", "Orange", "Red", "Yellow", "Blue", "Green", "Blue", "Blue"])
		const expected = "Orange"

		assert.deepStrictEqual(actual, expected)
	})

	it('should work with numbers (sorted alphabetically)', function () {
		const actual = thirdQuartile([1, 1, 1, 2, 2, 2, 3, 4, 5, 6, 7, 8, 99, 99, 1, 2, 3])
		const expected = 6

		assert.deepStrictEqual(actual, expected)
	})

	it('should sort the input array alphabetically by default', function () {
		const actual = thirdQuartile([1, 10, 10, 10, 2, 20, 21, 3, 4, 5])
		const expected = 3

		assert.deepStrictEqual(actual, expected)
	})

	it('should accept a ranker function, for instance to sort the input array numerically', function () {
		const actual = thirdQuartile([1, 10, 10, 10, 2, 20, 21, 3, 4, 5], (a, b) => {
			return a > b ? 1 : -1
		})
		const expected = 10

		assert.deepStrictEqual(actual, expected)
	})
})

describe('IQR', function () {
	it('should sort the array numerically by default', function () {
		const actual = interQuartileRange([1, 10, 10, 10, 2, 20, 21, 3, 4, 5])
		const expected = 7

		assert.deepStrictEqual(actual, expected)
	})
})

describe('sum()', function () {
	it('should return 0 for an empty array', function () {
		const actual = sum([])
		const expected = 0

		assert.deepStrictEqual(actual, expected)
	})

	it('should work for negatives and positives', function () {
		const actual = sum([10, 0, -10, 7])
		const expected = 7
		assert.deepStrictEqual(actual, expected)
	})

})

describe('mode()', function () {
	it('should return undefined when passing an empty array', () => {
		const actual = mode([])
		const expected = undefined
		assert.deepStrictEqual(actual, expected)
	})

	it('should return 1 when passing an array of 3 zeros and 4 ones', function () {
		const actual = mode([1, 0, 1, 0, 1, 0, 1])
		const expected = 1

		assert.deepStrictEqual(actual, expected)
	})

	it('should return 1 when passing an array of 3 zeros and 4 ones but sorted in ascending order', function () {
		const actual = mode([0, 0, 0, 1, 1, 1, 1])
		const expected = 1

		assert.deepStrictEqual(actual, expected)
	})

	it('should return 5 when passing an array of different values but with the value "5" with more occurrences', function () {
		const actual = mode([3, 5, 6, 7, 3, 2, 13, 45, 43, 23, 13, 45, 5, 6, 7, 5, 14, 4])
		const expected = 5

		assert.deepStrictEqual(actual, expected)
	})

	it('should return the middle value of all the possible modes when passing an array of three values with the same occurrences', function () {
		const actual = mode([3, 5, 6, 7, 5, 5, 6, 6, 3, 3])
		const expected = 5

		assert.deepStrictEqual(actual, expected)
	})

	it('should return the middle value of all the possible modes when passing an array with every element having the same occurrences', function () {
		const actual = mode([1, 2, 3, 4])
		const expected = 2

		assert.deepStrictEqual(actual, expected)
	})

	it('should return the middle value of all the possible modes when passing an array with number and characters', function () {
		const actual = mode([2, 2, 'a', 'a', 'v', 'v'])
		const expected = 'a'

		assert.deepStrictEqual(actual, expected)
	})
})

describe('multiMode()', function () {
	it('should return an empty array when passing an empty vector', () => {
		const actual = multiMode([])
		const expected = [] as string[]
		assert.deepStrictEqual(actual, expected)
	})

	it('should return an array with multiple modes when passing an array of three values with the same occurrences', function () {
		const actual = multiMode([3, 5, 6, 7, 5, 5, 6, 6, 3, 3])
		const expected = [5, 6, 3]

		assert.deepStrictEqual(actual, expected)
	})

	it('should return the same array when passing an array with every element having the same occurrences', function () {
		const actual = multiMode([1, 2, 3, 4, 5])
		const expected = [1, 2, 3, 4, 5]

		assert.deepStrictEqual(actual, expected)
	})

	it('should return an array of all the possible modes when passing an array with number and characters', function () {
		const actual = multiMode([2, 2, 'a', 'a', 'v', 'v'])
		const expected = [2, 'a', 'v']

		assert.deepStrictEqual(actual, expected)
	})
})
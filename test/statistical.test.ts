/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable fp/no-unused-expression */

// import mocha from "mocha"
import * as assert from "assert"
import {
	min, max, sum, mean,
	median, mode, variance, deviation, firstQuartile, thirdQuartile, interQuartileRange,
	frequencies
} from "../dist/statistical"


describe('min()', function () {
	it('should return <undefined> for an empty array', function () {
		const actual = min([])
		const expected = undefined

		assert.deepEqual(actual, expected)
	})

	it('should use numeric order for numbers', function () {
		const actual = min([10, 3, 8, 1, 2, 7,])
		const expected = 1
		assert.deepEqual(actual, expected)
	})

	it('should treat negatives as smaller than zero', function () {
		const actual = min([19, 3, -8, 2, 7,])
		const expected = -8
		assert.deepEqual(actual, expected)
	})

	it('should work for floats', function () {
		const actual = min([3.2, 8.4, 1.001, 2, 7, 1.0000001])
		const expected = 1.0000001
		assert.deepEqual(actual, expected)
	})
})

describe('max()', function () {
	it('should return <undefined> for an empty array', function () {
		const actual = max([])
		const expected = undefined

		assert.deepEqual(actual, expected)
	})

	it('should use numeric order for numbers', function () {
		const actual = max([10, 3, 8.3, 1, 2, 7,])
		const expected = 10
		assert.deepEqual(actual, expected)
	})

	it('should treat negatives as smaller than zero', function () {
		const actual = max([0, 0, -8])
		const expected = 0
		assert.deepEqual(actual, expected)
	})

	it('should work for floats', function () {
		const actual = max([3.2, 8.4, 1.001, 2, 7, 1.0000001])
		const expected = 8.4
		assert.deepEqual(actual, expected)
	})
})

describe('sum()', function () {
	it('should return 0 for an empty array', function () {
		const actual = sum([])
		const expected = 0

		assert.deepEqual(actual, expected)
	})

	it('should work for negatives and positives', function () {
		const actual = sum([10, 0, -10, 7])
		const expected = 7
		assert.deepEqual(actual, expected)
	})

})

describe('mode()', function () {
	it('should return 1 when passing an array of 3 zeros and 4 ones', function () {
		const actual = mode([1, 0, 1, 0, 1, 0, 1])
		const expected = 1

		assert.deepEqual(actual, expected)
	})

	it('should return 1 when passing an array of 3 zeros and 4 ones but sorted in ascending order', function () {
		const actual = mode([0, 0, 0, 1, 1, 1, 1])
		const expected = 1

		assert.deepEqual(actual, expected)
	})

	it('should return 5 when passing an array of different values but with more 5s', function () {
		const actual = mode([3, 5, 6, 7, 3, 2, 13, 45, 43, 23, 13, 45, 5, 6, 7, 5, 14, 4])
		const expected = 5

		assert.deepEqual(actual, expected)
	})
})
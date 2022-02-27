/* eslint-disable indent */
/* eslint-disable brace-style */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable fp/no-mutating-methods */
/* eslint-disable fp/no-unused-expression */
/* eslint-disable fp/no-let */
/* eslint-disable fp/no-class */
/* eslint-disable no-unused-expressions */
/* eslint-disable fp/no-rest-parameters */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable fp/no-mutation */
/* eslint-disable fp/no-loops */

import { ToCamel } from "../utility"
import * as char from "./char"

const whitespaceChars = ["\n", "\t", "\v", "\r"]
const wordTokenSeperatorChars = ["-", "_", "+", "^", "%", "=", " ", "	", "\\", "/", "\t", "\n", "*", "$", "#", "@", "&", "(", ")", "!"]
const singulars = ["sheep", "series", "species", "deer", "ox", "child", "goose", "man", "woman", "tooth", "foot", "mouse", "person"]
const plurals = ["sheep", "series", "species", "deer", "oxen", "children", "geese", "men", "women", "teeth", "feet", "mice", "people"]


export const tokenizeWords = function* (str: string, args?:
	{
		/** Case changes to consider as separators; Default is upper */
		sepCaseChange?:
		| "upper" /* Lower to upper case change */
		| "lower" /* Upper to lower case change */
		| "all"   /* All case changes */
		| "none", /* No case change */

		/** Array of separator characters, if any */
		sepChars?: string[],

	}): Iterable<string> {


	//console.log(`starting tokenizeWords for "${this.valueOf()}"`)
	const separatorCaseChange = args?.sepCaseChange ?? "upper"
	const seperatorChars = args?.sepChars ?? wordTokenSeperatorChars

	let currentWord = ""
	let lastChar = str[0]

	const chars = [...str]
	// console.log(`chars array: ${JSON.stringify(chars)}`)

	for (const ch of chars) {
		console.assert(ch !== undefined, `String.tokenizeWords(): ch is undefined`)
		//console.log(`testing char "${ch.valueOf()}"`)

		if (seperatorChars.includes(ch.valueOf())) {
			//console.log(`separators include char tested, will push ${currentWord} to words`)
			if (currentWord.length > 0) yield currentWord
			currentWord = ""
		}
		else {
			//console.log(`separators do not include char tested, testing for case boundary`)
			const nowCase = getCase(ch)
			const lastCase = getCase(lastChar)

			const test = (
				(separatorCaseChange === "none") ||
				(seperatorChars.includes(lastChar)) ||
				(lastCase === undefined) ||
				(nowCase === undefined) ||
				(nowCase !== separatorCaseChange) ||
				(nowCase === lastCase)
			)

			if (test === false) {
				//console.log(`case boundary test is true, pushing `)
				if (currentWord.length > 0)
					yield currentWord
				currentWord = ch.valueOf()
			}
			else {
				//console.log(`case boundary test is false, concatenating char to currentWord`)
				currentWord = currentWord.concat(ch.valueOf())
				//console.log(`currentWord concatenated to ${currentWord}`)
			}
		}
		// TTLoUKmidiForm
		// TTL-o-UK-midi-F-orm
		lastChar = ch.valueOf()
		//console.log(`lastChar set to ${lastChar}`)
	}

	//console.log(`Outer loop, pushing currentWord "${currentWord}" to words`)

	if (currentWord.length > 0)
		yield currentWord
	currentWord = ""

}
export const getCase = (str: string): "upper" | "lower" | undefined => (str.toLowerCase() === str.toUpperCase()) ? undefined : isUpperCase(str) ? "upper" : "lower"
export const isUpperCase = (str: string) => str.toUpperCase() === str.valueOf()
export const isLowerCase = (str: string) => str.toLowerCase() === str.valueOf()
export const capitalize = (str: string) => str[0].toUpperCase() + str.substring(1).toLowerCase()
export const toSnakeCase = (str: string) => [...tokenizeWords(str)].map(token => token.toLowerCase()).join("_")
export const toDashCase = (str: string) => [...tokenizeWords(str)].map(token => token.toLowerCase()).join("-")
export const toCamelCase = <S extends string = string>(str: S) => [...tokenizeWords(str)].map((word, index) => index > 0 ? capitalize(word) : word.toLowerCase()).join("") as ToCamel<S>
export const toTitleCase = (str: string) => [...tokenizeWords(str, { sepChars: [" "] })].map(s => capitalize(s)).join(" ")
export const toSpaces = (str: string) => [...tokenizeWords(str)].join(" ")

export const isWhitespace = (str: string): boolean => str.replace(/^\s+|\s+$/g, '').length === 0
export const isEmptyOrWhitespace = (str: string) => strip(str, [" ", ...whitespaceChars]).length === 0
/** Transforms single or multiple consecutive white-space characters into single spaces */
export const cleanWhitespace = (str: string, chars?: string[]) => ([...str].map(ch => (chars ?? whitespaceChars).indexOf(ch) < 0 ? ch : " ")
	.join("")
	.split(/[ ]{2,}/g)
	.join(" ")
)
export const prependSpaceIfNotEmpty = (str: string) => isEmptyOrWhitespace(str) ? "" : " " + str
export const strip = (str: string, chars: string[]) => [...str].filter(ch => chars.indexOf(ch) < 0).join("")

/** Truncate this string by removing a specified number of characters from the end */
export const truncate = (str: string, numChars: number) => str.substr(0, str.length - numChars)

export const isURL = (str: string): boolean => new RegExp('^(https?:\\/\\/)?' + // protocol
	'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.+)+[a-z]{2,}|' + // domain name
	'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
	'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
	'(\\?[;&a-z\\d%_.~+=\\*()-]*)?' + // query string
	'(\\#[-a-z\\d_]*)?$', 'i' // fragment locator
).test(str)
export const trimLeft = (str: string, ...strings: string[]) => strings.reduce((prev, curr) =>
	(prev.toUpperCase().startsWith(curr.toUpperCase())) ? prev.substr(prev.length) : prev,
	str // initial value
)
export const trimRight = (str: string, ...strings: string[]) => strings.reduce((prev, curr) =>
	(prev.toUpperCase().endsWith(curr.toUpperCase())) ? prev.substr(0, prev.length - curr.length) : prev,
	str // initial value
)
export const plural = (str: string) => {
	const match = singulars.indexOf(str.toString().toLowerCase())
	if (match >= 0) {
		const chars = [...str]
		return [...plurals[match]]
			.map((ch, i) => isUpperCase(chars[i < chars.length ? i : chars.length - 1])
				? ch.toUpperCase()
				: ch.toLowerCase()
			)
			.join("")
	}

	const lower = str.toLowerCase()
	return (() => {
		const _ = (nTruncate: number, suffix: string,) => {
			const truncated = truncate(str, nTruncate)
			const effectiveLastIndex = str.length - (nTruncate === 0 ? 1 : nTruncate)
			const ch = str[effectiveLastIndex]
			if (!ch) throw new Error(`${effectiveLastIndex} is not a valid index for ${str}`)
			return getCase(ch) === "upper"
				? truncated + suffix.toUpperCase()
				: truncated + suffix.toLowerCase()
		}

		switch (true) {
			case str.toString() === "":
				return ""
			case lower.endsWith("us") && str.length > 4:
				return _(2, "i")
			case (lower.endsWith("sis")):
				return _(2, "es")
			case ["s", "ss", "sh", "ch", "x", "z"].some(x => lower.endsWith(x)):
				return _(0, "es")
			case lower.endsWith("ife"):
				return _(2, "ves")
			case lower.endsWith("lf"):
				return _(2, "lves")
			case lower.endsWith("y") && char.isConsonant(char.from(str.charCodeAt(str.length - 2))):
				return _(1, "ies")
			case lower.endsWith("y") && char.isVowel(char.from(str.charCodeAt(str.length - 2))):
				return _(0, "s")
			case lower.endsWith("o") && !["photo", "piano", "halo"].includes(str.toString()):
				return _(0, "es")
			case lower.endsWith("on") || str.toString() === ("criterion"):
				return _(2, "a")
			default:
				return _(0, "s")
		}

	})()
}

export const split = (str: string, arg: { [Symbol.split](string: string, limit?: number): string[]; } | string | RegExp | number) => {
	if (typeof arg === "object")
		return str.split(arg)
	else if (typeof arg !== "number") {
		return str.split(arg)
	}
	else {
		const numChunks = Math.ceil(str.length / arg)
		const chunks: string[] = new Array(numChunks)
		for (let i = 0, o = 0; i < numChunks; ++i, o += arg) {
			chunks[i] = str.substr(o, arg)
		}
		return chunks
	}
}


export class String extends global.String {
	constructor(str: string) { super(str) }

	protected wrap<T, A extends any[]>(fn: (str: string, ..._args: A) => T): (..._args: A) => T extends string ? String : T {
		return (..._args: A) => {
			const out = fn(this.toString(), ..._args)
			return (typeof out === "string" ? new String(out) : out) as any
		}
	}

	isWhiteSpace = this.wrap(isWhitespace)
	isUpperCase = this.wrap(isUpperCase)
	isLowerCase = this.wrap(isLowerCase)
	isEmptyOrWhitespace = this.wrap(isEmptyOrWhitespace)
	prependSpaceIfNotEmpty = this.wrap(prependSpaceIfNotEmpty)
	strip = this.wrap(strip)

	/** Returns the case of input string; if string contains only special characters, 'upper' is returned */
	getCase = this.wrap(getCase)

	toTitleCase = this.wrap(toTitleCase)
	toSnakeCase = this.wrap(toSnakeCase)
	toCamelCase = this.wrap(toCamelCase as (s: string) => string)
	toSpace = this.wrap(toSpaces)

	/** Truncate this string by removing a specified number of characters from the end */
	truncate = this.wrap(truncate)

	// getCharacters = (): Iterable<String> => [...this].map(ch => new String(ch))

	/** Transforms single or multiple consecutive white-space characters into single spaces
	 * @param chars
	 */
	cleanWhitespace = this.wrap(cleanWhitespace)

	isURL = this.wrap(isURL)
	// trimLeft = this.wrap(trimLeft)
	// trimRight = this.wrap(trimRight)
	plural = this.wrap(plural)
	split = this.wrap(split)
}
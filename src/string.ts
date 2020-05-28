"use strict";

import * as assert from 'assert'




interface Container<T> {
	new(args: Iterable<T>): InstanceType<this>
}

export class String__ extends global.String {
	constructor(str: string) {
		super(str)
	}

	isWhiteSpace(): boolean { return this.replace(/^\s+|\s+$/g, '').length === 0 }
	isUpperCase() { return this.toUpperCase() === this.valueOf() }
	isLowerCase() { return this.toLowerCase() === this.valueOf() }
	isEmptyOrWhitespace() { return this.strip([" ", "\n", "\t", "\v", "\r"]).length === 0; }
	prependSpaceIfNotEmpty() { if (this.isEmptyOrWhitespace()) return ""; else return " " + this }
	/** truncate this string by lopping a specified number of characters from the end */
	truncate(numChars: number) { return new String__(this.substr(0, this.length - numChars)) }

	toSnakeCase() { return new String__([...this.tokenizeWords()].join("_")) }
	toCamelCase() { return new String__([...this.tokenizeWords()].map(word => word.toTitleCase).join("_")) }
	toSpace() {
		return new String__([...this.tokenizeWords({
			separateCaseBoundary: "upper",
			seperatorChars: ["-", "_", " ", "    ", "\t"]
		})].join(" "))
	}
	toTitleCase() { return new String__(this.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase())) }

	/** Transforms single or multiple consecutive white-space characters into single spaces
	 * @param chars
	 */
	cleanWhitespace(chars?: string[]) {
		if (["null", "undefined", "array"].indexOf(typeof (chars)) < 0)
			throw `String.cleanWhitespace(): Invalid chars argument type; expected 'null', 'undefined', or 'array'; found ${typeof (chars)}`;

		var _chars = !(chars) ? ["\n", "\t", "\v", "\r"] : chars;
		var result = "";

		for (var i = 0; i < this.length; i++) {
			let val = this[i];
			result += (_chars.indexOf(val) < 0 ? val : " ")
		}
		return result.split(/[ ]{2,}/g).join(" ");
	}

	isURL(): boolean {
		var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
			'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
		return pattern.test(this.toString())
	}

	getCharacters<C extends Iterable<String__>>(container: { (items: Iterable<String__>): C }) {
		let arr = [...this].map(ch => new String__(ch))
		return container(arr)
	}

	trimLeft(...strings: string[]) {
		let str = this.toString()
		strings.forEach(_str => {
			if (str.toLowerCase().startsWith(_str.toLowerCase()))
				str = str.substr(_str.length)
		})

		return str
	}

	trimRight(...strings: string[]) {
		let str = this.toString()
		strings.forEach(_str => {
			if (str.toLowerCase().endsWith(_str.toLowerCase()))
				str = str.substr(0, str.length - _str.length)
		})

		return str
	}

	tokenizeWords<C extends Iterable<String__>>(args?:
		{
			separateCaseBoundary?: "upper" | "lower" | "all" | "none",
			seperatorChars?: string[],
			container?: { (items: Iterable<String__>): C }
		}) {
		//console.log(`starting tokenizeWords for "${this.valueOf()}"`)
		const separateCaseBoundary = args?.separateCaseBoundary ?? "upper"
		const seperatorChars = args?.seperatorChars ?? ["-", "_", " ", "    ", "\t"]
		const container = args?.container ?? (items => items)

		var words: string[] = []
		var currentWord = ""
		var lastChar = this[0]

		let pushWord = (str: string = "") => {
			if (currentWord.length > 0) {
				words.push(currentWord)
				//console.log(`pushed ${currentWord} to words, now ${JSON.stringify(words)}`)
			}

			//console.log(`set currentWord to ${str}`)
			currentWord = str
		}

		let chars = [...this.getCharacters(container)]
		// console.log(`chars array: ${JSON.stringify(chars)}`)

		for (let ch of chars) {
			console.assert(ch !== undefined, `String.tokenizeWords(): ch is undefined`)
			//console.log(`testing char "${ch.valueOf()}"`)

			if (seperatorChars.includes(ch.valueOf())) {
				//console.log(`separators include char tested, will push ${currentWord} to words`)
				pushWord()
			}
			else {
				//console.log(`separators do not include char tested, testing for case boundary`)

				let nowCase = ch.getCase()
				let lastCase = new String__(lastChar).getCase()

				let test = (
					(separateCaseBoundary === "none") ||
					(seperatorChars.includes(lastChar)) ||
					(lastCase === undefined) ||
					(nowCase === undefined) ||
					(nowCase !== separateCaseBoundary) ||
					(nowCase === lastCase)
				)

				if (test === false) {
					//console.log(`case boundary test is true, pushing `)
					pushWord(ch.valueOf())
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

		pushWord()

		//let result = words.map(x => new String__(x))
		//console.log(`result of tokenizeWords(${this.valueOf()}) = ${words}`)

		return container(words.map(x => new String__(x)))
	}

	/** Shorten a string by placing an ellipsis at the middle of it.
	 * @param maxLen is the maximum length of the new shortened string
	 */
	shorten(maxLen: number) {
		let title = this.toString()
		if (title.length <= maxLen) return new String__(title);

		let i = 0, j = title.length - 1;
		let left = "", right = "";
		let leftCount = 0, rightCount = 0;

		while (true) {
			left += title[i];
			leftCount += 1;
			i += 1;
			if (leftCount + rightCount + 3 >= maxLen) break;

			right += title[j];
			rightCount += 1;
			j -= 1;
			if (leftCount + rightCount + 3 >= maxLen) break;
		}
		right = right.split("").reverse().join("")

		return new String(left + "..." + right)
	}

	/** returns the case of input string
	 * if string contains only special characters, 'upper' is returned
	 * @param str the input string
	 */
	getCase(): "upper" | "lower" | undefined {
		if (this.toLowerCase() === this.toUpperCase())
			return undefined
		else if (this.isUpperCase())
			return "upper"
		else
			return "lower"
	}

	strip(chars: string[]) {
		if (!Array.isArray(chars))
			throw `String.strip(): Invalid chars argument type; expected 'Array'; found ${typeof (chars)}`;

		var result = "";
		for (var i = 0; i < this.length; i++) {
			if (chars.indexOf(this[i]) < 0) result += this[i];
		}
		return result
	}

	plural() {

		let thisLower = this.toString().toLowerCase()
		let result: string

		let singulars = ["sheep", "series", "species", "deer", "ox", "child", "goose", "man", "woman", "tooth", "foot", "mouse", "person"];
		let plurals = ["sheep", "series", "species", "deer", "oxen", "children", "geese", "men", "women", "teeth", "feet", "mice", "people"]

		let match = singulars.indexOf(this.toString().toLowerCase())
		if (match >= 0) {
			result = plurals[match]
		}
		else {
			if (this.toString() === "") {
				result = ("")
			}
			else if (thisLower.endsWith("us") && this.length > 4) {
				result = (this.truncate(2).concat("i"))
			}
			else if (thisLower.endsWith("sis")) {
				result = (this.truncate(2).concat("es"))
			}
			else if (["s", "ss", "sh", "ch", "x", "z"].some(x => thisLower.endsWith(x))) {
				result = (this.concat("es"))
			}
			else if (thisLower.endsWith("ife")) { // e.g., wife -> wives
				result = (this.truncate(3).concat("ives"))
			}
			else if (thisLower.endsWith("lf")) { // e.g., elf -> elves
				result = (this.truncate(2).concat("lves"))
			}
			else if (thisLower.endsWith("y") && new CharASCII(this.charCodeAt(this.length - 2)).isConsonant()) {
				result = this.truncate(1).concat("ies")
			}
			else if (thisLower.endsWith("y") && new CharASCII(this.charCodeAt(this.length - 2)).isVowel()) {
				result = (this.concat("s"))
			}
			else if (thisLower.endsWith("o") && !["photo", "piano", "halo"].includes(this.toString())) {
				result = (this.concat("es"))
			}
			else if (thisLower.endsWith("on") || this.toString() === ("criterion")) {
				result = (this.truncate(2).concat("a"))
			}
			else {
				result = this.concat("s")
			}
		}

		return new String__(this.isUpperCase() ? result.toUpperCase() : result)
	}

	split(arg: { [Symbol.split](string: string, limit?: number): string[]; } | string | RegExp | number) {
		if (typeof arg === "object")
			return super.split(arg)
		else if (typeof arg !== "number") {
			return super.split(arg)
		}
		else {
			const numChunks = Math.ceil(this.length / arg)
			const chunks: string[] = new Array(numChunks)
			for (let i = 0, o = 0; i < numChunks; ++i, o += arg) {
				chunks[i] = this.substr(o, arg)
			}
			return chunks
		}
	}
}


export class CharASCII {
	private char: string
	constructor(charCode: number) {
		if (charCode < 0)
			throw new Error(`Invalid argument: must be non-negative`)
		if (charCode > 128)
			throw new Error(`Invalid argument: must be less than 128`)

		this.char = String.fromCharCode(charCode)
		console.assert(this.char.length === 1)
	}

	isVowel() {
		return ["a", "e", "i", "o", "u"].includes(this.char)
	}
	isConsonant() {
		return !this.isVowel()
	}
	isDigit() {
		for (let i = 0; i < 10; i++) {
			if (this.char === i.toString()) return true
		}
		return false
	}

	static Codes = {
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
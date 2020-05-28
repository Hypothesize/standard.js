
import * as assert from 'assert'


export class Number__ extends global.Number {
	constructor(num: number) {
		super(num)
	}

	static isFloat(value: any): boolean {
		let parsed = typeof value === "number"
			? value : Number.parseFloat(value);
		return (!Number.isNaN(parsed)) && (!Number.isInteger(parsed))
	}

	static isInteger(value: any): boolean {
		let parsed = typeof value === "number"
			? value : Number.parseFloat(value);
		return (!Number.isNaN(parsed)) && (Number.isInteger(parsed))
	}

	static isNumber(x: any) {
		return typeof x === "number" && !isNaN(x)
	}

	static parse(value: any): number | undefined {
		let parsed = typeof value === "number"
			? value
			: Number.parseFloat(value);
		return (!Number.isNaN(parsed)) ? parsed : undefined
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
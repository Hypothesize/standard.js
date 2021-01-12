/* eslint-disable fp/no-mutation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable indent */
/* eslint-disable fp/no-loops */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable brace-style */

import { Obj, ExtractByType, Primitive, hasValue } from "../../utility"
import { zip } from "../iterable"
import { ArrayNumeric } from "./array"
import { mean, deviation } from "../../statistical"
import { Predicate, Projector, getRanker } from "../../functional"
import { Dictionary } from "./dictionary"
import { Sequence } from "./sequence"

export const ROW_NUM_COL_NAME = "rowNum" as const

export class DataTable<T extends Obj = Obj> /*implements Table<T>*/ {
	protected readonly _idVector: number[]
	protected readonly _colVectors: Dictionary<Record<keyof T, T[keyof T][]>>

	/** Contruct from a collection of objects
	 * @param rowObjects Iterable collection of row object literals
	 * @param idVector 
	 */
	constructor(rowObjects: Iterable<T>, idVector?: Iterable<number>)

	/** Construct from an object literal of columns
	 * @param columnVectors
	 * @param idVector 
	 */
	constructor(columnVectors: Record<keyof T, T[keyof T][]>, idVector?: Iterable<number>)

	/** Actual implementation of constructor variants
	 * @param source Either rows or columns as defined above
	 * @param idVector Optional vector of row indexes indicating which which rows are part of this data table
	 */
	constructor(source: Iterable<T> | Record<keyof T, T[keyof T][]>, idVector?: Iterable<number>) {
		const start = new Date().getTime()

		// eslint-disable-next-line fp/no-mutation, @typescript-eslint/no-explicit-any
		this._colVectors = (typeof (source as any)[Symbol.iterator] === "function")
			? new Dictionary(DataTable.rowsToColumns(source as Iterable<T>))
			: new Dictionary(source as Record<keyof T, T[keyof T][]>)

		// eslint-disable-next-line fp/no-mutation
		this._idVector = idVector
			? [...idVector]
			: this._colVectors.size > 0
				? [...Array([...this._colVectors][0][1].length).keys()]
				: []

		// eslint-disable-next-line fp/no-unused-expression
		console.log(`\nDataTable took ${new Date().getTime() - start}ms to instantiate`)
	}

	static fromColumns<T extends Obj = Obj>(columnVectors: Record<keyof T, T[keyof T][]>, idVector?: Iterable<number>) {
		return new DataTable(columnVectors, idVector)
	}
	static fromRows<T extends Obj = Obj>(rowObjects: Iterable<T>, idVector?: Iterable<number>) {
		return new DataTable(rowObjects, idVector)
	}

	get idVector() { return this._idVector }
	/** Columns vectors excluding row ids vector */
	get columnVectors() { return this._colVectors }
	/** Return data as an iterable of rows that includes a sequential row number property */
	get rowObjects(): Iterable<T> {
		return (function* (me): IterableIterator<T> {
			for (const originalRowNum of me._idVector) {
				const row = {
					...me._colVectors.map(vector => vector[originalRowNum]).asObject() as any as T
				}
				yield row
			}
		})(this)
	}
	get rowObjectsNumbered(): Iterable<T & { origRowNum: number, sequentialRowNum: number }> {
		return (function* (me): IterableIterator<T & { origRowNum: number, sequentialRowNum: number }> {
			for (const rowNumInfo of zip(Sequence.integers({ from: 0, to: me.length - 1 }), me._idVector)) {
				const [sequentialRowNum, originalRowNum] = rowNumInfo

				const row: T & { origRowNum: number, sequentialRowNum: number } = {
					origRowNum: originalRowNum,
					sequentialRowNum: sequentialRowNum + 1,
					...me._colVectors.map(vector => vector[originalRowNum]).asObject() as any as T
				}

				yield row
			}
		})(this)
	}

	get length() { return this._idVector.length }

	/** Return a new data table that excludes data disallowed by the passed filters */
	filter(args: { filter?: Predicate<T, void> | TableFilter | FilterGroup, options?: FilterOptions }): DataTable<T> {

		const shouldRetain = (row: T, filter: Predicate<T, void> | TableFilter | FilterGroup): boolean => {
			if ("filters" in filter) {
				switch (filter.combinator) {
					case undefined:
					case "AND": return filter.filters.every(f => shouldRetain(row, f))
					case "OR": return filter.filters.some(f => shouldRetain(row, f))
					default: {
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const _: never = filter.combinator
						throw new Error(`Unknown filter group combinator: ${filter.combinator}`)
					}
				}
			}
			else if ("fieldName" in filter) {
				// eslint-disable-next-line fp/no-let
				let averageAndDev: { average: number, std: number } = { average: 0, std: 0 }
				if (filter.operator === "is_outlier_by") {
					const originalIdVector = this.idVector
					const colVector: unknown[] = filter.fieldName === "rowId" ? originalIdVector : this._colVectors.get(filter.fieldName as keyof T)
					if (colVector === undefined) {
						throw new Error(`Trying to apply a filter on column ${filter.fieldName}, but no such column in the dataTable`)
					}
					const vector: number[] = colVector.filter(v => v !== undefined).map(val => Number.parseFloat(String(val)))
					const columnMean = mean(vector)
					const stdv = deviation(vector, { mean: columnMean, forSample: true })
					if (columnMean === undefined) { throw new Error("Undefined mean, cannot filter by standard deviation") }
					if (stdv === undefined) { throw new Error("Undefined std dev, cannot filter by standard deviation") }

					averageAndDev = {
						average: columnMean,
						std: stdv
					}
				}

				const _test = filter.negated ? false : true
				const _val = row[filter.fieldName as keyof T]

				switch (filter.operator) {
					case "equal":
						return (_val == filter.value) === _test
					case "not_equal":
						return (_val != filter.value) === _test
					case "greater":
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						return (parseFloat(String(_val)) > parseFloat(filter.value as any)) === _test
					case "greater_or_equal":
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						return (parseFloat(String(_val)) >= parseFloat(filter.value as any)) === _test
					case "less":
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						return (parseFloat(String(_val)) < parseFloat(filter.value as any)) === _test
					case "less_or_equal":
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						return (parseFloat(String(_val)) <= parseFloat(filter.value as any)) === _test
					case "is_outlier_by": {
						const belowMin = parseFloat(String(_val)) < averageAndDev.average - parseFloat(filter.value as any) * averageAndDev.std
						const aboveMax = parseFloat(String(_val)) > averageAndDev.average + parseFloat(filter.value as any) * averageAndDev.std
						return (belowMin || aboveMax) === _test
					}
					case "contains":
						return (hasValue(_val) && String(_val).indexOf(filter.value) >= 0) === _test
					case "is-contained":
						return (hasValue(_val) && filter.value.indexOf(String(_val)) >= 0) === _test
					case "starts_with":
						return (_val !== undefined && _val !== null && String(_val).startsWith(filter.value)) === _test
					case "ends_with":
						return (_val !== undefined && _val !== null && String(_val).endsWith(filter.value)) === _test
					case "blank":
						return _val === undefined || _val === null === _test

					default: {
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						throw new Error(`Unknown filter operator: ${(filter as any).operator}`)
					}
				}
			}
			else {
				return filter(row)
			}
		}

		const effectiveIdVector = args.options?.scope === "original"
			? Sequence.integers({ from: 0, to: this.length - 1 })
			: this._idVector
		const idColumnVectorFiltered = effectiveIdVector.filter(rowNum => {
			if (args.filter === undefined) return true
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const row = this._colVectors.map(v => v[rowNum]).asObject() as any as T
			return shouldRetain(row, args.filter)
		})

		return new DataTable<T>(this._colVectors.asObject(), idColumnVectorFiltered)
	}

	sort(args: { columnName: typeof ROW_NUM_COL_NAME | keyof T, order: SortOrder, options?: SortOptions }) {
		if (args.columnName !== ROW_NUM_COL_NAME && this._colVectors.get(args.columnName) === undefined)
			throw new Error(`Unknown column ${args.columnName}`)

		// eslint-disable-next-line fp/no-mutating-methods
		const idColumnVectorSorted = [...this._idVector].sort(
			getRanker<number>({
				projector: rowNum => args.columnName === ROW_NUM_COL_NAME
					? rowNum
					: this._colVectors.get(args.columnName)[rowNum],
				tryNumeric: args.options?.tryNumericSort ?? true,
				reverse: args.order === "descending"
			})
		)

		return new DataTable<T>(this._colVectors.asObject(), idColumnVectorSorted)
	}

	page(args: { size: number, index: number, options?: PagingOptions }) {
		const effectiveIdVector = args.options?.scope === "original"
			? [...Sequence.integers({ from: 0, to: this.length - 1 })]
			: this._idVector

		const idColumnVectorPaged = effectiveIdVector.slice(args.index * args.size, (args.index + 1) * args.size)
		return new DataTable<T>(this._colVectors.asObject(), idColumnVectorPaged)
	}

	map<Y>(projector: Projector<T[keyof T], Y>) {
		return new DataTable(this._colVectors.map(vector => vector.map(projector)).asObject()) as DataTable<Obj<Y>>
	}

	static rowsToColumns = <X extends Obj = Record<string, Primitive>>(rows: Iterable<X>) => {
		const srcArray = [...rows as Iterable<X>]
		const columnVectors = {} as Record<keyof X, X[keyof X][]>
		// eslint-disable-next-line fp/no-unused-expression
		srcArray.forEach((row, index) => {
			const rowKeys = new Dictionary(row).keys()
			if (rowKeys.some(key => hasValue(row[key]))) { // ensure row is not empty
				// eslint-disable-next-line fp/no-unused-expression
				rowKeys.forEach(colName => {
					if (!columnVectors[colName])
						// eslint-disable-next-line fp/no-mutation
						columnVectors[colName] = new Array(srcArray.length).fill(undefined)
					// eslint-disable-next-line fp/no-mutation
					columnVectors[colName][index] = row[colName]
				})
			}
		})
		return columnVectors
	}

	/* static async *parseTablesAsync<T extends "rows" | "columns" = "rows">(binaryBuffer: ArrayBuffer, datasetName: string, resultType?: T): AsyncIterableIterator<ResultObject<"rows" | "columns">> {
		const startTime = new Date().getTime()

		const buffer = new Uint8Array(binaryBuffer)

		const dataSetNameNoExtension = new stdString(datasetName).isURL()
			? datasetName.split('/')[datasetName.split('/').length - 1].replace(/\.[^/.]+$/, "")
			: datasetName.replace(/\.[^/.]+$/, "")

		// We try to identify the file type via the buffer's magic number. If there's no type, it's a CSV or JSON
		const isOtherFormat = FileType(binaryBuffer) !== null

		let stringBuffer = ""
		if (TextDecoder && !isOtherFormat) { // Old browsers or complex files will use the old stringification method
			stringBuffer = new TextDecoder().decode(buffer)
		}
		else {
			for (let i = 0; i < buffer.byteLength; i++) stringBuffer += String.fromCharCode(buffer[i])
		}

		console.log(`Time to turn the buffer into a string: ${new Date().getTime() - startTime}ms`)
		const parser: GeneratorParser = isOtherFormat
			? parseUniversal
			: ["[", "{"].includes(stringBuffer.trim()[0]) // The first characters of a JSON file
				? parseJSON
				: parseCSV

		for await (const parseUpdate of parser(stringBuffer, buffer.byteLength, dataSetNameNoExtension)) {
			if (resultType === "rows") {
				yield parseUpdate
			}
			else {
				yield {
					...parseUpdate,
					tables: parseUpdate.tables
						? parseUpdate.tables.map(table => ({ name: table.name, data: DataTable.rowsToColumns(table.data) }))
						: undefined
				}
			}
		}
	}*/

	/* static fromRaw(buffer: ArrayBuffer, datasetName: string): DataTable<Record<string, Primitive>> {
		const parsers = Object.values(tableParsers)
		for (const parser of parsers) {
			const info = parser.preProcess(buffer, datasetName)
			if (info) {
				parser.parse(info)
			}
		}
	}*/

}

export type TableFilter = {
	fieldName: string,
	operator: string,
	value: any,
	negated?: boolean
}

export namespace Filter {
	export type Base<TObj extends Obj = Obj, TVal = any> = {
		fieldName: keyof (ExtractByType<TObj, TVal>),
		value: TVal,
		negated?: boolean
	}
	export type Categorical<T extends Obj> = Base<T, Primitive | null> & {
		operator: "equal" | "not_equal" | "blank",
	}
	export type Ordinal<T extends Obj> = Base<T, number> & {
		operator: "greater" | "greater_or_equal" | "less" | "less_or_equal" | "blank",
	}
	export type Textual<T extends Obj> = Base<T, string> & {
		operator: "contains" | "is-contained" | "starts_with" | "ends_with" | "blank",
	}
	export type Statistical<T extends Obj> = Base<T, number> & {
		operator: "is_outlier_by" | "blank",
		/** number of std. deviations (possibly fractional) */
	}
}
export type Filter<T extends Obj = Obj> = (
	| Filter.Categorical<T>
	| Filter.Ordinal<T>
	| Filter.Textual<T>
	| Filter.Statistical<T>
)

export type FilterGroup = {
	filters: Array<TableFilter | FilterGroup>
	combinator?: "AND" | "OR"
}


export type SortOrder = "ascending" | "descending" | "none"

interface SortOptions { tryNumericSort: boolean }
interface FilterOptions {
	/** Filter without consideration of id vector i.e., use all/original values in column vectors */
	scope: "current" | "original"

	//numberRows: boolean
	//clean?: false | { removeEmptyRows?: boolean, removeEmptyColumns?: boolean }
}
interface PagingOptions {
	/** Page without consideration of id vector i.e., use all/original values in column vectors */
	scope: "current" | "original"
}
// interface DataView {
// 	filters: Record<string, Filter>,
// 	sortColumn: string,
// 	sortOrder: SortOrder,
// 	pageSize: number,
// 	pageIndex: number
// }

/** Data table */
/*export interface Table<T extends Record<string, unknown> = {}> {
	length: number
	// lengthOriginal: number
	idVector: Iterable<number>
	// filteredIdVector: number[]
	columnVectors: Collection.Enumerable<[keyof T, any[]]>
	// columnNames: Collection.Ordered<keyof T>
	rowObjects: Iterable<T & { rowId: number }>

	filter(args: { filterGroup: FilterGroup, options?: Record<string, unknown> }): Table<T>

	sort(args: { columnName: string, order: SortOrder, options?: Record<string, unknown> }): Table<T>

	page(args: { size: number, index: number }): Table<T>
	pageOriginal(args: { size: number, index: number }): Table<T>

	removeById(rowId: number): Table<T>
}*/

import { Projector, Ranker, Comparer } from "./_types"

export function compare<T>(x: T, y: T, comparer?: Projector<T, unknown>, tryNumeric = false, tryDate = false): number {
	const _x: unknown = comparer ? comparer(x) : x
	const _y: unknown = comparer ? comparer(y) : y

	if (typeof _x === "string" && typeof _y === "string") {
		if (tryDate === true) {
			const __x = new Date(_x)
			const __y = new Date(_y)
			if (__x > __y)
				return 1
			else if (__x === __y)
				return 0
			else
				return -1
		}
		if (tryNumeric === true) {
			const __x = parseFloat(_x)
			const __y = parseFloat(_y)
			if ((!Number.isNaN(__x)) && (!Number.isNaN(__y))) {
				return __x - __y
			}
		}

		return new Intl.Collator().compare(_x || "", _y || "")
	}
	else if (typeof _x === "number" && typeof _y === "number") {
		return (_x || 0) - (_y || 0)
	}
	else if (_x instanceof Date && _y instanceof Date) {
		const __x = _x || new Date()
		const __y = _y || new Date()
		if ((__x as Date) > (__y as Date))
			return 1
		else if (__x === __y)
			return 0
		else
			return -1
	}
	else
		return _x === _y ? 0 : 1
}
export function getRanker<T>(args: { projector: Projector<T, unknown>, tryNumeric?: boolean/*=false*/, tryDate?: boolean/*=false*/, reverse?: boolean/*=false*/ }): Ranker<T> {
	//console.log(`generating comparer, try numeric is ${tryNumeric}, reversed is ${reverse} `)
	return (x: T, y: T) => {
		return compare(x, y, args.projector, args.tryNumeric, args.tryDate) * (args.reverse === true ? -1 : 1)
	}
}
export function getComparer<T>(projector: Projector<T, unknown>, tryNumeric = false, tryDate?: boolean/*=false* reverse = false*/): Comparer<T> {
	//console.log(`generating comparer, try numeric is ${tryNumeric}, reversed is ${reverse} `)
	return (x: T, y: T) => {
		return compare(x, y, projector, tryNumeric, tryDate) === 0
	}
}
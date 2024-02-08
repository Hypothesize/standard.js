/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable brace-style */

export type AsyncFn<T, Args extends any[] = any[]> = (...args: Args) => Promise<T>

export function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function promisify<T, A extends any[]>(fn: (...args: A) => T): AsyncFn<T, A> {
	return (...args: A) => {
		return new Promise<T>((resolve, reject) => {
			try {

				resolve(fn(...args))
			}
			catch (e) {

				reject(e)
			}
		})
	}
}

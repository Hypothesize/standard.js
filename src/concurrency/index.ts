/** Returns a wrapped version of a function that prevents simultaneous execution.
 * See https://spin.atomicobject.com/2018/09/10/javascript-concurrency/
 * @param fn The input (possibly async) function
 */
/*export function notConcurrent<X extends any[], Y>(fn: (...args: X) => PromiseLike<Y>): (...args: X) => Promise<Y> {
	
	let inFlight: Promise<Y> | false = false
	return (...args: X) => {
		if (!inFlight) {
			
			inFlight = (async () => {
				try {
					return await fn(...args)
				}
				finally {
					
					inFlight = false
				}
			})()
		}
		return inFlight
	}
}

/** Enables a way to specify critical section of code that cannot be running simultaneously */
/*export class Mutex {
	private mutex = Promise.resolve();

	lock(): PromiseLike<() => void> {
		// eslint-disable-next-line @typescript-eslint/no-empty-function, fp/no-let
		let begin: (unlock: () => void) => void = unlock => { }

		
		this.mutex = this.mutex.then(() => new Promise(begin))

		return new Promise(res => { begin = res })
	}

	async dispatch<T>(fn: (() => T) | (() => PromiseLike<T>)): Promise<T> {
		const unlock = await this.lock()
		try {
			return await Promise.resolve(fn())
		}
		finally {
			unlock()
		}
	}
}*/


/**
 * Throttle function execution. Throttling will ensure the function
 * will not be called again until a certain amount of time has passed.
 * If throttle is called during the throttle limit, it will execute
 * function after the limit with the most recent parameters.
 *
 * @template T The function type.
 * @param func The function to throttle.
 * @param limit The throttle limit in milliseconds.
 * @returns The throttled function.
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	let shouldRunOnTimeoutEnd = false;
	let latestArgs: Parameters<T>;

	// This function will be called when the throttle timeout ends
	const runner = () => {
		// If the throttled function was called during throttle timeout,
		// call the function with the latest arguments
		if (shouldRunOnTimeoutEnd) {
			func(...latestArgs);
			shouldRunOnTimeoutEnd = false;
		}

		timeout = null;
	};

	return ((...innerArgs: Parameters<T>): void => {
		latestArgs = innerArgs;
		// If no throttle timeout is set, execute the function immediately
		// and start the throttle timeout
		if (timeout === null) {
			func(...innerArgs);
			timeout = setTimeout(runner, limit);
		} else {
			// If the function is called during the throttle timeout,
			// set a flag to call it when the timeout ends
			shouldRunOnTimeoutEnd = true;
		}
	}) as T;
}

/**
 * A class representing a Promise that can be externally resolved or rejected
 * It also can be reset, creating a new Promise instance.
 *
 * @template T The promise result type.
 */
export class Deferred<T> {
	public promise!: Promise<T>;
	public resolve!: (value: T) => void;
	public reject!: (reason?: any) => void;

	/**
	 * Construct a new Deferred object.
	 */
	public constructor() {
		this.reset();
	}

	/**
	 * Reset the Deferred instance with a new Promise.
	 */
	public reset() {
		this.promise = new Promise<T>((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
}

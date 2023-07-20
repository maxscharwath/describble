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

/**
 * The ConcurrencyLimiter class is used to limit the execution of a certain number of tasks at the same time.
 * If the number of active tasks reaches the maximum limit, the new tasks are added to a queue and will only
 * start once one of the active tasks completes.
 */
export class ConcurrencyLimiter {
	// A queue to hold tasks that cannot start immediately because we're at the limit
	private readonly taskQueue: Array<() => void> = [];
	// The count of active tasks
	private activeTasks = 0;

	// Create a new concurrency limiter, with the maximum number of concurrent tasks specified
	public constructor(private readonly maxTasks = 4) {}

	/**
	 * Execute a task, if we're at the limit of concurrent tasks it will be queued for later execution
	 *
	 * @param task The task to execute
	 * @return A promise that will resolve to the result of the task, or be rejected if the task throws an error
	 */
	public async execute<T>(task: () => Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			// A wrapper around the task to increase/decrease the count of active tasks and handle the task result
			const asyncTask = async () => {
				this.activeTasks++;
				try {
					const result = await task();
					resolve(result);
				} catch (err) {
					reject(err);
				} finally {
					this.activeTasks--;
					this.checkQueue();
				}
			};

			// If we're below the limit, start the task immediately. Otherwise queue it for later
			if (this.activeTasks < this.maxTasks) {
				void asyncTask();
			} else {
				this.taskQueue.push(asyncTask);
			}
		});
	}

	/**
	 * If there are queued tasks and we're below the limit, start the next task from the queue
	 */
	private checkQueue() {
		if (this.taskQueue.length > 0 && this.activeTasks < this.maxTasks) {
			const nextTask = this.taskQueue.shift();
			if (nextTask) {
				nextTask();
			}
		}
	}
}

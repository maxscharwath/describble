export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	let shouldRunOnTimeoutEnd = false;
	let latestArgs: Parameters<T>;

	const runner = () => {
		func(...latestArgs);
		timeout = null;
		if (shouldRunOnTimeoutEnd) {
			shouldRunOnTimeoutEnd = false;
			timeout = setTimeout(runner, limit);
		}
	};

	return ((...innerArgs: Parameters<T>): void => {
		latestArgs = innerArgs;
		if (timeout) {
			shouldRunOnTimeoutEnd = true;
		} else {
			timeout = setTimeout(runner, limit);
		}
	}) as T;
}

export class Deferred<T> {
	public promise!: Promise<T>;
	public resolve!: (value: T) => void;
	public reject!: (reason?: any) => void;

	public constructor() {
		this.reset();
	}

	reset() {
		this.promise = new Promise<T>((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
}

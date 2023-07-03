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

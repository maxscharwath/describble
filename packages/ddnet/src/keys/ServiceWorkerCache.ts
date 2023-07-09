type Message<T> = {
	type: 'get' | 'delete';
	key: string;
} | {
	type: 'set';
	key: string;
	data: T;
};

export class ServiceWorkerCache {
	private reg?: Promise<ServiceWorkerRegistration>;
	async getSw() {
		if (!this.reg) {
			this.reg = navigator.serviceWorker.register(new URL('./sw.js', import.meta.url));
		}

		return (await this.reg).active;
	}

	public async unregister() {
		const reg = await this.reg;
		if (reg) {
			await reg.unregister();
			this.reg = undefined;
		}
	}

	public async get<T>(key: string): Promise<T | undefined> {
		return this.send<T, T>({
			type: 'get',
			key,
		});
	}

	public async set<T>(key: string, data: T): Promise<void> {
		return this.send<T>({
			type: 'set',
			key,
			data,
		});
	}

	public async delete(key: string): Promise<boolean> {
		return this.send({
			type: 'delete',
			key,
		});
	}

	private async send<T, P = void>(message: Message<T>): Promise<P> {
		const sw = await this.getSw();
		if (!sw) {
			throw new Error('Service worker not found');
		}

		return new Promise<P>(resolve => {
			const channel = new MessageChannel();
			channel.port1.onmessage = event => resolve(event.data as P);
			sw.postMessage(message, [channel.port2]);
		});
	}
}

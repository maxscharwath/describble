import {type Cache} from './Cache';

type Message<T> = {
	type: 'get' | 'delete';
	key: string;
} | {
	type: 'set';
	key: string;
	data: T;
};

/**
 * ServiceWorkerCache class implements Cache interface and provides methods for interacting with Service Workers.
 * This class can be used to register, unregister Service Workers and perform get, set, delete operations on the cache.
 */
export class ServiceWorkerCache implements Cache {
	private reg?: Promise<ServiceWorkerRegistration>;

	/**
	 * Constructs a new ServiceWorkerCache.
	 * @param path - The path to the service worker file.
	 */
	public constructor(private readonly path: string) {}

	/**
	 * Returns the active service worker.
	 * @returns The active service worker.
	 */
	public async getSw() {
		if (!this.reg) {
			// Register the service worker if not already registered.
			this.reg = navigator.serviceWorker.register(this.path, {
				type: 'module',
			});
		}

		return (await this.reg).active;
	}

	/**
	 * Unregisters the service worker.
	 */
	public async unregister() {
		const reg = await this.reg;
		if (reg) {
			await reg.unregister();
			this.reg = undefined;
		}
	}

	/**
	 * Returns the value associated with the given key from the cache.
	 * @param key - The key to look up in the cache.
	 * @returns The value associated with the key.
	 */
	public async get<T>(key: string): Promise<T | undefined> {
		return this.send<T, T>({
			type: 'get',
			key,
		});
	}

	/**
	 * Sets a value for a key in the cache.
	 * @param key - The key to set in the cache.
	 * @param data - The value to set for the key.
	 */
	public async set<T>(key: string, data: T): Promise<void> {
		return this.send<T>({
			type: 'set',
			key,
			data,
		});
	}

	/**
	 * Deletes the value associated with the given key in the cache.
	 * @param key - The key to delete from the cache.
	 * @returns True if the deletion was successful, false otherwise.
	 */
	public async delete(key: string): Promise<boolean> {
		return this.send({
			type: 'delete',
			key,
		});
	}

	/**
	 * Sends a message to the service worker and returns the response.
	 * @param message - The message to send to the service worker.
	 * @returns The response from the service worker.
	 */
	private async send<T, P = void>(message: Message<T>): Promise<P> {
		const sw = await this.getSw();
		if (!sw) {
			throw new Error('Service worker not found');
		}

		// Use MessageChannel API to send and receive messages to/from the service worker.
		return new Promise<P>(resolve => {
			const channel = new MessageChannel();
			channel.port1.onmessage = event => resolve(event.data as P);
			sw.postMessage(message, [channel.port2]);
		});
	}
}


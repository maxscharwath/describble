/**
 * Cache is an interface representing a simple key-value store that supports get, set, delete operations.
 * It also supports unregister operation, which typically is used to clear the cache or disconnect from the storage.
 */
export interface Cache {
	/**
	 * Gets a value for a given key from the cache. If the key is not present, it should return undefined.
	 * @param key - The key to look up in the cache.
	 * @returns The value associated with the key or undefined if the key is not in the cache.
	 */
	get<T> (key: string): Promise<T | undefined>;

	/**
	 * Sets a value for a given key in the cache.
	 * @param key - The key under which to store the value.
	 * @param data - The value to be stored.
	 * @returns A promise that resolves when the value has been set.
	 */
	set<T> (key: string, data: T): Promise<void>;

	/**
	 * Deletes a key-value pair from the cache.
	 * @param key - The key of the key-value pair to delete.
	 * @returns A promise that resolves to true if the key was deleted, false otherwise.
	 */
	delete (key: string): Promise<boolean>;

	/**
	 * Unregisters from the cache or clears the cache.
	 * @returns A promise that resolves when the cache has been unregistered or cleared.
	 */
	unregister(): Promise<void>;
}

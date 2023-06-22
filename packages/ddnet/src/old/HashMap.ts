type KeyValue = number | string | symbol | bigint | boolean;
export type Hashable = {
	hashCode(): KeyValue;
};

export class HashMap<T extends Hashable, U> implements Map<T, U> {
	get [Symbol.toStringTag]() {
		return 'HashMap';
	}

	readonly #map = new Map<KeyValue, {originalKey: T; value: U}>();

	get(key: T): U | undefined {
		const hash = this.#getKey(key);
		return this.#map.get(hash)?.value;
	}

	set(key: T, value: U): this {
		const hash = this.#getKey(key);
		this.#map.set(hash, {originalKey: key, value});
		return this;
	}

	has(key: T): boolean {
		const hash = this.#getKey(key);
		return this.#map.has(hash);
	}

	delete(key: T): boolean {
		const hash = this.#getKey(key);
		return this.#map.delete(hash);
	}

	forEach(callbackfn: (value: U, key: T, map: HashMap<T, U>) => void, thisArg?: any): void {
		for (const [key, value] of this.entries()) {
			callbackfn.call(thisArg, value, key, this);
		}
	}

	keys(): IterableIterator<T> {
		return (function * (map) {
			for (const {originalKey} of map.values()) {
				yield originalKey;
			}
		})(this.#map);
	}

	entries(): IterableIterator<[T, U]> {
		return (function * (map) {
			for (const {originalKey, value} of map.values()) {
				yield [originalKey, value];
			}
		})(this.#map);
	}

	values(): IterableIterator<U> {
		return (function * (map) {
			for (const {value} of map.values()) {
				yield value;
			}
		})(this.#map);
	}

	clear(): void {
		this.#map.clear();
	}

	get size(): number {
		return this.#map.size;
	}

	[Symbol.iterator](): IterableIterator<[T, U]> {
		return this.entries();
	}

	#getKey(value: T) {
		if (value && typeof value === 'object' && 'hashCode' in value && typeof value.hashCode === 'function') {
			return value.hashCode();
		}

		return value as unknown as KeyValue;
	}
}

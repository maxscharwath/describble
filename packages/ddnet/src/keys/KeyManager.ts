import {type DBSchema, type IDBPDatabase, openDB} from 'idb/with-async-ittr';
import {decryptData, encryptData, getPublicKey} from '../crypto';
import {base58} from '@describble/base-x';

interface DDNetKeyDB extends DBSchema {
	keys: {
		key: string;
		value: Uint8Array;
	};
}

/**
 * KeyManager class provides methods for managing keys stored in IndexedDB.
 * This class can be used to get private keys, save keys and list all keys.
 */
export class KeyManager {
	private dbPromise?: Promise<IDBPDatabase<DDNetKeyDB>>;

	/**
	 * Constructs a new KeyManager.
	 * @param dbName - The name of the IndexedDB database.
	 */
	public constructor(private readonly dbName: string) {
	}

	/**
	 * Returns the decrypted private key associated with the given key from the database.
	 * @param key - The key to look up in the database.
	 * @param secret - The secret used to decrypt the private key.
	 * @returns The decrypted private key.
	 */
	public async getPrivateKey(key: string, secret: Uint8Array | string): Promise<Uint8Array | undefined> {
		const db = await this.db;
		const encrypted = await db.get('keys', key);
		if (!encrypted) {
			return;
		}

		try {
			return await decryptData(encrypted, secret);
		} catch (cause) {
			throw new Error('Failed to decrypt key', {cause});
		}
	}

	/**
	 * Encrypts and saves the private key in the database and returns the public key.
	 * @param privateKey - The private key to save.
	 * @param secret - The secret used to encrypt the private key.
	 * @param force - Whether to overwrite the key if it already exists.
	 * @returns The public key associated with the private key.
	 */
	public async saveKey(privateKey: Uint8Array, secret: Uint8Array | string, force = false): Promise<string> {
		const publicKey = getPublicKey(privateKey);
		const encrypted = await encryptData(privateKey, secret);
		const db = await this.db;
		const key = base58.encode(publicKey);
		if (force) {
			await db.put('keys', encrypted, key);
		} else {
			await db.add('keys', encrypted, key);
		}

		return key;
	}

	/**
	 * Returns all keys from the database.
	 * @returns An array of all keys.
	 */
	public async listKeys(): Promise<string[]> {
		const db = await this.db;
		return db.getAllKeys('keys');
	}

	/**
	 * Returns the IndexedDB database.
	 * @returns The IndexedDB database.
	 */
	private get db(): Promise<IDBPDatabase<DDNetKeyDB>> {
		if (!this.dbPromise) {
			this.dbPromise = openDB<DDNetKeyDB>(this.dbName, 1, {
				upgrade(db) {
					db.createObjectStore('keys');
				},
			});
		}

		return this.dbPromise;
	}
}


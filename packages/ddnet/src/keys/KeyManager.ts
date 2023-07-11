import {type DBSchema, type IDBPDatabase, openDB} from 'idb/with-async-ittr';
import {decryptData, encryptData, getPublicKey} from '../crypto';
import {base58} from 'base-x';

interface DDNetKeyDB extends DBSchema {
	keys: {
		key: string;
		value: Uint8Array;
	};
}

export class KeyManager {
	private dbPromise?: Promise<IDBPDatabase<DDNetKeyDB>>;

	constructor(private readonly dbName: string) {
	}

	async getPrivateKey(key: string, secret: Uint8Array | string): Promise<Uint8Array | undefined> {
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

	async saveKey(privateKey: Uint8Array, secret: Uint8Array | string): Promise<string> {
		const publicKey = getPublicKey(privateKey);
		const encrypted = await encryptData(privateKey, secret);
		const db = await this.db;
		const key = base58.encode(publicKey);
		await db.add('keys', encrypted, key);
		return key;
	}

	async listKeys(): Promise<string[]> {
		const db = await this.db;
		return db.getAllKeys('keys');
	}

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

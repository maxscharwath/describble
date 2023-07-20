import {type StorageProvider} from './StorageProvider';
import {
	type DBSchema,
	type IDBPDatabase,
	openDB,
} from 'idb/with-async-ittr';
import {type DocumentId} from '../types';

/**
 * DDNetDB is the IndexedDB schema for the DDNet namespace.
 */
interface DDNetDB extends DBSchema {
	documents: {
		key: DocumentId;
		value: Uint8Array;
	};
	saves: {
		key: [DocumentId, 'snapshot'] | [DocumentId, 'incremental', number];
		value: Uint8Array;
	};
}

/**
 * IDBStorageProvider class implements the StorageProvider interface using IndexedDB for persistent storage.
 * It defines methods to save, remove, and retrieve documents, snapshots, and chunks of data.
 * Also, it manages databases for different namespaces using the getDB private method.
 */
export class IDBStorageProvider implements StorageProvider {
	private readonly dbPromises = new Map<string, Promise<IDBPDatabase<DDNetDB>>>();

	public async saveDocumentHeader(namespace: string, documentId: DocumentId, header: Uint8Array): Promise<void> {
		const db = await this.getDB(namespace);
		await db.put('documents', header, documentId);
	}

	public async getDocumentHeader(namespace: string, documentId: DocumentId): Promise<Uint8Array | undefined> {
		const db = await this.getDB(namespace);
		return db.get('documents', documentId);
	}

	public async removeDocument(namespace: string, documentId: DocumentId): Promise<void> {
		const db = await this.getDB(namespace);
		const tx = db.transaction(['documents', 'saves'], 'readwrite');
		await tx.objectStore('documents').delete(documentId);
		await tx.objectStore('saves').delete(IDBKeyRange.bound([documentId], [documentId, '\uffff']));
		await tx.done;
	}

	public async listDocuments(namespace: string): Promise<DocumentId[]> {
		const db = await this.getDB(namespace);
		return db.getAllKeys('documents');
	}

	public async saveChunk(namespace: string, documentId: DocumentId, binary: Uint8Array, index: number): Promise<void> {
		const db = await this.getDB(namespace);
		await db.put('saves', binary, [documentId, 'incremental', index]);
	}

	public async getChunks(namespace: string, documentId: DocumentId, clear = false): Promise<Uint8Array[]> {
		const db = await this.getDB(namespace);
		const keyRange = IDBKeyRange.bound(
			[documentId, 'incremental'],
			[documentId, 'incremental', '\uffff'],
		);
		const tx = db.transaction('saves', clear ? 'readwrite' : 'readonly');
		const chunks: Uint8Array[] = [];
		for await (const cursor of tx.store.iterate(keyRange)) {
			if (cursor.key[1] === 'incremental') {
				chunks.push(cursor.value);
				if (clear) {
					await cursor.delete?.();
				}
			}
		}

		await tx.done;
		return chunks;
	}

	public async saveSnapshot(namespace: string, documentId: DocumentId, binary: Uint8Array, clearChunks: boolean): Promise<void> {
		const db = await this.getDB(namespace);
		const tx = db.transaction('saves', 'readwrite');
		await tx.store.put(binary, [documentId, 'snapshot']);
		if (clearChunks) {
			await tx.store.delete(IDBKeyRange.bound([documentId, 'incremental'], [documentId, 'incremental', '\uffff']));
		}

		await tx.done;
	}

	public async getSnapshot(namespace: string, documentId: DocumentId): Promise<Uint8Array | undefined> {
		const db = await this.getDB(namespace);
		return db.get('saves', [documentId, 'snapshot']);
	}

	public async removeSnapshot(namespace: string, documentId: DocumentId): Promise<void> {
		const db = await this.getDB(namespace);
		await db.delete('saves', [documentId, 'snapshot']);
	}

	/**
	 * Creates a database object for a particular namespace if it doesn't already exist.
	 * @param namespace - The name of the namespace for the desired database.
	 * @returns A Promise resolving with a database object.
	 */
	private async getDB(namespace: string): Promise<IDBPDatabase<DDNetDB>> {
		let dbPromise = this.dbPromises.get(namespace);
		if (!dbPromise) {
			dbPromise = openDB<DDNetDB>(namespace, 1, {
				upgrade(db) {
					db.createObjectStore('documents');
					db.createObjectStore('saves');
				},
			});
			this.dbPromises.set(namespace, dbPromise);
		}

		return dbPromise;
	}
}

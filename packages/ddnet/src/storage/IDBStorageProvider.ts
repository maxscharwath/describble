import {type StorageProvider} from './StorageProvider';
import {
	type DBSchema,
	type IDBPDatabase,
	openDB,
} from 'idb/with-async-ittr';
import {type DocumentId} from '../types';

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

export class IDBStorageProvider implements StorageProvider {
	private readonly dbPromises = new Map<string, Promise<IDBPDatabase<DDNetDB>>>();

	async saveDocumentHeader(namespace: string, documentId: DocumentId, header: Uint8Array): Promise<void> {
		const db = await this.getDB(namespace);
		await db.put('documents', header, documentId);
	}

	async getDocumentHeader(namespace: string, documentId: DocumentId): Promise<Uint8Array | undefined> {
		const db = await this.getDB(namespace);
		return db.get('documents', documentId);
	}

	async removeDocument(namespace: string, documentId: DocumentId): Promise<void> {
		const db = await this.getDB(namespace);
		const tx = db.transaction(['documents', 'saves'], 'readwrite');
		await tx.objectStore('documents').delete(documentId);
		await tx.objectStore('saves').delete(IDBKeyRange.bound([documentId], [documentId, '\uffff']));
		await tx.done;
	}

	async listDocuments(namespace: string): Promise<DocumentId[]> {
		const db = await this.getDB(namespace);
		return db.getAllKeys('documents');
	}

	async saveChunk(namespace: string, documentId: DocumentId, binary: Uint8Array, index: number): Promise<void> {
		const db = await this.getDB(namespace);
		await db.put('saves', binary, [documentId, 'incremental', index]);
	}

	async getChunks(namespace: string, documentId: DocumentId, clear = false): Promise<Uint8Array[]> {
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

	async saveSnapshot(namespace: string, documentId: DocumentId, binary: Uint8Array, clearChunks: boolean): Promise<void> {
		const db = await this.getDB(namespace);
		const tx = db.transaction('saves', 'readwrite');
		await tx.store.put(binary, [documentId, 'snapshot']);
		if (clearChunks) {
			await tx.store.delete(IDBKeyRange.bound([documentId, 'incremental'], [documentId, 'incremental', '\uffff']));
		}

		await tx.done;
	}

	async getSnapshot(namespace: string, documentId: DocumentId): Promise<Uint8Array | undefined> {
		const db = await this.getDB(namespace);
		return db.get('saves', [documentId, 'snapshot']);
	}

	async removeSnapshot(namespace: string, documentId: DocumentId): Promise<void> {
		const db = await this.getDB(namespace);
		await db.delete('saves', [documentId, 'snapshot']);
	}

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

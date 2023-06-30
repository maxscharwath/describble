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
	private readonly dbPromise: Promise<IDBPDatabase<DDNetDB>>;
	constructor() {
		const name = 'ddnet';
		this.dbPromise = openDB<DDNetDB>(name, 1, {
			upgrade(db) {
				db.createObjectStore('documents');
				db.createObjectStore('saves');
			},
		});
	}

	async saveDocumentHeader(documentId: DocumentId, header: Uint8Array): Promise<void> {
		const db = await this.dbPromise;
		await db.put('documents', header, documentId);
	}

	async getDocumentHeader(documentId: DocumentId): Promise<Uint8Array | undefined> {
		const db = await this.dbPromise;
		return db.get('documents', documentId);
	}

	async removeDocument(documentId: DocumentId): Promise<void> {
		const db = await this.dbPromise;
		const tx = db.transaction(['documents', 'saves'], 'readwrite');
		await tx.objectStore('documents').delete(documentId);
		await tx.objectStore('saves').delete(IDBKeyRange.bound([documentId], [documentId, '\uffff']));
		await tx.done;
	}

	async listDocuments(): Promise<DocumentId[]> {
		const db = await this.dbPromise;
		return db.getAllKeys('documents');
	}

	async saveChunk(documentId: DocumentId, binary: Uint8Array, index: number): Promise<void> {
		const db = await this.dbPromise;
		await db.put('saves', binary, [documentId, 'incremental', index]);
	}

	async getChunks(documentId: DocumentId, clear = false): Promise<Uint8Array[]> {
		const db = await this.dbPromise;
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

	async saveSnapshot(documentId: DocumentId, binary: Uint8Array, clearChunks: boolean): Promise<void> {
		const db = await this.dbPromise;
		const tx = db.transaction('saves', 'readwrite');
		await tx.store.put(binary, [documentId, 'snapshot']);
		if (clearChunks) {
			await tx.store.delete(IDBKeyRange.bound([documentId, 'incremental'], [documentId, 'incremental', '\uffff']));
		}

		await tx.done;
	}

	async getSnapshot(documentId: DocumentId): Promise<Uint8Array | undefined> {
		const db = await this.dbPromise;
		return db.get('saves', [documentId, 'snapshot']);
	}

	async removeSnapshot(documentId: DocumentId): Promise<void> {
		const db = await this.dbPromise;
		await db.delete('saves', [documentId, 'snapshot']);
	}
}

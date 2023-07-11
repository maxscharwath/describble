import * as fs from 'fs';
import path from 'path';
import {type StorageProvider} from './StorageProvider';
import {glob} from 'glob';
import {type DocumentId} from '../types';

export class NodeFileStorageProvider implements StorageProvider {
	constructor(private readonly rootDir: string) {
	}

	async saveDocumentHeader(namespace: string, documentId: DocumentId, header: Uint8Array): Promise<void> {
		const dir = this.getDir(namespace);
		const filePath = path.join(dir, `${documentId}.header`);
		fs.writeFileSync(filePath, header);
	}

	async removeSnapshot(namespace: string, documentId: DocumentId): Promise<void> {
		const dir = this.getDir(namespace);
		const filePath = path.join(dir, `${documentId}.snapshot`);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	}

	async getDocumentHeader(namespace: string, documentId: DocumentId): Promise<Uint8Array | undefined> {
		const dir = this.getDir(namespace);
		const filePath = path.join(dir, `${documentId}.header`);
		if (fs.existsSync(filePath)) {
			return fs.readFileSync(filePath);
		}

		return undefined;
	}

	async listDocuments(namespace: string): Promise<DocumentId[]> {
		const dir = this.getDir(namespace);
		const files = await glob(`${dir}/*.header`);
		return files.map(file => path.basename(file, '.header'));
	}

	async getChunks(namespace: string, documentId: DocumentId): Promise<Uint8Array[]> {
		const dir = this.getDir(namespace);
		const filePath = path.join(dir, `${documentId}.chunks`);
		if (!fs.existsSync(filePath)) {
			return [];
		}

		const fileContent = fs.readFileSync(filePath);
		let offset = 0;
		const chunks: Uint8Array[] = [];

		while (offset < fileContent.length) {
			const chunkSize = fileContent.readInt32BE(offset);
			offset += 4; // Size of 32-bit integer

			const chunk = fileContent.subarray(offset, offset + chunkSize);
			chunks.push(chunk);
			offset += chunkSize;
		}

		return chunks;
	}

	async getSnapshot(namespace: string, documentId: DocumentId): Promise<Uint8Array | undefined> {
		const dir = this.getDir(namespace);
		const filePath = path.join(dir, `${documentId}.snapshot`);
		if (fs.existsSync(filePath)) {
			return fs.readFileSync(filePath);
		}

		return undefined;
	}

	async removeDocument(namespace: string, documentId: DocumentId): Promise<void> {
		const dir = this.getDir(namespace);
		const headerPath = path.join(dir, `${documentId}.header`);
		const chunksPath = path.join(dir, `${documentId}.chunks`);
		const snapshotPath = path.join(dir, `${documentId}.snapshot`);

		if (fs.existsSync(headerPath)) {
			fs.unlinkSync(headerPath);
		}

		if (fs.existsSync(chunksPath)) {
			fs.unlinkSync(chunksPath);
		}

		if (fs.existsSync(snapshotPath)) {
			fs.unlinkSync(snapshotPath);
		}
	}

	async saveChunk(namespace: string, documentId: DocumentId, chunk: Uint8Array, _index: number): Promise<void> {
		const dir = this.getDir(namespace);
		const filePath = path.join(dir, `${documentId}.chunks`);

		const chunkSizeBuffer = Buffer.alloc(4);
		chunkSizeBuffer.writeInt32BE(chunk.length);

		fs.appendFileSync(filePath, Buffer.concat([chunkSizeBuffer, chunk]));
	}

	async saveSnapshot(namespace: string, documentId: DocumentId, binary: Uint8Array, clearChunks: boolean): Promise<void> {
		const dir = this.getDir(namespace);
		const filePath = path.join(dir, `${documentId}.snapshot`);
		fs.writeFileSync(filePath, binary);
		if (clearChunks) {
			const chunkPath = path.join(dir, `${documentId}.chunks`);
			if (fs.existsSync(chunkPath)) {
				fs.unlinkSync(chunkPath);
			}
		}
	}

	private getDir(namespace: string): string {
		const sanitizedNamespace = namespace.replace(/[^a-z0-9]/gi, '_');
		const dir = path.join(this.rootDir, sanitizedNamespace);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, {recursive: true});
		}

		return dir;
	}
}

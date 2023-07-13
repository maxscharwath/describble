import {generateKeyPair} from '../src';
import {expect} from 'vitest';
import {Document} from '../src/document/Document';
import {UnauthorizedAccessError} from '../src/document/errors/UnauthorizedAccessError';

describe('Document', () => {
	let ownerKeys: {privateKey: Uint8Array; publicKey: Uint8Array};
	let clientKeys1: {privateKey: Uint8Array; publicKey: Uint8Array};
	let clientKeys2: {privateKey: Uint8Array; publicKey: Uint8Array};
	let doc: Document<unknown>;

	beforeEach(() => {
		ownerKeys = generateKeyPair();
		clientKeys1 = generateKeyPair();
		clientKeys2 = generateKeyPair();
		const allowedClients = [clientKeys1.publicKey];
		doc = Document.create(ownerKeys.privateKey, allowedClients);
	});

	it('should create a new secure document correctly', () => {
		const {header} = doc;
		expect(header.owner).toEqual(ownerKeys.publicKey);
		expect(header.hasAllowedUser(clientKeys1.publicKey)).toBe(true);
		expect(header.version).toBe(1);
	});

	it('should export the document correctly', async () => {
		const exportedDoc = doc.export(ownerKeys.privateKey);
		const importedDoc = Document.import(exportedDoc);
		expect(importedDoc.header.id).toEqual(doc.header.id);
	});

	it('should throw UnauthorizedAccessError when exporting with unauthorized user', async () => {
		expect(() => doc.export(clientKeys2.privateKey)).toThrow(UnauthorizedAccessError);
	});

	it('should throw Error when importing a corrupted document', () => {
		const exportedDoc = doc.export(ownerKeys.privateKey);
		exportedDoc[0]++; // Corrupt the document
		expect(() => Document.import(exportedDoc)).toThrow();
	});

	it('should correctly set allowed users', () => {
		doc.header.setAllowedClients([clientKeys2.publicKey], ownerKeys.privateKey);
		expect(doc.header.hasAllowedUser(clientKeys2.publicKey)).toBe(true);
		expect(doc.header.version).toBe(2);
	});

	it('should throw UnauthorizedAccessError when setting allowed users with unauthorized user', () => {
		expect(() => doc.header.setAllowedClients([clientKeys2.publicKey], clientKeys1.privateKey)).toThrow(UnauthorizedAccessError);
	});
});

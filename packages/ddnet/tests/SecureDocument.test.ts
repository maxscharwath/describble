import {DocumentValidationError, SecureDocument, UnauthorizedAccessError} from '../src/SecureDocument';
import {generateKeyPair, uint8ArrayEquals} from '../src/crypto';
import {v5 as uuidv5} from 'uuid';
import {expect} from 'vitest';

describe('SecureDocument', () => {
	let ownerKeys: {privateKey: Uint8Array; publicKey: Uint8Array};
	let clientKeys1: {privateKey: Uint8Array; publicKey: Uint8Array};
	let clientKeys2: {privateKey: Uint8Array; publicKey: Uint8Array};
	let doc: SecureDocument;
	let newContent: Uint8Array;
	let newAllowedClients: Uint8Array[];

	beforeEach(async () => {
		ownerKeys = generateKeyPair();
		clientKeys1 = generateKeyPair();
		clientKeys2 = generateKeyPair();
		const content = new Uint8Array([1, 2, 3]);
		const allowedClients = [clientKeys1.publicKey];
		doc = await SecureDocument.create(ownerKeys.privateKey, content, allowedClients);
		newContent = new Uint8Array([4, 5, 6]);
		newAllowedClients = [clientKeys1.publicKey, clientKeys2.publicKey];
	});

	it('should create a new secure document correctly', () => {
		const documentHeader = doc.getDocumentHeader();
		const expectedAddress = uuidv5(
			documentHeader.owner,
			documentHeader.id,
			new Uint8Array(16),
		);

		expect(doc.getDocumentAddress()).toEqual(expectedAddress);
		expect(doc.getDocumentData()).toEqual(new Uint8Array([1, 2, 3]));
		expect(doc.hasAllowedUser(clientKeys1.publicKey)).toBe(true);
		expect(doc.getDocumentHeaderVersion()).toBe(1);
	});

	it('should update the document content correctly', async () => {
		await doc.updateDocument(newContent, ownerKeys.privateKey);
		expect(doc.getDocumentData()).toEqual(newContent);
	});

	it('should not allow to update the document content by an unauthorized user', async () => {
		await expect(doc.updateDocument(newContent, clientKeys2.privateKey)).rejects.toThrow(UnauthorizedAccessError);
	});

	it('should not allow to update the allowed users list by an unauthorized user', async () => {
		await expect(doc.updateAllowedUsers(newAllowedClients, clientKeys1.privateKey)).rejects.toThrow(UnauthorizedAccessError);
		expect(doc.hasAllowedUser(clientKeys2.publicKey)).toBe(false);
		expect(doc.getDocumentHeaderVersion()).toBe(1);
	});

	it('should correctly verify document address', () => {
		expect(doc.verifyDocumentAddress(doc.getDocumentAddress())).toBe(true);
		expect(doc.verifyDocumentAddress(new Uint8Array([1, 2, 3]))).toBe(false);
	});

	it('should correctly import document', () => {
		const exportedDoc = doc.exportDocument();
		const importedDoc = SecureDocument.importDocument(exportedDoc);
		expect(importedDoc.getDocumentData()).toEqual(doc.getDocumentData());
	});

	it('should throw DocumentValidationError when importing a corrupted document', () => {
		const exportedDoc = doc.exportDocument();
		exportedDoc[0]++; // Corrupt the document
		expect(() => SecureDocument.importDocument(exportedDoc)).toThrow(DocumentValidationError);
	});

	it('should correctly update allowed users', async () => {
		await doc.updateAllowedUsers(newAllowedClients, ownerKeys.privateKey);
		expect(doc.hasAllowedUser(clientKeys2.publicKey)).toBe(true);
		expect(doc.getDocumentHeaderVersion()).toBe(2);
	});

	it('should not allow to update the document content after removing the user from allowed users list', async () => {
		await doc.updateAllowedUsers([clientKeys2.publicKey], ownerKeys.privateKey); // ClientKeys1 is now unauthorized
		await expect(doc.updateDocument(newContent, clientKeys1.privateKey)).rejects.toThrow(UnauthorizedAccessError);
	});

	it('should correctly check if a user is not an allowed user', () => {
		expect(doc.hasAllowedUser(clientKeys2.publicKey)).toBe(false);
	});

	it('should correctly remove a user from the allowed users list using updateAllowedUsers', async () => {
		await doc.updateAllowedUsers(newAllowedClients, ownerKeys.privateKey);
		expect(doc.hasAllowedUser(clientKeys2.publicKey)).toBe(true);
		expect(doc.getDocumentHeaderVersion()).toBe(2);

		const updatedAllowedClients = newAllowedClients.filter(
			user => !uint8ArrayEquals(user, clientKeys2.publicKey),
		);

		await doc.updateAllowedUsers(updatedAllowedClients, ownerKeys.privateKey);
		expect(doc.hasAllowedUser(clientKeys2.publicKey)).toBe(false);
		expect(doc.getDocumentHeaderVersion()).toBe(3);
	});

	it('should correctly get document header', () => {
		const header = doc.getDocumentHeader();
		expect(header.owner).toEqual(ownerKeys.publicKey);
		expect(header.owner).not.toBe(ownerKeys.publicKey); // Should be a copy
		expect(header.allowedClients).toEqual([clientKeys1.publicKey]);
		expect(header.allowedClients[0]).not.toBe(clientKeys1.publicKey); // Should be a copy
		expect(header.version).toBe(1);
	});
});

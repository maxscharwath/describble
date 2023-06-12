import {describe, expect} from 'vitest';
import {generateKeys} from './utils';
import {createDocumentHeader, verifyDocumentOwnership, verifyHeaderSignature} from './Document';

describe('Document', () => {
	it('should be able to create a document', async () => {
		const keys = generateKeys();
		const header = await createDocumentHeader(keys);
		expect(await verifyDocumentOwnership(header), 'verifyDocumentOwnership').toBe(true);
		expect(await verifyHeaderSignature(header), 'verifyHeaderSignature').toBe(true);
	});
});

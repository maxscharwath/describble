import {v4 as uuidV4, v5 as uuidV5, parse as uuidParse} from 'uuid';
import {
	createSignature,
	fromBase58,
	toBase58,
	verifySignature,
} from './utils';

type PubKey = string;

/**
 * DocumentHeader is the header of a document.
 *
 * The access list is a map of public keys with the secret key encrypted with the public key.
 * The document secret DS, is a symmetric key used to encrypt the document in untrusted storage.
 * All users need to have access to the document secret DS.
 * DocumentId is a unique identifier for the document.
 * DocumentAddress is the address of document based on the documentId and the owner public key.
 * 	So we can find the document in untrusted storage and verify the ownership.
 */
export type DocumentHeader = {
	uuid: string;
	addressSignature: string;
	address: string;
	owner: PubKey;
	access: PubKey[];
	signature: string;
};

export async function createDocumentHeader(keys: {publicKey: Uint8Array; privateKey: Uint8Array}) {
	const uuid = uuidV4();
	const address = uuidV5(keys.publicKey, uuid);
	const addressSignature = toBase58(await createSignature(uuidParse(address), keys.privateKey));
	const ownerPublicKey = keys.publicKey;
	const header: Omit<DocumentHeader, 'signature'> = {
		uuid,
		address,
		addressSignature,
		owner: toBase58(ownerPublicKey),
		access: [toBase58(ownerPublicKey)],
	};
	return {
		...header,
		signature: toBase58(await createSignature(new TextEncoder().encode(JSON.stringify(header)), keys.privateKey)),
	};
}

export async function verifyDocumentOwnership(header: DocumentHeader) {
	const ownerPublicKey = fromBase58(header.owner);
	const addressSignature = verifySignature(uuidParse(header.address), fromBase58(header.addressSignature), ownerPublicKey);
	const address = uuidV5(ownerPublicKey, header.uuid);
	return addressSignature && address === header.address;
}

export async function verifyHeaderSignature({signature, ...header}: DocumentHeader) {
	const ownerPublicKey = fromBase58(header.owner);
	return verifySignature(new TextEncoder().encode(JSON.stringify(header)), fromBase58(signature), ownerPublicKey);
}

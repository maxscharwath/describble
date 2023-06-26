import {SignalingServer} from './server/SignalingServer';
import {WebSocketNetwork, WebSocketNetworkAdapter} from './network/websocket';
import {generateKeyPair} from './crypto';
import {DocumentSharingClient} from './client/DocumentSharingClient';
import {encode} from 'cbor-x';
import {base58} from 'base-x';

(async () => {
	const server = new SignalingServer({
		network: new WebSocketNetwork({
			host: 'localhost',
			port: 8080,
		}),
	});

	await server.listen();
	console.log('Signaling server listening on port 8080');

	const clientAlice = new DocumentSharingClient({
		...generateKeyPair(),
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
	});

	const clientBob = new DocumentSharingClient({
		...generateKeyPair(),
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
	});

	const clientCharlie = new DocumentSharingClient({
		...generateKeyPair(),
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
	});

	const document = await clientAlice.createDocument('Hello World!');
	await document.updateAllowedUsers([clientBob.publicKey], clientAlice.privateKey);
	clientCharlie.addDocument(document);

	await Promise.all([
		clientAlice.connect(),
		clientBob.connect(),
		clientCharlie.connect(),
	]);
	console.log('All clients connected');

	clientAlice.on('share-document', async ({document, to}) => {
		console.log(`Alice(${base58.encode(clientAlice.publicKey)}) shared a document with ${base58.encode(to.publicKey)}`, base58.encode(document.getDocumentAddress()));
	});

	clientCharlie.on('share-document', async ({document, to}) => {
		console.log(`Charlie(${base58.encode(clientCharlie.publicKey)}) shared a document with ${base58.encode(to.publicKey)}`, base58.encode(document.getDocumentAddress()));
	});

	clientBob.on('document', async document => {
		console.log(`Bob(${base58.encode(clientBob.publicKey)}) received a document`, base58.encode(document.getDocumentAddress()));
	});

	clientAlice.on('peer-connected', async ({peer, client}) => {
		console.log(`Alice is connected to ${base58.encode(client.publicKey)}`, peer.address());
	});

	clientBob.on('peer-connected', async ({peer, client}) => {
		console.log(`Bob is connected to ${base58.encode(client.publicKey)}`, peer.address());
	});

	clientCharlie.on('peer-connected', async ({peer, client}) => {
		console.log(`Charlie is connected to ${base58.encode(client.publicKey)}`, peer.address());
	});

	await clientBob.requestDocument(document.getDocumentAddress()).then(() => console.log('Bob broadcasted a document request'));
})();

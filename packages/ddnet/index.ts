import 'fake-indexeddb/auto';
import {
	SignalingServer,
	WebSocketNetwork,
	WebSocketNetworkAdapter,
	DocumentSharingClient,
	generateKeyPair,
	mnemonicToSeedSync,
} from './src';
import {base58} from 'base-x';
import {NodeFileStorageProvider} from './src/storage/NodeFileStorageProvider';
import {IDBStorageProvider} from './src/storage/IDBStorageProvider';

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
		...generateKeyPair(
			mnemonicToSeedSync('arrow armor boat cart circle tenant couple beef luggage ginger color effort'),
		),
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
		storageProvider: new NodeFileStorageProvider('.ddnet'),
	});

	const clientBob = new DocumentSharingClient({
		...generateKeyPair(
			mnemonicToSeedSync('accident observe boss minute mixture goddess trash craft candy smooth rubber coffee'),
		),
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
		storageProvider: new IDBStorageProvider(),
	});

	const clientCharlie = new DocumentSharingClient({
		...generateKeyPair(
			mnemonicToSeedSync('apology lazy vocal help film slice journey panic table either view hole'),
		),
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
		storageProvider: new NodeFileStorageProvider('.ddnet'),
	});

	const documentList = await clientAlice.listDocumentIds();
	let document = documentList.length > 0 ? await clientAlice.findDocument<{title: string}>(documentList[0]) : null;
	if (!document) {
		console.log('Creating new document');
		document = clientAlice.createDocument<{title: string}>([clientBob.publicKey, clientCharlie.publicKey]);
	}

	await Promise.all([
		clientAlice.connect(),
		clientBob.connect(),
		clientCharlie.connect(),
	]);
	console.log('All clients connected');

	clientAlice.on('share-document', async ({document, to}) => {
		console.log(`Alice(${base58.encode(clientAlice.publicKey)}) shared a document with ${base58.encode(to.publicKey)}`, document.id);
	});

	clientCharlie.on('share-document', async ({document, to}) => {
		console.log(`Charlie(${base58.encode(clientCharlie.publicKey)}) shared a document with ${base58.encode(to.publicKey)}`, document.id);
	});

	await clientAlice.requestDocument(document.id).then(document => {
		console.log('Alice received document', document.id);
	});

	await clientBob.requestDocument(document.id).then(document => {
		console.log('Bob received document', document.id);
	});

	await clientCharlie.requestDocument(document.id).then(document => {
		console.log('Charlie received document', document.id);
	});

	setInterval(() => {
		document?.change(doc => {
			doc.title = `It's ${new Date().toLocaleTimeString()}`;
		});
	}, 1000);
})();

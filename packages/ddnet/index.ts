import {
	SignalingServer,
	WebSocketNetwork,
	WebSocketNetworkAdapter,
	DocumentSharingClient,
	generateKeyPair,
	mnemonicToSeedSync,
} from './src';
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

	const mnemonic = 'arrow armor boat cart circle tenant couple beef luggage ginger color effort';
	console.log('Mnemonic:', mnemonic);
	const seed = mnemonicToSeedSync(mnemonic);

	const clientAlice = new DocumentSharingClient({
		...generateKeyPair(seed),
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

	const document = await clientAlice.createDocument([clientBob.publicKey, clientCharlie.publicKey]);
	clientCharlie.addDocument(document);

	await Promise.all([
		clientAlice.connect(),
		clientBob.connect(),
		clientCharlie.connect(),
	]);
	console.log('All clients connected');

	clientAlice.on('share-document', async ({document, to}) => {
		console.log(`Alice(${base58.encode(clientAlice.publicKey)}) shared a document with ${base58.encode(to.publicKey)}`, base58.encode(document.header.address));
	});

	clientCharlie.on('share-document', async ({document, to}) => {
		console.log(`Charlie(${base58.encode(clientCharlie.publicKey)}) shared a document with ${base58.encode(to.publicKey)}`, base58.encode(document.header.address));
	});

	clientBob.on('document', async document => {
		console.log(`Bob(${base58.encode(clientBob.publicKey)}) received a document`, base58.encode(document.header.address));
	});

	await clientBob.requestDocument(document.header.address).then(() => console.log('Bob broadcasted a document request'));
})();

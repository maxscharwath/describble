# Decentralized Document Network (DDNet)

[![npm (scoped)](https://img.shields.io/npm/v/@describble/ddnet)](https://www.npmjs.com/package/@describble/ddnet)
![npm (scoped)](https://img.shields.io/npm/l/@describble/ddnet)

Decentralized Document Network (DDNet) is a cutting-edge, decentralized network designed for secure storage and access of documents. It aims to address the inherent challenges of centralized document storage systems, namely access control and single points of failure, by providing a robust, decentralized alternative powered by cryptographic techniques.

## Features
- **Decentralized**: DDNet is a decentralized network that enables users to store and access documents in a secure, distributed manner.
- **Secure**: DDNet uses cryptographic techniques to ensure that documents are stored and accessed securely.
- **Private**: DDNet uses a decentralized architecture that ensures data ownership, privacy, and the freedom to collaborate seamlessly.
- **Local-first**: DDNet is a local-first network that enables users to store and access documents locally.
- **CRDT-based**: DDNet uses Conflict-free Replicated Data Types (CRDTs) to ensure that documents are replicated across the network in a consistent manner.

## Getting Started

### Installation
```bash
# Using npm
$ npm install @describble/ddnet

# Using pnpm
$ pnpm install @describble/ddnet

# Using yarn
$ yarn add @describble/ddnet
```

## Usage
We have divided the usage examples into smaller chunks, each demonstrating a specific aspect of DDNet.

### KeyManager
The `KeyManager` class handles the generation and storage of cryptographic keys for users. You pass the store-name to it as a string. This is the name of the IndexedDB store where keys are saved.
```ts
import { KeyManager } from '@describble/ddnet';

const keyManager = new KeyManager('store-name');
```

### SessionManager
`SessionManager` is responsible for managing user's sessions. 
It takes an instance of `KeyManager` as a parameter to manage cryptographic keys. You can also optionally pass an instance of `ServiceWorkerCache` to cache sessions in the browser.

```ts
import { SessionManager, KeyManager, ServiceWorkerCache } from '@describble/ddnet';

const sessionManager = new SessionManager(
  new KeyManager('store-name'),
  new ServiceWorkerCache(myServiceWorkerInstance) // optional session caching
);
```

### NetworkAdapter
DDnet requires a `NetworkAdapter` to communicate with the signaling server. 
You can use the `WebSocketNetworkAdapter` class for this. 
Pass the URL of the signaling server to it.
    
```ts
import { WebSocketNetworkAdapter } from '@describble/ddnet';

const networkAdapter = new WebSocketNetworkAdapter('wss://ddnet-server.com');
```

### StorageProvider
You need a `StorageProvider` instance for storing documents in the browser. 
`IDBStorageProvider` is an implementation using IndexedDB.

```ts
import { IDBStorageProvider } from '@describble/ddnet';

const storageProvider = new IDBStorageProvider();
```

### DocumentSharingClient
`DocumentSharingClient` is the main class that you use to create and manage documents. 
It requires instances of `SessionManager`, `NetworkAdapter`, and `StorageProvider`.

```ts
import { DocumentSharingClient } from '@describble/ddnet';

const docClient = new DocumentSharingClient({
  sessionManager,
  network: networkAdapter,
  storageProvider: storageProvider,
});
```

### Document Access Control

Once you have an instance of `DocumentSharingClient`, you can start creating, fetching, and updating documents.

#### Creating a Document
You can create a new document using the `createDocument` method.
It will return a `Document` instance that you can use to perform operations on the document.
```ts
const doc = docClient.createDocument();
```

#### Finding a document by its ID
This fetches a document from the browser's local storage or in memory cache.
```ts
const doc = await docClient.findDocument('document-id');
```

#### Requesting access to a document by its ID
This fetches a document from the network and caches it in the browser's local storage.
If the document is already cached, it will be returned from the cache, but the network will be queried for any updates.
```ts
const doc = await docClient.requestDocument('document-id');
```

#### List all documents
This returns a list of all document IDs that are stored in the browser's local storage.
```ts
const docs = await docClient.listDocumentIds();
```

#### Remove a document
This removes a document from the browser's local storage.
```ts
const docs = await docClient.removeDocument('document-id');
```

### Document Operations
Now that you have a `Document` instance, you can perform operations on it.

#### Updating document content
We are using [Automerge](https://automerge.org/) internally to manage document content.
You can use the `change` method to update the document content.
```ts
doc.change((data) => {
  data.text = 'Hello World!';
});
```

#### Getting document content
You can get the document data using the `data` property.
```ts
const data = doc.data;
```

#### Updating document header
Each document has a header that contains metadata about the document.

For example, to edit who can access the document, you can do the following:
All keys can be `base58` encoded or `Uint8Array` instances.

Header is immutable, so you need to create a new header and update the document with it.
```ts
// Private key of the owner of the document
const privateKey = "G8gw9d54D3NDt4SogSBxzyBzfkyTL9Dge1EeMQgmZSAk"
const allowedClients = [
  '24YDGmC5swrdiph4pfBweYW8P8L1A4kv5K6o9BR3jHafi',
  'qBWVsxpXJHfNShbiKtgWkD6M2KNp35JaPS4Efck39t43'
];

const header = document.header.withAllowedClients(allowedClients, privateKey);
document.updateHeader(header);
```

### Events
You can listen to events on the document using the `on` method.
#### Document change event
This event is fired when the document content changes.
```ts
doc.on('change', ({document, data}) => {
  console.log(`Document ${document.id} changed`, data);
});
```
#### Document patch event
This event is useful to know what changes were made to the document.
```ts
doc.on('patch', ({document, patches, before, after}) => {
  console.log(`Document ${document.id} patched`, patches, before, after);
});
```

#### Document header change event
This event is fired when the document header changes.
```ts
doc.on('header-updated', ({document, header}) => {
  console.log(`Document ${document.id} header changed`, header);
});
```

### Server
DDNet requires a signaling server to establish connections between clients.
The server handles the signaling process and forwards messages between clients to establish a WebRTC connection for document exchange.

```ts
import {SignalingServer, WebSocketNetwork} from '@describble/ddnet/node';

const server = new SignalingServer({
	network: new WebSocketNetwork({
		host: '0.0.0.0',
		port: 8080,
	}),
});

server.listen();
```

### Presence
DDnet have a system called `Presence`
that allows you to send arbitrary data to other connected clients for a specific document scope.
This is useful for implementing features like cursors, chat, and other collaborative features.
The data is sent to all connected clients for a specific document, and the data is not persisted.

#### Get presence instance
You can get an instance of `Presence` using the `getPresence` method on the `DocumentSharingClient` instance.
```ts
const presence = docClient.getPresence('document-id');
```

### Send presence data
You can send presence data using the `sendPresenceMessage` method.
```ts
presence.sendPresenceMessage({
  type: 'cursor',
  position: {
    x: 10,
    y: 20,
  },
});
```

#### Listen to presence data
You can listen to presence data using the `on` method.
```ts
presence.on('update', (presenceMap) => {
    presenceMap.forEach(({
      peerId, // ID of the WebRTC connection
      client, // Client data
      presence, // Presence data
    }) => {
        console.log(`Received presence data from ${peerId}`, presence);
    });
});
```

We can get the current presence map using the `getPresence` method.
```ts
const presenceMap = presence.getPresence();
```

#### Stop listening to presence data
You can stop listening to presence data using the `stop` method.
```ts
presence.stop();
```

## Usage with Vite

Vite is a modern front-end build tool that significantly improves the front-end development experience. It provides features like hot module replacement and efficient lazy loading out of the box.

If you're using DDNet with Vite, you'll need to use a specific configuration since this package uses WebAssembly (wasm).

### Install Required Plugins
First, you need to install the required Vite plugins. These plugins enable support for WebAssembly and top-level await, respectively. You can install them using npm, yarn, or pnpm. Here's an example using npm:
```bash
# Using npm
$ npm install vite-plugin-wasm vite-plugin-top-level-await

# Using pnpm
$ pnpm install vite-plugin-wasm vite-plugin-top-level-await

# Using yarn
$ yarn add vite-plugin-wasm vite-plugin-top-level-await
```

### Configuration
Create or modify your `vite.config.js` file and include the `vite-plugin-wasm` and `vite-plugin-top-level-await` as plugins in your configuration:
```js
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
});
```

This configuration ensures that Vite properly handles the WebAssembly files included in the DDNet package and supports top-level await syntax, which is commonly used with async WebAssembly functions.

With this setup, you should be able to integrate DDNet into your Vite project successfully. If you still encounter issues, please consult the respective plugin documentation or reach out for support.


## Technical Overview
To understand how DDNet works, please read the [technical overview](./docs/technical-overview.md).

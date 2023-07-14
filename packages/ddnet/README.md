# Decentralized Document Network (DDNet)

[![npm (scoped)](https://img.shields.io/npm/v/describble/ddnet)](https://www.npmjs.com/package/@describble/ddnet)
![npm (scoped)](https://img.shields.io/npm/l/@describble/ddnet)

Decentralized Document Network (DDNet) is a cutting-edge, decentralized network designed for secure storage and access of documents. It aims to address the inherent challenges of centralized document storage systems, namely access control and single points of failure, by providing a robust, decentralized alternative powered by cryptographic techniques.

## Key Components and Client
In the DDNet network, each user has a unique pair of public and private keys generated using the secp256k1 elliptic curve algorithm.

The public key is a 33-byte compressed key, which is encoded using base58 encoding to make it shorter and more human-readable than Base64 encoding. This public key is used to identify users in the network.

Additionally, each user is assigned a unique clientId. This clientId is a 16-byte identifier, which is randomly generated using UUIDv4 to ensure the uniqueness and randomness. This clientId is used to identify different sessions or instances of the same user in the network.

## Message

Each message transmitted in the network follows a defined structure:

```ts
export type Message<TData> = {
  from: {
    publicKey: Uint8Array;  // sender's public key
    clientId: Uint8Array;   // sender's clientId
  };
  to?: {
    publicKey: Uint8Array;  // recipient's public key
    clientId?: Uint8Array;  // recipient's clientId (optional)
  };
  data: TData;              // payload data of the message
};
```
This message structure is designed with flexibility and security in mind:

- `from` field identifies the sender of the message.
- `to` field is optional and identifies the recipient of the message. This is necessary when the message is private and intended for a specific user. If the to field is omitted, the message is considered public and can be read by any user in the network
- `data` field contains the actual payload data of the message.

### Message transmission and encryption
Messages can be transmitted in three different ways:

- **Broadcast**: A message is broadcasted to all users in the network. This is the default transmission method when the `to` field is omitted.
- **Multicast**: A message is sent to a specific user in the network. This is the default transmission method when the `to` field is specified, but the `clientId` field is omitted.
- **Unicast**: A message is sent to a specific session of a user in the network. This is the default transmission method when the `to` field is specified and the `clientId` field is specified.

In **Multicast** and **Unicast** transmission methods, the message is encrypted.

When a sender wants to send a message to a recipient, they utilize an encryption system to ensure that the message can only be read by the intended recipient.

This process involves generating a shared secret between the sender and recipient using Elliptic-curve Diffie–Hellman (ECDH), a key agreement protocol that allows two parties, each having the other's public key, to establish a shared secret over an insecure channel.

The shared secret, however, is not directly used for encryption. To create an encryption key, we use the HKDF (HMAC-based Extract-and-Expand Key Derivation Function) to derive a symmetric AES key from the shared secret. This key is then used to encrypt the message.

Using this mechanism, even if someone intercepts the communication, they won't be able to decrypt the message because they don't possess the shared secret or the derived AES key.

## SecureDocument

SecureDocument is the core data structure of the DDNet network. 
It is an object that contains the following fields:

```ts
type SecureDocumentHeader = {
  id: Uint8Array;
  owner: Uint8Array;
  allowedClients: Uint8Array[]; 
  version: number;
};

type SecureDocument = {
  header: Uint8Array;
  headerSignature: Uint8Array;
  content: Uint8Array; 
  contentSignature: Uint8Array; 
};
```

The `SecureDocumentHeader` contains the following fields:
- `id` is a 16-byte identifier, which is randomly generated using UUIDv4 to ensure the uniqueness and randomness. This id is used to identify different versions of the same document.
- `owner` is the 33-byte compressed public key of the document owner.
- `allowedClients` is an array of 33-byte compressed public keys of the users who are allowed to read and update the document.
- `version` is the version of the document header. It is incremented on each update of the document.

The `SecureDocument` contains the following fields:
- `header` is the document header in CBOR format.
- `headerSignature` is the signature of the document header signed by the document owner.
- `content` is the document content.
- `contentSignature` is the signature of the document content signed by one of the allowed users' private keys.

### Document Access Control

The access control of the document is enforced by the following rules:

- Only the document owner can update the document header.
- Only the document owner and the allowed users can update the document content.

The SecureDocument class is responsible for enforcing these rules and ensuring the integrity of the document.

### Document Address

Each document has a unique address in the network. This address is a 16-byte identifier, which is generated using UUIDv5 from the document id and the document owner's public key. This address is used to identify the document in the network.

## CBOR Encoding

CBOR (Concise Binary Object Representation) is a binary data serialization format designed for small code size and small message size. It is a superset of JSON and supports all JSON data types. CBOR is used to encode data in the DDNet network because of the transmission is not necessarily human-readable and JSON is not the most efficient way to encode binary data.

## Signaling Server

The signaling server is a WebSocket server that is used to establish a peer-to-peer connection between two users. It is used to exchange the public keys of the users and establish a WebRTC connection between them.

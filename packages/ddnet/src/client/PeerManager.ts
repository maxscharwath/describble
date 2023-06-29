import SimplePeer from 'simple-peer';
import {type MessageExchanger} from '../exchanger/MessageExchanger';
import {sha256Some} from '../crypto';
import wrtc from '../wrtc';
import {z} from 'zod';
import Emittery from 'emittery';
import {base58} from 'base-x';

type DocumentId = string;
export type PeerId = string;

export type ClientIdentity = {
	publicKey: Uint8Array;
	clientId: Uint8Array;
};

export type Peer = {
	peerId: PeerId;
	connection: SimplePeer.Instance;
	client: ClientIdentity;
};

export const SignalMessageSchema = z.object({
	type: z.literal('signal'),
	documentId: z.string(),
	signal: z.any().refine((value): value is SimplePeer.SignalData => true),
});

type PeerManagerConfig = {
	exchanger: MessageExchanger<typeof SignalMessageSchema>;
	timeout?: number;
};

type PeerManagerEvent = {
	'peer-created': {
		documentId: DocumentId;
		peer: Peer;
	};
	'peer-destroyed': {
		documentId: DocumentId;
		peer: Peer;
	};
};

export class PeerManager extends Emittery<PeerManagerEvent> {
	private readonly pendingPeer = new Map<PeerId, Peer>();
	private readonly documentPeers = new Map<DocumentId, Set<Peer>>();
	private readonly connectionTimeout: number;
	private readonly exchanger: MessageExchanger<typeof SignalMessageSchema>;

	constructor(config: PeerManagerConfig) {
		super();
		this.connectionTimeout = config.timeout ?? 10000;
		this.exchanger = config.exchanger;
		this.exchanger.on('signal', message => {
			const {connection} = this.createPeer(false, message.data.documentId, message.from);
			connection.signal(message.data.signal);
		});
	}

	/**
	 * Creates a new peer and adds it to the peers map.
	 * If the peer already exists, it is returned.
	 * @param initiator - Whether the peer should be the initiator.
	 * @param documentId - The document ID for which the peer should be created.
	 * @param client - The message from which the peer was created.
	 * @returns The created peer.
	 */
	public createPeer(initiator: boolean, documentId: DocumentId, client: ClientIdentity) {
		const peerId = this.computePeerId(documentId, client);
		if (this.pendingPeer.has(peerId)) {
			return this.pendingPeer.get(peerId)!;
		}

		const peer: Peer = {
			peerId,
			connection: new SimplePeer({initiator, wrtc}),
			client,
		};

		const timeout = setTimeout(() => {
			this.removePeer(documentId, peer);
		}, this.connectionTimeout);

		peer.connection
			.on('connect', () => {
				clearTimeout(timeout);
				this.pendingPeer.delete(peerId);
				this.addPeer(documentId, peer);
				void this.emit('peer-created', {
					documentId,
					peer,
				});
			})
			.on('close', () => {
				this.removePeer(documentId, peer);
				void this.emit('peer-destroyed', {
					documentId,
					peer,
				});
			})
			.on('signal', signal => {
				void this.exchanger.sendMessage({
					type: 'signal',
					documentId,
					signal,
				}, client);
			});

		this.pendingPeer.set(peerId, peer);

		return peer;
	}

	/**
	 * Adds a peer to the document peers set.
	 * @param documentId - The ID of the document.
	 * @param peer - The peer to be added.
	 */
	private addPeer(documentId: DocumentId, peer: Peer) {
		let peers = this.documentPeers.get(documentId);
		if (!peers) {
			peers = new Set();
			this.documentPeers.set(documentId, peers);
		}

		peers.add(peer);
	}

	/**
	 * Removes a peer from the pending peers map and the document peers set.
	 * @param documentId - The ID of the document.
	 * @param peer - The peer to be removed.
	 */
	private removePeer(documentId: DocumentId, peer: Peer) {
		this.pendingPeer.delete(peer.peerId);
		this.documentPeers.get(documentId)?.delete(peer);
		peer.connection.destroy();
	}

	/**
	 * Computes a unique ID for the peer.
	 * @param documentId - The ID of the document.
	 * @param client - The client identity.
	 * @returns The computed peer ID.
	 */
	private computePeerId(documentId: DocumentId, client: ClientIdentity): PeerId {
		return base58.encode(sha256Some(new TextEncoder().encode(documentId), client.publicKey, client.clientId));
	}
}

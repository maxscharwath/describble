import {type MessageExchanger} from '../exchanger/MessageExchanger';
import {sha256Some} from '../crypto';
import {type Wrtc} from '../wrtc';
import {z} from 'zod';
import Emittery, {type UnsubscribeFunction} from 'emittery';
import {base58} from 'base-x';
import {type ChannelId, PeerConnection, type SignalData} from '../network/PeerConnection';
import {type Message} from '../Message';

type DocumentId = string;
export type PeerId = string;

export type ClientIdentity = {
	publicKey: Uint8Array;
	clientId: Uint8Array;
};

export type Peer = {
	peerId: PeerId;
	connection: PeerConnection;
	client: ClientIdentity;
};

export const SignalMessageSchema = z.object({
	type: z.literal('signal'),
	documentId: z.string(),
	signal: z.any().refine((value): value is SignalData => true),
});

type PeerManagerConfig = {
	exchanger: MessageExchanger<typeof SignalMessageSchema>;
	verifyIncomingSignal?: (message: Message<z.infer<typeof SignalMessageSchema>>) => Promise<boolean> | boolean;
	wrtc?: Wrtc;
	timeout?: number;
};

type PeerManagerEvent = {
	data: {
		peer: Peer;
		documentId: DocumentId;
		channelId: ChannelId;
		data: Uint8Array;
	};
	'peer-created': {
		documentId: DocumentId;
		peer: Peer;
	};
	'peer-destroyed': {
		documentId: DocumentId;
		peer: Peer;
	};
};

export type DocumentPeers = {
	onData: (callback: (peer: Peer, data: Uint8Array) => void) => UnsubscribeFunction;
	onJoin: (callback: (peer: Peer) => void) => UnsubscribeFunction;
	onLeave: (callback: (peer: Peer) => void) => UnsubscribeFunction;
	send: (peer: Peer, data: Uint8Array) => void;
	broadcast: (data: Uint8Array) => void;
};

export class PeerManager extends Emittery<PeerManagerEvent> {
	private readonly pendingPeer = new Map<PeerId, Peer>();
	private readonly documentPeers = new Map<DocumentId, Set<Peer>>();
	private readonly connectionTimeout: number;
	private readonly exchanger: MessageExchanger<typeof SignalMessageSchema>;
	private readonly wrtc?: Wrtc;

	constructor(config: PeerManagerConfig) {
		super();
		this.connectionTimeout = config.timeout ?? 10000;
		this.exchanger = config.exchanger;
		this.wrtc = config.wrtc;
		this.exchanger.on('signal', async message => {
			if (!config.verifyIncomingSignal || await config.verifyIncomingSignal(message)) {
				const {connection} = this.createPeer(false, message.data.documentId, message.from);
				void connection.signal(message.data.signal);
			}
		});
	}

	public getDocumentPeers(documentId: DocumentId, channelId: ChannelId): DocumentPeers {
		return {
			onData: (callback: (peer: Peer, data: Uint8Array) => void) => this.on('data', event => {
				if (event.documentId === documentId && event.channelId === channelId) {
					callback(event.peer, event.data);
				}
			}),
			onJoin: (callback: (peer: Peer) => void) => this.on('peer-created', event => {
				if (event.documentId === documentId) {
					callback(event.peer);
				}
			}),
			onLeave: (callback: (peer: Peer) => void) => this.on('peer-destroyed', event => {
				if (event.documentId === documentId) {
					callback(event.peer);
				}
			}),
			send(peer: Peer, data: Uint8Array) {
				peer.connection.send(channelId, data);
			},
			broadcast: (data: Uint8Array) => {
				this.documentPeers.get(documentId)?.forEach(peer => {
					peer.connection.send(channelId, data);
				});
			},
		};
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
			connection: new PeerConnection({initiator, wrtc: this.wrtc}),
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
			});

		peer.connection.on('close', () => {
			this.removePeer(documentId, peer);
			void this.emit('peer-destroyed', {
				documentId,
				peer,
			});
		});

		peer.connection.on('signal', signal => {
			void this.exchanger.sendMessage({
				type: 'signal',
				documentId,
				signal: JSON.parse(JSON.stringify(signal)) as SignalData,
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

		peer.connection.on('data', ({channelId, data}) => {
			void this.emit('data', {
				peer,
				documentId,
				channelId,
				data,
			});
		});

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

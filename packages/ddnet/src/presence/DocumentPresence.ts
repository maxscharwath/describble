import Emittery from 'emittery';
import {throttle} from '../utils';
import {type ClientIdentity, type DocumentPeers, type Peer, type PeerId, type PeerManager} from '../client/PeerManager';
import {decode, encode} from 'cbor-x';

type PresenceMessage<T> = {
	peerId: string;
	client: ClientIdentity;
	presence: T;
};

type DocumentPresenceEvent<T> = {
	change: PresenceMessage<T>;
	update: ReadonlyMap<PeerId, PresenceMessage<T>>;
};

/**
 * DocumentPresence class extends an Emittery that emits events with a structure described by DocumentPresenceEvent.
 * This class is used to manage presence information for a document.
 */
export class DocumentPresence<T=unknown> extends Emittery<DocumentPresenceEvent<T>> {
	public readonly sendPresenceMessage = throttle(<T>(message: T) => {
		this.documentPeers.broadcast(encode(message));
	}, 33); // Throttle the sendPresenceMessage function to only run every 33ms (30fps).

	public readonly stop: () => void;

	private readonly documentPeers: DocumentPeers;

	private readonly presence = new Map<PeerId, PresenceMessage<T>>();

	/**
	 * Constructs a new DocumentPresence.
	 * @param documentId - The ID of the document.
	 * @param peerManager - The PeerManager to manage the peers.
	 */
	public constructor(documentId: string, peerManager: PeerManager) {
		super();
		this.documentPeers = peerManager.getDocumentPeers(documentId, 0x02);

		// Listen to peer leave and data events for the document.
		const unsubOnData = this.documentPeers.onData((peer, message) => {
			this.processPresenceMessage(peer, message);
		});
		const unsubOnLeave = this.documentPeers.onLeave(peer => {
			this.presence.delete(peer.peerId);
			void this.emit('update', this.getPresence());
		});

		this.stop = () => {
			// Unsubscribe from peer events and clear presence and listeners when stopping.
			unsubOnData();
			unsubOnLeave();
			this.presence.clear();
			this.clearListeners();
		};
	}

	/**
	 * Gets the current presence for the document.
	 * @returns The presence.
	 */
	public getPresence(): ReadonlyMap<PeerId, PresenceMessage<T>> {
		return this.presence as ReadonlyMap<PeerId, PresenceMessage<T>>;
	}

	/**
	 * Processes a presence message from a peer.
	 * @param peer - The peer sending the message.
	 * @param message - The presence message.
	 */
	private processPresenceMessage(peer: Peer, message: Uint8Array) {
		try {
			const presence: PresenceMessage<T> = {
				peerId: peer.peerId,
				client: peer.client,
				presence: decode(message) as T,
			};
			this.presence.set(peer.peerId, presence);
			// Emit a change event for the presence of the specific peer and an update event for the overall presence.
			void this.emit('change', presence);
			void this.emit('update', this.getPresence());
		} catch (e) {
			console.error(e);
		}
	}
}

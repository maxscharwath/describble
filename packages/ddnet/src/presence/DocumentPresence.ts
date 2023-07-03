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

export class DocumentPresence<T=unknown> extends Emittery<DocumentPresenceEvent<T>> {
	public readonly sendPresenceMessage = throttle(<T>(message: T) => {
		this.documentPeers.broadcast(encode(message));
	}, 33);

	public readonly stop: () => void;

	private readonly documentPeers: DocumentPeers;

	private readonly presence = new Map<PeerId, PresenceMessage<T>>();

	constructor(documentId: string, peerManager: PeerManager) {
		super();
		this.documentPeers = peerManager.getDocumentPeers(documentId, 0x02);
		const unsubOnData = this.documentPeers.onData((peer, message) => {
			this.processPresenceMessage(peer, message);
		});
		const unsubOnLeave = this.documentPeers.onLeave(peer => {
			this.presence.delete(peer.peerId);
			void this.emit('update', this.getPresence());
		});

		this.stop = () => {
			unsubOnData();
			unsubOnLeave();
			this.presence.clear();
			this.clearListeners();
		};
	}

	public getPresence(): ReadonlyMap<PeerId, PresenceMessage<T>> {
		return this.presence as ReadonlyMap<PeerId, PresenceMessage<T>>;
	}

	private processPresenceMessage(peer: Peer, message: Uint8Array) {
		try {
			const presence: PresenceMessage<T> = {
				peerId: peer.peerId,
				client: peer.client,
				presence: decode(message) as T,
			};
			this.presence.set(peer.peerId, presence);
			void this.emit('change', presence);
			void this.emit('update', this.getPresence());
		} catch (e) {
			console.error(e);
		}
	}
}

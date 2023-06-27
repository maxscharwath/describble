import {type SecureDocument} from '../document/SecureDocument';
import type SimplePeer from 'simple-peer';

type Peer = {
	peer: SimplePeer.Instance;
	client: {
		publicKey: Uint8Array;
		clientId: Uint8Array;
	};
};

export class SharedDocument {
	private readonly peers = new WeakSet<Peer>();
	constructor(protected document: SecureDocument) {
	}

	public addPeer(peer: Peer) {
		this.peers.add(peer);
	}
}

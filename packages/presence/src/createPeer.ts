import Peer, {type DataConnection} from 'peerjs';

export async function createPeer(roomId: string) {
	return new Promise<{peer: Peer; conn?: DataConnection}>((resolve, reject) => {
		const clientPeer = new Peer();
		clientPeer.once('open', () => {
			const conn = clientPeer.connect(roomId);
			conn.once('open', () => {
				resolve({peer: clientPeer, conn});
			});
			clientPeer.once('error', error => {
				clientPeer.destroy();
				const hostPeer = new Peer(roomId);
				hostPeer.once('open', () => {
					resolve({peer: hostPeer});
				});
				hostPeer.once('error', error => {
					reject(error);
				});
			});
		});
	});
}

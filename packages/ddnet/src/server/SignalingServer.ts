import {ServerAuthenticator} from '../authenticator/ServerAuthenticator';
import {MessageRouter} from './MessageRouter';
import {ConnectionRegistry} from './ConnectionRegistry';
import {type Network} from '../network/Network';

/**
 * Configuration object for the SignalingServer.
 */
type SignalingServerConfig = {
	network: Network; // The network to use for communication
};

/**
 * Class representing a signaling server.
 */
export class SignalingServer {
	private readonly registry = new ConnectionRegistry();
	private readonly network: Network;

	public constructor({network}: SignalingServerConfig) {
		this.network = network;
		const authenticator = new ServerAuthenticator(network);
		const messageRouter = new MessageRouter(this.registry, network);

		// Once a connection is authenticated, register it in the registry
		// and set up a listener for incoming data.
		authenticator.on('authenticated', ({publicKey, clientId, connection}) => {
			this.registry.registerConnection(publicKey, clientId, connection);
			connection.on('data', data => messageRouter.routeIncomingData(data, connection));
		});
	}

	/**
   * Begin listening for connections.
   */
	public async listen() {
		return this.network.listen();
	}

	/**
   * Close the server and all active connections.
   */
	public async close() {
		return this.network.close();
	}
}

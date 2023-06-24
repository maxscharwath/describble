import {Connection, Network, type NetworkAdapter} from '../src/network';

export class MockConnection extends Connection {
	public relatedConnection?: MockConnection;

	constructor(relatedConnection?: MockConnection) {
		super();
		this.relatedConnection = relatedConnection ?? new MockConnection(this);
	}

	close(cause: string): void {
		void this.emit('close', new Error(cause));
		const tmp = this.relatedConnection;
		this.relatedConnection = undefined;
		tmp?.close(cause);
	}

	isConnected(): boolean {
		return this.relatedConnection !== undefined;
	}

	send(data: Uint8Array): void {
		void this.relatedConnection?.emit('data', data);
	}
}

export class MockNetwork extends Network {
	async close(): Promise<void> {
		return Promise.resolve();
	}

	async listen(): Promise<void> {
		return Promise.resolve();
	}

	send(connection: Connection, data: Uint8Array): void {
		void (connection as MockConnection).relatedConnection?.emit('data', data);
	}
}

export class MockNetworkAdapter implements NetworkAdapter {
	constructor(private readonly server: MockNetwork) {
	}

	createConnection(publicKey: Uint8Array, clientId: Uint8Array): Connection {
		const connection = new MockConnection();
		if (connection.relatedConnection) {
			void this.server.emit('connection', {
				publicKey,
				clientId,
				connection: connection.relatedConnection,
			});
		}

		return connection;
	}
}

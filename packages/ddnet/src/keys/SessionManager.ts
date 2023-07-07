import {type KeyManager} from './KeyManager';
import {getPublicKey} from '../crypto';
import Emittery from 'emittery';
import {base58} from 'base-x';

export type KeyPair = {
	readonly privateKey: Uint8Array;
	readonly publicKey: Uint8Array;
};

export class KeySession implements KeyPair {
	readonly #privateKey: ArrayBuffer;
	readonly #publicKey: ArrayBuffer;
	readonly #base58PublicKey: string;

	constructor(privateKey: Uint8Array) {
		this.#privateKey = privateKey.buffer;
		this.#publicKey = getPublicKey(privateKey).buffer;
		this.#base58PublicKey = base58.encode(this.#publicKey);
	}

	get privateKey(): Uint8Array {
		return new Uint8Array(this.#privateKey);
	}

	get publicKey(): Uint8Array {
		return new Uint8Array(this.#publicKey);
	}

	get base58PublicKey(): string {
		return this.#base58PublicKey;
	}
}

type SessionManagerEvents = {
	login: KeySession;
	logout: undefined;
};

export class SessionManager extends Emittery<SessionManagerEvents> {
	private session: KeySession | null = null;

	constructor(private readonly keyManager: KeyManager) {
		super();
	}

	public async login(key: string, password: string): Promise<void> {
		const privateKey = await this.keyManager.getKey(key, password);
		if (!privateKey) {
			throw new Error('Login failed');
		}

		if (this.session) {
			this.logout();
		}

		this.session = new KeySession(privateKey);
		void this.emit('login', this.session);
	}

	public async register(privateKey: Uint8Array, password: string): Promise<KeySession> {
		await this.keyManager.saveKey(privateKey, password);
		return new KeySession(privateKey);
	}

	public async listKeys(): Promise<string[]> {
		return this.keyManager.listKeys();
	}

	public logout(): void {
		this.session = null;
		void this.emit('logout');
	}

	get currentSession(): KeySession {
		if (!this.session) {
			throw new Error('No session');
		}

		return this.session;
	}

	get isLoggedIn(): boolean {
		return Boolean(this.session);
	}

	public onLogin(callback: (session: KeySession) => void) {
		if (this.isLoggedIn) {
			callback(this.currentSession);
		}

		return this.on('login', callback);
	}
}

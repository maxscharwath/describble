import {type KeyManager} from './KeyManager';
import {getPublicKey} from '../crypto';
import Emittery from 'emittery';
import {base58} from '@describble/base-x';
import {type Cache} from './Cache';

export type KeyPair = {
	readonly privateKey: Uint8Array;
	readonly publicKey: Uint8Array;
};

export type KeySession = Readonly<{
	privateKey: Uint8Array;
	publicKey: Uint8Array;
	base58PublicKey: string;
}>;

type SessionManagerEvents = {
	login: KeySession;
	logout: undefined;
	change: KeySession | null;
};

/**
 * SessionManager class extends an Emittery that emits events related to session changes.
 * The purpose of this class is to manage user sessions in the application.
 */
export class SessionManager extends Emittery<SessionManagerEvents> {
	private session: KeySession | null = null;

	/**
	 * Constructs a new SessionManager.
	 * @param keyManager - The KeyManager to manage keys.
	 * @param cache - The optional Cache object to store session information.
	 */
	public constructor(private readonly keyManager: KeyManager, private readonly cache?: Cache) {
		super();
		// If a cache is provided, attempt to restore the session from the cache.
		void this.cache?.get<KeySession>('session').then(session => {
			if (session) {
				this.session = session;
				void this.emit('change', session);
				void this.emit('login', session);
			}
		})
			.catch(e => console.error('Failed to load cache', e));
	}

	/**
	 * Logs in the user with the given key and password.
	 * @param key - The user's key.
	 * @param password - The user's password.
	 */
	public async login(key: string, password: string): Promise<void> {
		const privateKey = await this.keyManager.getPrivateKey(key, password);
		if (!privateKey) {
			throw new Error('Login failed');
		}

		if (this.session) {
			this.logout();
		}

		this.session = this.createSession(privateKey);

		// Cache the session for future logins.
		await this.cache?.set('session', this.session)
			.catch(e => console.error('Failed to save cache', e));
		void this.emit('change', this.session);
		void this.emit('login', this.session);
	}

	/**
	 * Registers a new user with the given private key and password.
	 * @param privateKey - The user's private key.
	 * @param password - The user's password.
	 * @returns The newly created session.
	 */
	public async register(privateKey: Uint8Array, password: string): Promise<KeySession> {
		await this.keyManager.saveKey(privateKey, password);
		return this.createSession(privateKey);
	}

	/**
	 * Lists all the keys.
	 * @returns A list of keys.
	 */
	public async listKeys(): Promise<string[]> {
		return this.keyManager.listKeys();
	}

	/**
	 * Logs out the user.
	 */
	public logout(): void {
		this.session = null;
		// Delete the session from the cache.
		void this.cache?.delete('session')
			.catch(e => console.error('Failed to delete cache', e));
		void this.emit('change', null);
		void this.emit('logout');
	}

	/**
	 * Returns the current session.
	 * @returns The current session.
	 */
	public get currentSession(): KeySession {
		if (!this.session) {
			throw new Error('No session');
		}

		return this.session;
	}

	/**
	 * Checks if the user is logged in.
	 * @returns A boolean indicating whether the user is logged in.
	 */
	public get isLoggedIn(): boolean {
		return Boolean(this.session);
	}

	/**
	 * Registers a callback to be called when the user logs in.
	 * @param callback - The callback to be called.
	 */
	public onLogin(callback: (session: KeySession) => void) {
		if (this.isLoggedIn) {
			callback(this.currentSession);
		}

		return this.on('login', callback);
	}

	/**
	 * Registers a callback to be called when the session changes.
	 * @param callback - The callback to be called.
	 */
	public onChange(callback: (session: KeySession | null) => void) {
		callback(this.session);
		return this.on('change', callback);
	}

	/**
	 * Creates a new session from a private key.
	 * @param privateKey - The private key.
	 * @returns The newly created session.
	 */
	private createSession(privateKey: Uint8Array): KeySession {
		const publicKey = getPublicKey(privateKey);
		const base58PublicKey = base58.encode(publicKey);
		return {
			privateKey,
			publicKey,
			base58PublicKey,
		};
	}
}

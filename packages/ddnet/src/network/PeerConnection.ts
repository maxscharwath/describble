import Emittery, {type UnsubscribeFunction} from 'emittery';
import {concatBytes} from '../crypto';

export type SignalData = RTCIceCandidate | RTCSessionDescription;

export type ChannelId = number;

type PeerEvents = {
	data: {channelId: ChannelId; data: Uint8Array};
	signal: SignalData;
	connect: undefined;
	close: undefined;
};

type PeerConfig = {
	initiator: boolean;
	wrtc?: {
		RTCPeerConnection: typeof RTCPeerConnection;
		RTCSessionDescription: typeof RTCSessionDescription;
		RTCIceCandidate: typeof RTCIceCandidate;
	};
};

export type Channel = {
	send: (data: Uint8Array) => void;
	onmessage: (callback: (data: Uint8Array) => void) => UnsubscribeFunction;
};

/**
 * PeerConnection class extends an Emittery that emits events with a structure described by PeerEvents.
 * This class is used to manage a WebRTC connection to a peer.
 */
export class PeerConnection extends Emittery<PeerEvents> {
	private readonly chunkSize: number = 16 * 1024; // 16 KB
	private readonly connection: RTCPeerConnection;
	private readonly dataChannel: RTCDataChannel;
	private readonly wrtc: {
		RTCPeerConnection: typeof RTCPeerConnection;
		RTCSessionDescription: typeof RTCSessionDescription;
		RTCIceCandidate: typeof RTCIceCandidate;
	};

	/**
	 * Constructs a new PeerConnection.
	 * @param config - The configuration for the peer connection.
	 */
	public constructor({initiator, wrtc}: PeerConfig) {
		super();
		// Verify and set up the WebRTC environment.
		if (!wrtc && typeof window === 'undefined') {
			throw new Error('WebRTC is only supported in browser environment, please provide wrtc');
		} else if (!wrtc) {
			wrtc = window;
		}

		this.wrtc = wrtc;

		this.connection = new this.wrtc.RTCPeerConnection({
			iceServers: [
				{
					urls: [
						'stun:stun.l.google.com:19302',
						'stun:global.stun.twilio.com:3478',
					],
				},
			],
		});

		// Create the data channel and setup event listeners for it.
		this.dataChannel = this.connection.createDataChannel('dataChannel', {ordered: true});
		this.dataChannel.binaryType = 'arraybuffer';

		this.connection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
			if (event.candidate) {
				void this.emit('signal', event.candidate);
			}
		};

		this.setupDataChannel();

		this.dataChannel.onopen = () => {
			void this.emit('connect');
		};

		this.dataChannel.onclose = () => {
			void this.emit('close');
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('beforeunload', () => {
				this.destroy();
			});
		}

		// If this peer is the initiator, start the connection process.
		if (initiator) {
			void this.initiateConnection();
		}
	}

	/**
	 * Sends data to the peer through the data channel.
	 * @param channelId - The channel to send the data through.
	 * @param data - The data to send.
	 */
	public send(channelId: number, data: Uint8Array) {
		// Check if the data channel is open
		if (this.dataChannel.readyState !== 'open') {
			throw new Error('Channel is not open');
		}

		// Create a buffer to contain the channelId and the data
		// The first 4 bytes will contain the channelId
		const buffer = new Uint8Array(data.length + 4);
		const view = new DataView(buffer.buffer);
		view.setUint32(0, channelId);
		buffer.set(data, 4);

		// Calculate the total number of chunks needed to send the buffer
		const totalChunks = Math.ceil(buffer.length / this.chunkSize);

		// Iterate over each chunk
		for (let i = 0; i < totalChunks; i++) {
			// Calculate the start and end index of the chunk
			const chunkStart = i * this.chunkSize;
			const chunkEnd = chunkStart + this.chunkSize < buffer.length ? chunkStart + this.chunkSize : buffer.length;

			// Extract the chunk from the buffer
			const chunk = buffer.subarray(chunkStart, chunkEnd);

			// Create a header for the chunk
			// The header contains the total number of chunks and the index of this chunk
			const header = new Uint8Array(new Uint32Array([totalChunks, i]).buffer);

			// Merge the header and the chunk
			const chunkWithHeader = new Uint8Array(header.length + chunk.length);
			chunkWithHeader.set(header);
			chunkWithHeader.set(chunk, header.length);

			// Send the chunk with its header
			this.dataChannel.send(chunkWithHeader);
		}
	}

	/**
	 * Signal handling method, to be implemented.
	 * @param signal - The signal data.
	 */
	public async signal(signal: SignalData) {
		try {
			if ('sdp' in signal) {
				await this.connection.setRemoteDescription(new this.wrtc.RTCSessionDescription(signal));
				if (signal.type === 'offer') {
					const answer = await this.connection.createAnswer();
					await this.connection.setLocalDescription(answer);
					const description = this.connection.localDescription;
					if (description) {
						void this.emit('signal', description);
					}
				}
			} else if ('candidate' in signal && 'sdpMid' in signal && 'sdpMLineIndex' in signal) {
				await this.connection.addIceCandidate(new this.wrtc.RTCIceCandidate(signal));
			}
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * Closes the connection and the data channel, then emits a close event and clears listeners.
	 */
	public destroy() {
		this.dataChannel.close();
		this.connection.close();
		void this.emit('close');
		this.clearListeners();
	}

	/**
	 * Initiates the connection process, to be implemented.
	 */
	private async initiateConnection() {
		try {
			const offer = await this.connection.createOffer();
			await this.connection.setLocalDescription(offer);
			const description = this.connection.localDescription;
			if (description) {
				void this.emit('signal', description);
			}
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * Sets up the data channel, to be implemented.
	 */
	private setupDataChannel() {
		// Array to temporarily hold received data chunks
		const buffers = new Array<Uint8Array>();
		let totalChunks: number | null = null;
		let receivedChunks = 0;

		// Configure the event listener for the data channel
		this.connection.ondatachannel = (event: RTCDataChannelEvent) => {
			event.channel.onmessage = (message: MessageEvent) => {
				const dataWithHeader = new Uint8Array(message.data as ArrayBuffer);

				// The first 8 bytes of the message are a header that contains
				// the total number of chunks and the index of the current chunk.
				const header = new Uint32Array(dataWithHeader.slice(0, 8).buffer);
				const totalChunksFromHeader = header[0];
				const chunkIndex = header[1];

				// Store the data chunk in the buffer array at its corresponding index
				buffers[chunkIndex] = dataWithHeader.slice(8);

				// If this is the first chunk, set the total number of chunks
				if (totalChunks === null) {
					totalChunks = totalChunksFromHeader;
				}

				// Increment the number of received chunks
				receivedChunks += 1;

				// If all chunks have been received, combine them into a single Uint8Array
				// Then, parse the channelId and the data from the combined buffer
				// Finally, emit a 'data' event with the channelId and the data
				// Reset the state for the next message
				if (receivedChunks === totalChunks) {
					const combined = concatBytes(Object.values(buffers));
					const view = new DataView(combined.buffer);
					const channelId = view.getUint32(0);
					const data = combined.subarray(4);

					void this.emit('data', {channelId, data});
					totalChunks = null;
					receivedChunks = 0;
					buffers.length = 0;
				}
			};
		};
	}
}

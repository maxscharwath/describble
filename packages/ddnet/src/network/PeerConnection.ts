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

export class PeerConnection extends Emittery<PeerEvents> {
	private readonly chunkSize: number = 16 * 1024; // 16 KB
	private readonly connection: RTCPeerConnection;
	private readonly dataChannel: RTCDataChannel;
	private readonly wrtc: {
		RTCPeerConnection: typeof RTCPeerConnection;
		RTCSessionDescription: typeof RTCSessionDescription;
		RTCIceCandidate: typeof RTCIceCandidate;
	};

	constructor({initiator, wrtc}: PeerConfig) {
		super();
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

		window?.addEventListener('beforeunload', () => {
			this.destroy();
		});

		if (initiator) {
			void this.initiateConnection();
		}
	}

	public send(channelId: number, data: Uint8Array) {
		if (this.dataChannel.readyState !== 'open') {
			throw new Error('Channel is not open');
		}

		const buffer = new Uint8Array(data.length + 4);
		const view = new DataView(buffer.buffer);
		view.setUint32(0, channelId);
		buffer.set(data, 4);

		const totalChunks = Math.ceil(buffer.length / this.chunkSize);
		for (let i = 0; i < totalChunks; i++) {
			const chunkStart = i * this.chunkSize;
			const chunkEnd = chunkStart + this.chunkSize < buffer.length ? chunkStart + this.chunkSize : buffer.length;

			const chunk = buffer.subarray(chunkStart, chunkEnd);

			// Prepare header: totalChunks (32-bit Int) + current chunk index (32-bit Int)
			const header = new Uint8Array(new Uint32Array([totalChunks, i]).buffer);

			// Merge the header and the chunk
			const chunkWithHeader = new Uint8Array(header.length + chunk.length);
			chunkWithHeader.set(header);
			chunkWithHeader.set(chunk, header.length);

			this.dataChannel.send(chunkWithHeader);
		}
	}

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

	public destroy() {
		this.dataChannel.close();
		this.connection.close();
		void this.emit('close');
		this.clearListeners();
	}

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

	private setupDataChannel() {
		const buffers = new Array<Uint8Array>();
		let totalChunks: number | null = null;
		let receivedChunks = 0;

		this.connection.ondatachannel = (event: RTCDataChannelEvent) => {
			event.channel.onmessage = (message: MessageEvent) => {
				const dataWithHeader = new Uint8Array(message.data as ArrayBuffer);

				// Extract header: totalChunks (32-bit Int) + current chunk index (32-bit Int)
				const header = new Uint32Array(dataWithHeader.slice(0, 8).buffer);
				const totalChunksFromHeader = header[0];
				const chunkIndex = header[1];

				buffers[chunkIndex] = dataWithHeader.slice(8);

				if (totalChunks === null) {
					totalChunks = totalChunksFromHeader;
				}

				receivedChunks += 1;

				if (receivedChunks === totalChunks) {
					const combined = concatBytes(Object.values(buffers));
					const view = new DataView(combined.buffer);
					const channelId = view.getUint32(0);
					const data = combined.subarray(4);

					void this.emit('data', {channelId, data});
					// Reset state for next message
					totalChunks = null;
					receivedChunks = 0;
					buffers.length = 0;
				}
			};
		};
	}
}

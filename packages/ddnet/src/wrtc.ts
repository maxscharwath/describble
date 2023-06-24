// @ts-expect-error - no types @koush/wrtc
import wrtc from '@koush/wrtc';

export type Wrtc = {
	RTCPeerConnection: typeof RTCPeerConnection;
	RTCSessionDescription: typeof RTCSessionDescription;
	RTCIceCandidate: typeof RTCIceCandidate;
};

export default wrtc as Wrtc;

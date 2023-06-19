type BaseMap = {
	encode: (source: ArrayBuffer | Uint8Array | number[]) => string;
	decodeUnsafe: (source: string) => Uint8Array | undefined;
	decode: (source: string) => Uint8Array;
};

export function base(ALPHABET: string): BaseMap {
	if (ALPHABET.length >= 255) {
		throw new TypeError('Alphabet too long');
	}

	const BASE_MAP: Uint8Array = new Uint8Array(256);
	for (let j = 0; j < BASE_MAP.length; j++) {
		BASE_MAP[j] = 255;
	}

	for (let i = 0; i < ALPHABET.length; i++) {
		const x = ALPHABET.charAt(i);
		const xc = x.charCodeAt(0);
		if (BASE_MAP[xc] !== 255) {
			throw new TypeError(x + ' is ambiguous');
		}

		BASE_MAP[xc] = i;
	}

	const BASE = ALPHABET.length;
	const LEADER = ALPHABET.charAt(0);
	const FACTOR = Math.log(BASE) / Math.log(256);
	const iFACTOR = Math.log(256) / Math.log(BASE);

	function encode(source: ArrayBuffer | Uint8Array | number[]): string {
		if (ArrayBuffer.isView(source)) {
			source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
		} else if (Array.isArray(source)) {
			source = Uint8Array.from(source);
		}

		if (!(source instanceof Uint8Array)) {
			throw new TypeError('Expected Uint8Array');
		}

		if (source.length === 0) {
			return '';
		}

		let zeroes = 0;
		let length = 0;
		let pbegin = 0;
		const pend = source.length;
		while (pbegin !== pend && source[pbegin] === 0) {
			pbegin++;
			zeroes++;
		}

		const size = (((pend - pbegin) * iFACTOR) + 1) >>> 0;
		const b58 = new Uint8Array(size);

		while (pbegin !== pend) {
			let carry = source[pbegin];
			let i = 0;
			for (let it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
				carry += (256 * b58[it1]) >>> 0;
				b58[it1] = (carry % BASE) >>> 0;
				carry = (carry / BASE) >>> 0;
			}

			if (carry !== 0) {
				throw new Error('Non-zero carry');
			}

			length = i;
			pbegin++;
		}

		let it2 = size - length;
		while (it2 !== size && b58[it2] === 0) {
			it2++;
		}

		let str = LEADER.repeat(zeroes);
		for (; it2 < size; ++it2) {
			str += ALPHABET.charAt(b58[it2]);
		}

		return str;
	}

	function decodeUnsafe(source: string): Uint8Array | undefined {
		if (typeof (source as unknown) !== 'string') {
			throw new TypeError('Expected String');
		}

		if (source.length === 0) {
			return new Uint8Array();
		}

		let psz = 0;
		let zeroes = 0;
		let length = 0;
		while (source[psz] === LEADER) {
			zeroes++;
			psz++;
		}

		const size = (((source.length - psz) * FACTOR) + 1) >>> 0;
		const b256 = new Uint8Array(size);

		while (source[psz]) {
			let carry = BASE_MAP[source.charCodeAt(psz)];
			if (carry === 255) {
				return;
			}

			let i = 0;
			for (let it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
				carry += (BASE * b256[it3]) >>> 0;
				b256[it3] = (carry % 256) >>> 0;
				carry = (carry / 256) >>> 0;
			}

			if (carry !== 0) {
				throw new Error('Non-zero carry');
			}

			length = i;
			psz++;
		}

		let it4 = size - length;
		const vch = new Uint8Array(zeroes + (size - it4));
		let j = zeroes;
		while (it4 !== size) {
			vch[j++] = b256[it4++];
		}

		return vch;
	}

	function decode(string: string): Uint8Array {
		const buffer = decodeUnsafe(string);
		if (buffer) {
			return buffer;
		}

		throw new Error(`Non-base${BASE} character`);
	}

	return {
		encode,
		decodeUnsafe,
		decode,
	};
}

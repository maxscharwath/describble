import {base, type BaseMap} from './base';

export {base, type BaseMap} from './base';
export const base2 = base('01');
export const base8 = base('01234567');
export const base11 = base('0123456789a');
export const base16 = base('0123456789abcdef');
export const base32 = base('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567');
export const base32z = base('ybndrfg8ejkmcpqxot1uwisza345h769');
export const base36 = base('0123456789abcdefghijklmnopqrstuvwxyz');
export const base58 = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
export const base62 = base('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
export const base64 = base('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/');
export const base67 = base('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~');

export type BufferLike = Uint8Array | string;

/**
 * Helper for encoding and decoding using a base map that can handle both strings and Uint8Arrays
 * @param base - The base map
 */
export const baseHelper = <T extends BaseMap> (base: T) => ({
	decode: (source: BufferLike) => typeof source === 'string' ? base.decode(source) : source,
	decodeUnsafe: (source: BufferLike) => typeof source === 'string' ? base.decodeUnsafe(source) : source,
	encode: (source: BufferLike) => typeof source === 'string' ? source : base.encode(source),
});

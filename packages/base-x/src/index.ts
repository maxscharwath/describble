import {base} from './base';

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

import * as cbor from 'cbor-x';
import {type Schema} from './validator';

export async function parseBuffer<T>(schema: Schema<T>, buffer: Uint8Array) {
	return schema.safeParseAsync(cbor.decode(buffer));
}

export async function encodeMessage<T>(schema: Schema<T>, message: T, validate = true) {
	return cbor.encode(validate ? message : await schema.parseAsync(message));
}

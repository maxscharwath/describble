import * as z from './validator';
import {type ZodDiscriminatedUnionOption} from 'zod/lib/types';

export const ChallengeResponseMessageSchema = z.object({
	type: z.literal('challenge-response'),
	signature: z.uint8Array(),
});

export const ChallengeMessageSchema = z.object({
	type: z.literal('challenge'),
	challenge: z.uint8Array(),
});

export const AuthenticatedMessageSchema = z.object({
	type: z.literal('authenticated'),
});

export const EncryptedMessageSchema = z.object({
	type: z.string(),
	to: z.uint8Array(),
	from: z.uint8Array(),
	data: z.uint8Array(),
});

export const mergeTypedSchemas = <Types extends [
	ZodDiscriminatedUnionOption<'type'>,
	...Array<ZodDiscriminatedUnionOption<'type'>>,
]>(...schemas: Types) => z.discriminatedUnion('type', schemas);

export const AuthenticationSchema = mergeTypedSchemas(
	ChallengeMessageSchema,
	AuthenticatedMessageSchema,
);

import {custom} from 'zod';
import {type CustomErrorParams} from 'zod/lib/types';

export * from 'zod';

export const uint8Array = (params?: CustomErrorParams) => custom<Uint8Array>(value => value instanceof Uint8Array, params);

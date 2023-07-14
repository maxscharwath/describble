import {afterEach, expect} from 'vitest';
import {cleanup} from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import 'fake-indexeddb/auto';

expect.extend(matchers);

afterEach(() => {
	cleanup();
});

import {bench, describe} from 'vitest';
import * as bip39 from 'bip39';
import * as srp from '../src';

describe('generateMnemonic', () => {
	bench('srp.generateMnemonic()', () => {
		srp.generateMnemonic();
	});

	bench('bip39.generateMnemonic()', () => {
		bip39.generateMnemonic();
	});
});

describe('mnemonicToSeedSync', () => {
	const mnemonic = 'sausage bleak beauty join fan swarm fix tourist mutual saddle cart parrot';

	bench('srp.mnemonicToSeedSync()', () => {
		srp.mnemonicToSeedSync(mnemonic);
	});

	bench('bip39.mnemonicToSeedSync()', () => {
		bip39.mnemonicToSeedSync(mnemonic);
	});
});

describe('mnemonicToSeed', () => {
	const mnemonic = 'sausage bleak beauty join fan swarm fix tourist mutual saddle cart parrot';

	bench('srp.mnemonicToSeed()', async () => {
		await srp.mnemonicToSeed(mnemonic);
	});

	bench('bip39.mnemonicToSeed()', async () => {
		await bip39.mnemonicToSeed(mnemonic);
	});
});

describe('mnemonicToEntropy', () => {
	const mnemonic = 'sausage bleak beauty join fan swarm fix tourist mutual saddle cart parrot';

	bench('srp.mnemonicToEntropy()', () => {
		srp.mnemonicToEntropy(mnemonic);
	});

	bench('bip39.mnemonicToEntropy()', () => {
		bip39.mnemonicToEntropy(mnemonic);
	});
});

# 🔐 SRP - Secret Recovery Phrase Library

[![npm (scoped)](https://img.shields.io/npm/v/@describble/srp)](https://www.npmjs.com/package/@describble/srp)
![npm (scoped)](https://img.shields.io/npm/l/@describble/srp)

This TypeScript SRP (Secret Recovery Phrase) library is an enhanced version of the original [bitcoinjs/bip39](https://github.com/bitcoinjs/bip39) library. SRP, originally described by the BIP39 specification, pertains to the creation of a mnemonic sentence. This sentence forms a human-readable, pronounceable, and memorable group of words that can be used for backing up and restoring a private key.

This updated version is designed to be compatible with both browser and Node.js environments. It utilizes Uint8Array instead of Node.js Buffer and currently supports the English language dictionary for mnemonic generation.

## 🚀 Usage

```typescript
import {entropyToMnemonic, generateMnemonic, mnemonicToEntropy, mnemonicToSeedSync, validateMnemonic} from 'bip39';

const mnemonic = 'sausage bleak beauty join fan swarm fix tourist mutual saddle cart parrot';
console.log(validateMnemonic(mnemonic)); // true

const entropy = mnemonicToEntropy(mnemonic);
console.log(entropy); // "bfa2f04ebc152db6d6072f9237b88c50"

const seed = mnemonicToSeedSync(mnemonic);
console.log(seed); // Uint8Array(64) [154, 110, 157,  14, 157, 178, 183, 215, 101, 191, 255, ...]

const mnemonic2 = entropyToMnemonic(entropy);
console.log(mnemonic2); // "sausage bleak beauty join fan swarm fix tourist mutual saddle cart parrot"

const randomMnemonic = generateMnemonic(); // a random mnemonic sentence of 12 words
console.log(randomMnemonic);

```

## ⚙️ How it Works

The library adheres to the BIP39 specification, outlining the process of converting a binary seed into a mnemonic sentence and vice versa. Each word in the mnemonic sentence symbolizes 11 bits of data. The total length of the mnemonic determines the entropy of the produced seed.

Through the provided functions, you can:

- Convert a mnemonic sentence to the associated entropy.
- Convert entropy to a mnemonic sentence.
- Generate a mnemonic sentence of a specific length.
- Validate a mnemonic sentence.

## 🚧 Caution
While the library is optimized for performance and usability, it currently only supports the English language dictionary. The original BIP39 specification supports multiple languages, and expanding the library to support these could be a future enhancement.

## 👥 Contributing
Contributions are warmly welcomed! Feel free to submit issues for bugs and feature requests, and submit pull requests for improvements or new features.

## 📜 License
This library is a derivative of the original [bitcoinjs/bip39](https://github.com/bitcoinjs/bip39) library, which is licensed under the [ISC license](https://github.com/bitcoinjs/bip39/blob/master/LICENSE.md).

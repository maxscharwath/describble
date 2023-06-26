# 👋 TypeScript BIP39 Library

This TypeScript BIP39 library is a revamped version of the original [bitcoinjs/bip39](https://github.com/bitcoinjs/bip39) library. BIP39 describes the implementation of a mnemonic sentence, i.e., generating a human-readable, pronounceable, and memorable group of words that can be used to back-up and restore a private key.

Unlike the original library, this version does not rely on Node.js Buffer but Uint8Array and currently only supports the English language dictionary for mnemonic generation.

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

The library follows the BIP39 specification, which describes the process of converting a binary seed to a mnemonic sentence and vice versa. Each word in the mnemonic sentence represents 11 bits of data, and the overall length of the mnemonic determines the entropy of the generated seed.

By leveraging the provided functions, you can:

- Convert a mnemonic sentence to the associated entropy.
- Convert entropy to a mnemonic sentence.
- Generate a mnemonic sentence of a particular length.
- Validate a mnemonic sentence.

## 🚧 Caution
While the library is optimized for performance and usability, it currently only supports the English language dictionary. The original BIP39 specification supports multiple languages, and expanding the library to support these could be a future enhancement.

## 👥 Contributing
Contributions are warmly welcomed! Feel free to submit issues for bugs and feature requests, and submit pull requests for improvements or new features.

## 📜 License
This library is a derivative of the original [bitcoinjs/bip39](https://github.com/bitcoinjs/bip39) library, which is licensed under the [ISC license](https://github.com/bitcoinjs/bip39/blob/master/LICENSE.md).

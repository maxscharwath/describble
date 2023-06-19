# 👋 Base-encoding TypeScript Library

This library is a robust and efficient refactored version of the [base-x](https://github.com/cryptocoinjs/base-x) library, now optimized with TypeScript. It provides fast base encoding and decoding of any given alphabet using bitcoin style leading zero compression.

⚠️ **WARNING:** This module is **NOT RFC3548** compliant, it cannot be used for base16 (hex), base32, or base64 encoding in a standards compliant manner.

## 🚀 Usage

Example with Base58:

```typescript
import { base58 } from 'base-encoding-ts';

const decoded = base58.decode('5Kd3NBUAdUnhyzenEwVLy9pBKxSwXvE9FMPyR4UKZvpe6E3AgLr');

console.log(decoded);
// => Uint8Array(33) [
//   128, 237, 219, 220,  17, 104, 241, 218,
//   234, 219, 211, 228,  76,  30,  63, 143,
//    90,  40,  76,  32,  41, 247, 138, 210,
//   106, 249, 133, 131, 164, 153, 222,  91,
//    25
// ]

console.log(base58.encode(decoded));
// => 5Kd3NBUAdUnhyzenEwVLy9pBKxSwXvE9FMPyR4UKZvpe6E3AgLr
```

### 🎨 Alphabets

This library supports a variety of base encoding alphabets. Below is a list of commonly recognized alphabets, along with their respective base:

| Base | Alphabet                                                              |
|------|-----------------------------------------------------------------------|
| 2    | `01`                                                                  |
| 8    | `01234567`                                                            |
| 11   | `0123456789a`                                                         |
| 16   | `0123456789abcdef`                                                    |
| 32   | `0123456789ABCDEFGHJKMNPQRSTVWXYZ`                                    |
| 32z  | `ybndrfg8ejkmcpqxot1uwisza345h769`                                    |
| 36   | `0123456789abcdefghijklmnopqrstuvwxyz`                                |
| 58   | `123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`          |
| 62   | `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`      |
| 64   | `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`    |
| 67   | `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~` |

## ⚙️ How it Works

This library encodes octet arrays by performing long divisions on all significant digits in the array, creating a representation of that number in the new base. For every leading zero in the input (not significant as a number), it is encoded as a single leader character, the first character in the alphabet which decodes as 8 bits. The other characters' values depend upon the base. For instance, a base58 alphabet packs roughly 5.858 bits per character.

Interestingly, the encoded string '000f' (using a base16, 0-f alphabet) will actually decode to 4 bytes unlike a canonical hex encoding which uniformly packs 4 bits into each character. Although this might seem unusual, it allows us to eliminate the need for padding and it also works for bases like 43.

## 🚧 Caution
While using the `decodeUnsafe` and `decode` methods, please note that if the source string contains a character not recognized in the base encoding scheme, the `decodeUnsafe` function will return `undefined`, while `decode` will throw an `Error`. Always ensure the validity of your source string to prevent unexpected errors or results.

## 👥 Contributing
Contributions are always welcome! Feel free to report bugs or request features by submitting issues, and feel free to propose improvements or new features via pull requests.

## 📜 License
This library is a derivative of the base58 implementation from [`bitcoin/bitcoin`](https://github.com/bitcoin/bitcoin/blob/f1e2f2a85962c1664e4e55471061af0eaa798d40/src/base58.cpp), generalized for variable length alphabets. It is licensed under the MIT license.

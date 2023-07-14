# Moodie Avatars

[![NPM](https://img.shields.io/npm/v/moodie)](https://www.npmjs.com/package/moodie)
![NPM](https://img.shields.io/npm/l/moodie)

Moodie is a delightful, lightweight JavaScript library for React that generates SVG-based, expressive avatars from any username and color palette. Inspired by the amazing [boring-avatars](https://github.com/boringdesigners/boring-avatars) project, Moodie aims to take a step further by introducing an array of expressive, fun, and playful avatar faces.

<div align="center">
  <img src="https://github.com/maxscharwath/Describble/assets/6887819/b9eb9650-b097-42af-9bff-1ef702a9ea5b" alt="moodie-52" style="margin: 10px;">
  <img src="https://github.com/maxscharwath/Describble/assets/6887819/c1a0d6f7-02c0-4e05-a26a-a022afa6c0be" alt="moodie-18" style="margin: 10px;">
  <img src="https://github.com/maxscharwath/Describble/assets/6887819/dad254d1-7997-4185-ac3c-68cbe6f34047" alt="moodie-88" style="margin: 10px;">
  <img src="https://github.com/maxscharwath/Describble/assets/6887819/a0faa218-3450-4ebf-b550-83eb82670574" alt="moodie-22" style="margin: 10px;">
</div>

## Features
- Generates unique, vibrant avatars based on any input string
- Offers an assortment of expressions to bring your avatars to life
- Extremely lightweight with no external dependencies
- Fully customizable color palette

## Usage
```jsx
import { Moodie } from 'moodie';

<Moodie
  size={40}
  name="Ada Lovelace"
  expression={{
    eye: 'happy',
    mouth: 'smile',
  }}
  colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
/>;
```

### Props
| Prop       | Type             | Description                               |
|------------|------------------|-------------------------------------------|
| size       | number \| string | Size of the avatar, default: `40px`       |
| name       | string           | String based on which avatar is generated |
| expression | ExpressionProps  | Defines the expression of the avatar      |
| colors     | array            | Array of colors for the avatar palette    |

`ExpressionProps` is an object that can have two keys: `eye` and `mouth`. The possible values for these keys are:

- `eye`: `normal`, `happy`, `sleepy`, `mischief`
- `mouth`: `smile`, `open`, `surprise`, `unhappy`

# Acknowledgments
Moodie was inspired by a project originally made by [Hayk An](https://hayk.design/) and [Josep Martins](https://josepmartins.com/).

# License
Moodie is open source software licensed as MIT.

# Support
If you like Moodie, star the repo or contribute to support the project!

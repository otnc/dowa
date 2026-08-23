# dowa

[![npm version](https://badge.fury.io/js/dowa.svg)](https://badge.fury.io/js/dowa)
[![CI](https://github.com/otnc/dowa/actions/workflows/ci.yml/badge.svg)](https://github.com/otnc/dowa/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/node/v/dowa)](https://www.npmjs.com/package/dowa)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

> dowa means どわーw (冷笑)

冷笑を検知しますw

## 動作環境

- Node.js >= 14 (ESM/CJS 両対応)
- ブラウザ(バンドラー経由での利用)

## インストール

```bash
npm install dowa
```

## 使い方

```js
// ESM
import { findAll, contains } from 'dowa';
// CJS
const { findAll, contains } = require('dowa');

findAll('←うおw、爆笑'); // => ['うおw', '爆笑']
contains('うおw'); // => true
// relaxed モード(検知範囲を拡大)
contains('どわー', true);
```

## API

- `findAll(text: string, relaxed = false): string[] | null` — マッチした冷笑の配列を返すw（見つからなければ `null`）
- `contains(text: string, relaxed = false): boolean` — 冷笑が含まれるかを真偽値で返すw

## 貢献について

貢献方法については [./CONTRIBUTING.md](./CONTRIBUTING.md) を確認してください

<a href="https://github.com/otnc/dowa/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=otoneko1102/dowa" />
</a>

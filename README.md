# dowa

[![npm version](https://badge.fury.io/js/dowa.svg)](https://badge.fury.io/js/dowa)
[![CI](https://github.com/otnc/dowa/actions/workflows/ci.yml/badge.svg)](https://github.com/otnc/dowa/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/node/v/dowa)](https://www.npmjs.com/package/dowa)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

> *dowa* means どわーw (冷笑)

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
contains('どわー', { relaxed: true });

// どのパターンにマッチしたかの詳細がほしい場合
findMatches('うおw、爆笑爆笑');
// => [
//   { text: 'うおw', index: 0, patternId: 'stem-uo', strict: true },
//   { text: '爆笑爆笑', index: 4, patternId: 'repeat-bakushou', strict: true },
// ]
```

> [!Important]
>   
> v2 で `relaxed` は第2引数の boolean からオプションオブジェクトに変わりました。
> `findAll(text, true)` → `findAll(text, { relaxed: true })`

## API

- `findAll(text: string, options?: DowaOptions): string[] | null` — マッチした冷笑の配列を返すw（見つからなければ `null`）
- `contains(text: string, options?: DowaOptions): boolean` — 冷笑が含まれるかを真偽値で返すw
- `findMatches(text: string, options?: DowaOptions): DowaMatch[] | null` — どのパターンにマッチしたかの詳細(位置・パターンid・strict/relaxed)付きで返すw（見つからなければ `null`）。パターンごとに個別検索するため、複数パターンの一致範囲が重なる場合は `findAll` の重複排除された結果とは一致しないことがある
- `DowaOptions`
  - `relaxed?: boolean` (デフォルト: `false`) — `true` で検知範囲を拡大する
- `DowaMatch`
  - `text: string` — マッチした文字列
  - `index: number` — マッチ開始位置
  - `patternId: string` — マッチしたパターンのid([src/lib/patterns.ts](./src/lib/patterns.ts) 参照)
  - `strict: boolean` — そのパターンがstrictかどうか
- `patterns: PatternDefinition[]` — 検知に使われている全パターンの定義(id/strict/source/samples)。パターンを紹介・デバッグしたい場合に

## 貢献について

貢献方法については [./CONTRIBUTING.md](./CONTRIBUTING.md) を確認してください

<a href="https://github.com/otnc/dowa/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=otoneko1102/dowa" />
</a>

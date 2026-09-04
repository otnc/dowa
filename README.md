# dowa

[![npm version](https://badge.fury.io/js/dowa.svg)](https://badge.fury.io/js/dowa)
[![CI](https://github.com/otnc/dowa/actions/workflows/ci.yml/badge.svg)](https://github.com/otnc/dowa/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/node/v/dowa)](https://www.npmjs.com/package/dowa)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![技術者倫理|遵守済み](https://gijutsusharin.li/badge.svg)](https://gijutsusharin.li)

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
import { contains, findAll, findMatches } from 'dowa';
// CJS
const { contains, findAll, findMatches } = require('dowa');

contains('うおw'); // => true
// relaxed モード(検知範囲を拡大)
contains('どわー', { relaxed: true });

findAll('←うおw、爆笑'); // => ['うおw', '爆笑']

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

### Standard Schema

[Standard Schema](https://standardschema.dev/) に対応したスキーマも提供しています。zod・valibotなどのバリデーションパイプラインにそのまま組み込めるので、スキーマのパースと冷笑検知を別々に行う必要がなくなりますw

```js
import { dowaSchema } from 'dowa';

const schema = dowaSchema({ relaxed: true }); // DowaOptionsと同じオプションを渡せる

const result = await schema['~standard'].validate('うおw');
// => { issues: [{ message: '冷笑パターンを検出しました: うおw' }] }
```

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
- `dowaSchema(options?: DowaOptions): StandardSchemaV1<string, string>` — 冷笑を検知する[Standard Schema](https://standardschema.dev/)を作る。冷笑が検出された場合は`issues`で弾く

## 貢献について

貢献方法については [CONTRIBUTING.md](./CONTRIBUTING.md) を確認してください

<a href="https://github.com/otnc/dowa/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=otoneko1102/dowa" />
</a>

## その他

Twitter (新X) で冷笑ツイートを検知するChrome/Firefox拡張機能を公開中です。

https://github.com/otnc/dowa-twitter-checker

[Chrome拡張機能](https://chromewebstore.google.com/detail/kkojaplhlbbildhofdophfadmbdholdn) / [Firefox拡張機能](https://addons.mozilla.org/firefox/addon/%E5%86%B7%E7%AC%91%E3%83%81%E3%82%A7%E3%83%83%E3%82%AB%E3%83%BC-for-twitter/)

## 著者

otoneko. https://github.com/otnc

## ライセンス

[MIT License](./LICENSE)

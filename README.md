# dowa

[![npm version](https://badge.fury.io/js/dowa.svg)](https://badge.fury.io/js/dowa)
[![CI](https://github.com/otnc/dowa/actions/workflows/ci.yml/badge.svg)](https://github.com/otnc/dowa/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/node/v/dowa)](https://www.npmjs.com/package/dowa)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![技術者倫理|遵守済み](https://gijutsusharin.li/badge.svg)](https://gijutsusharin.li)

> *dowa* means どわーw (冷笑)

冷笑を検知しますw

JavaScript/TypeScript のライブラリとして使えるほか、CLI を通して他の言語からも呼び出せます。

## 動作環境

- Node.js >= 18.3 (ESM/CJS 両対応)
- ブラウザ(バンドラー経由での利用。CLI を除く)

## インストール

```bash
npm install dowa
```

CLI だけ使う場合はインストールせずに `npx dowa` でも実行できます。

## 使い方

```js
// ESM
import { contains, findAll, findMatches, mask } from 'dowa';
// CJS
const { contains, findAll, findMatches, mask } = require('dowa');

contains('うおw'); // => true
// relaxed モード(検知範囲を拡大)
contains('どわー', { relaxed: true }); // => true

findAll('←うおw、爆笑'); // => ['うおw']
findAll('←うおw、爆笑', { relaxed: true }); // => ['うおw', '爆笑']
findAll('普通の文章です'); // => []

// どのパターンにマッチしたかの詳細がほしい場合
findMatches('うおw、爆笑爆笑');
// => [
//   { text: 'うおw', index: 0, end: 3, patternId: 'stem-uo', strict: true },
//   { text: '爆笑爆笑', index: 4, end: 8, patternId: 'repeat-bakushou', strict: true },
// ]

// 冷笑を伏せ字にする
mask('うおw、なるほど'); // => '***、なるほど'
mask('うおw、なるほど', { replacement: '[冷笑]' }); // => '[冷笑]、なるほど'

// 特定のパターンを検知から外す(idは patterns や `dowa --patterns` で確認できる)
contains('うおw', { disable: ['stem-uo'] }); // => false
```

### Standard Schema

[Standard Schema](https://standardschema.dev/) に対応したスキーマも提供しています。[zod](https://zod.dev/) / [valibot](https://valibot.dev/) などのバリデーションパイプラインにそのまま組み込めるので、スキーマのパースと冷笑検知を別々に行う必要がなくなりますw

```js
import { dowaSchema } from 'dowa';

const schema = dowaSchema({ relaxed: true }); // DowaOptionsと同じオプションを渡せる

const result = await schema['~standard'].validate('うおw');
// => { issues: [{ message: '冷笑パターンを検出しました: うおw' }] }
```

## CLI

```bash
$ npx dowa "うおw、爆笑爆笑"
うおw
爆笑爆笑

$ echo "どわー" | npx dowa --relaxed --json
{"detected":true,"matches":[{"text":"どわー","index":0,"end":3,"patternId":"bare-dowa","strict":false}]}

$ npx dowa --lines < posts.txt
3:うおw
10:爆笑爆笑

$ npx dowa --mask "うおw、なるほど"
***、なるほど
```

テキストを引数で渡さなければ標準入力から読み込みます。

| オプション | 説明 |
| --- | --- |
| `-r`, `--relaxed` | 検知範囲を拡大する |
| `-d`, `--disable <id>` | 指定したidのパターンを検知から外す(複数指定・カンマ区切り可) |
| `-l`, `--lines` | 1行ずつ判定し、行番号付きで出力する |
| `-j`, `--json` | 結果をJSONで出力する(`--lines` と併用するとJSON Lines) |
| `-m`, `--mask` | 冷笑を伏せ字にしたテキストを出力する |
| `--replacement <str>` | `--mask` で使う置き換え文字列(デフォルト: 1文字ごとに `*`) |
| `--offset-unit <unit>` | JSONの `index` / `end` の単位。`codepoint`(デフォルト) / `utf16` / `utf8` |
| `-q`, `--quiet` | 何も出力せず、終了コードだけ返す |
| `--stdio` | 1行1件のJSONリクエストを読み、JSONで応答し続ける |
| `--patterns` | パターン一覧をJSONで出力する |
| `-h`, `--help` | ヘルプを表示する |
| `-v`, `--version` | バージョンを表示する |

終了コードは `0`: 冷笑なし、`1`: 冷笑あり、`2`: エラー です。CI などで `npx dowa -q < file.txt` のように使えます。

### 他の言語から使う

CLI の `--json` を使えば、どの言語からでもサブプロセスとして呼び出せます。JSONの `index` / `end` はデフォルトでコードポイント単位です。Go のように文字列をバイト単位で扱う言語では `--offset-unit utf8`、JavaScript/Java/C# のように UTF-16 で扱う言語では `--offset-unit utf16` を指定すると、受け取った位置でそのまま文字列をスライスできます。

たくさんのテキストを判定するときは、毎回プロセスを起動するより `--stdio` で常駐させるほうが速いです。1行に1つJSONを書き込むと、1行のJSONで応答が返ってきます。

```text
> {"id": 1, "text": "うおw"}
< {"id":1,"detected":true,"matches":[{"text":"うおw","index":0,"end":3,"patternId":"stem-uo","strict":true}]}
> {"id": 2, "text": "どわー", "relaxed": true, "mask": true}
< {"id":2,"detected":true,"matches":[...],"masked":"***"}
```

リクエストには `text`(必須) のほかに `id` / `relaxed` / `disable` / `mask` / `replacement` を指定できます。`id` はそのまま応答に含まれます。不正なリクエストには `{"id": ..., "error": "..."}` が返り、処理は続きます。

Go での例:

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
)

type Match struct {
	Text      string `json:"text"`
	Index     int    `json:"index"`
	End       int    `json:"end"`
	PatternID string `json:"patternId"`
	Strict    bool   `json:"strict"`
}

type Response struct {
	ID       int     `json:"id"`
	Detected bool    `json:"detected"`
	Matches  []Match `json:"matches"`
	Masked   string  `json:"masked"`
	Error    string  `json:"error"`
}

func main() {
	// Goの文字列はバイト単位で扱うので、位置をUTF-8のバイト数で受け取る
	cmd := exec.Command("npx", "dowa", "--stdio", "--offset-unit", "utf8")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		log.Fatal(err)
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Fatal(err)
	}
	if err := cmd.Start(); err != nil {
		log.Fatal(err)
	}
	requests := json.NewEncoder(stdin)
	responses := json.NewDecoder(stdout)

	check := func(req map[string]any) Response {
		if err := requests.Encode(req); err != nil {
			log.Fatal(err)
		}
		var res Response
		if err := responses.Decode(&res); err != nil {
			log.Fatal(err)
		}
		return res
	}

	text := "😅うおw"
	for _, m := range check(map[string]any{"id": 1, "text": text}).Matches {
		fmt.Println(m.PatternID, text[m.Index:m.End])
	}
	// emoji-sweat-smile 😅
	// stem-uo うおw

	fmt.Println(check(map[string]any{"id": 2, "text": "どわー", "relaxed": true, "mask": true}).Masked)
	// ***

	stdin.Close()
	if err := cmd.Wait(); err != nil {
		log.Fatal(err)
	}
}
```

## API

- `findAll(text: string, options?: DowaOptions): string[]` — マッチした冷笑の配列を返すw(見つからなければ空配列)
- `contains(text: string, options?: DowaOptions): boolean` — 冷笑が含まれるかを真偽値で返すw
- `findMatches(text: string, options?: DowaOptions): DowaMatch[]` — どのパターンにマッチしたかの詳細(位置・パターンid・strict/relaxed)付きで返すw(見つからなければ空配列)。パターンごとに個別検索するため、複数パターンの一致範囲が重なる場合は `findAll` の重複排除された結果とは一致しないことがある
- `mask(text: string, options?: MaskOptions): string` — 冷笑を伏せ字にしたテキストを返すw。伏せる範囲は `findAll` と同じ
- `createRegExp(options?: DowaOptions): RegExp` — 有効なパターンを1つにまとめた正規表現(`gu` フラグ)を返す。呼ぶたびに新しいインスタンスなので、`test` / `exec` で `lastIndex` が変わっても他に影響しない
- `dowaSchema(options?: DowaOptions): StandardSchemaV1<string, string>` — 冷笑を検知する[Standard Schema](https://standardschema.dev/)を作る。冷笑が検出された場合は`issues`で弾く
- `patterns: readonly Pattern[]` — 検知に使われている全パターンの定義。凍結されているので書き換えられない
- `DowaOptions`
  - `relaxed?: boolean` (デフォルト: `false`) — `true` で検知範囲を拡大する
  - `disable?: string[]` — 検知から外すパターンのid。存在しないidを渡すと `TypeError`
- `MaskOptions` (`DowaOptions` を継承)
  - `replacement?: string | ((match: string) => string)` — 文字列ならマッチ全体をその文字列に、関数ならマッチごとの戻り値に置き換える(デフォルト: 1文字ごとに `*`。絵文字の肌の色なども含めて見た目の1文字で数える)
- `DowaMatch`
  - `text: string` — マッチした文字列
  - `index: number` — マッチ開始位置(UTF-16 コードユニット単位。`String#matchAll` の `index` と同じ)
  - `end: number` — マッチ終了位置(この位置の文字は含まない)。`text.slice(index, end)` がマッチした文字列になる
  - `patternId: string` — マッチしたパターンのid([src/lib/patterns.ts](./src/lib/patterns.ts) 参照)
  - `strict: boolean` — そのパターンがstrictかどうか
- `Pattern`
  - `id: string` / `strict: boolean` / `samples: string[]` / `negativeSamples: string[]`
  - `source: { strict: string; relaxed: string }` — モードごとの正規表現ソース

## v2 からの移行

> [!Important]
>   
> v3 には破壊的変更があります。

- 見つからなかったときの `findAll` / `findMatches` の戻り値が `null` から空配列 `[]` になりました。`if (findAll(text))` のような判定は `contains(text)` か `findAll(text).length` に置き換えてください
- `regexStrict` / `regexRelaxed` を廃止しました。共有された `g` フラグ付きの正規表現は `lastIndex` が残って誤動作しやすいためです。代わりに `createRegExp()` / `createRegExp({ relaxed: true })` を使ってください
- `patterns` が読み取り専用になりました。また `source` は関数ではなく `{ strict, relaxed }` のモードごとの文字列になりました
- `DowaMatch` に `end` が増えました
- 対応する Node.js が 18.3 以上になりました
- 検知の改善により、同じテキストでも結果が変わることがあります
  - 「行ってきたw」「寝ていたw」「思うわw」「置いておけw」のような動詞の活用への誤検知を減らしました
  - 波ダッシュ(`〜`)、大文字の `W` / `Ｗ`、語幹と笑いの間の三点リーダー(`ヤバ…w`)を検知するようになりました

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

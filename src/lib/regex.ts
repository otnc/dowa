import { patterns, type Pattern } from "./patterns";
import type { ResolvedOptions } from "./options";

interface CompiledPattern {
  pattern: Pattern;
  regex: RegExp;
}

export interface Matcher {
  /**
   * 有効なパターンを1つにまとめた正規表現(gフラグ付き)。
   * lastIndexを使うメソッド(test/exec)は呼ばず、match/matchAll/replace/searchだけで使う。
   */
  combined: RegExp;
  /** パターンごとの正規表現(定義順) */
  each: CompiledPattern[];
}

// 何にもマッチしない正規表現。空文字列の正規表現は全位置にマッチしてしまうため使わない
const NEVER = "(?!)";

function build({ relaxed, disable }: ResolvedOptions): Matcher {
  const mode = relaxed ? "relaxed" : "strict";
  const enabled = patterns.filter(
    (p) => (p.strict || relaxed) && !disable.has(p.id)
  );
  // strict なパターンを常に先に並べる。正規表現の選択肢(|)は最初に
  // マッチしたものを採用するため、順序が逆だと "爆笑" のような
  // relaxed専用の短い一致が "(?:爆笑){2,}" より先に取られてしまう。
  const ordered = [
    ...enabled.filter((p) => p.strict),
    ...enabled.filter((p) => !p.strict),
  ];
  const source = ordered.map((p) => `(?:${p.source[mode]})`).join("|");
  return {
    combined: new RegExp(source || NEVER, "gu"),
    each: enabled.map((p) => ({
      pattern: p,
      regex: new RegExp(p.source[mode], "gu"),
    })),
  };
}

const MAX_CACHE_SIZE = 64;
const cache = new Map<string, Matcher>();

/** オプションに応じたコンパイル済みの正規表現を返す(キャッシュあり) */
export function getMatcher(options: ResolvedOptions): Matcher {
  const key = `${options.relaxed}:${[...options.disable].sort().join(",")}`;
  let matcher = cache.get(key);
  if (!matcher) {
    if (cache.size >= MAX_CACHE_SIZE) cache.clear();
    matcher = build(options);
    cache.set(key, matcher);
  }
  return matcher;
}

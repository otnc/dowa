import { regexStrict, regexRelaxed, match } from "./lib/regex";
import {
  patterns,
  resolveSource,
  type PatternDefinition,
} from "./lib/patterns";
import { resolveRelaxed, type DowaOptions } from "./lib/options";
import { dowaSchema } from "./lib/schema";

export interface DowaMatch {
  /** マッチした文字列 */
  text: string;
  /** マッチ開始位置(UTF-16コードユニット単位、String#matchAllのindexと同じ) */
  index: number;
  /** マッチしたパターンのid ([lib/patterns.ts](./lib/patterns.ts) 参照) */
  patternId: string;
  /** そのパターンがstrictかどうか */
  strict: boolean;
}

function validate(text: string, options: DowaOptions): boolean {
  if (typeof text !== "string") {
    throw new TypeError('"text" must be a string.');
  }
  return resolveRelaxed(options);
}

/**
 * テキスト中の冷笑パターンをすべて検出する。
 * @param text 検査対象の文字列
 * @param options.relaxed true で検知範囲を拡大する (デフォルト: false)
 */
export function findAll(
  text: string,
  options: DowaOptions = {}
): string[] | null {
  const relaxed = validate(text, options);
  return match(text, relaxed);
}

/**
 * テキストに冷笑パターンが含まれるかを判定する。
 * @param text 検査対象の文字列
 * @param options.relaxed true で検知範囲を拡大する (デフォルト: false)
 */
export function contains(text: string, options: DowaOptions = {}): boolean {
  return !!findAll(text, options);
}

/**
 * テキスト中の冷笑パターンを、どのパターンにマッチしたかの詳細付きで検出する。
 * パターンごとに独立して検索するため、複数パターンの一致範囲が重なる場合は
 * それぞれ個別の結果として返る(findAllの重複排除された結果とは一致しない)。
 * @param text 検査対象の文字列
 * @param options.relaxed true で検知範囲を拡大する (デフォルト: false)
 */
export function findMatches(
  text: string,
  options: DowaOptions = {}
): DowaMatch[] | null {
  const relaxed = validate(text, options);
  const results: DowaMatch[] = [];
  for (const pattern of patterns) {
    if (!pattern.strict && !relaxed) continue;
    const re = new RegExp(resolveSource(pattern, relaxed), "gu");
    for (const m of text.matchAll(re)) {
      results.push({
        text: m[0],
        index: m.index,
        patternId: pattern.id,
        strict: pattern.strict,
      });
    }
  }
  results.sort((a, b) => a.index - b.index);
  return results.length ? results : null;
}

export { regexStrict, regexRelaxed, patterns, dowaSchema };
export type { PatternDefinition, DowaOptions };

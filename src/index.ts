import { patterns, type Pattern } from "./lib/patterns";
import { resolveOptions, type DowaOptions } from "./lib/options";
import { getMatcher } from "./lib/regex";
import { dowaSchema } from "./lib/schema";

export interface DowaMatch {
  /** マッチした文字列 */
  text: string;
  /** マッチ開始位置(UTF-16コードユニット単位、String#matchAllのindexと同じ) */
  index: number;
  /** マッチ終了位置(この位置の文字は含まない)。text.slice(index, end) がマッチした文字列になる */
  end: number;
  /** マッチしたパターンのid ([lib/patterns.ts](./lib/patterns.ts) 参照) */
  patternId: string;
  /** そのパターンがstrictかどうか */
  strict: boolean;
}

export interface MaskOptions extends DowaOptions {
  /**
   * 検知した部分の置き換え方。文字列ならマッチ全体をその文字列に置き換え、関数ならマッチごとに呼ぶ。
   * (デフォルト: 1文字(書記素)ごとに "*")
   */
  replacement?: string | ((match: string) => string);
}

function assertText(text: unknown): asserts text is string {
  if (typeof text !== "string") {
    throw new TypeError('"text" must be a string.');
  }
}

/**
 * テキスト中の冷笑パターンをすべて検出する。見つからなければ空配列を返す。
 * @param text 検査対象の文字列
 * @param options.relaxed true で検知範囲を拡大する (デフォルト: false)
 * @param options.disable 検知から外すパターンのid
 */
export function findAll(text: string, options: DowaOptions = {}): string[] {
  assertText(text);
  return text.match(getMatcher(resolveOptions(options)).combined) ?? [];
}

/**
 * テキストに冷笑パターンが含まれるかを判定する。
 * @param text 検査対象の文字列
 * @param options.relaxed true で検知範囲を拡大する (デフォルト: false)
 * @param options.disable 検知から外すパターンのid
 */
export function contains(text: string, options: DowaOptions = {}): boolean {
  assertText(text);
  return text.search(getMatcher(resolveOptions(options)).combined) !== -1;
}

/**
 * テキスト中の冷笑パターンを、どのパターンにマッチしたかの詳細付きで検出する。
 * パターンごとに独立して検索するため、複数パターンの一致範囲が重なる場合は
 * それぞれ個別の結果として返る(findAllの重複排除された結果とは一致しない)。
 * 結果は位置順で、同じ位置ならpatternsの定義順に並ぶ。見つからなければ空配列を返す。
 * @param text 検査対象の文字列
 * @param options.relaxed true で検知範囲を拡大する (デフォルト: false)
 * @param options.disable 検知から外すパターンのid
 */
export function findMatches(
  text: string,
  options: DowaOptions = {}
): DowaMatch[] {
  assertText(text);
  const results: DowaMatch[] = [];
  for (const { pattern, regex } of getMatcher(resolveOptions(options)).each) {
    for (const m of text.matchAll(regex)) {
      results.push({
        text: m[0],
        index: m.index,
        end: m.index + m[0].length,
        patternId: pattern.id,
        strict: pattern.strict,
      });
    }
  }
  return results.sort((a, b) => a.index - b.index);
}

let segmenter: Intl.Segmenter | undefined;

function countGraphemes(text: string): number {
  if (typeof Intl === "undefined" || !("Segmenter" in Intl)) {
    return [...text].length;
  }
  segmenter ??= new Intl.Segmenter();
  return Array.from(segmenter.segment(text)).length;
}

/**
 * テキスト中の冷笑を伏せ字にする。どの部分が伏せられるかは findAll と同じ。
 * @param text 対象の文字列
 * @param options.replacement 置き換え方 (デフォルト: 1文字ごとに "*")
 * @param options.relaxed true で検知範囲を拡大する (デフォルト: false)
 * @param options.disable 検知から外すパターンのid
 */
export function mask(text: string, options: MaskOptions = {}): string {
  assertText(text);
  const { replacement, ...detectOptions } = resolveMaskOptions(options);
  const combined = getMatcher(resolveOptions(detectOptions)).combined;
  return text.replace(combined, (m) =>
    replacement === undefined
      ? "*".repeat(countGraphemes(m))
      : typeof replacement === "string"
        ? replacement
        : String(replacement(m))
  );
}

function resolveMaskOptions(options: MaskOptions): MaskOptions {
  if (typeof options !== "object" || options === null) {
    throw new TypeError('"options" must be an object.');
  }
  const { replacement } = options;
  if (
    replacement !== undefined &&
    typeof replacement !== "string" &&
    typeof replacement !== "function"
  ) {
    throw new TypeError('"options.replacement" must be a string or function.');
  }
  return options;
}

/**
 * 有効なパターンを1つにまとめた正規表現(`gu` フラグ)を新しく作って返す。
 * 呼び出すたびに別のインスタンスなので、test/execでlastIndexが変わっても他に影響しない。
 * @param options.relaxed true で検知範囲を拡大する (デフォルト: false)
 * @param options.disable 検知から外すパターンのid
 */
export function createRegExp(options: DowaOptions = {}): RegExp {
  const { combined } = getMatcher(resolveOptions(options));
  return new RegExp(combined.source, combined.flags);
}

export { patterns, dowaSchema };
export type { Pattern, DowaOptions };

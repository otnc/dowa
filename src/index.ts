import { regexStrict, regexRelaxed } from "./lib/regex";

export interface DowaOptions {
  /** 検知範囲を拡大するか (デフォルト: false) */
  relaxed?: boolean;
}

/**
 * テキスト中の冷笑パターンをすべて検出する。
 * @param text 検査対象の文字列
 * @param options.relaxed true で検知範囲を拡大する (デフォルト: false)
 * @returns マッチした文字列の配列。見つからなければ null
 */
export function findAll(
  text: string,
  options: DowaOptions = {},
): string[] | null {
  if (typeof text !== "string") {
    throw new TypeError('"text" must be a string.');
  }
  if (typeof options !== "object" || options === null) {
    throw new TypeError('"options" must be an object.');
  }
  const { relaxed = false } = options;
  if (typeof relaxed !== "boolean") {
    throw new TypeError('"options.relaxed" must be a boolean.');
  }
  const re = relaxed ? regexRelaxed : regexStrict;
  re.lastIndex = 0;
  const m = text.match(re);
  return m && m.length ? m : null;
}

/**
 * テキストに冷笑パターンが含まれるかを判定する。
 * @param text 検査対象の文字列
 * @param options.relaxed true で検知範囲を拡大する (デフォルト: false)
 */
export function contains(text: string, options: DowaOptions = {}): boolean {
  return !!findAll(text, options);
}

export { regexStrict, regexRelaxed };

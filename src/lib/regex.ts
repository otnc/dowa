import { patterns, resolveSource } from "./patterns";

function build(relaxedMode: boolean): RegExp {
  // strict なパターンを常に先に並べる。正規表現の選択肢(|)は最初に
  // マッチしたものを採用するため、順序が逆だと "爆笑" のような
  // relaxed専用の短い一致が "(?:爆笑){2,}" より先に取られてしまう。
  const relevant = relaxedMode
    ? [
        ...patterns.filter((p) => p.strict),
        ...patterns.filter((p) => !p.strict),
      ]
    : patterns.filter((p) => p.strict);
  // stem/yan由来のパターンは、strict/relaxedいずれのモードで組み立てるかに
  // よって語尾条件(STEM_SUFFIX)自体が変わるため、resolveSourceにモードを渡す。
  const sources = relevant.map((p) => `(?:${resolveSource(p, relaxedMode)})`);
  return new RegExp(sources.join("|"), "gu");
}

export const regexStrict: RegExp = build(false);
export const regexRelaxed: RegExp = build(true);

/** テキストにマッチした冷笑パターンの配列を返す(なければnull) */
export function match(text: string, relaxed: boolean): string[] | null {
  const re = relaxed ? regexRelaxed : regexStrict;
  re.lastIndex = 0;
  const m = text.match(re);
  return m && m.length ? m : null;
}

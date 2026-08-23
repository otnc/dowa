import { patterns } from "./patterns";

function build(includeRelaxedOnly: boolean): RegExp {
  // strict なパターンを常に先に並べる。正規表現の選択肢(|)は最初に
  // マッチしたものを採用するため、順序が逆だと "爆笑" のような
  // relaxed専用の短い一致が "(?:爆笑){2,}" より先に取られてしまう。
  const relevant = includeRelaxedOnly
    ? [
        ...patterns.filter((p) => p.strict),
        ...patterns.filter((p) => !p.strict),
      ]
    : patterns.filter((p) => p.strict);
  const sources = relevant.map((p) => `(?:${p.source})`);
  return new RegExp(sources.join("|"), "gu");
}

export const regexStrict: RegExp = build(false);
export const regexRelaxed: RegExp = build(true);

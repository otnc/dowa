/**
 * \u
 * 1F605: 😅
 * 1F923: 🤣
 * 203C FE0F: ‼️
 */
export const regexStrict: RegExp =
  /(?:\u{1F605}|\u{1F923}|\u{203C}\u{FE0F}?|(?:[きキｷ][ちチﾁ]|[おぉオォｵｫ][うぅウゥｳｩ]|[うぅウゥｳｩ][おぉオォｵｫ]|[どドﾄﾞ][わゎワヮ]|[っッｯ][たタﾀ][くクｸ]|[よヨﾖ][せセｾ][やヤﾔ][いイｲ]|[あアｱ][たタﾀ](?:ぼ|ボ|ﾎﾞ)[うウｳ][よヨﾖ]|[てテﾃ][やヤﾔ][んンﾝ](?:で|デ|ﾃﾞ)[いイｲ])[-ｰー～っッｯ…]*(?:[wｗ]+|(?:(?:爆笑)|笑)+|[（(]笑[）)] )|あ[ぁあ]?、?そういう[ノﾉ][リﾘ][…]*[wｗ]+|(?:爆笑){2,}|(?:冷笑){2,}|[（(]笑[）)])/gu;
/**
 * 1F4A6: 💦
 */
export const relaxedOnly: RegExp =
  /(?:[うぅウゥｳｩ][おぉオォｵｫ]|[どドﾄﾞ][わゎワヮ])[-ｰー～っッｯ]*|爆笑|冷笑|(?:\u{1F4A6})/gu;
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

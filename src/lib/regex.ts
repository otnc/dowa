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

function mergeRegex(r1: RegExp, r2: RegExp): RegExp {
  const flags = Array.from(new Set((r1.flags + r2.flags).split(""))).join("");
  const src = `(?:${r1.source})|(?:${r2.source})`;
  return new RegExp(src, flags);
}

export const regexRelaxed: RegExp = mergeRegex(regexStrict, relaxedOnly);

export interface PatternDefinition {
  id: string;
  /** true: strict(既定)に含む / false: relaxedのときだけ含む */
  strict: boolean;
  /** 正規表現ソース(フラグなし) */
  source: string;
  /** マッチするはずのサンプル(自動テストに使用) */
  samples: string[];
}

// 語幹の異表記(ひらがな/カタカナ/半角カナ)をまとめた文字クラス
const KI = "きキｷ";
const CHI = "ちチﾁ";
const O = "おぉオォｵｫ";
const U = "うぅウゥｳｩ";
const DO = "どドﾄﾞ";
const WA = "わゎワヮﾜ";
const SA = "さサｻ";
const MU = "むムﾑ";
const I = "いぃイィｲｨ";
const TA = "たタﾀ";
const MO = "もモﾓ";

// 語幹の後に続く「伸ばし棒/促音の繰り返し」+「！/？」+「w/笑/爆笑/(笑)」
const STEM_SUFFIX =
  "[-ｰー～っッｯ]*[！!？?]*(?:[wｗ]+|(?:(?:爆笑)|笑)+|[（(]笑[）)])";
const stem = (a: string, b: string) => `[${a}][${b}]${STEM_SUFFIX}`;

export const patterns: PatternDefinition[] = [
  // --- 絵文字 (strict) ---
  {
    id: "emoji-sweat-smile",
    strict: true,
    source: "\\u{1F605}",
    samples: ["これは😅です"],
  },
  {
    id: "emoji-rofl",
    strict: true,
    source: "\\u{1F923}",
    samples: ["爆笑🤣爆笑"],
  },
  {
    id: "emoji-double-exclamation",
    strict: true,
    source: "\\u{203C}\\u{FE0F}?",
    samples: ["本当‼️"],
  },
  { id: "emoji-bang", strict: true, source: "\\u{2757}", samples: ["早く❗"] },
  {
    id: "emoji-question",
    strict: true,
    source: "\\u{2753}",
    samples: ["は❓"],
  },
  {
    id: "emoji-interrobang",
    strict: true,
    source: "\\u{2049}\\u{FE0F}?",
    samples: ["は⁉️"],
  },
  {
    id: "emoji-eye-roll",
    strict: true,
    source: "\\u{1F644}",
    samples: ["は？🙄"],
  },
  {
    id: "emoji-smirk",
    strict: true,
    source: "\\u{1F60F}",
    samples: ["それな😏"],
  },
  {
    id: "emoji-clown",
    strict: true,
    source: "\\u{1F921}",
    samples: ["🤡だなw"],
  },

  // --- 絵文字 (relaxedのみ: 単体だと冷笑と断定しづらいもの) ---
  {
    id: "emoji-sweat-drop",
    strict: false,
    source: "\\u{1F4A6}",
    samples: ["いや💦"],
  },
  {
    id: "emoji-expressionless",
    strict: false,
    source: "\\u{1F611}",
    samples: ["😑"],
  },
  {
    id: "emoji-upside-down",
    strict: false,
    source: "\\u{1F643}",
    samples: ["🙃"],
  },
  { id: "emoji-skull", strict: false, source: "\\u{1F480}", samples: ["💀"] },
  { id: "emoji-melting", strict: false, source: "\\u{1FAE0}", samples: ["🫠"] },

  // --- 語幹 + w/笑/爆笑/(笑) (strict) ---
  {
    id: "stem-kichi",
    strict: true,
    source: stem(KI, CHI),
    samples: ["きちーｗ"],
  },
  { id: "stem-ou", strict: true, source: stem(O, U), samples: ["お、おうｗ"] },
  { id: "stem-uo", strict: true, source: stem(U, O), samples: ["うおw"] },
  { id: "stem-dowa", strict: true, source: stem(DO, WA), samples: ["どわーw"] },
  { id: "stem-uwa", strict: true, source: stem(U, WA), samples: ["うわw"] },
  { id: "stem-samu", strict: true, source: stem(SA, MU), samples: ["さむw"] },
  { id: "stem-ita", strict: true, source: stem(I, TA), samples: ["いたw"] },
  { id: "stem-kimo", strict: true, source: stem(KI, MO), samples: ["きもw"] },

  // --- 語幹単体 (relaxedのみ: 語尾のw/笑がなくても検知する) ---
  {
    id: "bare-uo",
    strict: false,
    source: `[${U}][${O}][-ｰー～っッｯ]*`,
    samples: ["うお"],
  },
  {
    id: "bare-dowa",
    strict: false,
    source: `[${DO}][${WA}][-ｰー～っッｯ]*`,
    samples: ["どわ"],
  },
  { id: "bare-bakushou", strict: false, source: "爆笑", samples: ["爆笑"] },
  { id: "bare-reishou", strict: false, source: "冷笑", samples: ["冷笑"] },

  // --- 繰り返しパターン (strict) ---
  {
    id: "repeat-bakushou",
    strict: true,
    source: "(?:爆笑){2,}",
    samples: ["爆笑爆笑"],
  },
  {
    id: "repeat-reishou",
    strict: true,
    source: "(?:冷笑){2,}",
    samples: ["冷笑冷笑"],
  },
  { id: "repeat-warai", strict: true, source: "(?:笑){2,}", samples: ["笑笑"] },
  {
    id: "paren-warai",
    strict: true,
    source: "[（(]笑[）)]",
    samples: ["(笑)", "（笑）"],
  },

  // --- フレーズ系(strict) ---
  // 元ネタ: https://note.com/kido_meigen/n/nc0fb2d47f6f6 / https://w.atwiki.jp/reisyou/pages/10.html
  {
    id: "phrase-kakke",
    strict: true,
    source: `かっけ${STEM_SUFFIX}`,
    samples: ["かっけーw"],
  },
  {
    id: "phrase-kakkoyo",
    strict: true,
    source: `かっこよ${STEM_SUFFIX}`,
    samples: ["かっこよw"],
  },
  {
    id: "phrase-egui",
    strict: true,
    source: `えぐ${STEM_SUFFIX}`,
    samples: ["えぐー！笑"],
  },
  {
    id: "phrase-do-doshita",
    strict: true,
    source: `ど、?どした${STEM_SUFFIX}`,
    samples: ["ど、どした？笑"],
  },
  {
    id: "phrase-joudan-desu-yan",
    strict: true,
    source: `冗談ですやん${STEM_SUFFIX}`,
    samples: ["冗談ですやん！！w"],
  },
  {
    id: "phrase-hisshi-yan",
    strict: true,
    source: `必死やん${STEM_SUFFIX}`,
    samples: ["必死やんww"],
  },
  {
    id: "phrase-sonna-nori",
    strict: true,
    source: `そういうノリ[…\\.･]*${STEM_SUFFIX}`,
    samples: ["そういうノリ...w"],
  },

  // --- フレーズ系(relaxedのみ: 単体では冷笑以外の文脈でも頻出するため) ---
  {
    id: "phrase-cho",
    strict: false,
    source: `ちょ${STEM_SUFFIX}`,
    samples: ["ちょw"],
  },
  {
    id: "phrase-mattaku",
    strict: false,
    source: `ったく${STEM_SUFFIX}`,
    samples: ["ったくw"],
  },
  {
    id: "phrase-omoroi",
    strict: false,
    source: `おもろいな[あぁ]?${STEM_SUFFIX}`,
    samples: ["おもろいなあww"],
  },
  {
    id: "phrase-sugoi",
    strict: false,
    source: `すごいな[あぁ]?${STEM_SUFFIX}`,
    samples: ["すごいなあww"],
  },
];

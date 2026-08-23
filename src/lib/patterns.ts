export interface PatternDefinition {
  id: string;
  label: string;
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

// 語幹の後に続く「伸ばし棒/促音の繰り返し」+「w/笑/爆笑/(笑)」
const STEM_SUFFIX = "[-ｰー～っッｯ]*(?:[wｗ]+|(?:(?:爆笑)|笑)+|[（(]笑[）)])";
const stem = (a: string, b: string) => `[${a}][${b}]${STEM_SUFFIX}`;

export const patterns: PatternDefinition[] = [
  // --- 絵文字 (strict) ---
  {
    id: "emoji-sweat-smile",
    label: "😅",
    strict: true,
    source: "\\u{1F605}",
    samples: ["これは😅です"],
  },
  {
    id: "emoji-rofl",
    label: "🤣",
    strict: true,
    source: "\\u{1F923}",
    samples: ["爆笑🤣爆笑"],
  },
  {
    id: "emoji-double-exclamation",
    label: "‼️",
    strict: true,
    source: "\\u{203C}\\u{FE0F}?",
    samples: ["本当‼️?"],
  },
  {
    id: "emoji-eye-roll",
    label: "🙄 (白目/呆れ)",
    strict: true,
    source: "\\u{1F644}",
    samples: ["は？🙄"],
  },
  {
    id: "emoji-smirk",
    label: "😏 (ニヤリ)",
    strict: true,
    source: "\\u{1F60F}",
    samples: ["それな😏"],
  },
  {
    id: "emoji-clown",
    label: "🤡 (道化=馬鹿にする)",
    strict: true,
    source: "\\u{1F921}",
    samples: ["🤡だなw"],
  },

  // --- 絵文字 (relaxedのみ: 単体だと冷笑と断定しづらいもの) ---
  {
    id: "emoji-sweat-drop",
    label: "💦",
    strict: false,
    source: "\\u{1F4A6}",
    samples: ["いや💦"],
  },
  {
    id: "emoji-expressionless",
    label: "😑",
    strict: false,
    source: "\\u{1F611}",
    samples: ["😑"],
  },
  {
    id: "emoji-upside-down",
    label: "🙃 (皮肉)",
    strict: false,
    source: "\\u{1F643}",
    samples: ["🙃"],
  },
  {
    id: "emoji-skull",
    label: "💀",
    strict: false,
    source: "\\u{1F480}",
    samples: ["💀"],
  },
  {
    id: "emoji-melting",
    label: "🫠",
    strict: false,
    source: "\\u{1FAE0}",
    samples: ["🫠"],
  },

  // --- 語幹 + w/笑/爆笑/(笑) (strict, 既存4種) ---
  {
    id: "stem-kichi",
    label: "きち",
    strict: true,
    source: stem(KI, CHI),
    samples: ["きちーｗ"],
  },
  {
    id: "stem-ou",
    label: "おう",
    strict: true,
    source: stem(O, U),
    samples: ["お、おうｗ"],
  },
  {
    id: "stem-uo",
    label: "うお",
    strict: true,
    source: stem(U, O),
    samples: ["うおw"],
  },
  {
    id: "stem-dowa",
    label: "どわ",
    strict: true,
    source: stem(DO, WA),
    samples: ["どわーw"],
  },

  // --- 語幹 + w/笑/爆笑/(笑) (strict, 新規追加候補) ---
  {
    id: "stem-uwa",
    label: "うわ",
    strict: true,
    source: stem(U, WA),
    samples: ["うわw"],
  },
  {
    id: "stem-samu",
    label: "さむ (寒い=しらける)",
    strict: true,
    source: stem(SA, MU),
    samples: ["さむw"],
  },
  {
    id: "stem-ita",
    label: "いた (痛い=イタい)",
    strict: true,
    source: stem(I, TA),
    samples: ["いたw"],
  },
  {
    id: "stem-kimo",
    label: "きも (気持ち悪い)",
    strict: true,
    source: stem(KI, MO),
    samples: ["きもw"],
  },

  // --- 語幹単体 (relaxedのみ: 語尾のw/笑がなくても検知する) ---
  {
    id: "bare-uo",
    label: "うお (語尾なし)",
    strict: false,
    source: `[${U}][${O}][-ｰー～っッｯ]*`,
    samples: ["うお"],
  },
  {
    id: "bare-dowa",
    label: "どわ (語尾なし)",
    strict: false,
    source: `[${DO}][${WA}][-ｰー～っッｯ]*`,
    samples: ["どわ"],
  },
  {
    id: "bare-bakushou",
    label: "爆笑 (1回のみ、relaxedのみ)",
    strict: false,
    source: "爆笑",
    samples: ["爆笑"],
  },
  {
    id: "bare-reishou",
    label: "冷笑 (1回のみ、relaxedのみ)",
    strict: false,
    source: "冷笑",
    samples: ["冷笑"],
  },

  // --- 繰り返しパターン (strict) ---
  {
    id: "repeat-bakushou",
    label: "爆笑2回以上",
    strict: true,
    source: "(?:爆笑){2,}",
    samples: ["爆笑爆笑"],
  },
  {
    id: "repeat-reishou",
    label: "冷笑2回以上",
    strict: true,
    source: "(?:冷笑){2,}",
    samples: ["冷笑冷笑"],
  },
  {
    id: "repeat-warai",
    label: "笑2回以上 (新規)",
    strict: true,
    source: "(?:笑){2,}",
    samples: ["笑笑"],
  },
  {
    id: "paren-warai",
    label: "(笑)/（笑）",
    strict: true,
    source: "[（(]笑[）)]",
    samples: ["(笑)", "（笑）"],
  },
];

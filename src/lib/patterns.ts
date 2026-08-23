export interface PatternDefinition {
  id: string;
  /** true: strict(既定)に含む / false: relaxedのときだけ含む */
  strict: boolean;
  /** 正規表現ソース(フラグなし) */
  source: string;
  /** マッチするはずのサンプル(自動テストに使用) */
  samples: string[];
}

// モーラ単位の異表記(ひらがな/カタカナ/半角カナ)。そのまま連結できるように
// 単独モーラは文字クラス `[...]`、半角に濁点合成が必要なモーラ(が/ざ/だ行など)
// は `(?:...)` の選択構造にしている(半角カナの濁点は「ﾄ」+「ﾞ」の2文字のため
// 文字クラスでは表現できない)。
const A = "[あぁアァｱｧ]";
const CHI = "[ちチﾁ]";
const DO = "(?:ど|ド|ﾄﾞ)";
const E = "[えぇエェｴｪ]";
const GO = "(?:ご|ゴ|ｺﾞ)";
const GU = "(?:ぐ|グ|ｸﾞ)";
const I = "[いぃイィｲｨ]";
const KA = "[かカｶ]";
const KE = "[けケｹ]";
const KI = "[きキｷ]";
const KO = "[こコｺ]";
const KU = "[くクｸ]";
const MO = "[もモﾓ]";
const MU = "[むムﾑ]";
const NA = "[なナﾅ]";
const O = "[おぉオォｵｫ]";
const RO = "[ろロﾛ]";
const SA = "[さサｻ]";
const SHI = "[しシｼ]";
const SMALL_TSU = "[っッｯ]";
const SMALL_YO = "[ょョｮ]";
const SO = "[そソｿ]";
const SU = "[すスｽ]";
const TA = "[たタﾀ]";
const U = "[うぅウゥｳｩ]";
const WA = "[わゎワヮﾜ]";
const YO = "[よヨﾖ]";

// 語幹の後に続く「伸ばし棒/促音の繰り返し」+「！/？」+「w/笑/爆笑/(笑)」
const STEM_SUFFIX =
  "[-ｰー～っッｯ]*[！!？?]*(?:[wｗ]+|(?:(?:爆笑)|笑)+|[（(]笑[）)])";
// モーラ断片を連結して語幹+STEM_SUFFIXの正規表現ソースを作る
const stem = (...parts: string[]) => parts.join("") + STEM_SUFFIX;
// 語尾(w/笑など)を要求しない語幹単体(伸ばし棒の繰り返しのみ許容)
const bare = (...parts: string[]) => parts.join("") + "[-ｰー～っッｯ]*";

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
  { id: "stem-kita", strict: true, source: stem(KI, TA), samples: ["きたーw"] },

  // --- 語幹単体 (relaxedのみ: 語尾のw/笑がなくても検知する) ---
  { id: "bare-uo", strict: false, source: bare(U, O), samples: ["うお"] },
  { id: "bare-dowa", strict: false, source: bare(DO, WA), samples: ["どわ"] },
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
  // 「冗談ですやん」「必死やん」は漢字を含み仮名の読み替えが素直に作れないため
  // カタカナ/半角カナ対応は見送り、リテラルのまま。
  {
    id: "phrase-kakke",
    strict: true,
    source: stem(KA, SMALL_TSU, KE),
    samples: ["かっけーw"],
  },
  {
    id: "phrase-kakkoyo",
    strict: true,
    source: stem(KA, SMALL_TSU, KO, YO),
    samples: ["かっこよw"],
  },
  {
    id: "phrase-egui",
    strict: true,
    source: stem(E, GU),
    samples: ["えぐー！笑"],
  },
  {
    id: "phrase-do-doshita",
    strict: true,
    source: stem(DO, "[、,]?", DO, SHI, TA),
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
    source: stem(SO, U, I, U, "ノリ[…\\.･]*"),
    samples: ["そういうノリ...w"],
  },

  // --- フレーズ系(relaxedのみ: 単体では冷笑以外の文脈でも頻出するため) ---
  {
    id: "phrase-cho",
    strict: false,
    source: stem(CHI, SMALL_YO),
    samples: ["ちょw"],
  },
  {
    id: "phrase-mattaku",
    strict: false,
    source: stem(SMALL_TSU, TA, KU),
    samples: ["ったくw"],
  },
  {
    id: "phrase-omoroi",
    strict: false,
    source: stem(O, MO, RO, I, NA, `${A}?`),
    samples: ["おもろいなあww"],
  },
  {
    id: "phrase-sugoi",
    strict: false,
    source: stem(SU, GO, I, NA, `${A}?`),
    samples: ["すごいなあww"],
  },
];

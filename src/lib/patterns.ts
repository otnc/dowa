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
const N = "[んンﾝ]";
const NA = "[なナﾅ]";
const NO = "[のノﾉ]";
const O = "[おぉオォｵｫ]";
const RI = "[りリﾘ]";
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
const YA = "[やヤﾔ]";
const YO = "[よヨﾖ]";

// 語幹の後に続く「伸ばし棒/促音の繰り返し」+「！/？」+「w/笑/爆笑/(笑)」
const STEM_SUFFIX =
  "[-ｰー～っッｯ]*[！!？?❗❓]*(?:[wｗ]+|(?:(?:爆笑)|笑)+|[（(]笑[）)])";
// モーラ断片を連結して語幹+STEM_SUFFIXの正規表現ソースを作る
const stem = (...parts: string[]) => parts.join("") + STEM_SUFFIX;
// 語尾(w/笑など)を要求しない語幹単体(伸ばし棒の繰り返しのみ許容)
const bare = (...parts: string[]) => parts.join("") + "[-ｰー～っッｯ]*";
// 「(です)やん」で終わる冷笑フレーズ共通のビルダー
const yan = (word = "") => `${word}(?:です)?やん${STEM_SUFFIX}`;

export const patterns: PatternDefinition[] = [
  // --- 絵文字 (strict) ---
  {
    id: "emoji-sweat-smile",
    strict: true,
    source: "\\u{1F605}", // 😅
    samples: ["それはさすがに草😅"],
  },
  {
    id: "emoji-rofl",
    strict: true,
    source: "\\u{1F923}", // 🤣
    samples: ["それ何回同じネタやってんの🤣🤣"],
  },
  {
    id: "emoji-double-exclamation",
    strict: true,
    source: "\\u{203C}\\u{FE0F}?", // ‼️
    samples: ["は？そんなことある‼️"],
  },
  {
    id: "emoji-bang",
    strict: true,
    source: "\\u{2757}\\u{FE0F}?", // ❗
    samples: ["それはさすがに無理があるだろ❗"],
  },
  {
    id: "emoji-question",
    strict: true,
    source: "\\u{2753}\\u{FE0F}?", // ❓
    samples: ["は❓意味わからんのだが"],
  },
  {
    id: "emoji-interrobang",
    strict: true,
    source: "\\u{2049}\\u{FE0F}?", // ⁉️
    samples: ["まじで言ってる⁉️"],
  },
  {
    id: "emoji-eye-roll",
    strict: true,
    source: "\\u{1F644}", // 🙄
    samples: ["はいはい、また同じ話🙄"],
  },
  {
    id: "emoji-smirk",
    strict: true,
    source: "\\u{1F60F}", // 😏
    samples: ["それな、知ってた😏"],
  },
  {
    id: "emoji-clown",
    strict: true,
    source: "\\u{1F921}", // 🤡
    samples: ["自分だけ気づいてない🤡"],
  },

  // --- 絵文字 (relaxedのみ: 単体だと冷笑と断定しづらいもの) ---
  {
    id: "emoji-sweat-drop",
    strict: false,
    source: "\\u{1F4A6}", // 💦
    samples: ["それはさすがに草だわ💦"],
  },
  {
    id: "emoji-expressionless",
    strict: false,
    source: "\\u{1F611}", // 😑
    samples: ["……😑"],
  },
  {
    id: "emoji-upside-down",
    strict: false,
    source: "\\u{1F643}", // 🙃
    samples: ["はいはい、そうですね🙃"],
  },
  {
    id: "emoji-skull",
    strict: false,
    source: "\\u{1F480}", // 💀
    samples: ["その理論はさすがに無理💀"],
  },
  {
    id: "emoji-melting",
    strict: false,
    source: "\\u{1FAE0}", // 🫠
    samples: ["見てるだけでしんど🫠"],
  },

  // --- 語幹 + w/笑/爆笑/(笑) (strict) ---
  {
    id: "stem-kichi",
    strict: true,
    source: stem(KI, CHI),
    samples: ["きちーｗ急に早口になってて草"],
  },
  {
    id: "stem-ou",
    strict: true,
    source: stem(O, U),
    samples: ["お、おうｗそれは良かったな"],
  },
  {
    id: "stem-uo",
    strict: true,
    source: stem(U, O),
    samples: ["うおw急にキレ出してて草"],
  },
  {
    id: "stem-dowa",
    strict: true,
    source: stem(DO, WA),
    samples: ["どわーwww必死すぎん"],
  },
  {
    id: "stem-uwa",
    strict: true,
    source: stem(U, WA),
    samples: ["うわw自分で気づいてないんかな"],
  },
  {
    id: "stem-samu",
    strict: true,
    source: stem(SA, MU),
    samples: ["そのノリさむw誰も乗ってないよ"],
  },
  {
    id: "stem-ita",
    strict: true,
    source: stem(I, TA),
    samples: ["それいたw自覚ないの草"],
  },
  {
    id: "stem-kimo",
    strict: true,
    source: stem(KI, MO),
    samples: ["その言い方きもwドン引きだわ"],
  },
  {
    id: "stem-kita",
    strict: true,
    source: stem(KI, TA),
    samples: ["きたーw予想通りの反応で草"],
  },

  // --- 語幹 + w/笑/爆笑/(笑) (relaxedのみ: 単体では冷笑以外の文脈でも頻出するため) ---
  {
    id: "stem-iya",
    strict: false,
    source: stem(I, YA),
    samples: ["いやwそれは草すぎるでしょ"],
  },

  // --- 語幹単体 (relaxedのみ: 語尾のw/笑がなくても検知する) ---
  {
    id: "bare-uo",
    strict: false,
    source: bare(U, O),
    samples: ["うお、うお、しか言えなくなってて草"],
  },
  {
    id: "bare-dowa",
    strict: false,
    source: bare(DO, WA),
    samples: ["どわ…しか反応できてなくて草"],
  },
  {
    id: "bare-bakushou",
    strict: false,
    source: "爆笑",
    samples: ["その返し思わず爆笑してしまった"],
  },
  {
    id: "bare-reishou",
    strict: false,
    source: "冷笑",
    samples: ["これが世に言う冷笑ってやつか"],
  },

  // --- 繰り返しパターン (strict) ---
  {
    id: "repeat-bakushou",
    strict: true,
    source: "(?:爆笑){2,}",
    samples: ["その言い訳マジで爆笑爆笑"],
  },
  {
    id: "repeat-reishou",
    strict: true,
    source: "(?:冷笑){2,}",
    samples: ["これぞ正統派の冷笑冷笑という感じ"],
  },
  {
    id: "repeat-warai",
    strict: true,
    source: "(?:笑){2,}",
    samples: ["それは草生えるわ笑笑"],
  },
  {
    id: "paren-warai",
    strict: true,
    source: "[（(]笑[）)]",
    samples: ["はいはい、すごいですね（笑）"],
  },

  // --- フレーズ系(strict) ---
  {
    id: "phrase-kakke",
    strict: true,
    source: stem(KA, SMALL_TSU, KE),
    samples: ["かっけーwイキっててウケる"],
  },
  {
    id: "phrase-kakkoyo",
    strict: true,
    source: stem(KA, SMALL_TSU, KO, YO),
    samples: ["かっこよwナルシストかよ"],
  },
  {
    id: "phrase-egui",
    strict: true,
    source: stem(E, GU),
    samples: ["その自己評価えぐー！笑"],
  },
  {
    id: "phrase-do-doshita",
    strict: true,
    source: stem(DO, "[、,]?", DO, SHI, TA, `${N}?`),
    samples: ["ど、どした？笑 急に早口になって"],
  },
  // 「必死やんw」「冗談ですやんw」など、前の語を問わず「(です)やん」+ 語尾で
  // 冷笑的な相槌として使われる構文
  {
    id: "phrase-yan",
    strict: true,
    source: yan(),
    samples: ["それめっちゃ必死ですやんw", "冗談やんwノリ悪いなあ"],
  },
  {
    id: "phrase-sonna-nori",
    strict: true,
    source: stem(SO, U, I, U, NO, RI, "[…\\.･]*"),
    samples: ["あぁ、そういうノリ...w理解した"],
  },

  // --- フレーズ系(relaxedのみ: 単体では冷笑以外の文脈でも頻出するため) ---
  {
    id: "phrase-cho",
    strict: false,
    source: stem(CHI, SMALL_YO),
    samples: ["ちょwそれは草すぎる"],
  },
  {
    id: "phrase-mattaku",
    strict: false,
    source: stem(SMALL_TSU, TA, KU),
    samples: ["ったくwしょうがないやつだな"],
  },
  {
    id: "phrase-omoroi",
    strict: false,
    source: stem(O, MO, RO, I, NA, `${A}?`),
    samples: ["おもろいなあwそのノリ嫌いじゃない"],
  },
  {
    id: "phrase-sugoi",
    strict: false,
    source: stem(SU, GO, I, NA, `${A}?`),
    samples: ["すごいなあwwキミ見損なったわ"],
  },
];

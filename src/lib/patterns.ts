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
const I = "[いぃイィｲｨ]";
const U = "[うぅウゥｳｩ]";
const E = "[えぇエェｴｪ]";
const O = "[おぉオォｵｫ]";
const KA = "[かカｶ]";
const KI = "[きキｷ]";
const KU = "[くクｸ]";
const KE = "[けケｹ]";
const KO = "[こコｺ]";
const GU = "(?:ぐ|グ|ｸﾞ)";
const GO = "(?:ご|ゴ|ｺﾞ)";
const SA = "[さサｻ]";
const SHI = "[しシｼ]";
const SU = "[すスｽ]";
const SE = "[せセｾ]";
const SO = "[そソｿ]";
const TA = "[たタﾀ]";
const CHI = "[ちチﾁ]";
const SMALL_TSU = "[っッｯ]";
const TE = "[てテﾃ]";
const DE = "(?:で|デ|ﾃﾞ)";
const DO = "(?:ど|ド|ﾄﾞ)";
const NA = "[なナﾅ]";
const NO = "[のノﾉ]";
const BO = "(?:ぼ|ボ|ﾎﾞ)";
const MU = "[むムﾑ]";
const MO = "[もモﾓ]";
const YA = "[やヤﾔ]";
const SMALL_YO = "[ょョｮ]";
const YO = "[よヨﾖ]";
const RI = "[りリﾘ]";
const RO = "[ろロﾛ]";
const WA = "[わゎワヮﾜ]";
const N = "[んンﾝ]";

// 語幹の後に続く「伸ばし棒/促音の繰り返し」+「！/？」+「w/笑/爆笑/(笑)」
const STEM_SUFFIX =
  "[-ｰー～っッｯ]*[！!？?❗❓]*(?:[wｗ]+|(?:(?:爆笑)|笑)+|[（(]笑[）)])";
// モーラ断片を連結して語幹+STEM_SUFFIXの正規表現ソースを作る
const stem = (...parts: string[]) => parts.join("") + STEM_SUFFIX;
// 語尾(w/笑など)を要求しない語幹単体(伸ばし棒の繰り返しのみ許容)
const bare = (...parts: string[]) => parts.join("") + "[-ｰー～っッｯ]*";
// 「(です)やん」で終わる冷笑フレーズ共通のビルダー
const yan = (word = "") => `${word}(?:${DE}${SU})?${YA}${N}${STEM_SUFFIX}`;

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
    samples: ["そんな‼️"],
  },
  {
    id: "emoji-bang",
    strict: true,
    source: "\\u{2757}\\u{FE0F}?", // ❗
    samples: ["いいね❗"],
  },
  {
    id: "emoji-question",
    strict: true,
    source: "\\u{2753}\\u{FE0F}?", // ❓
    samples: ["は❓"],
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
    samples: ["はいはい🙄"],
  },
  {
    id: "emoji-smirk",
    strict: true,
    source: "\\u{1F60F}", // 😏
    samples: ["それな😏"],
  },
  {
    id: "emoji-clown",
    strict: true,
    source: "\\u{1F921}", // 🤡
    samples: ["ふっ🤡"],
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
    samples: ["きちーｗ"],
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
    samples: ["うおw"],
  },
  {
    id: "stem-dowa",
    strict: true,
    source: stem(DO, WA),
    samples: ["どわーwww"],
  },
  {
    id: "stem-uwa",
    strict: true,
    source: stem(U, WA),
    samples: ["うわーw"],
  },
  {
    id: "stem-samu",
    strict: true,
    source: stem(SA, MU),
    samples: ["そのノリさむw"],
  },
  {
    id: "stem-ita",
    strict: true,
    source: stem(`${A}?`, I, `${TA}+`),
    samples: ["アイタタタタw"],
  },
  {
    id: "stem-kimo",
    strict: true,
    source: stem(KI, MO),
    samples: ["きもwドン引きだわ"],
  },
  {
    id: "stem-kita",
    strict: true,
    source: stem(KI, TA),
    samples: ["キター！！！！ｗ"],
  },

  // --- 語幹 + w/笑/爆笑/(笑) (relaxedのみ: 単体では冷笑以外の文脈でも頻出するため) ---
  {
    id: "stem-iya",
    strict: false,
    source: stem(I, YA),
    samples: ["いやwそれは草"],
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
    id: "phrase-omoro",
    strict: true,
    source: stem(O, MO, RO, `${I}?`),
    samples: ["おもろwww"]
  },
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
    id: "phrase-doshita",
    strict: true,
    source: stem(DO, SHI, TA, `${N}?`),
    samples: ["ど、どした？笑 急に早口になって"],
  },
  // 「必死やんw」「冗談ですやんw」など、前の語を問わず「(です)やん」+ 語尾で
  // 冷笑的な相槌として使われる構文
  {
    id: "phrase-yan",
    strict: true,
    source: yan(),
    samples: ["めっちゃ必死やんw", "冗談やんwノリ悪いなあ", "冗談ですやんw"],
  },
  {
    id: "phrase-sonna-nori",
    strict: true,
    source: stem(SO, U, I, U, NO, RI, "[…\\.・･]*"),
    samples: ["あぁ、そういうノリ...w理解した"],
  },
  // 「うおwからのけけっwからのひひっwからのどわーwからの…ったくwからの
  // よせやいwからのあらよっとwからのてやんでいw…」のような冷笑チェーン
  // ネタで使われる定型フレーズ
  {
    id: "phrase-yoseyai",
    strict: true,
    source: stem(YO, SE, YA, I),
    samples: ["よせやいw"],
  },
  {
    id: "phrase-atabouyo",
    strict: true,
    source: stem(A, TA, BO, U, YO),
    samples: ["あたぼうよw"],
  },
  {
    id: "phrase-teyandei",
    strict: true,
    source: stem(TE, YA, N, DE, I),
    samples: ["てやんでいw"],
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
    samples: ["おもろいなあwキミw"],
  },
  {
    id: "phrase-sugoi",
    strict: false,
    source: stem(SU, GO, I, NA, `${A}?`),
    samples: ["すごいなあwwキミ見損なったわ"],
  },
];

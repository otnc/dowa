export interface PatternDefinition {
  id: string;
  /** true: strict(既定)に含む / false: relaxedのときだけ含む */
  strict: boolean;
  /** 正規表現ソース(フラグなし)。strict/relaxedで内容が変わる場合は関数 */
  source: string | ((relaxed: boolean) => string);
  /** マッチするはずのサンプル(自動テストに使用) */
  samples: string[];
}

/** パターンのsourceを指定モード向けの正規表現ソース文字列に解決する */
export function resolveSource(
  pattern: PatternDefinition,
  relaxed: boolean
): string {
  return typeof pattern.source === "function"
    ? pattern.source(relaxed)
    : pattern.source;
}

// モーラの異表記(ひらがな/カタカナ/半角カナ)。濁点合成が要るもの(が/ざ/だ行等)は
// 半角カナの濁点が2文字になるため文字クラスではなく(?:...)の選択構造にしている
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
const BA = "(?:ば|バ|ﾊﾞ)";
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

// ！/？: 語尾なしだとstrictは2文字以上、relaxedは1文字以上で許容
const LOW_PUNCT = "[！!？?]";
// ‼️❗❓⁉️: 語尾なしでも常に1文字から許容
const HIGH_PUNCT = "(?:[❗❓]|‼\\u{FE0F}?|⁉\\u{FE0F}?)";
const ANY_PUNCT = `(?:${LOW_PUNCT}|${HIGH_PUNCT})`;
const LAUGH = "(?:[wｗ]+|(?:(?:爆笑)|笑)+|[（(]笑[）)])";
// 語幹+伸ばし棒+記号+語尾。記号だけでも上記の条件を満たせば語尾なしで許容する
const STEM_SUFFIX = (relaxed: boolean): string =>
  "[-ｰー～っッｯ]*(?:" +
  `${ANY_PUNCT}*${LAUGH}` +
  `|${LOW_PUNCT}{${relaxed ? 1 : 2},}` +
  `|${HIGH_PUNCT}+` +
  ")";
// 語幹+STEM_SUFFIXを組み立てる(モードで解決する関数を返す)
const stem =
  (...parts: string[]) =>
  (relaxed: boolean) =>
    parts.join("") + STEM_SUFFIX(relaxed);
// 語尾(w/笑など)を要求しない語幹単体(伸ばし棒の繰り返しのみ許容)
const bare = (...parts: string[]) => parts.join("") + "[-ｰー～っッｯ]*";
// 「(です)やん」で終わる冷笑フレーズ共通のビルダー
const yan =
  (word = "") =>
  (relaxed: boolean) =>
    `${word}(?:${DE}${SU})?${YA}${N}${STEM_SUFFIX(relaxed)}`;

// 手・指のジェスチャー系絵文字に付く肌の色modifier(任意)
const SKIN_TONE = "[\\u{1F3FB}-\\u{1F3FF}]?";

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
  {
    id: "emoji-grin-fist",
    strict: true,
    // 😁 + (✊|👊) の組み合わせ(順不同、✊👊は肌の色modifier許容)
    source: `(?:\\u{1F601}(?:\\u{270A}|\\u{1F44A})${SKIN_TONE}|(?:\\u{270A}|\\u{1F44A})${SKIN_TONE}\\u{1F601})`,
    samples: ["また学校来いよ😁✊", "待ってるからな👊😁"],
  },
  {
    id: "emoji-grin",
    strict: true,
    source: "\\u{1F601}", // 😁
    samples: ["余裕😁"],
  },
  {
    id: "emoji-fist-raised",
    strict: true,
    source: `\\u{270A}${SKIN_TONE}`, // ✊
    samples: ["かかってこいよ✊"],
  },
  {
    id: "emoji-fist-oncoming",
    strict: true,
    source: `\\u{1F44A}${SKIN_TONE}`, // 👊
    samples: ["やる気👊"],
  },
  {
    id: "emoji-point-at-viewer",
    strict: true,
    source: `\\u{1FAF5}${SKIN_TONE}`, // 🫵
    samples: ["それお前のことな🫵"],
  },
  {
    id: "emoji-ok-hand",
    strict: true,
    source: `\\u{1F44C}${SKIN_TONE}`, // 👌
    samples: ["了解👌"],
  },
  {
    id: "emoji-joy",
    strict: true,
    source: "\\u{1F602}", // 😂
    samples: ["おけ😂"],
  },
  {
    id: "emoji-grinning",
    strict: true,
    source: "\\u{1F603}", // 😃
    samples: ["すごいですね😃"],
  },
  {
    id: "emoji-tongue",
    strict: true,
    source: "\\u{1F61B}", // 😛
    samples: ["残念😛"],
  },
  {
    id: "emoji-wink-tongue",
    strict: true,
    source: "\\u{1F61C}", // 😜
    samples: ["バレたか😜"],
  },
  {
    id: "emoji-open-mouth",
    strict: true,
    source: "\\u{1F62E}", // 😮
    samples: ["まさかそれ本気で言ってる😮"],
  },
  {
    id: "emoji-astonished",
    strict: true,
    source: "\\u{1F632}", // 😲
    samples: ["それはさすがに草😲"],
  },
  {
    id: "emoji-frowning-open-mouth",
    strict: true,
    source: "\\u{1F626}", // 😦
    samples: ["それは無理があるでしょ😦"],
  },
  {
    id: "emoji-anguished",
    strict: true,
    source: "\\u{1F627}", // 😧
    samples: ["見てて痛々しい😧"],
  },
  {
    id: "emoji-fearful",
    strict: true,
    source: "\\u{1F628}", // 😨
    samples: ["それはさすがにやばい😨"],
  },
  {
    id: "emoji-weary",
    strict: true,
    source: "\\u{1F629}", // 😩
    samples: ["もう見てられない😩"],
  },
  {
    id: "emoji-zany",
    strict: true,
    source: "\\u{1F92A}", // 🤪
    samples: ["それマジで言ってる🤪"],
  },
  {
    id: "emoji-hot-face",
    strict: true,
    source: "\\u{1F975}", // 🥵
    samples: ["必死すぎん🥵"],
  },
  {
    id: "emoji-anxious-sweat",
    strict: true,
    source: "\\u{1F630}", // 😰
    samples: ["それはさすがに焦るわ😰"],
  },
  {
    id: "emoji-scream",
    strict: true,
    source: "\\u{1F631}", // 😱
    samples: ["うそでしょ😱"],
  },
  {
    id: "emoji-nerd",
    strict: true,
    source: "\\u{1F913}", // 🤓
    samples: ["詳しいっすね🤓"],
  },
  {
    id: "emoji-hand-over-mouth",
    strict: true,
    source: "\\u{1F92D}", // 🤭
    samples: ["ぷっ🤭"],
  },
  {
    id: "emoji-eyes-hand-over-mouth",
    strict: true,
    source: "\\u{1FAE2}", // 🫢
    samples: ["まじで言ってるの🫢"],
  },
  {
    id: "emoji-lying",
    strict: true,
    source: "\\u{1F925}", // 🤥
    samples: ["よく言うわ🤥"],
  },
  {
    id: "emoji-cowboy",
    strict: true,
    source: "\\u{1F920}", // 🤠
    samples: ["余裕じゃん🤠"],
  },
  {
    id: "emoji-point-up",
    strict: true,
    source: `\\u{1F446}${SKIN_TONE}`, // 👆
    samples: ["それそれ👆"],
  },
  {
    id: "emoji-point-down",
    strict: true,
    source: `\\u{1F447}${SKIN_TONE}`, // 👇
    samples: ["こいつを見て👇"],
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
  {
    id: "emoji-ok",
    strict: false,
    source: "\\u{1F197}", // 🆗
    samples: ["🆗"],
  },
  {
    id: "emoji-pleading",
    strict: false,
    source: "\\u{1F97A}", // 🥺
    samples: ["許して🥺"],
  },
  {
    id: "emoji-grin-squint",
    strict: false,
    source: "\\u{1F606}", // 😆
    samples: ["それは草😆"],
  },
  {
    id: "emoji-thinking",
    strict: false,
    source: "\\u{1F914}", // 🤔
    samples: ["それ本気で言ってる?🤔"],
  },
  {
    id: "emoji-salute",
    strict: false,
    source: "\\u{1FAE1}", // 🫡
    samples: ["了解しました🫡"],
  },
  {
    id: "emoji-partying",
    strict: false,
    source: "\\u{1F973}", // 🥳
    samples: ["やったぜ🥳"],
  },
  {
    id: "emoji-squint-tongue",
    strict: false,
    source: "\\u{1F61D}", // 😝
    samples: ["ばれちゃった😝"],
  },
  {
    id: "emoji-monocle",
    strict: false,
    source: "\\u{1F9D0}", // 🧐
    samples: ["それで?🧐"],
  },
  {
    id: "emoji-shushing",
    strict: false,
    source: "\\u{1F92B}", // 🤫
    samples: ["へぇ🤫"],
  },
  {
    id: "emoji-shaking",
    strict: false,
    source: "\\u{1FAE8}", // 🫨
    samples: ["それやば🫨"],
  },
  {
    id: "emoji-holding-tears",
    strict: false,
    source: "\\u{1F979}", // 🥹
    samples: ["感動した🥹"],
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
    samples: ["お、おうｗ"],
  },
  {
    id: "stem-uo",
    strict: true,
    source: stem(U, O),
    samples: ["うおw"],
  },
  {
    id: "stem-oke",
    strict: true,
    source: stem(O, KE),
    samples: ["おけ（笑）"],
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
    id: "stem-yaba",
    strict: true,
    source: stem(YA, BA),
    samples: ["それヤバ笑"],
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
    samples: ["う、うお、しか言えなくなってて草"],
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
    samples: ["おもろwww"],
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
  // 「(です)やん」+ 語尾の冷笑的な相槌
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
  // 冷笑チェーンネタで使われる定型フレーズ
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

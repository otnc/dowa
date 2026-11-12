import { describe, test, expect } from "vitest";
import {
  findAll,
  contains,
  findMatches,
  mask,
  createRegExp,
  patterns,
} from "../src/index";

describe("findAll / contains", () => {
  test("基本的な検出", () => {
    expect(contains("うおw")).toBe(true);
    expect(contains("普通の文章です")).toBe(false);
  });

  test("見つからなければ空配列を返す", () => {
    expect(findAll("普通の文章です")).toEqual([]);
  });

  test("relaxedモードでのみ検知するパターン", () => {
    expect(contains("いや💦")).toBe(false);
    expect(contains("いや💦", { relaxed: true })).toBe(true);
  });

  test("(笑)は語幹込みで一致する(旧実装では語幹が欠落するバグがあった)", () => {
    expect(findAll("うお(笑)")).toEqual(["うお(笑)"]);
    expect(findAll("どわー（笑）")).toEqual(["どわー（笑）"]);
  });

  test("複数マッチ", () => {
    expect(findAll("うおうおうおｗ、爆笑爆笑")).toEqual(["うおｗ", "爆笑爆笑"]);
    expect(findAll("うおうおうおｗ、爆笑爆笑", { relaxed: true })).toEqual([
      "うお",
      "うお",
      "うおｗ",
      "爆笑爆笑",
    ]);
  });

  test("単体の爆笑はrelaxedモードでのみ検知する", () => {
    expect(findAll("←うおw、爆笑")).toEqual(["うおw"]);
    expect(findAll("←うおw、爆笑", { relaxed: true })).toEqual([
      "うおw",
      "爆笑",
    ]);
  });

  test("波ダッシュ(〜)と全角チルダ(～)の両方を伸ばし棒として扱う", () => {
    expect(findAll("うお〜〜w")).toEqual(["うお〜〜w"]);
    expect(findAll("うお～～w")).toEqual(["うお～～w"]);
  });

  test("大文字のW/Ｗも笑いとして扱う", () => {
    expect(findAll("うおW")).toEqual(["うおW"]);
    expect(findAll("うおＷＷ")).toEqual(["うおＷＷ"]);
  });

  test("語幹と笑いの間の三点リーダーを許容する", () => {
    expect(findAll("ヤバ…w")).toEqual(["ヤバ…w"]);
  });

  test("不正な引数はTypeErrorを投げる", () => {
    // @ts-expect-error 意図的に不正な型を渡す
    expect(() => findAll(123)).toThrow(TypeError);
    // @ts-expect-error 意図的に不正な型を渡す
    expect(() => contains("text", "invalid")).toThrow(TypeError);
    // @ts-expect-error 意図的に不正な型を渡す
    expect(() => contains("text", { disable: "stem-uo" })).toThrow(TypeError);
  });
});

describe("disable", () => {
  test("指定したパターンを検知から外す", () => {
    expect(contains("うおw", { disable: ["stem-uo"] })).toBe(false);
    expect(findAll("うおw、😅", { disable: ["stem-uo"] })).toEqual(["😅"]);
    expect(
      findMatches("うおw", { disable: ["stem-uo"] }).map((m) => m.patternId)
    ).toEqual([]);
  });

  test("全パターンを外すと何も検知しない(空の正規表現で全位置にマッチしない)", () => {
    const disable = patterns.map((p) => p.id);
    expect(findAll("うおw", { relaxed: true, disable })).toEqual([]);
    expect(contains("うおw", { relaxed: true, disable })).toBe(false);
    expect(mask("うおw", { relaxed: true, disable })).toBe("うおw");
  });

  test("存在しないidはTypeErrorを投げる", () => {
    expect(() => contains("うおw", { disable: ["no-such-id"] })).toThrow(
      /no-such-id/
    );
  });
});

describe("findMatches", () => {
  test("マッチしたパターンのidと位置を返す", () => {
    expect(findMatches("うおうおうおｗ、爆笑爆笑")).toEqual([
      {
        text: "うおｗ",
        index: 4,
        end: 7,
        patternId: "stem-uo",
        strict: true,
      },
      {
        text: "爆笑爆笑",
        index: 8,
        end: 12,
        patternId: "repeat-bakushou",
        strict: true,
      },
    ]);
  });

  test("indexとendはUTF-16コードユニット単位", () => {
    const text = "😅うおw";
    const [, m] = findMatches(text);
    expect(m).toMatchObject({ index: 2, end: 5 });
    expect(text.slice(m?.index, m?.end)).toBe("うおw");
  });

  test("見つからなければ空配列を返す", () => {
    expect(findMatches("普通の文章です")).toEqual([]);
  });

  test("relaxed指定時のみrelaxed専用パターンが含まれる", () => {
    expect(findMatches("いや💦")).toEqual([]);
    const result = findMatches("いや💦", { relaxed: true });
    expect(
      result.every((m) => m.patternId === "emoji-sweat-drop" && !m.strict)
    ).toBe(true);
  });
});

describe("mask", () => {
  test("検知した部分を1文字ごとに*で伏せる", () => {
    expect(mask("うおw、なるほど")).toBe("***、なるほど");
  });

  test("絵文字は肌の色modifier込みで1文字として数える", () => {
    expect(mask("了解👌🏽")).toBe("了解*");
  });

  test("replacementに文字列を渡すとマッチ全体を置き換える", () => {
    expect(mask("うおw、爆笑爆笑", { replacement: "[冷笑]" })).toBe(
      "[冷笑]、[冷笑]"
    );
  });

  test("replacementに関数を渡すとマッチごとに呼ぶ", () => {
    expect(mask("うおw", { replacement: (m) => `<${m}>` })).toBe("<うおw>");
  });

  test("relaxedとdisableが効く", () => {
    expect(mask("どわー")).toBe("どわー");
    expect(mask("どわー", { relaxed: true })).toBe("***");
    expect(mask("うおw😅", { disable: ["stem-uo"] })).toBe("うおw*");
  });

  test("不正なreplacementはTypeErrorを投げる", () => {
    // @ts-expect-error 意図的に不正な型を渡す
    expect(() => mask("うおw", { replacement: 1 })).toThrow(TypeError);
  });
});

describe("createRegExp", () => {
  test("呼ぶたびに新しいRegExpを返す", () => {
    const a = createRegExp();
    const b = createRegExp();
    expect(a).not.toBe(b);
    expect(a.flags).toBe("gu");
    expect(a.test("うおw")).toBe(true);
    expect(a.lastIndex).not.toBe(0);
    expect(b.lastIndex).toBe(0);
    expect(contains("うおw")).toBe(true);
  });

  test("オプションが反映される", () => {
    expect("どわー".match(createRegExp())).toBeNull();
    expect("どわー".match(createRegExp({ relaxed: true }))).toEqual(["どわー"]);
  });
});

describe("patterns", () => {
  test("凍結されていて書き換えられない", () => {
    expect(Object.isFrozen(patterns)).toBe(true);
    expect(() => {
      (patterns[0] as { strict: boolean }).strict = false;
    }).toThrow(TypeError);
  });

  test("idは重複しない", () => {
    const ids = patterns.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// src/lib/patterns.ts にパターンを追加するだけで、そのsamples/negativeSamplesが
// 自動的にテスト対象になる(strict/relaxedの分類と、findAll側/findMatches側の
// 両方の検出経路を検証する)。
describe("パターン別サンプル", () => {
  for (const p of patterns) {
    describe(`[${p.id}]`, () => {
      for (const sample of p.samples) {
        test(`strict -> ${sample}`, () => {
          expect(contains(sample)).toBe(p.strict);
        });
        test(`relaxed -> ${sample}`, () => {
          expect(contains(sample, { relaxed: true })).toBe(true);
        });
        test(`findMatchesにも同じidが含まれる -> ${sample}`, () => {
          const matches = findMatches(sample, { relaxed: true });
          expect(matches.some((m) => m.patternId === p.id)).toBe(true);
        });
      }
      for (const sample of p.negativeSamples) {
        test(`マッチしない -> ${sample}`, () => {
          const matches = findMatches(sample, { relaxed: true });
          expect(matches.map((m) => m.patternId)).not.toContain(p.id);
        });
      }
    });
  }
});

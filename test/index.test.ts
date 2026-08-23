import { describe, test, expect } from "vitest";
import { findAll, contains, findMatches, patterns } from "../src/index";

describe("findAll / contains", () => {
  test("基本的な検出", () => {
    expect(contains("うおw")).toBe(true);
    expect(contains("普通の文章です")).toBe(false);
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

  test("不正な引数はTypeErrorを投げる", () => {
    // @ts-expect-error 意図的に不正な型を渡す
    expect(() => findAll(123)).toThrow(TypeError);
    // @ts-expect-error 意図的に不正な型を渡す
    expect(() => contains("text", "invalid")).toThrow(TypeError);
  });
});

describe("findMatches", () => {
  test("マッチしたパターンのidと位置を返す", () => {
    expect(findMatches("うおうおうおｗ、爆笑爆笑")).toEqual([
      { text: "うおｗ", index: 4, patternId: "stem-uo", strict: true },
      {
        text: "爆笑爆笑",
        index: 8,
        patternId: "repeat-bakushou",
        strict: true,
      },
    ]);
  });

  test("見つからなければnullを返す", () => {
    expect(findMatches("普通の文章です")).toBeNull();
  });

  test("relaxed指定時のみrelaxed専用パターンが含まれる", () => {
    expect(findMatches("いや💦")).toBeNull();
    const result = findMatches("いや💦", { relaxed: true });
    expect(
      result?.every((m) => m.patternId === "emoji-sweat-drop" && !m.strict)
    ).toBe(true);
  });
});

// patterns.ts に PatternDefinition を追加するだけで、そのsamplesが自動的に
// テスト対象になる(strict/relaxedの分類と、findAll側/findMatches側の両方の
// 検出経路を検証する)。
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
          const matches = findMatches(sample, { relaxed: true }) ?? [];
          expect(matches.some((m) => m.patternId === p.id)).toBe(true);
        });
      }
    });
  }
});

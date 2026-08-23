import { describe, test, expect } from "vitest";
import { findMatches, patterns } from "../src/index";

describe("findMatches", () => {
  test("マッチしたパターンのidと位置を返す", () => {
    const result = findMatches("うおうおうおｗ、爆笑爆笑");
    expect(result).toEqual([
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

  test("strictでは検知できずrelaxedでのみ検知するパターンも含まれる", () => {
    const result = findMatches("いや💦", { relaxed: true });
    expect(result).not.toBeNull();
    expect(result?.some((m) => m.patternId === "emoji-sweat-drop")).toBe(true);
    expect(result?.every((m) => m.strict === false)).toBe(true);
  });

  test("relaxed指定なしではrelaxed専用パターンは含まれない", () => {
    expect(findMatches("いや💦")).toBeNull();
  });

  test("不正な引数はTypeErrorを投げる", () => {
    // @ts-expect-error 意図的に不正な型を渡す
    expect(() => findMatches(123)).toThrow(TypeError);
  });
});

describe("patterns", () => {
  test("全パターンのsamplesが自身のstrict/relaxed分類と整合している", () => {
    for (const p of patterns) {
      for (const sample of p.samples) {
        const matches = findMatches(sample, { relaxed: true }) ?? [];
        expect(matches.some((m) => m.patternId === p.id)).toBe(true);
      }
    }
  });
});

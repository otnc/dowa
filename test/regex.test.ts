import { describe, test, expect } from "vitest";
import { findAll, contains } from "../src/index";

type Case = {
  // 例文
  content: string;
  // 単一 or 複数
  expected: boolean | string[];
  // true: relaxedモード
  relaxed?: boolean;
};

// テストケース
const cases: Case[] = [
  // 絵文字: Strict に含めるもの
  { content: "これは😅です", expected: true },
  { content: "爆笑🤣爆笑", expected: true },
  { content: "本当‼️?", expected: true },
  // 絵文字: 💦 は Relaxed のみ
  { content: "いや💦", expected: false },
  { content: "いや💦", expected: true, relaxed: true },
  // 単一
  { content: "爆笑爆笑", expected: true },
  { content: "うおｗ", expected: true },
  { content: "うおw", expected: true },
  { content: "うおｗｗｗｗｗ", expected: true },
  { content: "うおwwwwww", expected: true },
  { content: "うお笑", expected: true },
  { content: "うお笑笑笑笑笑笑笑笑", expected: true },
  { content: "うお（笑）", expected: true },
  { content: "うお(笑)", expected: true },
  { content: "うお爆笑", expected: true },
  { content: "うお爆笑爆笑", expected: true },
  { content: "どわｗ", expected: true },
  { content: "どわw", expected: true },
  { content: "どわwwww", expected: true },
  { content: "どわｗｗｗｗｗ", expected: true },
  { content: "どわーw", expected: true },
  { content: "どわーwwwww", expected: true },
  { content: "どわーｗ", expected: true },
  { content: "どわーｗｗｗｗｗｗ", expected: true },
  { content: "どわー笑", expected: true },
  { content: "どわー笑笑笑笑笑笑", expected: true },
  { content: "どわー（笑）", expected: true },
  { content: "どわー(笑)", expected: true },
  { content: "どわー爆笑", expected: true },
  { content: "どわー爆笑爆笑", expected: true },
  { content: "お、おうｗ", expected: true },
  { content: "きちーｗ", expected: true },
  // (笑) は語幹込みで一致する(旧実装では語幹が欠落するバグがあった)
  { content: "うお(笑)", expected: ["うお(笑)"] },
  { content: "どわー（笑）", expected: ["どわー（笑）"] },
  // 複数マッチ
  { content: "うおうおうおｗ、爆笑爆笑", expected: ["うおｗ", "爆笑爆笑"] },
  {
    content: "うおうおうおｗ、爆笑爆笑",
    expected: ["うお", "うお", "うおｗ", "爆笑爆笑"],
    relaxed: true,
  },
];

describe("冷笑検出", () => {
  cases.forEach((c, i) => {
    const isRelaxed = !!c.relaxed;
    if (typeof c.expected === "boolean") {
      test(`case ${i} [${isRelaxed ? "relaxed" : "strict"}] contains -> ${c.content}`, () => {
        expect(contains(c.content, { relaxed: isRelaxed })).toBe(
          c.expected as boolean
        );
      });
    } else {
      test(`case ${i} [${isRelaxed ? "relaxed" : "strict"}] findAll -> ${c.content}`, () => {
        const res = findAll(c.content, { relaxed: isRelaxed }) || [];
        expect(res).toEqual(c.expected as string[]);
      });
    }
  });
});

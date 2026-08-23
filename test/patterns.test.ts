import { describe, test, expect } from "vitest";
import { contains } from "../src/index";
import { patterns } from "../src/lib/patterns";

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
      }
    });
  }
});

import { describe, test, expect } from "vitest";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { z } from "zod";
import * as v from "valibot";
import { dowaSchema } from "../src/index";

// Standard Schemaの公式ドキュメントで案内されている汎用バリデーションヘルパー。
// zod/valibot/dowaSchemaのいずれもこの1つの関数で扱えることを確認する。
async function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>
): Promise<StandardSchemaV1.InferOutput<T>> {
  let result = schema["~standard"].validate(input);
  if (result instanceof Promise) result = await result;
  if (result.issues) {
    throw new Error(JSON.stringify(result.issues));
  }
  return result.value;
}

describe("dowaSchema", () => {
  test("~standardプロパティを持つ", () => {
    const schema = dowaSchema();
    expect(schema["~standard"].version).toBe(1);
    expect(schema["~standard"].vendor).toBe("dowa");
  });

  test("冷笑がなければvalueを返す", () => {
    const result = dowaSchema()["~standard"].validate("普通の文章です");
    expect(result).toEqual({ value: "普通の文章です" });
  });

  test("冷笑があればissuesを返す", () => {
    const result = dowaSchema()["~standard"].validate("うおw");
    expect("issues" in result && result.issues).toBeTruthy();
    if ("issues" in result && result.issues) {
      expect(result.issues[0]?.message).toContain("うおw");
    }
  });

  test("relaxedオプションで検知範囲が変わる", () => {
    const strictResult = dowaSchema()["~standard"].validate("いや💦");
    expect(strictResult).toEqual({ value: "いや💦" });

    const relaxedResult = dowaSchema({ relaxed: true })["~standard"].validate(
      "いや💦"
    );
    expect("issues" in relaxedResult && relaxedResult.issues).toBeTruthy();
  });

  test("文字列以外はissuesを返す", () => {
    const result = dowaSchema()["~standard"].validate(123);
    expect("issues" in result && result.issues).toBeTruthy();
  });

  test("不正なoptionsはスキーマ生成時にTypeErrorを投げる", () => {
    // @ts-expect-error 意図的に不正な型を渡す
    expect(() => dowaSchema({ relaxed: "yes" })).toThrow(TypeError);
  });

  test("zod/valibotと同じStandardSchemaのインターフェースで扱える", async () => {
    await expect(standardValidate(z.string().min(1), "hello")).resolves.toBe(
      "hello"
    );
    await expect(standardValidate(z.string().min(1), "")).rejects.toThrow();

    await expect(standardValidate(v.string(), "hello")).resolves.toBe("hello");

    await expect(
      standardValidate(dowaSchema(), "普通の文章です")
    ).resolves.toBe("普通の文章です");
    await expect(standardValidate(dowaSchema(), "うおw")).rejects.toThrow();
  });
});

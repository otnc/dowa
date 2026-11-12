import { describe, test, expect } from "vitest";
import { Readable } from "node:stream";
import { run } from "../src/cli/run";
import { version } from "../package.json";

async function cli(
  args: string[],
  stdin?: string
): Promise<{ code: number; stdout: string; stderr: string }> {
  let stdout = "";
  let stderr = "";
  const code = await run(args, {
    stdin: Readable.from(stdin === undefined ? [] : [stdin]),
    stdinIsTTY: stdin === undefined,
    stdout: { write: (s: string) => (stdout += s) },
    stderr: { write: (s: string) => (stderr += s) },
  });
  return { code, stdout, stderr };
}

describe("CLI", () => {
  test("引数のテキストを判定し、検知したら終了コード1", async () => {
    expect(await cli(["うおw、爆笑爆笑"])).toEqual({
      code: 1,
      stdout: "うおw\n爆笑爆笑\n",
      stderr: "",
    });
  });

  test("検知しなければ終了コード0", async () => {
    expect(await cli(["普通の文章です"])).toEqual({
      code: 0,
      stdout: "",
      stderr: "",
    });
  });

  test("標準入力から読む", async () => {
    const result = await cli([], "うおw\n");
    expect(result).toMatchObject({ code: 1, stdout: "うおw\n" });
  });

  test("テキストも標準入力もなければエラー", async () => {
    const result = await cli([]);
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("no text given");
  });

  test("--relaxed", async () => {
    expect((await cli(["どわー"])).code).toBe(0);
    expect(await cli(["-r", "どわー"])).toMatchObject({
      code: 1,
      stdout: "どわー\n",
    });
  });

  test("--disable は複数指定とカンマ区切りに対応する", async () => {
    const result = await cli(
      ["-d", "stem-uo", "--disable", "emoji-sweat-smile,repeat-bakushou"],
      "うおw😅爆笑爆笑"
    );
    expect(result.code).toBe(0);
  });

  test("--disable に存在しないidを渡すとエラー", async () => {
    const result = await cli(["-d", "nope", "うおw"]);
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("nope");
  });

  test("--json はコードポイント単位の位置を返す", async () => {
    const result = await cli(["--json", "😅うおw"]);
    expect(result.code).toBe(1);
    expect(JSON.parse(result.stdout)).toEqual({
      detected: true,
      matches: [
        {
          text: "😅",
          index: 0,
          end: 1,
          patternId: "emoji-sweat-smile",
          strict: true,
        },
        { text: "うおw", index: 1, end: 4, patternId: "stem-uo", strict: true },
      ],
    });
  });

  test("--offset-unit で位置の単位を変えられる", async () => {
    const utf16 = await cli(["--json", "--offset-unit", "utf16", "😅うおw"]);
    expect(JSON.parse(utf16.stdout).matches[1]).toMatchObject({
      index: 2,
      end: 5,
    });
    const utf8 = await cli(["--json", "--offset-unit", "utf8", "😅うおw"]);
    expect(JSON.parse(utf8.stdout).matches[1]).toMatchObject({
      index: 4,
      end: 11,
    });
    expect((await cli(["--offset-unit", "bytes", "x"])).code).toBe(2);
  });

  test("--json で検知しなければ detected: false", async () => {
    const result = await cli(["--json", "普通"]);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ detected: false, matches: [] });
  });

  test("--lines は行番号付きで出力する", async () => {
    const result = await cli(["-l"], "普通\nうおw\r\n\n爆笑爆笑\n");
    expect(result).toMatchObject({ code: 1, stdout: "2:うおw\n4:爆笑爆笑\n" });
  });

  test("--lines --json はJSON Linesで出力する", async () => {
    const result = await cli(["-l", "-j"], "普通\n😅うおw\n");
    const lines = result.stdout
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l));
    expect(lines).toHaveLength(1);
    expect(lines[0].line).toBe(2);
    expect(lines[0].matches[1]).toMatchObject({ text: "うおw", index: 1 });
  });

  test("--mask は伏せ字にしたテキストを出力する", async () => {
    expect(await cli(["-m", "うおw、なるほど"])).toMatchObject({
      code: 1,
      stdout: "***、なるほど\n",
    });
    expect(
      await cli(["-m", "--replacement", "[冷笑]", "うおw、なるほど"])
    ).toMatchObject({ stdout: "[冷笑]、なるほど\n" });
    const json = await cli(["-m", "-j", "うおw"]);
    expect(JSON.parse(json.stdout).masked).toBe("***");
  });

  test("--quiet は何も出力しない", async () => {
    expect(await cli(["-q", "うおw"])).toEqual({
      code: 1,
      stdout: "",
      stderr: "",
    });
  });

  test("--patterns はパターン一覧をJSONで出力する", async () => {
    const result = await cli(["--patterns"]);
    expect(result.code).toBe(0);
    const list = JSON.parse(result.stdout);
    expect(list[0]).toHaveProperty("id");
    expect(list[0]).toHaveProperty("source.strict");
  });

  test("--version / --help", async () => {
    expect((await cli(["-v"])).stdout).toBe(`${version}\n`);
    expect((await cli(["-h"])).stdout).toContain("Usage: dowa");
  });

  test("不明なオプションはエラー", async () => {
    const result = await cli(["--nope"]);
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("--help");
  });

  describe("--stdio", () => {
    test("1行1件のJSONリクエストに応答する", async () => {
      const input = [
        JSON.stringify({ id: 1, text: "うおw" }),
        "",
        JSON.stringify({ id: "b", text: "どわー", relaxed: true, mask: true }),
        JSON.stringify({ id: 3, text: "普通" }),
      ].join("\n");
      const result = await cli(["--stdio"], input);
      expect(result.code).toBe(0);
      const responses = result.stdout
        .trim()
        .split("\n")
        .map((l) => JSON.parse(l));
      expect(responses).toEqual([
        {
          id: 1,
          detected: true,
          matches: [
            {
              text: "うおw",
              index: 0,
              end: 3,
              patternId: "stem-uo",
              strict: true,
            },
          ],
        },
        {
          id: "b",
          detected: true,
          matches: [
            {
              text: "どわー",
              index: 0,
              end: 3,
              patternId: "bare-dowa",
              strict: false,
            },
          ],
          masked: "***",
        },
        { id: 3, detected: false, matches: [] },
      ]);
    });

    test("CLIのオプションが既定値になり、リクエストで上書きできる", async () => {
      const input = [
        JSON.stringify({ id: 1, text: "どわー" }),
        JSON.stringify({ id: 2, text: "どわー", relaxed: false }),
      ].join("\n");
      const responses = (await cli(["--stdio", "-r"], input)).stdout
        .trim()
        .split("\n")
        .map((l) => JSON.parse(l));
      expect(responses.map((r) => r.detected)).toEqual([true, false]);
    });

    test("不正なリクエストにはエラーを返して処理を続ける", async () => {
      const input = [
        "not json",
        JSON.stringify({ id: 2, text: 1 }),
        JSON.stringify({ id: 3, text: "x", disable: ["nope"] }),
        JSON.stringify({ id: 4, text: "うおw" }),
      ].join("\n");
      const responses = (await cli(["--stdio"], input)).stdout
        .trim()
        .split("\n")
        .map((l) => JSON.parse(l));
      expect(responses[0]).toEqual({
        id: null,
        error: "request must be a JSON object",
      });
      expect(responses[1]).toMatchObject({ id: 2, error: expect.any(String) });
      expect(responses[2].error).toContain("nope");
      expect(responses[3]).toMatchObject({ id: 4, detected: true });
    });
  });
});

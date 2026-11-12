import { parseArgs } from "node:util";
import { createInterface } from "node:readline";
import type { Readable } from "node:stream";
import { version } from "../../package.json";
import { findAll, findMatches, mask, patterns, type DowaMatch } from "../index";
import type { DowaOptions } from "../lib/options";

export interface CliIO {
  stdin: Readable;
  stdinIsTTY: boolean;
  stdout: { write(chunk: string): unknown };
  stderr: { write(chunk: string): unknown };
}

export const EXIT_NOT_DETECTED = 0;
export const EXIT_DETECTED = 1;
export const EXIT_ERROR = 2;

const OFFSET_UNITS = ["codepoint", "utf16", "utf8"] as const;
type OffsetUnit = (typeof OFFSET_UNITS)[number];

const HELP = `Usage: dowa [options] [text...]

冷笑を検知しますw
text を省略すると標準入力から読み込みます。

Options:
  -r, --relaxed            検知範囲を拡大する
  -d, --disable <id>       指定したidのパターンを検知から外す (複数指定・カンマ区切り可)
  -l, --lines              1行ずつ判定し、行番号付きで出力する
  -j, --json               結果をJSONで出力する (--lines と併用するとJSON Lines)
  -m, --mask               冷笑を伏せ字にしたテキストを出力する
      --replacement <str>  --mask で使う置き換え文字列 (デフォルト: 1文字ごとに *)
      --offset-unit <unit> JSONの index/end の単位: codepoint (デフォルト), utf16, utf8
  -q, --quiet              何も出力せず、終了コードだけ返す
      --stdio              1行1件のJSONリクエストを読み、JSONで応答し続ける
      --patterns           パターン一覧をJSONで出力する
  -h, --help               このヘルプを表示する
  -v, --version            バージョンを表示する

Exit status:
  0  冷笑なし
  1  冷笑あり
  2  エラー
`;

class UsageError extends Error {}

interface Flags {
  options: Required<DowaOptions>;
  offsetUnit: OffsetUnit;
  replacement: string | undefined;
}

/** CLIを実行して終了コードを返す */
export async function run(argv: string[], io: CliIO): Promise<number> {
  try {
    return await runUnsafe(argv, io);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`dowa: ${message}\n`);
    if (error instanceof UsageError) {
      io.stderr.write("Try 'dowa --help' for more information.\n");
    }
    return EXIT_ERROR;
  }
}

async function runUnsafe(argv: string[], io: CliIO): Promise<number> {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        relaxed: { type: "boolean", short: "r" },
        disable: { type: "string", short: "d", multiple: true },
        lines: { type: "boolean", short: "l" },
        json: { type: "boolean", short: "j" },
        mask: { type: "boolean", short: "m" },
        replacement: { type: "string" },
        "offset-unit": { type: "string" },
        quiet: { type: "boolean", short: "q" },
        stdio: { type: "boolean" },
        patterns: { type: "boolean" },
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "v" },
      },
    });
  } catch (error) {
    throw new UsageError(
      error instanceof Error ? error.message : String(error)
    );
  }
  const { values, positionals } = parsed;

  if (values.help) {
    io.stdout.write(HELP);
    return EXIT_NOT_DETECTED;
  }
  if (values.version) {
    io.stdout.write(`${version}\n`);
    return EXIT_NOT_DETECTED;
  }
  if (values.patterns) {
    io.stdout.write(`${JSON.stringify(patterns, null, 2)}\n`);
    return EXIT_NOT_DETECTED;
  }

  const offsetUnit = values["offset-unit"] ?? "codepoint";
  if (!isOffsetUnit(offsetUnit)) {
    throw new UsageError(
      `--offset-unit must be one of ${OFFSET_UNITS.join(", ")}: ${offsetUnit}`
    );
  }
  const flags: Flags = {
    options: {
      relaxed: values.relaxed ?? false,
      disable: (values.disable ?? []).flatMap((v) =>
        v
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    },
    offsetUnit,
    replacement: values.replacement,
  };
  // 不正なidなどはここで検出して、入力を読む前にエラーにする
  try {
    findAll("", flags.options);
  } catch (error) {
    throw new UsageError(
      error instanceof Error ? error.message : String(error)
    );
  }

  if (values.stdio) {
    if (positionals.length) {
      throw new UsageError("--stdio does not take text arguments");
    }
    await serveStdio(io, flags);
    return EXIT_NOT_DETECTED;
  }

  let text: string;
  if (positionals.length) {
    text = positionals.join(" ");
  } else if (io.stdinIsTTY) {
    throw new UsageError("no text given (pass text as arguments or via stdin)");
  } else {
    text = await readAll(io.stdin);
  }

  const out = values.quiet ? undefined : io.stdout;
  if (values.lines) {
    return checkLines(text, flags, values.json ?? false, out);
  }
  return checkText(
    text,
    flags,
    values.json ?? false,
    values.mask ?? false,
    out
  );
}

function isOffsetUnit(value: string): value is OffsetUnit {
  return (OFFSET_UNITS as readonly string[]).includes(value);
}

async function readAll(stream: Readable): Promise<string> {
  stream.setEncoding("utf8");
  let text = "";
  for await (const chunk of stream) text += chunk;
  return text;
}

function checkText(
  text: string,
  flags: Flags,
  json: boolean,
  masked: boolean,
  out: CliIO["stdout"] | undefined
): number {
  const matches = findMatches(text, flags.options);
  const detected = matches.length > 0;
  if (out) {
    const maskedText = masked ? maskText(text, flags) : undefined;
    if (json) {
      out.write(
        `${JSON.stringify({
          detected,
          matches: convertOffsets(text, matches, flags.offsetUnit),
          ...(maskedText === undefined ? {} : { masked: maskedText }),
        })}\n`
      );
    } else if (maskedText !== undefined) {
      out.write(maskedText.endsWith("\n") ? maskedText : `${maskedText}\n`);
    } else {
      for (const m of findAll(text, flags.options)) out.write(`${m}\n`);
    }
  }
  return detected ? EXIT_DETECTED : EXIT_NOT_DETECTED;
}

function checkLines(
  text: string,
  flags: Flags,
  json: boolean,
  out: CliIO["stdout"] | undefined
): number {
  const lines = text.split(/\r?\n/);
  if (lines.at(-1) === "") lines.pop();
  let detected = false;
  lines.forEach((line, i) => {
    const matches = findMatches(line, flags.options);
    if (!matches.length) return;
    detected = true;
    if (!out) return;
    const lineNumber = i + 1;
    if (json) {
      out.write(
        `${JSON.stringify({
          line: lineNumber,
          matches: convertOffsets(line, matches, flags.offsetUnit),
        })}\n`
      );
    } else {
      for (const m of findAll(line, flags.options)) {
        out.write(`${lineNumber}:${m}\n`);
      }
    }
  });
  return detected ? EXIT_DETECTED : EXIT_NOT_DETECTED;
}

function maskText(text: string, flags: Flags): string {
  return mask(text, { ...flags.options, replacement: flags.replacement });
}

interface StdioRequest {
  id?: unknown;
  text: string;
  relaxed?: boolean;
  disable?: string[];
  mask?: boolean;
  replacement?: string;
}

async function serveStdio(io: CliIO, flags: Flags): Promise<void> {
  const reader = createInterface({ input: io.stdin, crlfDelay: Infinity });
  for await (const line of reader) {
    if (!line.trim()) continue;
    let id: unknown = null;
    try {
      const json = parseJsonObject(line);
      id = json.id ?? null;
      const request = validateRequest(json);
      const options = {
        relaxed: request.relaxed ?? flags.options.relaxed,
        disable: request.disable ?? flags.options.disable,
      };
      const matches = findMatches(request.text, options);
      const masked = request.mask
        ? mask(request.text, {
            ...options,
            replacement: request.replacement ?? flags.replacement,
          })
        : undefined;
      io.stdout.write(
        `${JSON.stringify({
          id,
          detected: matches.length > 0,
          matches: convertOffsets(request.text, matches, flags.offsetUnit),
          ...(masked === undefined ? {} : { masked }),
        })}\n`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      io.stdout.write(`${JSON.stringify({ id, error: message })}\n`);
    }
  }
}

function parseJsonObject(line: string): Record<string, unknown> {
  let json: unknown;
  try {
    json = JSON.parse(line);
  } catch {
    throw new TypeError("request must be a JSON object");
  }
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    throw new TypeError("request must be a JSON object");
  }
  return json as Record<string, unknown>;
}

function validateRequest(r: Record<string, unknown>): StdioRequest {
  if (typeof r.text !== "string") {
    throw new TypeError('"text" must be a string.');
  }
  if (r.mask !== undefined && typeof r.mask !== "boolean") {
    throw new TypeError('"mask" must be a boolean.');
  }
  if (r.replacement !== undefined && typeof r.replacement !== "string") {
    throw new TypeError('"replacement" must be a string.');
  }
  // relaxed/disableはライブラリ側で検証される
  return r as unknown as StdioRequest;
}

/** index/end(UTF-16)を指定の単位に変換する */
function convertOffsets(
  text: string,
  matches: DowaMatch[],
  unit: OffsetUnit
): DowaMatch[] {
  if (unit === "utf16") return matches;
  const toUnit = (utf16Index: number): number => {
    const prefix = text.slice(0, utf16Index);
    return unit === "utf8"
      ? Buffer.byteLength(prefix, "utf8")
      : [...prefix].length;
  };
  return matches.map((m) => ({
    ...m,
    index: toUnit(m.index),
    end: toUnit(m.end),
  }));
}

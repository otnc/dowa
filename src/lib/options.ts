import { patternIds } from "./patterns";

export interface DowaOptions {
  /** 検知範囲を拡大するか (デフォルト: false) */
  relaxed?: boolean;
  /** 検知から外すパターンのid (デフォルト: なし) */
  disable?: readonly string[];
}

export interface ResolvedOptions {
  relaxed: boolean;
  disable: ReadonlySet<string>;
}

/** optionsを検証し、内部で使う形に正規化する */
export function resolveOptions(options: DowaOptions): ResolvedOptions {
  if (typeof options !== "object" || options === null) {
    throw new TypeError('"options" must be an object.');
  }
  const { relaxed = false, disable = [] } = options;
  if (typeof relaxed !== "boolean") {
    throw new TypeError('"options.relaxed" must be a boolean.');
  }
  if (!Array.isArray(disable)) {
    throw new TypeError('"options.disable" must be an array of pattern ids.');
  }
  for (const id of disable) {
    if (typeof id !== "string") {
      throw new TypeError('"options.disable" must be an array of pattern ids.');
    }
    if (!patternIds.has(id)) {
      throw new TypeError(`"options.disable" has an unknown pattern id: ${id}`);
    }
  }
  return { relaxed, disable: new Set(disable) };
}

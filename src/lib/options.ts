export interface DowaOptions {
  /** 検知範囲を拡大するか (デフォルト: false) */
  relaxed?: boolean;
}

/** optionsを検証し、relaxedフラグを取り出す */
export function resolveRelaxed(options: DowaOptions): boolean {
  if (typeof options !== "object" || options === null) {
    throw new TypeError('"options" must be an object.');
  }
  const { relaxed = false } = options;
  if (typeof relaxed !== "boolean") {
    throw new TypeError('"options.relaxed" must be a boolean.');
  }
  return relaxed;
}

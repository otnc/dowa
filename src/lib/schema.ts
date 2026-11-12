import type { StandardSchemaV1 } from "@standard-schema/spec";
import { resolveOptions, type DowaOptions } from "./options";
import { getMatcher } from "./regex";

/**
 * 冷笑を検知するStandardSchema( https://standardschema.dev/ )を作る。
 * 冷笑が検出された場合はissuesとして弾く。
 */
export function dowaSchema(
  options: DowaOptions = {}
): StandardSchemaV1<string, string> {
  const { combined } = getMatcher(resolveOptions(options));
  return {
    "~standard": {
      version: 1,
      vendor: "dowa",
      validate(value) {
        if (typeof value !== "string") {
          return { issues: [{ message: '"value" must be a string.' }] };
        }
        const matches = value.match(combined);
        return matches
          ? {
              issues: matches.map((text) => ({
                message: `冷笑パターンを検出しました: ${text}`,
              })),
            }
          : { value };
      },
    },
  };
}

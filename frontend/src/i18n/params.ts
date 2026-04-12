/**
 * Template shape: `Hello {{name}}` → infer `{ name: string | number }` for `t()`.
 */

/** Names inside `{{...}}` segments (recursive). */
export type ExtractParamNames<S extends string> =
  S extends `${string}{{${infer Param}}}${infer Rest}`
    ? Param extends ""
      ? ExtractParamNames<Rest>
      : Param | ExtractParamNames<Rest>
    : never;

export type ParamsObject<S extends string> = [ExtractParamNames<S>] extends [never]
  ? Record<never, never>
  : { [K in ExtractParamNames<S>]: string | number };

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  let out = "";
  let i = 0;
  while (i < template.length) {
    if (template[i] === "{" && template[i + 1] === "{") {
      const close = template.indexOf("}}", i + 2);
      if (close === -1) {
        out += template.slice(i);
        break;
      }
      const rawName = template.slice(i + 2, close);
      const name = rawName.trim();
      const v = vars[name];
      out +=
        v === undefined || v === null ? template.slice(i, close + 2) : String(v);
      i = close + 2;
    } else {
      out += template[i];
      i++;
    }
  }
  return out;
}

export function isLanguageCode(x: unknown): x is "en" | "vi" {
  return x === "en" || x === "vi";
}

export function isPlainVarsObject(x: unknown): x is Record<string, string | number> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

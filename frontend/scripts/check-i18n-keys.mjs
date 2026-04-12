/**
 * i18n validation (no RegExp usage):
 * 1) en/vi locale bundles define the same keys
 * 2) Static `t("key")` calls use keys that exist in en
 * 3) Keys that contain `{{placeholders}}` must not pass a language code as the second argument
 *
 * Uses the TypeScript Compiler API only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcRoot = path.join(root, "src");
const localesDir = path.join(srcRoot, "locales");

/** @param {string} s */
function isI18nModuleSpecifier(s) {
  if (s === "@/i18n") return true;
  if (s.endsWith("/i18n")) return true;
  if (s.endsWith("/i18n/index")) return true;
  if (s.endsWith("\\i18n")) return true;
  if (s.endsWith("\\i18n\\index")) return true;
  return false;
}

/** @param {string} template @returns {string[]} */
function placeholderNamesInTemplate(template) {
  const names = [];
  let i = 0;
  while (i < template.length) {
    if (template.charCodeAt(i) === 123 && template.charCodeAt(i + 1) === 123) {
      const close = template.indexOf("}}", i + 2);
      if (close === -1) break;
      let j = i + 2;
      while (j < close && template.charCodeAt(j) === 32) j++;
      let k = close - 1;
      while (k > j && template.charCodeAt(k) === 32) k--;
      if (k >= j) names.push(template.slice(j, k + 1));
      i = close + 2;
    } else {
      i++;
    }
  }
  return names;
}

/** @param {string} filePath @returns {Map<string, string>} */
function collectExportedMessageMap(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(
    filePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const map = new Map();

  /** @param {ts.Node} node */
  function unwrapObjectLiteral(node) {
    if (ts.isObjectLiteralExpression(node)) return node;
    if (ts.isAsExpression(node)) return unwrapObjectLiteral(node.expression);
    return null;
  }

  /** @param {ts.Node} node */
  function visit(node) {
    if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword,
      );
      if (!isExported) {
        ts.forEachChild(node, visit);
        return;
      }
      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || !decl.name.text.endsWith("Messages")) {
          continue;
        }
        const obj = decl.initializer
          ? unwrapObjectLiteral(decl.initializer)
          : null;
        if (!obj) continue;
        for (const prop of obj.properties) {
          if (
            ts.isPropertyAssignment(prop) &&
            ts.isStringLiteral(prop.name) &&
            ts.isStringLiteral(prop.initializer)
          ) {
            const key = prop.name.text;
            if (map.has(key)) {
              console.error(`Duplicate key in locale files: ${key}`);
              process.exit(1);
            }
            map.set(key, prop.initializer.text);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return map;
}

/** @param {"en" | "vi"} lang */
function mergedLocaleMap(lang) {
  const sub = path.join(localesDir, lang);
  const files = ["common.ts", "auth.ts", "product.ts"];
  const merged = new Map();
  for (const f of files) {
    const fp = path.join(sub, f);
    if (!fs.existsSync(fp)) {
      console.error(`Missing locale file: ${path.relative(root, fp)}`);
      process.exit(1);
    }
    const part = collectExportedMessageMap(fp);
    for (const [k, v] of part) {
      if (merged.has(k)) {
        console.error(`Duplicate key in ${lang} bundles: ${k}`);
        process.exit(1);
      }
      merged.set(k, v);
    }
  }
  return merged;
}

const enMap = mergedLocaleMap("en");
const viMap = mergedLocaleMap("vi");
const enKeys = new Set(enMap.keys());
const viKeys = new Set(viMap.keys());

const missingInVi = [...enKeys].filter((k) => !viKeys.has(k)).sort();
const missingInEn = [...viKeys].filter((k) => !enKeys.has(k)).sort();

/** @param {string} p */
function walkSrcFiles(p, out) {
  for (const ent of fs.readdirSync(p, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    const full = path.join(p, ent.name);
    if (ent.isDirectory()) walkSrcFiles(full, out);
    else if (
      (ent.name.endsWith(".ts") || ent.name.endsWith(".tsx")) &&
      !ent.name.endsWith(".d.ts")
    ) {
      out.push(full);
    }
  }
}

const allFiles = [];
walkSrcFiles(srcRoot, allFiles);

/** @param {ts.Expression} node @returns {string | null} */
function stringLiteralText(node) {
  let n = node;
  while (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isSatisfiesExpression(n)) {
    n = n.expression;
  }
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
    return n.text;
  }
  return null;
}

/** @param {ts.SourceFile} sf @returns {{ locals: Set<string>, namespaces: Set<string> }} */
function collectTBindings(sf) {
  const locals = new Set();
  const namespaces = new Set();

  /** @param {ts.Node} node */
  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const spec = node.moduleSpecifier;
      if (!ts.isStringLiteral(spec) || !isI18nModuleSpecifier(spec.text)) {
        ts.forEachChild(node, visit);
        return;
      }
      const clause = node.importClause;
      if (!clause) return;
      if (clause.name) {
        if (clause.name.text !== "t") {
          /* default import as t — ignore */
        }
      }
      if (clause.namedBindings) {
        if (ts.isNamespaceImport(clause.namedBindings)) {
          namespaces.add(clause.namedBindings.name.text);
        } else if (ts.isNamedImports(clause.namedBindings)) {
          for (const el of clause.namedBindings.elements) {
            const exported = el.propertyName?.text ?? el.name.text;
            if (exported === "t") locals.add(el.name.text);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return { locals, namespaces };
}

/** @param {ts.Expression} expr @param {Set<string>} locals @param {Set<string>} namespaces */
function isTCallExpression(expr, locals, namespaces) {
  let e = expr;
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  if (ts.isIdentifier(e) && locals.has(e.text)) return true;
  if (
    ts.isPropertyAccessExpression(e) &&
    e.name.text === "t" &&
    ts.isIdentifier(e.expression) &&
    namespaces.has(e.expression.text)
  ) {
    return true;
  }
  return false;
}

/** @param {string} filePath @returns {{ line: number, col: number }} */
function lineCol(sf, pos) {
  const { line, character } = sf.getLineAndCharacterOfPosition(pos);
  return { line: line + 1, col: character + 1 };
}

const errors = [];
/** @param {string} msg */
function err(msg) {
  errors.push(msg);
}

const usedKeys = new Map();

/** @param {string} key @param {string} where */
function recordUsed(key, where) {
  if (!usedKeys.has(key)) usedKeys.set(key, []);
  usedKeys.get(key).push(where);
}

for (const filePath of allFiles) {
  const rel = path.relative(root, filePath).replaceAll("\\", "/");
  const text = fs.readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(
    rel,
    text,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const { locals, namespaces } = collectTBindings(sf);
  if (locals.size === 0 && namespaces.size === 0) continue;

  /** @param {ts.Node} node */
  function visitCalls(node) {
    if (
      ts.isCallExpression(node) &&
      isTCallExpression(node.expression, locals, namespaces)
    ) {
      const key = stringLiteralText(node.arguments[0]);
      if (key === null) return;
      const { line, col } = lineCol(sf, node.arguments[0].getStart(sf));
      const where = `${rel}:${line}:${col}`;
      recordUsed(key, where);

      if (!enKeys.has(key)) {
        err(`Invalid i18n key: ${key} at ${where}`);
      }

      const template = enMap.get(key) ?? "";
      const ph = placeholderNamesInTemplate(template);
      if (ph.length > 0 && node.arguments.length >= 2) {
        const arg1 = node.arguments[1];
        if (ts.isStringLiteral(arg1) || ts.isNoSubstitutionTemplateLiteral(arg1)) {
          const lit = arg1.text;
          if (lit === "en" || lit === "vi") {
            err(
              `i18n key "${key}" expects interpolation vars as 2nd argument, got language code at ${where}`,
            );
          }
        }
      }
      if (ph.length > 0 && node.arguments.length < 2) {
        err(`i18n key "${key}" requires interpolation object as 2nd argument at ${where}`);
      }
    }
    ts.forEachChild(node, visitCalls);
  }

  visitCalls(sf);

  if (rel.endsWith("pages/landing/landing-data.tsx")) {
    /** @param {ts.Node} node */
    function visitLandingStrings(node) {
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        const s = node.text;
        if (s.startsWith("landing.") && enKeys.has(s)) {
          const { line, col } = lineCol(sf, node.getStart(sf));
          recordUsed(s, `${rel}:${line}:${col} (landing-data)`);
        } else if (s.startsWith("landing.") && !enKeys.has(s)) {
          const { line, col } = lineCol(sf, node.getStart(sf));
          err(`Invalid i18n key in landing-data: ${s} at ${rel}:${line}:${col}`);
        }
      }
      ts.forEachChild(node, visitLandingStrings);
    }
    visitLandingStrings(sf);
  }
}

for (const k of missingInVi) err(`Missing key in vi (present in en): ${k}`);
for (const k of missingInEn) err(`Missing key in en (present in vi): ${k}`);

for (const k of usedKeys.keys()) {
  if (!enKeys.has(k)) {
    const locs = [...new Set(usedKeys.get(k))].sort();
    err(`Key used in code but missing from locale bundles: ${k}`);
    for (const L of locs) err(`    ${L}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `OK: ${enKeys.size} keys in en/vi; static t() calls and landing-data keys validated.`,
);
process.exit(0);

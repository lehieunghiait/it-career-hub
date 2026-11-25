// Codemod i18n: thay chuỗi hiển thị bằng i18next.t('app:<key>').
// Dùng: TS_PATH=node_modules/typescript node scripts/i18n/codemod.cjs src [--write]
//  - Không --write: chỉ thống kê.
//  - --write: sửa file + ghi scripts/i18n/out/source.json, skipped.json
const ts = require(process.env.TS_PATH || 'typescript');
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || 'src');
const WRITE = process.argv.includes('--write');
const OUT = path.resolve(__dirname, 'out');

// ---------------------------------------------------------------- cấu hình lọc
const PROPS = new Set(['title','placeholder','label','tooltip','okText','cancelText','content','description','message',
  'alt','extra','addonBefore','addonAfter','emptyText','text','help','subTitle','headerTitle','tab','children',
  'confirmText','loadingText','searchText','resetText','submitText','checkedChildren','unCheckedChildren','caption',
  'heading','subtitle','desc','question','answer','buttonText','okButtonText','tip','notFoundContent']);
const MSG_FN = /^(message|notification|toast)\.(success|error|info|warning|warn|loading|open)$/;
const SKIP_FILES = [/^config\/api\.ts$/, /^i18n\//, /\.d\.ts$/];
const SKIP_RANGES = { 'config/utils.ts': (line, src) => isInsideConst(src, line, 'SKILLS_LIST') };
const hasLetters = s => /[A-Za-zÀ-ỹ]/.test(s);
const looksCode = s => /^[a-z0-9_.\-/:#@?=&%]+$/.test(s) || /^(https?:|\/|#|\.)/.test(s) || /^[A-Z0-9_]+$/.test(s)
  || /^[a-z]+([A-Z][a-z0-9]+)+$/.test(s) || /^[a-z0-9-]+(\s[a-z0-9-]+)*$/.test(s) && /-/.test(s);
const VI = /[À-ỹđĐ]/;

function isInsideConst(src, line, name) {
  const lines = src.split('\n'); let start = -1;
  for (let i = 0; i < lines.length; i++) if (lines[i].includes(`const ${name}`)) { start = i + 1; break; }
  if (start < 0 || line < start) return false;
  let depth = 0;
  for (let i = start - 1; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '[' || ch === '{') depth++; if (ch === ']' || ch === '}') depth--; }
    if (i + 1 >= line) return depth > 0 || i + 1 === line;
    if (depth === 0 && i >= start) return false;
  }
  return false;
}

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f), st = fs.statSync(p);
    if (st.isDirectory()) { if (!/^(i18n|assets|styles|types)$/.test(f)) walk(p, out); }
    else if (/\.(tsx|ts)$/.test(f) && !/\.d\.ts$/.test(f)) out.push(p);
  }
  return out;
}

const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
const slugify = s => {
  const w = fold(s).toLowerCase().replace(/\{\{v\d+\}\}/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  let k = w.slice(0, 6).join('_') || 'text';
  if (/^\d/.test(k)) k = 't_' + k;
  return k.slice(0, 48);
};
const fileKey = rel => rel.replace(/\.(tsx|ts)$/, '').split('/').map(seg => seg.replace(/[^A-Za-z0-9]+/g, '_')).join('.');

// ---------------------------------------------------------------- thu thập
const occ = [];   // {file, start, end, kind, text, vars:[{name,expr}], moduleProp, propNode, raw}
const skipped = [];
const files = walk(root);
const sources = {};

for (const abs of files) {
  const rel = path.relative(root, abs).split(path.sep).join('/');
  if (SKIP_FILES.some(r => r.test(rel))) continue;
  const src = fs.readFileSync(abs, 'utf8'); sources[rel] = src;
  const sf = ts.createSourceFile(abs, src, ts.ScriptTarget.Latest, true, abs.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  const inFunction = n => { for (let p = n.parent; p; p = p.parent) if (ts.isFunctionLike(p)) return true; return false; };
  const lineOf = n => sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;

  const push = (node, kind, text, extra = {}) => {
    const norm = text.replace(/\s+/g, ' ').trim();
    if (!norm || !hasLetters(norm) || looksCode(norm)) return;
    if (SKIP_RANGES[rel] && SKIP_RANGES[rel](lineOf(node), src)) return;
    const fn = inFunction(node);
    const o = { file: rel, line: lineOf(node), kind, text: norm, node, fn, ...extra };
    if (!fn) {
      // ngoài function: chỉ xử lý được property trong object literal (đổi sang getter)
      const p = node.parent;
      if (ts.isPropertyAssignment(p) && p.initializer === node && ts.isObjectLiteralExpression(p.parent)) { o.moduleProp = p; }
      else { skipped.push({ file: rel, line: o.line, kind, text: norm }); return; }
    }
    occ.push(o);
  };

  const visit = n => {
    if (ts.isJsxText(n)) {
      const raw = n.getText();
      if (hasLetters(raw) && !/[{}<>]/.test(raw)) push(n, 'jsxText', raw);
    } else if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      const p = n.parent;
      if (ts.isJsxAttribute(p) && PROPS.has(p.name.getText())) push(n, 'attrStr', n.text);
      else if (ts.isJsxExpression(p) && (ts.isJsxElement(p.parent) || ts.isJsxFragment(p.parent))) push(n, 'lit', n.text);
      else if (ts.isJsxExpression(p) && ts.isJsxAttribute(p.parent) && PROPS.has(p.parent.name.getText())) push(n, 'lit', n.text);
      else if (ts.isPropertyAssignment(p) && p.initializer === n && PROPS.has(p.name.getText().replace(/['"]/g, ''))) push(n, 'lit', n.text);
      else if (ts.isCallExpression(p) && MSG_FN.test(p.expression.getText())) push(n, 'lit', n.text);
      else if (ts.isConditionalExpression(p) && p.condition !== n && (/\s/.test(n.text) || VI.test(n.text) || /^[A-Z]/.test(n.text))) push(n, 'lit', n.text);
      else if (ts.isBinaryExpression(p) && ['||', '??', '+'].includes(p.operatorToken.getText()) && (/\s/.test(n.text) || VI.test(n.text))) push(n, 'lit', n.text);
      else if (ts.isReturnStatement(p) && (/\s/.test(n.text) || VI.test(n.text))) push(n, 'lit', n.text);
    } else if (ts.isTemplateExpression(n)) {
      const p = n.parent;
      const ok = ts.isJsxExpression(p) || (ts.isCallExpression(p) && MSG_FN.test(p.expression.getText()))
        || (ts.isPropertyAssignment(p) && PROPS.has(p.name.getText().replace(/['"]/g, '')))
        || ts.isReturnStatement(p) || ts.isConditionalExpression(p);
      if (ok) {
        let text = n.head.text; const vars = [];
        n.templateSpans.forEach((s, i) => { vars.push({ name: 'v' + i, expr: s.expression.getText() }); text += `{{v${i}}}` + s.literal.text; });
        const plain = text.replace(/\{\{v\d+\}\}/g, '');
        if (hasLetters(plain) && !/^[\s\W\d]*$/.test(plain) && !/^(\/|https?:)/.test(text) && /[A-Za-zÀ-ỹ]{2,}/.test(plain)) push(n, 'template', text, { vars });
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

// ---------------------------------------------------------------- sinh key
const filesByText = {};
for (const o of occ) (filesByText[o.text] ||= new Set()).add(o.file);
const used = {};       // fullKey -> text
const textKey = {};    // scope|text -> fullKey
const keyOf = o => {
  const common = filesByText[o.text].size >= 3 && o.kind !== 'template';
  const scope = common ? 'common' : fileKey(o.file);
  const tk = scope + '|' + o.text;
  if (textKey[tk]) return textKey[tk];
  let base = scope + '.' + slugify(o.text), k = base, i = 2;
  while (used[k] && used[k] !== o.text) k = base + '_' + i++;
  used[k] = o.text; textKey[tk] = k; return k;
};
for (const o of occ) o.key = keyOf(o);

// ---------------------------------------------------------------- áp dụng
const IMPORT = "import i18next from 'i18next';";
const call = o => {
  const args = o.vars && o.vars.length ? `, { ${o.vars.map(v => `${v.name}: ${v.expr}`).join(', ')} }` : '';
  return `i18next.t('app:${o.key}'${args})`;
};
const byFile = {};
for (const o of occ) (byFile[o.file] ||= []).push(o);

let edited = 0;
for (const [rel, list] of Object.entries(byFile)) {
  let src = sources[rel];
  const edits = [];
  for (const o of list) {
    const n = o.node;
    if (o.moduleProp) {
      const p = o.moduleProp; const name = p.name.getText();
      edits.push({ start: p.getStart(), end: p.getEnd(), text: `get ${name}() { return ${call(o)}; }` });
    } else if (o.kind === 'jsxText') {
      const raw = n.getText(); const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
      const keepLead = /\n/.test(lead) ? lead : lead ? ' ' : '';
      const keepTrail = /\n/.test(trail) ? trail : trail ? ' ' : '';
      edits.push({ start: n.getStart(), end: n.getEnd(), text: `${keepLead ? keepLead.replace(/^ $/, "{' '}") : ''}{${call(o)}}${keepTrail ? keepTrail.replace(/^ $/, "{' '}") : ''}` });
    } else if (o.kind === 'attrStr') {
      edits.push({ start: n.getStart(), end: n.getEnd(), text: `{${call(o)}}` });
    } else {
      edits.push({ start: n.getStart(), end: n.getEnd(), text: call(o) });
    }
  }
  edits.sort((a, b) => b.start - a.start);
  // bỏ edit lồng nhau (giữ cái ngoài)
  const final = []; let lastStart = Infinity;
  for (const e of edits) { if (e.end <= lastStart) { final.push(e); lastStart = e.start; } }
  for (const e of final) src = src.slice(0, e.start) + e.text + src.slice(e.end);
  if (!/^import i18next from 'i18next';$/m.test(src)) {
    const m = [...src.matchAll(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm)];
    const at = m.length ? m[m.length - 1].index + m[m.length - 1][0].length : 0;
    src = src.slice(0, at) + (at ? '\n' : '') + IMPORT + '\n' + src.slice(at);
  }
  if (WRITE) fs.writeFileSync(path.join(root, rel), src);
  edited++;
}

// ---------------------------------------------------------------- xuất
const source = {};
for (const [k, text] of Object.entries(used)) source[k] = { text, lang: VI.test(text) ? 'vi' : 'en' };
const stats = { files: edited, occurrences: occ.length, keys: Object.keys(source).length,
  common: Object.keys(source).filter(k => k.startsWith('common.')).length,
  getters: occ.filter(o => o.moduleProp).length, templates: occ.filter(o => o.kind === 'template').length,
  vi: Object.values(source).filter(s => s.lang === 'vi').length, skipped: skipped.length };
console.log(JSON.stringify(stats));
if (WRITE) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'source.json'), JSON.stringify(source, null, 1));
  fs.writeFileSync(path.join(OUT, 'skipped.json'), JSON.stringify(skipped, null, 1));
} else {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'preview-source.json'), JSON.stringify(source, null, 1));
  fs.writeFileSync(path.join(OUT, 'preview-skipped.json'), JSON.stringify(skipped, null, 1));
}

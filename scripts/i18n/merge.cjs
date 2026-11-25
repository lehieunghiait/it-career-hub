// Ghép bản dịch -> src/i18n/locales/{vi,en,ja}/app.json, đồng thời trả các chuỗi kỹ thuật về code gốc.
// Dùng: node scripts/i18n/merge.cjs
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out');
const source = JSON.parse(fs.readFileSync(path.join(OUT, 'source.json'), 'utf8'));
const unique = fs.readFileSync(path.join(OUT, 'unique.txt'), 'utf8').split('\n').filter(Boolean)
  .map(l => { const i = l.indexOf('\t'); return [Number(l.slice(0, i)), l.slice(i + 1)]; });
const textByIdx = Object.fromEntries(unique);
const VI = /[À-ỹđĐ]/;

// 1) đọc TSV: idx \t A \t B  (nguồn en -> A=vi, B=ja; nguồn vi -> A=en, B=ja; '=' = giữ nguồn)
const tr = {};
for (const f of fs.readdirSync(path.join(__dirname, 'tr')).filter(f => f.endsWith('.tsv')).sort()) {
  for (const line of fs.readFileSync(path.join(__dirname, 'tr', f), 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const [idx, a, b] = line.split('\t');
    const text = textByIdx[idx];
    if (text === undefined) throw new Error(`Không có idx ${idx} (${f})`);
    const src = VI.test(text) ? 'vi' : 'en';
    const pick = v => (v === undefined || v === '=' ? text : v);
    tr[text] = src === 'vi' ? { vi: text, en: pick(a), ja: pick(b) } : { en: text, vi: pick(a), ja: pick(b) };
  }
}

// 2) chuỗi kỹ thuật: trả về code gốc, không đưa vào JSON
const REVERT = {
  'Bearer': { lit: "'Bearer '" },
  '&nbsp;': { jsx: '&nbsp;' },
  '&ldquo;': { jsx: '&ldquo;' },
  '&rdquo;': { jsx: '&rdquo;' },
  'tel:{{v0}}': { tpl: 'tel:' },
  'mailto:{{v0}}': { tpl: 'mailto:' },
};
// giữ khoảng trắng biên của chuỗi gốc
const EDGE_WS = { 'đ': [' ', ''] };

const walk = (d, out = []) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f);
  if (fs.statSync(p).isDirectory()) { if (f !== 'i18n') walk(p, out); } else if (/\.(tsx?)$/.test(f)) out.push(p); } return out; };
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let reverted = 0;
const revertKeys = new Set(Object.entries(source).filter(([, v]) => REVERT[v.text]).map(([k]) => k));
for (const file of walk(path.join(ROOT, 'src'))) {
  let s = fs.readFileSync(file, 'utf8'); const before = s;
  for (const k of revertKeys) {
    const r = REVERT[source[k].text]; const key = esc(`app:${k}`);
    if (r.lit) s = s.replace(new RegExp(`i18next\\.t\\('${key}'\\)`, 'g'), r.lit);
    if (r.jsx) s = s.replace(new RegExp(`\\{i18next\\.t\\('${key}'\\)\\}`, 'g'), r.jsx);
    if (r.tpl) s = s.replace(new RegExp(`i18next\\.t\\('${key}', \\{ v0: ([^}]+?) \\}\\)`, 'g'), (_, e) => '`' + r.tpl + '${' + e + '}`');
  }
  if (s !== before) {
    // bỏ import nếu file không còn dùng i18next
    if (!/i18next\.t\(/.test(s)) s = s.replace(/\nimport i18next from 'i18next';\n/, '\n');
    fs.writeFileSync(file, s); reverted++;
  }
}

// 3) dựng JSON lồng nhau
const setDeep = (obj, key, val) => { const parts = key.split('.'); let o = obj;
  parts.slice(0, -1).forEach(p => { if (typeof o[p] !== 'object') o[p] = {}; o = o[p]; }); o[parts.at(-1)] = val; };
const res = { vi: {}, en: {}, ja: {} }; const missing = [];
for (const [k, v] of Object.entries(source)) {
  if (REVERT[v.text]) continue;
  const t = tr[v.text];
  if (!t) { missing.push(v.text); continue; }
  const [pre, post] = EDGE_WS[v.text] || ['', ''];
  for (const lng of ['vi', 'en', 'ja']) setDeep(res[lng], k, pre + t[lng] + post);
}
for (const lng of ['vi', 'en', 'ja']) {
  const dir = path.join(ROOT, 'src/i18n/locales', lng); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'app.json'), JSON.stringify(res[lng], null, 2) + '\n');
}
console.log(JSON.stringify({ translated: Object.keys(tr).length, keys: Object.keys(source).length, revertedFiles: reverted, missing: missing.length }));
if (missing.length) console.log('THIẾU:', missing.slice(0, 20));

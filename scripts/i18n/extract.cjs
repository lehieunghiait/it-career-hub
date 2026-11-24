// Trích chuỗi hiển thị trong .tsx/.ts bằng TypeScript AST. Dùng: node extract.cjs <srcDir> [--json out.json]
const ts = require(process.env.TS_PATH || 'typescript');
const fs = require('fs'), path = require('path');
const root = process.argv[2];
const PROPS = new Set(['title','placeholder','label','tooltip','okText','cancelText','content','description','message',
  'alt','extra','addonBefore','addonAfter','emptyText','text','help','subTitle','headerTitle','tab','name','children',
  'confirmText','loadingText','searchText','resetText','submitText','checkedChildren','unCheckedChildren','prefix','suffix','caption','heading','subtitle','desc','question','answer','buttonText','status']);
const MSG_FN = /^(message|notification|toast)\.(success|error|info|warning|warn|loading|open)$/;
const hasLetters = s => /[A-Za-zÀ-ỹ]/.test(s);
const looksCode = s => /^[a-z0-9_.\-/:#@?=&%]+$/.test(s) || /^(https?:|\/|#|\.)/.test(s) || /^[A-Z0-9_]+$/.test(s) || /^[a-z]+([A-Z][a-z0-9]+)+$/.test(s);
function walk(dir, out=[]) { for (const f of fs.readdirSync(dir)) { const p=path.join(dir,f); const st=fs.statSync(p);
  if (st.isDirectory()) { if (!/i18n|assets|styles|types/.test(f)) walk(p,out);} else if (/\.(tsx|ts)$/.test(f) && !/\.d\.ts$/.test(f)) out.push(p);} return out; }
const results = [];
for (const file of walk(root)) {
  const src = fs.readFileSync(file,'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const add = (node, kind, text) => { text=text.replace(/\s+/g,' ').trim(); if (!text || !hasLetters(text) || looksCode(text)) return;
    const {line} = sf.getLineAndCharacterOfPosition(node.getStart()); results.push({file: path.relative(root,file), line: line+1, kind, text}); };
  const visit = n => {
    if (ts.isJsxText(n)) add(n,'jsxText',n.getText());
    else if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))) {
      const p = n.parent;
      if (ts.isJsxAttribute(p) && PROPS.has(p.name.getText())) add(n,'attr:'+p.name.getText(),n.text);
      else if (ts.isJsxExpression(p) && (ts.isJsxElement(p.parent)||ts.isJsxFragment(p.parent))) add(n,'jsxExpr',n.text);
      else if (ts.isJsxExpression(p) && ts.isJsxAttribute(p.parent) && PROPS.has(p.parent.name.getText())) add(n,'attr:'+p.parent.name.getText(),n.text);
      else if (ts.isPropertyAssignment(p) && p.initializer===n && PROPS.has(p.name.getText().replace(/['"]/g,''))) add(n,'prop:'+p.name.getText(),n.text);
      else if (ts.isCallExpression(p) && MSG_FN.test(p.expression.getText())) add(n,'call',n.text);
      else if (ts.isConditionalExpression(p) || ts.isBinaryExpression(p)) { if (/\s/.test(n.text) || /[À-ỹ]/.test(n.text)) add(n,'expr',n.text); }
      else if (ts.isReturnStatement(p) && (/\s/.test(n.text)||/[À-ỹ]/.test(n.text))) add(n,'return',n.text);
    } else if (ts.isTemplateExpression(n)) {
      const p=n.parent; const raw=n.getText();
      if (hasLetters(raw.replace(/\$\{[^}]*\}/g,'')) && (ts.isJsxExpression(p) || ts.isCallExpression(p) || ts.isPropertyAssignment(p))) add(n,'template',raw);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}
const byFile = {}; for (const r of results) (byFile[r.file] ||= []).push(r);
if (process.argv[3]==='--json') fs.writeFileSync(process.argv[4], JSON.stringify(results,null,1));
const vi = results.filter(r=>/[À-ỹ]/.test(r.text)).length;
console.log(`files=${Object.keys(byFile).length} strings=${results.length} (có dấu tiếng Việt: ${vi}) unique=${new Set(results.map(r=>r.text)).size}`);
for (const [f,rs] of Object.entries(byFile).sort((a,b)=>b[1].length-a[1].length)) console.log(String(rs.length).padStart(4), f);

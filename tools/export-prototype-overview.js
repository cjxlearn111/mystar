#!/usr/bin/env node
/**
 * 把 dist/ 下已导出的各页面单文件快照，合并为一个「原型总览」HTML。
 *
 * 用途：交付给设计 / 原型工具或其他 AI 时，一个文件看完整站所有页面，
 * 页与页之间有明确的序号分隔与说明，可页内锚点跳转。
 *
 * 用法：先跑 tools/export-single-html.js，再跑本脚本。
 * 产物：dist/mystar-prototype-overview.html
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const distDir = path.join(root, 'dist');
const outPath = path.join(distDir, 'mystar-prototype-overview.html');

const PAGES = [
  { id: 'page-home', name: '首页', file: 'mystar-home.html', path: '/', desc: 'Hero + 最新文章流 + 引言横幅' },
  { id: 'page-post', name: '文章详情页', file: 'mystar-post.html', path: '/posts/welcome-to-mystar/', desc: '单篇长文阅读布局' },
  { id: 'page-archive', name: '归档页', file: 'mystar-archive.html', path: '/archives/', desc: '全部文章时间线' },
  { id: 'page-about', name: '关于页', file: 'mystar-about.html', path: '/about/', desc: '站点与作者介绍' }
];

const css = fs.readFileSync(path.join(publicDir, 'css/main.css'), 'utf8');

function extractBody(file) {
  const html = fs.readFileSync(path.join(distDir, file), 'utf8');
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!m) throw new Error(`无法提取 ${file} 的 body 内容`);
  return m[1];
}

// 把单文件之间的跳转链接改为总览内的页内锚点
function relink(body) {
  return body.replace(/(<a\b[^>]*?\bhref=")([^"]+)(")/gi, (match, head, href, tail) => {
    if (/^https?:|^#|^mailto:|^data:/i.test(href)) return match;
    const target = PAGES.find((p) => p.file === href);
    return target ? `${head}#${target.id}${tail}` : `${head}#${tail}`;
  });
}

const overviewCss = `
/* ============ 总览专用样式（仅用于原型查看，不属于站点本身） ============ */
html { scroll-behavior: smooth; }
.ov-nav {
  position: sticky; top: 0; z-index: 999;
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.82);
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.ov-nav .ov-brand { font-weight: 600; font-size: 14px; margin-right: 12px; white-space: nowrap; }
.ov-nav .ov-note { font-size: 11px; color: #888; margin-left: auto; white-space: nowrap; }
.ov-nav a.ov-link {
  font-size: 13px; color: #333; text-decoration: none;
  padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(0,0,0,.1);
  transition: background .15s ease;
}
.ov-nav a.ov-link:hover { background: rgba(0,0,0,.05); }
.ov-page { border-top: 6px solid #111; background: #fff; }
.ov-page-head {
  padding: 18px 24px; background: #faf9f7; border-bottom: 1px solid #e6e4df;
  display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.ov-page-head .ov-index { font-weight: 700; font-size: 13px; letter-spacing: .08em; color: #999; }
.ov-page-head .ov-name { font-weight: 700; font-size: 15px; }
.ov-page-head .ov-path { font-size: 12px; color: #b0aca4; font-family: ui-monospace, monospace; }
.ov-page-head .ov-desc { font-size: 12px; color: #666; }
.ov-footer {
  padding: 22px 24px; text-align: center; font-size: 12px; color: #999;
  background: #faf9f7; border-top: 1px solid #e6e4df;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
`;

const bodyHtml = PAGES.map((p, i) => `
<!-- ================================================================== -->
<!--  页面 ${i + 1} / ${p.name}   ·   ${p.path}                              -->
<!-- ================================================================== -->
<section class="ov-page" id="${p.id}">
  <div class="ov-page-head">
    <span class="ov-index">PAGE ${String(i + 1).padStart(2, '0')}</span>
    <span class="ov-name">${p.name}</span>
    <span class="ov-path">${p.path}</span>
    <span class="ov-desc">${p.desc} · 源文件：dist/${p.file}</span>
  </div>
${relink(extractBody(p.file)).replace(/^/gm, '  ')}
</section>
`).join('\n');

const nav = PAGES.map((p, i) => `<a class="ov-link" href="#${p.id}">${i + 1}. ${p.name}</a>`).join('');

const doc = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>mystar · 原型总览（${PAGES.length} 个页面单文件快照）</title>
<meta name="description" content="mystar 个人博客全站页面快照：首页 / 文章详情 / 归档 / 关于。CSS 与图片已内联，用于设计还原与原型参考。">
<!--
  mystar · 原型总览
  本文件包含站点全部页面（垂直顺序排列），生成自 tools/export-prototype-overview.js。
  顶栏可跳转各页面；每个页面段落头标注了页面名称与源文件路径。
  改动请回到 Hexo 工程，不要直接编辑本文件。
-->
<style>
${css}
${overviewCss}
</style>
</head>
<body class="site-body">
<nav class="ov-nav">
  <span class="ov-brand">mystar · 原型总览</span>
  ${nav}
  <span class="ov-note">${PAGES.length} 页面 / 单文件 · 图片已内联</span>
</nav>
${bodyHtml}
<footer class="ov-footer">mystar 全站原型快照 · 由 Hexo 工程导出 · ${new Date().toISOString().slice(0, 10)}</footer>
</body>
</html>
`;

fs.writeFileSync(outPath, doc);
const size = (fs.statSync(outPath).size / 1024).toFixed(0);
console.log(`✓ mystar-prototype-overview.html  总览（${PAGES.length} 页合并）  ${size} KB`);

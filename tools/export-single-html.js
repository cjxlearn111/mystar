#!/usr/bin/env node
/**
 * 把 Hexo 生成的静态页面导出为「单文件 HTML」快照。
 *
 * 用途：交付给设计 / 原型工具或其他 AI 时，对方双击即可看到完整视觉效果，
 * 不依赖 css、images 等外部资源，也不需要起本地服务。
 *
 * 处理内容：
 *   1. 内联 public/css/main.css
 *   2. 图片压缩（最长边 1000px，jpeg q65）后转 base64 内联
 *   3. 站内 /mystar/ 链接改写为同目录下其他单文件 HTML 的链接
 *
 * 用法：node tools/export-single-html.js
 * 产物：dist/mystar-*.html
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const distDir = path.join(root, 'dist');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mystar-export-'));

const CSS_FILE = 'css/main.css';
const ROOT_PREFIX = '/mystar/';
const MAX_EDGE = 1000;
const JPEG_QUALITY = 65;

const PAGES = [
  { name: 'home', title: '首页', file: 'index.html', out: 'mystar-home.html' },
  { name: 'post', title: '文章详情页', file: 'posts/welcome-to-mystar/index.html', out: 'mystar-post.html' },
  { name: 'archive', title: '归档页', file: 'archives/index.html', out: 'mystar-archive.html' },
  { name: 'about', title: '关于页', file: 'about/index.html', out: 'mystar-about.html' }
];

const urlToFile = new Map(PAGES.map((p) => [ROOT_PREFIX + (p.file === 'index.html' ? '' : p.file.replace(/index\.html$/, '')), p.out]));
urlToFile.set('/', PAGES[0].out);

if (!fs.existsSync(publicDir)) {
  console.error('找不到 public/，请先执行 npm run build');
  process.exit(1);
}

const css = fs.readFileSync(path.join(publicDir, CSS_FILE), 'utf8');

const imageCache = new Map();

function toDataUri(relPath) {
  const abs = path.join(publicDir, relPath);
  if (!fs.existsSync(abs)) return null;
  if (imageCache.has(abs)) return imageCache.get(abs);

  const out = path.join(tmpDir, `${path.basename(abs, path.extname(abs))}.jpg`);
  execFileSync('sips', [
    '-Z', String(MAX_EDGE),
    '-s', 'format', 'jpeg',
    '-s', 'formatOptions', String(JPEG_QUALITY),
    abs, '--out', out
  ], { stdio: 'ignore' });

  const dataUri = `data:image/jpeg;base64,${fs.readFileSync(out).toString('base64')}`;
  imageCache.set(abs, dataUri);
  return dataUri;
}

function inlineImages(html) {
  return html.replace(/(<img\b[^>]*?\bsrc=")([^"]+)(")/gi, (match, head, src, tail) => {
    if (/^data:|^https?:/i.test(src)) return match;
    const rel = src.replace(ROOT_PREFIX, '').replace(/^\//, '');
    const dataUri = toDataUri(rel);
    return dataUri ? head + dataUri + tail : match;
  });
}

function rewriteLinks(html) {
  return html.replace(/(<a\b[^>]*?\bhref=")([^"]+)(")/gi, (match, head, href, tail) => {
    if (/^https?:|^#|^mailto:|^data:/i.test(href)) return match;
    const key = href.startsWith(ROOT_PREFIX) ? href : ROOT_PREFIX + href.replace(/^\//, '');
    const target = urlToFile.get(key) || urlToFile.get(`${key}/`);
    return head + (target || '#') + tail;
  });
}

console.log('压缩并内联图片资源...');
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

const banner = (title) => `<!--
  mystar 静态页面快照 · ${title}
  由 tools/export-single-html.js 生成：CSS 与图片已全部内联，可直接双击打开。
  源文件对应 public/ 下的同名页面，改动请回到 Hexo 工程，不要直接编辑本文件。
-->
`;

for (const page of PAGES) {
  const src = path.join(publicDir, page.file);
  if (!fs.existsSync(src)) {
    console.warn(`跳过 ${page.title}（缺少 ${page.file}）`);
    continue;
  }

  let html = fs.readFileSync(src, 'utf8');
  html = html.replace(new RegExp(`<link[^>]+href="${ROOT_PREFIX}${CSS_FILE.replace('/', '\\/')}"[^>]*>`, 'i'), `<style>\n${css}\n</style>`);
  html = rewriteLinks(html);
  html = inlineImages(html);
  html = html.replace(/<head>/i, `<head>\n${banner(page.title)}`);

  const outPath = path.join(distDir, page.out);
  fs.writeFileSync(outPath, html);
  const size = (fs.statSync(outPath).size / 1024).toFixed(0);
  console.log(`✓ ${page.out.padEnd(20)} ${page.title.padEnd(6)} ${size} KB`);
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`\n完成，产物在 ${path.relative(root, distDir)}/`);

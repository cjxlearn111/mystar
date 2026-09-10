# mystar 快速上手指南（给 Codex）

> **本文是唯一权威上手文档。** 仓库内其他 md（`prd.md` / `ui-dev-spec.md` / `hexo-dev-plan.md` / `sheji.md` / `writing-reference.md` / `hexo-workflow.md`）是历史过程稿，**优先级低于本文**，只在需要具体背景时查。
> ⚠️ **重要消歧**：`ui-dev-spec.md` 里的 **Next.js / Tailwind / shadcn / MDX 是已废弃方案**。当前栈是 **Hexo + EJS + 单个 CSS 文件**。**不要引入 Tailwind，不要加任何构建工具，不要改技术栈。**

---

## 1. 技术栈与环境（实测结论）

| 项 | 值 |
|---|---|
| 框架 | Hexo **7.3.0**（`hexo-cli` 4.3.2） |
| 主题 | 自研 `themes/mystar`：EJS 模板 + 单个 `main.css` |
| 样式入口 | `themes/mystar/source/css/main.css`（全站唯一 CSS，13KB） |
| 运行时 | node **v24.18.0** / npm 11.16.0（已实测可跑） |
| 部署 | GitHub Pages，`url: https://cjxlearn111.github.io`，`root: /mystar/` |
| 依赖 | **已随包提供，`node_modules/` 完整，不要 `npm install`** |

---

## 2. 跑起来

```powershell
cd mystar
npm run dev
```

**已知坑（Windows）**：本包从 macOS 打包，`node_modules/.bin/` 缺少 Windows 所需的 `.cmd` shim，`npm run dev` 可能报「hexo 不是内部或外部命令」。
两条解法，任选：

```powershell
# 解法 A（零改动，已验证可用）
node node_modules\hexo-cli\bin\hexo server

# 解法 B（一次性修好 npm run，本地重建，不下载）
npm rebuild
```

**禁止 `npm install`** —— 依赖已完整，联网重装是纯浪费。

| 命令 | 作用 |
|---|---|
| `npm run dev` | 本地预览（`hexo server`） |
| `npm run build` | 生成 `public/` |
| `npm run clean` | 清缓存 —— **改 `_config.yml` 或主题结构后必须跑** |
| `npm run new:post -- "标题"` | 新建文章（自动套 `scaffolds/post.md`） |
| `npm run new:draft -- "标题"` | 新建草稿（存 `source/_drafts/`，`render_drafts: false` 默认不发布） |
| `npm run publish:post -- "标题"` | 草稿转正式 |
| `npm run editor` | 本地可视化编辑器（`tools/local-editor`） |

### 简历 PDF（`source/files/resume.pdf`）

首页「下载简历」按钮指向它。这个 PDF **不由 Hexo 生成**，是用脚本从外部简历打印出来的：

```powershell
python make-resume-pdf.py      # 或双击 make-resume-pdf.bat
```

脚本流程：用 Edge 无头模式量出简历的真实内容高度 → 写回该 HTML 的 `@page` 尺寸（内容 + 6mm，必要时自动加高重试，收敛到**单页长页**）→ 打印 PDF → 落到 `source/files/resume.pdf`。

- ⚠️ 简历源文件在**仓库之外**（`个人资料库/求职/陈嘉希简历.html`）。改了它，PDF **不会自动更新**，必须重跑脚本。
- 简历容器宽 820px（≈217mm），比 A4 的 210mm 宽，所以 `@page` 宽度写的是 220mm——这是它以前被切成 3 页的原因。
- 生成后要 `git push` 才会发布到线上。
- 依赖：本机 Microsoft Edge。

---

## 3. 文件地图（想改什么 → 改哪个文件）

| 想改什么 | 改哪里 |
|---|---|
| 全站骨架（body/main 结构） | `themes/mystar/layout/layout.ejs` |
| `<head>` / SEO / 样式引入 | `themes/mystar/layout/partial/head.ejs` |
| 顶部导航（sticky 玻璃头） | `partial/header.ejs`；**菜单项在** `themes/mystar/_config.yml` 的 `menu` |
| 页脚 | `partial/footer.ejs` |
| 首页 Hero | `partial/hero.ejs`；**文案在** `_config.yml` 的 `home.hero` |
| 首页文章卡片 | `partial/post-card.ejs` |
| 首页整体结构 | `layout/index.ejs`（hero → 文章流 → quote banner） |
| 文章详情页 | `layout/post.ejs` |
| 独立页面（About 等） | `layout/page.ejs` + `source/about/index.md` |
| 归档 / 分类 / 标签页 | `layout/archive.ejs` / `category.ejs` / `tag.ejs` |
| **全部样式** | `themes/mystar/source/css/main.css`（只此一处） |
| 站点配置（url / permalink / 部署） | `mystar/_config.yml` |
| 主题文案 / 图片（首页、brand） | `themes/mystar/_config.yml` |
| 文章内容 | `source/_posts/*.md` |
| 发文模板 | `scaffolds/post.md` |

**关键约定：文案和图片不硬编码进 EJS**，一律走 `themes/mystar/_config.yml`（现有模板都已这么做，保持它）。

---

## 4. 铁律

1. **样式只写进 `main.css`**，不新增 CSS 文件、不引入 CSS 框架。
2. **不要动**：`public/`（构建产物）、`dist/`（原型导出成品）、`node_modules/`、`.git/`、`.env`。
3. 改 `_config.yml` 或主题结构后 **必须 `npm run clean`** 再 build，否则看到的是旧缓存。
4. 不新建 md 文档；要沉淀就改进现有文档。
5. 不重构目录结构、不改文件名、不动 permalink 规则。
6. 一次只改一个模块（模板 / 样式 / 配置分开做），最小 diff。
7. **git 纪律**：仓库已有提交历史和远端。不要 `reset --hard`、不要 force push、不要重写历史；除非明确要求发布，否则不要 `git push`。

---

## 5. 设计 token

**真源 = `design-tokens.json`**（完整值都在里面）。
注意：`main.css` 的 `:root` 只落地了**子集**（下面列的就是已落地的），新增变量请按 token 补齐命名。

```css
/* 已在 main.css 落地 */
--bg-page:#faf8fe; --bg-surface:#fff; --bg-surface-muted:#f4f3f8; --bg-panel-highest:#e3e2e7;
--text-primary:#1a1b1f; --text-secondary:#444748; --text-muted:#5d5e60;
--border-soft:rgba(0,0,0,.06); --border-strong:#c4c7c7;
--brand-primary:#000; --brand-on-primary:#fff;
--shadow-soft:0 4px 20px rgba(0,0,0,.04); --shadow-floating:0 12px 40px rgba(0,0,0,.05);
--blur-glass:20px;
--container-max:1120px; --content-reading:720px;
--page-margin-desktop:64px; --page-margin-mobile:20px;
--radius-lg:12px; --radius-xl:16px;
--font-display:"Bodoni Moda",serif; --font-body:"Inter","Noto Sans SC",sans-serif;
```

**排版尺度**（token）：displayLg 72/1.1/-0.02em/600 · headlineLg 48/1.2/500 · headlineLgMobile 32 · headlineMd 32/1.3/400 · bodyLg 18/1.7 · bodyMd 16/1.6 · labelCaps 12/600/0.12em · metaXs 10/600/0.14em · codeSm 13。
**其他**：容器 1120 / 阅读 720 / prose 680 / gutter 24；圆角 2·4·6·8·12·16·9999；动效 200·300·500ms，easing `cubic-bezier(.22,1,.36,1)`，图片 hover `scale(1.05)`；断点 640 / 768 / 1024 / 1280。
**颜色只用上面这些值**，不要新造魔法值。

---

## 6. 可复用 CSS 类（先查再写，别重造）

**布局**：`container-shell`（主容器）· `container-reading`（阅读窄栏）· `site-header` / `header-inner` / `brandmark` / `brand-issue` / `site-nav` · `site-main`
**首页**：`home-shell` · `hero` / `hero-copy` / `hero-title` / `hero-description` / `hero-actions` / `hero-notes` / `hero-note` · `hero-visual` / `hero-image` / `floating-card` / `floating-label` · `post-stream` · `section-head` / `section-label` / `section-title` · `post-list` / `post-card-*` · `ghost-link` · `quote-banner` / `quote-banner-media` / `quote-banner-overlay` / `quote-banner-text`
**文章页**：`article-shell` · `back-link` · `article-header` / `article-meta` / `article-title` / `article-description` / `article-cover` / `article-prose`
**通用**：`primary-button` · `page-title` · `footer-brand` / `footer-meta`

---

## 7. 发文规范

`scaffolds/post.md` 现有字段（新文章照填）：

```yaml
---
title: 标题
date: 2026-06-25 21:30:00
description: 一句话摘要。
tags: [设计, AI]
categories: [方法]
cover: /images/content/example-cover.jpg
excerpt: 列表摘要，可与 description 相同。
reading_time: 6 分钟
featured: false
---
```

**图片目录约定**：站点固定图 → `source/images/site/`；文章封面与配图 → `source/images/content/`；`source/images/posts/` 是旧目录，**新文章不要再用**。引用路径写站点绝对路径：`/images/content/xxx.jpg`。
链接规则：`permalink: posts/:title/`，`future: true`（未来日期也会渲染）。

---

## 8. 当前进度与下一步（按序推进，不要跳）

**已完成**：Hexo 骨架可跑 · 主题 8 个模板齐全（index/post/page/archive/category/tag + 3 个 partial）· `main.css` 基础样式 · 首页文案配置化 · 1 篇文章（`welcome-to-mystar.md`）· About 页。

**待办（官方排期，来自 `hexo-workflow.md` §9.3）**：

| Phase | 目标 | 完成标志 |
|---|---|---|
| 0. 范围冻结 | 不再发散页面种类 | 只围绕核心阅读体验开发 |
| 1. 首页精修 | 首页成为**视觉母版** | 首页可定稿，其他页复用其风格 |
| 2. 文章页阅读体验 | MD 长文稳定好读 | 标题/段落/列表/引用/代码块/图片/分隔线样式齐全 |
| 3. 内容系统页统一 | Archive / Tag / Category 同一套语言 | 标题区、列表密度、空状态一致 |
| 4. 发文流程标准化 | 写文章变固定动作 | scaffolds + front-matter + 封面命名固化 |
| 5. 部署上线 | 自动发布到 Pages | **配置已就位，待验证线上生效** |

**部署现状（已核实，不要重复搭建）**：

- `.github/workflows/pages.yml` **已存在且完整**：push 到 `main` → `npm ci` → `npm run build` → 上传 `public/` → `deploy-pages`。
- git remote 已配置：`https://github.com/cjxlearn111/mystar.git`，已有 2 次提交（`9cce0d4` Initial commit、`167414a` Optimize mobile homepage performance）。
- `.gitignore` 已忽略 `node_modules/`、`public/`、`db.json`、`.env`。
- `_config.yml` 的 `deploy.repo` 是空的 —— **这是对的，别填**（走 GitHub Actions 部署，`hexo deploy` 这条路没在用）。
- 剩余工作：验证 Pages 域名下 `root: /mystar/` 的路径是否正确、再考虑自定义域名（`source/CNAME`）。

---

## 9. 不要碰

- `public/`、`dist/`、`node_modules/`、`.git/`、`db.json`
- `.env`：本地编辑器配置（`EDITOR_HOST` / `EDITOR_PORT` / `EDITOR_TOKEN`），已列入 `.gitignore` —— 不要改、不要提交
- `dist/*.html` 是原型导出成品（`mystar-home.html` 等），**不是**构建产物，不要改
- `tools/export-*.js` 是导出脚本，除非明确要求导出，不要动
- `stitch_minimalist_ai_knowledge_base*/`、`cankao.html` 是设计参考稿，只读
- 仓库根的其他目录（`kaya*`、`00_主线`、`产品技能`、`参考` 等）与本项目无关，**不要跨目录改动**

---

## 10. 交接备忘

- 本项目从压缩包解压而来，`mystar/` 在原包内的目录名是 `mystar_副本`（中文名，已重命名为 `mystar`，以避开 Windows 命令行的编码问题）。
- **整体回滚**用原始包：`../mystar-backups/2026-09-10-original-package/mystar_副本.zip`（68 MB）。
- 开发时用绝对路径引用文件；**命令行里不要出现中文字面量** —— PowerShell 会按 ANSI 解析导致路径乱码，这是本项目最容易踩的环境坑（曾导致解压出乱码目录、`Test-Path` 误报文件不存在）。

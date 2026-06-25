# 写作与修改参考

这份文档给后续写博客、改页面文案、找目录时快速使用。

---

## 1. 先看哪里

最常用的修改入口：

- 首页文案配置：[themes/mystar/_config.yml](themes/mystar/_config.yml)
- 首页结构模板：[themes/mystar/layout/index.ejs](themes/mystar/layout/index.ejs)
- 首页 Hero 模板：[themes/mystar/layout/partial/hero.ejs](themes/mystar/layout/partial/hero.ejs)
- About 页面内容：[source/about/index.md](source/about/index.md)
- About 页面布局：[themes/mystar/layout/page.ejs](themes/mystar/layout/page.ejs)
- 文章目录：[source/_posts/](source/_posts/)
- 发文模板：[scaffolds/post.md](scaffolds/post.md)
- 站点主配置：[./_config.yml](_config.yml)
- 主题样式：[themes/mystar/source/css/main.css](themes/mystar/source/css/main.css)

---

## 2. 博客文章怎么写

正式文章放在：

- [source/_posts/](source/_posts/)

你可以直接新建一个 `.md` 文件，也可以用命令生成：

```bash
npm run new:post -- "文章标题"
```

如果你想先写草稿：

```bash
npm run new:draft -- "文章标题"
```

生成时会套用：

- [scaffolds/post.md](scaffolds/post.md)

当前文章模板字段：

```yaml
---
title: {{ title }}
date: {{ date }}
description: 在这里填写一句话摘要。
tags:
  - 未分类标签
categories:
  - 未分类栏目
cover: /images/content/default-cover.jpg
excerpt: 可与 description 相同，作为列表摘要使用。
reading_time: 5 分钟
featured: false
---
```

建议最少填写这些：

- `title`
- `date`
- `description`
- `tags`
- `categories`
- `cover`

---

## 3. 一篇文章的推荐写法

```md
---
title: 文章标题
date: 2026-06-25 21:30:00
description: 一句话摘要。
tags:
  - 设计
  - AI
categories:
  - 方法
cover: /images/content/example-cover.jpg
excerpt: 文章摘要，可与 description 相同。
reading_time: 6 分钟
featured: false
---

这里开始写正文。

## 小标题

- 列表项 1
- 列表项 2
```

---

## 4. 改首页文案去哪里

直接改：

- [themes/mystar/_config.yml](themes/mystar/_config.yml)

当前首页文案已经做成配置化，主要看这几段：

- `home.hero`
- `home.latest`
- `home.quote_banner`

最常改的是：

```yml
home:
  hero:
    title: 首页主标题
    description: 首页简介
    cta_text: 按钮文字
  latest:
    title: 最新文章
  quote_banner:
    text: 底部引言
```

如果以后要改首页结构，再看：

- [themes/mystar/layout/index.ejs](themes/mystar/layout/index.ejs)
- [themes/mystar/layout/partial/hero.ejs](themes/mystar/layout/partial/hero.ejs)

---

## 5. 改 About 页面去哪里

如果只是改文字内容，直接改：

- [source/about/index.md](source/about/index.md)

如果要改 About 页布局结构，再看：

- [themes/mystar/layout/page.ejs](themes/mystar/layout/page.ejs)

---

## 6. 图片放哪里

当前项目里常用图片目录：

- 站点视觉图：[source/images/site/](source/images/site/)
- 内容配图：[source/images/content/](source/images/content/)
- 旧的文章图目录：[source/images/posts/](source/images/posts/)

建议后续这样区分：

- 首页、About、全站固定图，放 `source/images/site/`
- 文章封面和正文配图，优先放 `source/images/content/`
- `source/images/posts/` 先不再作为新文章默认目录，避免路径分散

图片引用时使用站点路径，例如：

```txt
/images/content/example-cover.jpg
```

---

## 7. 我后续怎么更新博客

日常最简流程：

1. 启动本地预览
2. 新建或修改 Markdown
3. 刷新页面检查效果
4. 生成静态文件
5. 后续接上 GitHub Pages 后再推送发布

常用命令：

```bash
npm run dev
npm run new:post -- "文章标题"
npm run new:draft -- "文章标题"
npm run publish:post -- "文章标题"
npm run new:page -- "页面名称"
npm run build
```

如果你只是改现有文章：

1. 打开对应的 `source/_posts/*.md`
2. 直接改标题、摘要、正文或封面路径
3. 在本地预览确认

如果你先写草稿再发布：

1. 用 `npm run new:draft -- "文章标题"` 创建草稿
2. 草稿会放到 `source/_drafts/`
3. 准备正式发布时执行 `npm run publish:post -- "文章标题"`
4. Hexo 会把它移动到 `source/_posts/`

---

## 8. 目录和内容类型怎么区分

这个项目里常见的内容类型：

- `post`：正式文章，放在 [source/_posts/](source/_posts/)
- `page`：独立页面，例如 About
- `draft`：草稿，默认不发布

当前主配置里和发文相关的几个点：

- 文章链接格式：[_config.yml](_config.yml)
  `permalink: posts/:title/`
- 草稿默认不渲染：[_config.yml](_config.yml)
  `render_drafts: false`
- 未来日期文章仍会渲染：[_config.yml](_config.yml)
  `future: true`

---

## 9. 后续如果想更方便

接下来我们可以继续补这些能力：

- 固化更好用的发文模板
- 增加草稿工作流
- 统一封面图命名规则
- 后续增加 RSS、sitemap、站内搜索 UI
- 如果写作频率高，再考虑更轻后台的编辑方案

---

## 10. 相关文档链接

仓库内文档：

- 工作流说明：[hexo-workflow.md](hexo-workflow.md)

官方文档：

- Hexo Writing: https://hexo.io/docs/writing
- Hexo Asset Folders: https://hexo.io/docs/asset-folders
- Hexo Plugins: https://hexo.io/docs/plugins
- Hexo GitHub Pages: https://hexo.io/docs/github-pages

---

## 11. 一句话记忆版

写文章主要改 `source/_posts/`，改首页文案主要改 `themes/mystar/_config.yml`，改页面结构主要看 `themes/mystar/layout/`，改视觉样式主要看 `themes/mystar/source/css/main.css`。

如果是先写草稿，就走 `source/_drafts/ -> publish -> source/_posts/` 这条线。

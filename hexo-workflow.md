# Hexo + GitHub Pages 工作流

## 1. 方案结论

我们当前正式采用：

- `Hexo` 作为静态博客生成器
- `GitHub` 作为代码仓库
- `GitHub Pages` 作为公开托管平台

这条路线的目标是：

- 保留我们的高定前端审美
- 避免每次发文都修改前端代码
- 让博客最终变成公开可访问的网站
- 保持后续更新流程足够简单

---

## 2. 为什么选这条路线

对当前项目来说，这套方案最适合下面几个需求：

- 前端视觉必须可深度定制
- 托管成本尽量低
- 更新内容尽量简单
- 我可以替你承担绝大多数开发和部署工作

更新内容时，你主要是新增 Markdown 文章，而不是改页面代码。

---

## 3. 整体工作流

完整链路如下：

1. 我们先搭建 Hexo 项目
2. 我们基于现有参考 UI 开发自定义主题
3. 文章内容放进 `source/_posts`
4. 本地预览确认视觉和内容
5. 推送到 GitHub 仓库
6. GitHub Actions 自动构建
7. GitHub Pages 自动发布
8. 最终绑定自定义域名

---

## 3.1 当前项目进度（2026-06-25）

按当前仓库状态，我们已经走到这里：

1. Hexo 项目已初始化完成
2. 自定义主题 `themes/mystar` 已建立
3. 首页、文章页、归档页已可本地预览
4. 标签页 / 分类页已有基础模板
5. `About` 页已有基础版本，但当前不作为优先精修页面

也就是说，接下来的工作不再是“从零搭项目”，而是进入“主题打磨 + 内容系统完善 + 上线准备”阶段。

---

## 4. 角色分工

## 4.1 我负责的部分

- 初始化 Hexo 项目
- 配置项目结构与依赖
- 开发自定义主题
- 将设计系统映射到主题代码
- 开发首页、文章页、归档页等核心页面
- 配置 GitHub Actions 自动部署
- 配置 GitHub Pages 发布流程
- 配置自定义域名所需的项目文件
- 排查构建与样式问题

## 4.2 你负责的部分

- 提供或确认 GitHub 账号
- 创建 GitHub 仓库
- 最终确认视觉效果
- 提供域名或购买域名
- 在域名服务商后台配置 DNS

---

## 5. 日常更新流程

这是以后你最常用的流程。

### 5.1 新增文章

1. 新建文章
2. 填写 front-matter
3. 编写正文
4. 本地预览
5. 提交并推送 GitHub
6. GitHub Pages 自动更新

### 5.2 你实际感受到的操作

更新博客时，你通常只需要做这些：

1. 打开项目
2. 新增一篇 Markdown
3. 写标题、摘要、日期、标签
4. 写正文
5. 推送仓库

如果你不想碰命令行，我们后面还可以再加：

- 固定的发文模板
- 更简单的脚本命令
- 后台式编辑方案，例如 Decap CMS

---

## 6. Hexo 基础工作方式

根据 Hexo 官方文档，初始化项目的基础命令是：

```bash
hexo init <folder>
cd <folder>
npm install
```

初始化后，最关键的目录是：

- `_config.yml`
- `scaffolds/`
- `source/`
- `themes/`

其中：

- `source/_posts/` 用来放文章
- `themes/` 用来放主题
- `scaffolds/` 用来放文章模板

参考：

- Hexo Setup: https://hexo.io/docs/setup

---

## 7. 写文章的标准方式

根据 Hexo 官方文档，创建文章的基础命令是：

```bash
hexo new post "文章标题"
```

Hexo 默认会把文章放到：

```txt
source/_posts/
```

如果是草稿，可以使用：

```bash
hexo new draft "文章标题"
```

后续再发布草稿：

```bash
hexo publish post "文章标题"
```

参考：

- Hexo Writing: https://hexo.io/docs/writing

---

## 8. 我们的内容规范

为了后续稳定维护，我们约定每篇文章至少包含这些字段：

```yaml
title: 文章标题
date: 2026-06-25 10:00:00
description: 一句话摘要
tags:
  - 设计
  - AI
categories:
  - 随笔
cover: /images/content/example-cover.jpg
```

建议后续再补：

- `excerpt`
- `reading_time`
- `featured`
- `toc`

---

## 9. 本地开发流程

本地开发的标准顺序：

1. 安装依赖
2. 启动本地预览
3. 修改主题或文章
4. 预览检查
5. 生成静态文件

常用命令会是：

```bash
npm install
hexo clean
hexo server
hexo generate
```

本地预览通过后再推送仓库。

---

## 9.1 接下来逐步开发的推荐顺序

为了避免边做边散，我们建议按下面顺序推进：

1. 先收范围
2. 再打磨首页
3. 再完成文章阅读体验
4. 再补内容系统页
5. 再优化发文流程
6. 最后接自动部署

每一步具体含义如下：

### Step 1：收范围

- 明确 P0 只围绕首页、文章页、归档、标签、分类
- `About` 页保持简洁文字版，不继续扩张页面结构
- 停止继续扩张页面种类

### Step 2：首页精修

- 调整导航、Hero、文章流、引言图像区
- 统一留白、字号、边框、图片质感
- 优先把首页做成可作为视觉基准的页面

### Step 3：文章页完善

- 完成 Markdown 正文样式
- 补齐标题、段落、列表、引用、代码块、图片样式
- 视需要加入阅读时长、相关文章等模块

### Step 4：内容系统页补齐

- 完善 Archive 页面节奏
- 检查 Tag / Category 页结构是否一致
- 验证无文章、少文章、多文章时的展示状态

### Step 5：发文流程优化

- 固化 `scaffolds/post.md`
- 统一封面图路径和命名
- 明确 front-matter 最低字段要求

### Step 6：部署上线

- 配置 GitHub Actions
- 接通 GitHub Pages
- 后续再绑定自定义域名

---

## 9.2 还剩多少流程

从当前状态看，主线还剩 4 个开发段和 1 个上线段：

1. 首页视觉精修
2. 文章页阅读体验完善
3. 内容系统页统一
4. 发文工作流标准化
5. GitHub Pages 部署上线

更适合执行的理解方式是：

- 先做 1 个范围确认段
- 再做 4 个开发段
- 最后做 1 个上线段

也就是总共还剩 `6` 个连续阶段。

---

## 9.3 接下来怎么逐步开发

为了后面推进更稳，我们按下面节奏执行：

### Phase 0：范围冻结

- 目标：不再继续发散页面种类和装饰性模块
- 当前结论：首页、文章页、归档、标签、分类是 P0 主线
- 当前结论：`About` 页只保留简洁介绍，不再继续堆图片或复杂模块
- 完成标志：后续开发只围绕核心阅读体验展开

### Phase 1：首页精修

- 目标：把首页做成整站视觉基准
- 具体任务：调整导航、Hero、文章流、分区节奏、图片比例和留白
- 产出结果：首页达到可定稿状态，后续页面以此复用风格

### Phase 2：文章页阅读体验

- 目标：让 Markdown 内容读起来稳定、舒服、清晰
- 具体任务：补齐标题、段落、列表、引用、代码块、图片、分隔线等样式
- 产出结果：任意一篇文章都能保持一致的阅读质感

### Phase 3：内容系统页统一

- 目标：让 Archive / Tag / Category 保持同一套结构语言
- 具体任务：统一标题区、列表密度、空状态、少量内容和多内容状态
- 产出结果：所有内容索引页结构一致，不会像临时拼出来的页面

### Phase 4：发文工作流标准化

- 目标：把“写一篇文章”这件事尽量变成固定动作
- 具体任务：整理 `scaffolds/post.md`、front-matter 规范、封面图命名与目录约定
- 产出结果：后续新增文章时，主要只需要写 Markdown

### Phase 5：部署上线

- 目标：让站点稳定发布到 GitHub Pages
- 具体任务：创建仓库、补 `.github/workflows/pages.yml`、接通 Pages、验证构建
- 产出结果：每次 push 自动发布，后面再接自定义域名

---

## 9.4 我们下一步的推荐执行顺序

按你现在这个项目状态，我建议我们这样推进：

1. 先把首页精修完，作为视觉母版
2. 再完善文章页，把正文阅读体验拉齐
3. 接着统一归档、标签、分类页
4. 然后固化 Markdown 发文流程
5. 最后接 GitHub Pages 上线

如果按开发优先级来算，我们现在真正还没完成的是：

1. 首页
2. 文章页
3. 内容系统页
4. 发文流程
5. 部署上线

---

## 10. GitHub Pages 发布流程

根据 Hexo 官方文档，现在推荐的 GitHub Pages 方式是通过 `GitHub Actions` 自动部署。

推荐流程：

1. 创建 GitHub 仓库
2. 把 Hexo 项目源码推送到默认分支
3. 在仓库设置里启用 GitHub Pages
4. 选择 `GitHub Actions` 作为发布来源
5. 添加 Pages 工作流
6. 每次 push 自动构建并发布

Hexo 官方也明确说明：

- 源码仓库里不应该提交 `public/`
- `public/` 应保持在 `.gitignore` 中

参考：

- Hexo GitHub Pages: https://hexo.io/docs/github-pages

---

## 11. 自定义域名流程

GitHub Pages 支持自定义域名，包括：

- `www.example.com`
- `blog.example.com`
- `example.com`

我们的标准做法：

1. 在仓库中配置 Pages 域名
2. 在项目里保留 `CNAME`
3. 去域名服务商配置 DNS
4. 等待 GitHub Pages 生效
5. 开启 HTTPS

Hexo 官方说明，如果使用自定义域名，需要把 `CNAME` 文件放到 `source/` 目录中。

参考：

- GitHub Pages custom domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages
- Hexo GitHub Pages: https://hexo.io/docs/github-pages

---

## 12. 我们的推荐仓库结构

后续项目建议结构如下：

```txt
.
├── _config.yml
├── package.json
├── scaffolds/
├── source/
│   ├── _posts/
│   ├── about/
│   ├── archives/
│   ├── images/
│   └── CNAME
├── themes/
│   └── mystar/
└── .github/
    └── workflows/
        └── pages.yml
```

---

## 13. 主题开发原则

因为我们不是套默认主题，所以主题开发要遵守这几个原则：

1. 主题从零定制，不依赖现成模板风格
2. 视觉严格服从 `sheji.md` 与 `design-tokens.json`
3. 首页和文章页优先
4. 优先保留留白、排版层级和玻璃质感
5. 先完成静态结构，再补动效与内容映射

---

## 14. 后续可升级项

如果你后面觉得“写 Markdown + push”依然不够方便，我们可以加第二阶段升级：

### 14.1 轻后台方案

- `Decap CMS`

效果：

- 文章通过网页后台编辑
- 内容仍然提交到 GitHub
- 仍然走 GitHub Pages 发布

### 14.2 搜索与增强

- 本地搜索
- 目录导航
- 相关文章
- 标签页与分类页增强

---

## 15. 我们接下来的执行顺序

1. 先完成 Hexo 工作流确认
2. 初始化项目
3. 搭建自定义主题骨架
4. 开发首页
5. 开发文章详情页
6. 配置 GitHub Pages 自动部署
7. 接入自定义域名
8. 优化发文流程

---

## 16. 一句话结论

这套 Hexo 路线的核心思想是：

前端高定主题由我来负责，内容更新尽量简化为“写 Markdown + 推 GitHub”，网站公开访问由 GitHub Pages 承担。

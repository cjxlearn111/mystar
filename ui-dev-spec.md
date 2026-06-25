# UI 开发桥接规范

## 1. 文档目的

这份文档用于把 [sheji.md](/Users/a18966494010/Documents/自学编程等/mystar/sheji.md:1) 和 [design-tokens.json](/Users/a18966494010/Documents/自学编程等/mystar/design-tokens.json:1) 转成前端开发可直接执行的规范。

补充说明（2026-06-25）：

- 这份文档保留为“设计到工程的桥接参考”
- 当前实际落地栈已改为 `Hexo + EJS + CSS`
- 文中提到的 `Next.js`、`Tailwind`、`MDX` 可视为结构参考，而不是当前仓库的直接实施标准
- 真正执行时，以 `themes/mystar/` 下的主题代码和 `hexo-dev-plan.md` 的阶段规划为准

它解决的是三个问题：

1. token 如何进入工程
2. 组件应该按什么顺序开发
3. 首页和文章页该如何拆成可维护模块

---

## 2. 工程映射原则

### 2.1 样式来源优先级

统一按以下优先级执行：

1. `design-tokens.json`
2. `sheji.md`
3. Stitch / Variant 参考稿
4. 具体页面实现

### 2.2 样式实现原则

- 所有基础颜色、字号、圆角、阴影优先进入 Tailwind theme
- 所有跨组件会复用的值优先转成 CSS Variables
- 页面里尽量少写魔法值
- 允许少量临时值，但后续必须回收进 token

### 2.3 组件原则

- 先搭页面主骨架，再抽组件
- 先稳定版式，再补 hover、transition、细节材质
- shadcn/ui 只借结构和可访问性，不直接用默认视觉

---

## 3. CSS Variables 规范

建议在 `app/globals.css` 或等价全局样式文件中定义以下变量。

## 3.1 颜色变量

```css
:root {
  --bg-page: #faf8fe;
  --bg-surface: #ffffff;
  --bg-surface-muted: #f4f3f8;
  --bg-panel: #eeedf3;
  --bg-panel-high: #e9e7ed;
  --bg-panel-highest: #e3e2e7;

  --text-primary: #1a1b1f;
  --text-secondary: #444748;
  --text-muted: #5d5e60;
  --text-subtle: #858383;
  --text-inverse: #f1f0f5;

  --border-default: #c4c7c7;
  --border-strong: #747878;
  --border-soft: rgba(0, 0, 0, 0.06);
  --border-glass: rgba(255, 255, 255, 0.4);

  --brand-primary: #000000;
  --brand-on-primary: #ffffff;
  --brand-accent: #2b82f4;

  --overlay-scrim: rgba(0, 0, 0, 0.4);
  --overlay-glass: rgba(255, 255, 255, 0.75);

  --selection-bg: rgba(0, 0, 0, 0.08);
  --selection-text: #111111;
}
```

## 3.2 排版变量

```css
:root {
  --font-display: "Bodoni Moda", serif;
  --font-body: "Inter", "Noto Sans SC", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;

  --text-display-lg: 72px;
  --text-headline-lg: 48px;
  --text-headline-lg-mobile: 32px;
  --text-headline-md: 32px;
  --text-body-lg: 18px;
  --text-body-md: 16px;
  --text-label-caps: 12px;
  --text-meta-xs: 10px;
  --text-code-sm: 13px;
}
```

## 3.3 间距与材质变量

```css
:root {
  --space-base: 8px;
  --container-max: 1120px;
  --content-narrow: 720px;
  --content-prose: 680px;
  --gutter: 24px;
  --page-margin-desktop: 64px;
  --page-margin-mobile: 20px;

  --radius-sm: 2px;
  --radius-default: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;

  --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.04);
  --shadow-floating: 0 12px 40px rgba(0, 0, 0, 0.05);

  --blur-glass: 20px;
  --blur-glass-strong: 28px;
}
```

---

## 4. Tailwind Theme 映射

建议后续在 `tailwind.config.ts` 中扩展以下主题结构。

```ts
extend: {
  colors: {
    background: "var(--bg-page)",
    surface: "var(--bg-surface)",
    "surface-muted": "var(--bg-surface-muted)",
    panel: "var(--bg-panel)",
    "panel-high": "var(--bg-panel-high)",
    "panel-highest": "var(--bg-panel-highest)",

    foreground: "var(--text-primary)",
    "foreground-secondary": "var(--text-secondary)",
    muted: "var(--text-muted)",
    subtle: "var(--text-subtle)",

    border: "var(--border-default)",
    "border-strong": "var(--border-strong)",
    "border-soft": "var(--border-soft)",

    primary: "var(--brand-primary)",
    "primary-foreground": "var(--brand-on-primary)",
    accent: "var(--brand-accent)"
  },
  fontFamily: {
    display: ["var(--font-display)"],
    body: ["var(--font-body)"],
    mono: ["var(--font-mono)"]
  },
  fontSize: {
    "display-lg": ["72px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
    "headline-lg": ["48px", { lineHeight: "1.2", fontWeight: "500" }],
    "headline-lg-mobile": ["32px", { lineHeight: "1.2", fontWeight: "500" }],
    "headline-md": ["32px", { lineHeight: "1.3", fontWeight: "400" }],
    "body-lg": ["18px", { lineHeight: "1.7", fontWeight: "400" }],
    "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
    "label-caps": ["12px", { lineHeight: "1.1", letterSpacing: "0.12em", fontWeight: "600" }],
    "meta-xs": ["10px", { lineHeight: "1.2", letterSpacing: "0.14em", fontWeight: "600" }],
    "code-sm": ["13px", { lineHeight: "1.6", fontWeight: "400" }]
  },
  maxWidth: {
    container: "1120px",
    narrow: "720px",
    proseReading: "680px"
  },
  spacing: {
    gutter: "24px",
    "page-desktop": "64px",
    "page-mobile": "20px"
  },
  borderRadius: {
    sm: "2px",
    DEFAULT: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    "2xl": "16px"
  },
  boxShadow: {
    soft: "0 4px 20px rgba(0, 0, 0, 0.04)",
    floating: "0 12px 40px rgba(0, 0, 0, 0.05)"
  },
  backdropBlur: {
    glass: "20px",
    "glass-strong": "28px"
  }
}
```

---

## 5. 推荐基础工具类

后续建议在全局样式或 `@layer components` 中沉淀这些语义类。

### 5.1 布局类

- `.container-shell`
- `.container-reading`
- `.page-section`
- `.page-frame`

建议职责：

- `container-shell`: 主内容最大宽度 + 左右边距
- `container-reading`: 文章窄栏阅读容器
- `page-section`: 通用区块上下间距
- `page-frame`: 桌面大边距、移动安全边距

### 5.2 文本类

- `.text-display`
- `.text-headline`
- `.text-body`
- `.text-meta`
- `.text-label`

### 5.3 材质类

- `.glass-surface`
- `.soft-card`
- `.divider-soft`
- `.reading-prose`

---

## 6. 组件库清单

## 6.1 P0 必做组件

1. `SiteHeader`
2. `SiteFooter`
3. `HeroIntro`
4. `PrimaryButton`
5. `SecondaryButton`
6. `Tag`
7. `PostListItem`
8. `PostMetaRow`
9. `ArticleHero`
10. `ArticleProse`
11. `CodeBlock`
12. `RelatedPostCard`

## 6.2 P1 可扩展组件

1. `MobileNavDrawer`
2. `NewsletterForm`
3. `QuoteBanner`
4. `SectionHeading`
5. `CategoryFilter`
6. `ScrollProgress`

---

## 7. 组件职责定义

### 7.1 `SiteHeader`

负责：

- Logo
- 顶部导航
- 当前页面高亮
- 移动端菜单入口

视觉要求：

- sticky
- glass blur
- 低对比边框

### 7.2 `SiteFooter`

负责：

- 品牌信息
- 导航分组
- 社交信息
- 版权信息

### 7.3 `HeroIntro`

负责：

- 首页价值表达
- 栏目标识
- Hero 标题
- 导语
- 主 CTA
- 辅助视觉图像与悬浮卡片

### 7.4 `PostListItem`

负责：

- 日期
- 标签
- 标题
- 摘要
- hover 状态

### 7.5 `ArticleProse`

负责：

- MDX 内容排版
- 标题、段落、列表、引用、代码块统一样式

### 7.6 `RelatedPostCard`

负责：

- 缩略图
- 标题
- 轻元信息

---

## 8. 页面拆解方案

## 8.1 首页拆解

首页建议拆成以下模块：

1. `SiteHeader`
2. `HeroIntro`
3. `PostStreamSection`
4. `QuoteBanner`
5. `SiteFooter`

### 8.1.1 `PostStreamSection` 内部结构

- Section 标题
- 分类切换
- `PostListItem[]`
- “加载更多”按钮

## 8.2 文章页拆解

文章页建议拆成以下模块：

1. `SiteHeader`
2. `BackLink`
3. `PostMetaRow`
4. `ArticleHero`
5. `ArticleProse`
6. `RelatedPostsSection`
7. `SiteFooter`

---

## 9. 目录结构建议

建议后续项目目录按下面组织：

```txt
app/
  page.tsx
  posts/
    [slug]/
      page.tsx
components/
  layout/
    site-header.tsx
    site-footer.tsx
  home/
    hero-intro.tsx
    post-stream-section.tsx
    quote-banner.tsx
  posts/
    post-list-item.tsx
    post-meta-row.tsx
    article-hero.tsx
    article-prose.tsx
    related-post-card.tsx
  ui/
    primary-button.tsx
    secondary-button.tsx
    tag.tsx
lib/
  posts.ts
  utils.ts
content/
  posts/
```

---

## 10. 开发顺序建议

## 10.1 Phase 1：基础环境

1. Next.js 初始化
2. Tailwind 配置
3. 字体接入
4. CSS Variables 接入
5. Theme token 映射

## 10.2 Phase 2：基础骨架

1. `SiteHeader`
2. `SiteFooter`
3. 主容器与阅读容器类
4. Button / Tag 基础组件

## 10.3 Phase 3：首页

1. `HeroIntro`
2. `PostListItem`
3. `PostStreamSection`
4. `QuoteBanner`

## 10.4 Phase 4：文章页

1. `PostMetaRow`
2. `ArticleHero`
3. `ArticleProse`
4. `RelatedPostCard`

## 10.5 Phase 5：内容系统

1. MDX 接入
2. 文章数据读取
3. 文章列表联动
4. slug 页面生成

---

## 11. 验收标准

开发过程中每个页面都按以下标准验收：

### 11.1 视觉

- 与参考方向一致
- 颜色、圆角、阴影不漂移
- 排版稳定

### 11.2 工程

- 没有大段重复 class
- 能被拆分成清晰组件
- 没有大量魔法值

### 11.3 响应式

- Mobile 可读
- Tablet 不拥挤
- Desktop 有留白

### 11.4 内容体验

- 首页可快速理解站点定位
- 文章页长文阅读舒适
- 代码块、引用、列表有稳定样式

---

## 12. 当前结论

到这一步，我们已经具备正式开始工程开发的前置条件：

1. 有产品 PRD
2. 有设计系统规范
3. 有 design tokens
4. 有工程映射规则
5. 有组件库清单
6. 有页面拆解方案

下一步就可以直接初始化 Next.js 项目并安装依赖。

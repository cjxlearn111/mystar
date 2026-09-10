# Kaya 交互嫁接到 mystar 的技术方案

## 结论

可以实现。

最终实现为两个独立页面，文件都属于 `mystar/`，运行时互不混合：

```text
/mystar/       -> Kaya 独立开场页
/mystar/home/  -> mystar 完整主页
```

用户点击 Kaya 的 `See all the rooms` 后，通过普通链接进入 `/mystar/home/`。
Kaya 不作为 mystar 的遮罩、iframe、弹层或首页组件存在。

这样可以保留截图中的第一印象，又不会破坏 mystar 现有的侧边栏、简历锚点和文章区结构。

## 已确认的 Kaya 技术

`kaya-assets/hero-srcdoc.html` 已经包含完整的 Three.js 场景，不是静态截图：

- `#scene`：透明 WebGL canvas。
- `buildGrove()`：生成樱花树枝、花簇和场景层次。
- `fallingSprite()`：生成花瓣纹理。
- `buildAmbient()`：生成漂浮环境粒子。
- `buildCursorSpray()`：生成鼠标移动时的花瓣喷流。
- `updateMouse()`：把鼠标坐标投射到 3D 平面。
- `renderFrame()`：驱动相机、树枝、远近景和花瓣动画。
- `hero` 上的 `--px`、`--py`：驱动 CSS 层的克制视差。
- `prefers-reduced-motion`：已有基础的减少动效处理。

因此，截图里的“鼠标拖动带动花瓣和枝干”可以直接复用现有算法，不需要重新手写一套假的 CSS 花瓣。

## 不建议直接搬运的部分

以下部分属于 Kaya 整站，不应该一起接入 mystar：

- `main.js` 中的 Lenis 平滑滚动。
- `GSAP`、`ScrollTrigger`、`SplitText` 的整页滚动编排。
- Kaya 的 rooms、baths、day、stay 章节。
- Kaya 的独立 dock 导航。
- Kaya 的 loader、cursor 和整套页面主题样式。
- 当前 `hero-srcdoc.html` 内 5000 多行的完整单页 HTML。

这些代码依赖 Kaya 自己的 DOM、滚动结构和章节 ID。整包复制会覆盖 mystar 的 body、颜色、字体、导航和首页布局，后续维护成本很高。

## 最终实现结构

### 1. Kaya 根页面

文件：

```text
mystar/source/index.html
```

这是完整的 Kaya 独立页面，包含自己的 DOM、CSS、Three.js 场景和花瓣交互。

入口按钮只执行普通跳转：

```js
window.location.href = '/mystar/home/';
```

### 2. mystar 主页

根目录 `_config.yml` 将 Hexo 首页生成到 `home/`：

```yaml
index_generator:
  path: home
```

因此原有 mystar 首页模板继续生成到：

```text
mystar/public/home/index.html
```

原有侧边栏、Hero、简历分区、引用横幅和相关文章保持独立。

### 3. 本地资源

```text
mystar/source/index.html
mystar/source/kaya/
```

运行时不依赖 `kaya-assets/` 或外部 CDN。

### 4. 资源落点

入口文件和运行依赖已经全部归入 `mystar/`：

```text
mystar/source/kaya-entry.html
mystar/source/kaya/three.min.js
mystar/source/kaya/lexend-latin.woff2
mystar/source/kaya/shippori-mincho-400-latin.woff2
mystar/source/kaya/shippori-mincho-500-latin.woff2
mystar/source/kaya/card-house-v3.png
mystar/source/kaya/card-water-v2.png
```

运行时不依赖 `kaya-assets/`，也不依赖外部 CDN。

```text
https://cdn.jsdelivr.net/gh/Sam1983Aing/aura-assets@1.8.0/kaya/three.min.js
```

Kaya 的花瓣、枝干和环境粒子主要由代码生成。截图中的卡片图片属于入口文件自带的开场视觉，暂按原引用保留。

## 交互流程

### 初次进入

- 页面先显示全屏 Kaya 场景。
- Three.js 场景完成初始化后执行现有入口 reveal。
- 鼠标移动时：
  - 相机轻微偏移。
  - 近景和远景树枝产生不同幅度的视差。
  - 鼠标经过区域出现少量花瓣拖尾。
- 不做持续的大幅镜头推进，避免入口还没看清就跳走。

### 点击进入

点击按钮后：

1. 给入口层添加 `.is-exiting`。
2. 入口文案和 canvas 在约 700ms 内淡出。
3. 给 mystar 主页面移除 `.is-hidden`。
4. 停止 `requestAnimationFrame`。
5. 清理 Three.js geometry、material、renderer。
6. 入口层从 DOM 移除。

入口采用本地 iframe 承载 Kaya 场景。iframe 只负责隔离 Kaya 的全屏入口 DOM 和样式，父页面负责进入 mystar：

- iframe 内按钮通过 `postMessage` 通知父页面。
- 父页面收到消息后淡出并移除 iframe。
- Kaya 入口不接管 mystar 的滚动和导航。
- 资源只从 `mystar/source/` 生成的静态文件加载。

这是本次正式实现方案，不再把 Kaya 的整页 DOM 和 CSS 直接混入 mystar。

## 页面显示策略

建议使用 sessionStorage 控制入口出现频率：

```js
const seen = sessionStorage.getItem('mystar-kaya-entry');
```

推荐行为：

- 当前标签页第一次打开：显示入口。
- 点击进入后：写入 `sessionStorage`。
- 刷新当前标签页：直接进入 mystar。
- 新开标签页：再次展示入口。

如果希望每次刷新都展示入口，只需不使用 sessionStorage。

## 性能边界

Kaya 原场景的近景花瓣数量较高，桌面端可以保留较完整的效果，移动端需要使用已有的窄屏分支：

- 降低近景花瓣数量。
- 降低远景粒子数量。
- 关闭花瓣拖尾或只保留少量粒子。
- 关闭高成本的抗锯齿。
- `prefers-reduced-motion: reduce` 时显示静态入口，不启动持续渲染。

入口场景只在用户点击前运行，进入 mystar 后停止，因此不会长期占用首页性能。

## 样式隔离

所有入口样式统一加 `kaya-entry-` 前缀：

```text
.kaya-entry
.kaya-entry-canvas
.kaya-entry-copy
.kaya-entry-button
```

不要复用 Kaya 的 `.hero`、`.card`、`.dock`、`.cursor` 等通用类名，避免覆盖 mystar 现有 CSS。

入口配色可以沿用 Kaya 的：

- 深梅紫背景：`#3c2c36`
- 花瓣粉：`#e8a0af`
- 浅米白文字：`#f4efea`

进入 mystar 后恢复现有主题颜色，不让 Kaya 颜色变量污染全站。

## 实施顺序

1. 将 `hero-srcdoc.html` 收纳为 `mystar/source/kaya-entry.html`。
2. 新建 `themes/mystar/layout/partial/kaya-entry.ejs`。
3. 新建 `themes/mystar/source/js/kaya-entry.js`。
4. 在首页 `index.ejs` 插入入口层。
5. 在 `main.css` 增加入场层和退出层样式。
6. 通过 `postMessage` 把 iframe 内按钮接到 mystar。
7. 点击后写入 `sessionStorage`，停止并移除入口 iframe。

## 验收标准

- 首页首次打开时，先看到全屏 Kaya 樱花场景。
- 所有运行时接入文件都位于 `mystar/` 内，`kaya-assets/` 不参与运行。
- 鼠标移动能看到克制的枝干视差和花瓣拖尾。
- 点击“进入 mystar”后，能平滑显示现有 mystar 首页。
- 现有侧边栏锚点仍然可以定位教育、实习、项目等内容。
- 进入 mystar 后 Kaya 的动画循环停止。
- 文章页、归档页和 About 页不显示 Kaya 入口。
- 移动端不出现横向滚动，减少动效设置有效。

## 最终判断

技术上可行，且推荐实施。

推荐方案不是把 Kaya 整页嵌进 mystar，而是把 Kaya 的“入口场景能力”拆出来，作为 mystar 首页的独立首屏入口。这样能得到截图中的开场气质和花瓣交互，同时保留 mystar 现在已经完成的简历和文章结构。

# 图片库使用规范

## 1. 目标

为了提升整个网站的质感，我们现在建立统一的图片资源库。

这样做的目的有三个：

1. 后续加图不会混乱
2. 首页、文章页、About 页都能共用统一资源体系
3. 我后面开发时可以直接按固定路径调用图片

---

## 2. 图片统一存放位置

你后续添加图片，请统一放在：

`source/images/`

这是当前站点的公共图片目录，Hexo 构建后会自动发布到网站里。

---

## 3. 目录结构说明

目前我已经为你建好了这些目录：

```txt
source/images/
├── about/
├── content/
├── og/
├── posts/
├── site/
└── uploads/
```

各目录用途如下。

### 3.1 `source/images/site/`

放站点级公共图片：

- 首页 Hero 主图
- 首页大横幅图
- 全站通用背景图
- 品牌相关视觉图

适合放：

- 最能代表你网站气质的图片
- 首页会重复使用的核心视觉图

### 3.2 `source/images/posts/`

放文章封面图：

- 每篇文章的 cover
- 列表页缩略图
- 相关文章卡片图

建议：

- 一篇文章一张主封面
- 统一比例

### 3.3 `source/images/content/`

放文章正文中插入的图片：

- 正文插图
- 截图
- 说明图
- 资料图

适合按文章主题分子目录，例如：

```txt
source/images/content/post-name/
```

### 3.4 `source/images/about/`

放 About 页面相关图片：

- 个人肖像
- 工作照
- 空间照
- 品牌介绍图

### 3.5 `source/images/og/`

放分享图：

- Open Graph 图片
- 社交媒体分享封面
- Twitter / X 卡片图

### 3.6 `source/images/uploads/`

临时上传区：

- 暂时不知道该归哪类的图片
- 先放进来，后面再整理

注意：

- 这里只做临时缓冲
- 最终最好移动到正式目录

---

## 4. 你后面应该把图片放哪里

最简单的记法：

- 首页或全站图：`source/images/site/`
- 文章封面：`source/images/posts/`
- 正文插图：`source/images/content/`
- About 页图：`source/images/about/`
- 分享图：`source/images/og/`

如果你现在只是想先开始囤图，最推荐你先放到：

`source/images/site/`
和
`source/images/posts/`

因为这两类最先会影响你的网站质感。

---

## 5. 命名规范

建议统一使用英文小写和短横线：

正确示例：

- `hero-editorial-light.jpg`
- `homepage-quote-banner.jpg`
- `post-architecture-of-silence-cover.jpg`
- `about-portrait-01.jpg`

不建议：

- `图片1.jpg`
- `最终版真的最终版.png`
- `IMG_8473.PNG`

原因：

- 后续引用更清晰
- Git 里更好管理
- 不容易重复混乱

---

## 6. 推荐格式

优先建议：

- `.jpg`：适合摄影图、封面图、大图
- `.png`：适合透明底、UI 截图
- `.webp`：适合压缩后上线使用

建议：

- 首页大图尽量控制体积
- 不要一开始就塞超大原图

---

## 7. 当前开发阶段最需要的图片

如果你现在想尽快提升网站观感，建议优先准备这几类：

1. 首页 Hero 主图
2. 首页中部横幅图
3. 示例文章封面图
4. 相关文章卡片图
5. About 页个人或空间图

---

## 8. 当前示例路径写法

以后在文章 front-matter 里，封面图可以这样写：

```yaml
cover: /images/posts/post-architecture-of-silence-cover.jpg
```

正文图片可以这样写：

```md
![图片说明](/images/content/post-name/scene-01.jpg)
```

首页公共图后面我会这样接：

```txt
/images/site/hero-editorial-light.jpg
```

---

## 9. 现在你可以怎么做

你现在就可以开始往这些目录里放图。

如果你暂时还不确定怎么分类，先放到：

`source/images/uploads/`

等你发我图片用途，我再帮你归位并接到页面里。

---

## 10. 一句话结论

以后你加图片，统一放在：

`source/images/`

其中最常用的是：

- `source/images/site/`
- `source/images/posts/`

你先把图片往这两个目录里放，后面我来帮你接入页面。


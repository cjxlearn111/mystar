# GitHub Pages 部署参考

这份文档用于确认当前项目是否已经具备上线条件，以及下一步如何接通 GitHub Pages 自动发布。

---

## 1. 当前状态结论

当前项目已经具备这些上线基础：

- Hexo 项目可正常本地构建
- `public/` 已加入 `.gitignore`
- GitHub Pages 工作流文件已存在：
  [`.github/workflows/pages.yml`](.github/workflows/pages.yml)
- 主题和页面已经可以正常生成静态文件

当前还缺的关键条件：

- 当前目录还不是 Git 仓库
- 还没有 GitHub 远程仓库
- GitHub Pages 还没有在仓库设置中开启
- 站点正式地址还没写进 [_config.yml](_config.yml)
- 还不确定你最终使用的是：
  - 用户主页仓库：`username.github.io`
  - 项目仓库：`repo-name`
  - 自定义域名

所以结论是：

工作流骨架已经有了，但现在还不能真正发布到线上；只要把 Git 仓库、远程仓库和站点地址配置补齐，就可以接通。

补充更新：

- 本地 Git 仓库现在已经初始化完成
- 当前项目已切到项目仓库模式：
  - `url: https://cjxlearn111.github.io`
  - `root: /mystar/`
- 当前 GitHub 用户名已确定为 `cjxlearn111`

---

## 2. 当前项目里已经有的部署文件

### 2.1 GitHub Actions 工作流

文件：

- [`.github/workflows/pages.yml`](.github/workflows/pages.yml)

它当前会做这些事：

1. 在 `main` 分支 push 时触发
2. 安装依赖
3. 执行 `npm run build`
4. 上传 `public/` 作为 Pages 制品
5. 发布到 GitHub Pages

这条主线是对的，适合 Hexo + Pages。

### 2.2 忽略静态产物

文件：

- [`.gitignore`](.gitignore)

当前已经忽略：

- `public/`
- `node_modules/`
- `.deploy_git/`

这符合 GitHub Pages 的推荐思路：源码仓库提交源代码，不提交 `public/`。

---

## 3. 现在最可能导致上线失败的点

### 3.1 还不是 Git 仓库

本地检查结果显示当前目录还没有 `.git/`。

这意味着：

- 还不能真正 `push`
- GitHub Actions 也没有地方可跑

### 3.2 站点 URL 还是占位值

当前 [_config.yml](_config.yml) 里是：

```yml
url: https://example.com
```

这个值上线前必须改成真实地址，否则最终生成的链接、SEO 地址和部分资源引用都可能不对。

### 3.3 还没确认 Pages 类型

你后面可能有三种情况：

1. `username.github.io`
2. 普通项目仓库，例如 `mystar`
3. 自定义域名

这会影响 Hexo 的部署配置重点，尤其是：

- `url`
- 是否需要 `root`
- 是否需要 `source/CNAME`

---

## 4. 上线前最推荐的顺序

### Phase 1：把仓库接起来

1. 初始化 Git 仓库
2. 创建 GitHub 仓库
3. 添加远程仓库
4. 把源码推到 `main`

### Phase 2：确认访问地址

你需要先决定最终是哪一种：

- `username.github.io`
- `repo-name`
- 自定义域名

然后修改：

- [_config.yml](_config.yml) 里的 `url`

如果是项目仓库，通常还要补 `root`。

### Phase 3：开启 GitHub Pages

在 GitHub 仓库设置中：

1. 打开 `Settings`
2. 进入 `Pages`
3. Source 选择 `GitHub Actions`

### Phase 4：验证第一次自动发布

1. push 一次代码
2. 等待 Actions 跑完
3. 检查生成的网址
4. 核对首页、文章页、图片路径是否正常

---

## 5. 如果是不同 Pages 方案，要注意什么

### 5.1 用户主页仓库

例如：

```txt
https://yourname.github.io/
```

通常：

- `url` 写成完整域名
- 一般不需要额外设置 `root`

### 5.2 项目仓库

例如：

```txt
https://yourname.github.io/mystar/
```

通常：

- `url` 写成 `https://yourname.github.io`
- `root` 写成 `/mystar/`

如果这里漏掉 `root`，最常见的问题是：

- 样式路径不对
- 图片路径不对
- 页面 404

### 5.3 自定义域名

例如：

```txt
https://blog.example.com/
```

通常：

- `url` 改成自定义域名
- 在 `source/` 下增加 `CNAME`
- 去域名服务商配置 DNS

---

## 6. 我们下一步能不能搭成功

可以，但当前还不能直接证明“已经上线成功”，因为有两项必须依赖外部状态：

- 你得先有 GitHub 仓库
- 你得先决定最终的访问地址

也就是说：

- 本地层面：已经可以把工作流骨架准备好
- 仓库层面：还差 Git 和 GitHub
- 线上层面：还差 Pages 设置和第一次 push 验证

---

## 7. 我建议你下一步就做什么

优先级最高的是这两件事：

1. 确认 GitHub 仓库名称
2. 确认你是走 `username.github.io` 还是普通项目仓库

只要这两个信息确定下来，我就可以继续把部署配置收口成最终可用版本。

---

## 8. 相关链接

官方文档：

- Hexo GitHub Pages: https://hexo.io/docs/github-pages
- Hexo Config: https://hexo.io/docs/configuration
- GitHub Pages with custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

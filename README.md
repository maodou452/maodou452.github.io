# 个人主页 · 打游戏 & 撸小动物 🎮🐾

一个纯静态的个人主页，零构建、零依赖，直接丢到 GitHub Pages 就能访问。

- 深色电竞风 + 小动物可爱元素，支持深色 / 浅色切换
- 响应式布局（手机、平板、桌面都能看）
- 打字机标题、滚动进场动画、数字滚动、属性条动画
- 彩蛋：点击右上角 🐾（或左侧 logo）会下「爪印雨」，键盘输入 `↑↑↓↓←→←→BA` 也会触发
- 无障碍：键盘可达、有 `skip-link`、尊重系统「减少动态效果」

## 目录结构

```
personal-website/
├─ index.html              页面结构（所有文案都在这里改）
├─ assets/
│  ├─ css/style.css        全部样式
│  ├─ js/main.js           全部交互
│  └─ img/                 放你自己的照片（默认是空的）
├─ .nojekyll               告诉 GitHub Pages 不要走 Jekyll 处理
├─ .gitignore
├─ deploy.ps1              Windows 一键部署脚本（可选）
└─ README.md
```

## 本地预览

直接双击 `index.html` 就能看。或者起一个本地服务（推荐，路径更规范）：

```powershell
# 方式一：Python
python -m http.server 8000

# 方式二：VS Code 装 "Live Server" 插件，右键 index.html → Open with Live Server
```

然后浏览器打开 `http://localhost:8000`。

## 你需要修改的地方

在 `index.html` 里搜索 **`REPLACE`**，一共这几处：

| 位置 | 说明 |
| --- | --- |
| `<title>` / `og:*` / `canonical` | 页面标题和分享卡片，已经填好 `maodou452.github.io`（换仓库名或绑域名时改这里） |
| 首屏 `毛豆` | 换成你的昵称，`assets/css` 不用改 |
| 首屏 `.stats` 四个数字 | 改成你自己的真实数据（`data-target` 后面写数字） |
| 「随机小档案」`.facts` | 六条个人小档案 |
| 「属性面板」`.skill` | 技能名 + `data-level="88"` 熟练度（0-100） |
| 「我玩什么游戏」6 张卡片 | 游戏 / 类型 / 描述 |
| 「最近在玩的」 | 游戏名 + 进度百分比（改 `style="--p: 80%"`） |
| 「时间线」 | 你的经历和年份 |
| 「联系我」4 个入口 | GitHub 已填 **@maodou452**；邮箱 / 游戏 ID / 视频主页目前是「待补充」占位 |

> 昵称「毛豆」出现在导航栏、首屏大标题、`<title>`、`author` 元信息和页脚，共 6 处，改的时候搜 `毛豆` 就能找全。

## 怎么加自己的小动物照片

1. 把照片放进 `assets/img/`，比如 `cat-1.jpg`（建议先压缩到 300KB 以内）。
2. 打开 `index.html`，找到「我家的小动物」区域。
3. 把这一行：

```html
<div class="gallery__ph">＋ 放一张照片</div>
```

替换成：

```html
<img src="assets/img/cat-1.jpg" alt="我的猫在睡觉" />
```

图片会被自动裁成 4:3，所以横图效果最好。想加更多照片，直接复制整个 `<figure class="gallery__item">…</figure>` 块即可。

## 部署到 GitHub Pages

### 前置：让仓库名等于「你的用户名」

本项目的页面已经按 GitHub 用户名 `maodou452` 配好了：

- 仓库名填 **`maodou452.github.io`** → 这就是你的「个人主页」，地址是 `https://maodou452.github.io/`
- 如果你换了仓库名（例如 `my-site`）→ 地址会变成 `https://maodou452.github.io/my-site/`，也能用，但要记得把 `index.html` 里的 `og:url` / `canonical` 同步改成带子路径的地址。

### 方式 A：网页操作（不需要命令行）

1. 打开 https://github.com/new，仓库名填 `<你的用户名>.github.io`，**设为 Public**，不要勾选 Add README。
2. 在新仓库页面点 **uploading an existing file**，把 `index.html`、`assets/`、`.nojekyll`、`README.md` 拖进去，Commit。
3. 打开仓库 **Settings → Pages**，Source 选 **Deploy from a branch**，Branch 选 **main**、目录选 **/ (root)**，Save。
4. 等 1-2 分钟，访问 `https://<你的用户名>.github.io/`。

### 方式 B：命令行 (Git)

```powershell
git init
git add .
git commit -m "feat: 个人主页初版"
git branch -M main
git remote add origin https://github.com/maodou452/maodou452.github.io.git
git push -u origin main
```

推送之后同样去 **Settings → Pages** 选 `main` + `/ (root)`。

### 方式 C：用仓库里的脚本

```powershell
# 需要先装好 git 和 GitHub CLI（gh），并执行过一次 gh auth login
.\deploy.ps1
```

脚本会问你用户名和仓库名，然后自动完成 init / commit / 建仓库 / push / 开启 Pages。

## 常见问题

**页面打开是 404？**
- 确认仓库是 Public，且文件名是 `index.html`（全小写）而不是 `Index.html`。
- 确认 Settings → Pages 里的分支和目录选对了。
- 第一次部署要等 1-2 分钟，之后每次 push 大约 1 分钟刷新。

**改了代码但页面没变？**
浏览器缓存。用 `Ctrl + F5` 强制刷新，或者无痕窗口打开。

**样式 / 脚本 404？**
路径是区分大小写的，`assets/css/style.css` 必须是小写。

**想用自己的域名？**
在仓库根目录加一个 `CNAME` 文件，内容写你的域名（例如 `www.example.com`），然后在域名服务商处按 GitHub 文档配置 DNS。

**字体加载很慢 / 打不开？**
页面用到了 Google Fonts（Noto Sans SC、Press Start 2P）。国内访问可能较慢，但**不影响使用**：加载失败会自动回退到系统的「微软雅黑 / 苹方 / 系统等宽字体」。如果完全不想要这个外部依赖，删掉 `index.html` 里这两行即可：

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:..." rel="stylesheet" />
```

（也就是 `<preconnect>` 两行 + 那一行 `fonts.googleapis.com/css2` 的 `<link>`。）

## 想改配色？

所有颜色都在 `assets/css/style.css` 顶部的 `:root` 里：

```css
--accent:   #8b5cf6;   /* 主色（紫） */
--accent-2: #22d3ee;   /* 辅助色（青） */
--accent-3: #ff7ac6;   /* 点缀色（粉，小动物氛围） */
--grad: linear-gradient(120deg, #8b5cf6 0%, #22d3ee 55%, #ff7ac6 100%);
```

改完 `--grad`，全站的渐变文字、按钮、进度条都会跟着变。

## 技术说明

- 纯 `HTML + CSS + 原生 JavaScript`，没有框架、没有 npm 依赖、没有构建步骤。
- 交互用了 `IntersectionObserver` + `requestAnimationFrame`，无第三方库。
- 不需要后端：页面上那个「猫派 / 狗派投票」只是本地演示（不保存数据）。想要真实的统计，可以接 GitHub Issues / Utterances 之类的免费服务。

# Sn0w — Code Wiki

> Sn0w 是 克喵Moretti（克喵Moretti）的个人主页，部署于 [sn0w.fyi](https://sn0w.fyi/)。它是一个单页静态站点，风格模仿"桌面/手写笔记本"美学——手绘标记线、便签纸、图钉和橡皮章等元素随处可见。

---

## 1. 项目概览

| 项目 | 描述 |
|---|---|
| **名称** | Sn0w |
| **类型** | 单页个人主页 (SPA) |
| **领域** | 个人品牌 / 作品集展示 |
| **许可证** | AGPL-3.0 |
| **线上地址** | [https://sn0w.fyi](https://sn0w.fyi/) |

### 技术栈

| 层级 | 技术 | 版本 |
|---|---|---|
| 框架 | React | ^19.2.6 |
| 语言 | TypeScript | ~6.0.2 |
| 构建工具 | Vite | ^8.0.12 |
| 样式 | Tailwind CSS | ^4.3.0 |
| 包管理 | bun (首选), npm (备选) | Node 22 |
| 部署 | Cloudflare Workers Static Assets | — |
| 代码检查 | ESLint + Prettier | — |

---

## 2. 目录结构

```
kemiao/
├── public/                    # 静态资源（不经过 Vite 处理）
│   ├── _headers               # Cloudflare 缓存头配置
│   ├── apple-touch-icon.png
│   ├── avatar.png             # OG/Twitter 头像
│   ├── favicon-*.png / favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
├── src/                       # 源代码
│   ├── assets/
│   │   ├── fonts/
│   │   │   └── pinyon-script-AZ-400.woff2  # 自托管的花体字（仅 A-Z 子集）
│   │   └── avatar-mark.png                 # 头像标记图
│   ├── components/
│   │   ├── intro.tsx          # 页面头部介绍块
│   │   ├── desk.tsx           # 可复用视觉元素（钉子、便签、标记线…）
│   │   └── sections.tsx       # 四个正文区块组件
│   ├── App.tsx                # 页面壳组件 + 标题切换 Hook
│   ├── content.ts             # 所有页面内容数据（类型定义+数据）
│   ├── index.css              # 设计系统（@theme + 组件类 + 动画）
│   └── main.tsx               # 应用入口
├── index.html                 # HTML 模板（SEO meta + 结构化数据）
├── package.json
├── bun.lock / package-lock.json
├── vite.config.ts             # Vite 配置（React + Tailwind 插件）
├── wrangler.jsonc             # Cloudflare Workers 部署配置
├── eslint.config.js           # ESLint 扁平化配置
├── prettier.config.js         # Prettier 格式配置
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── CLAUDE.md                  # AI 辅助开发指南
└── README.md
```

---

## 3. 整体架构

### 3.1 设计原则

代码库刻意保持小巧，按 **内容与布局分离** 的轴进行划分：

```
                        ┌─────────────────────┐
                        │     index.html       │  SEO / OG / 结构化数据
                        └─────────┬───────────┘
                                  │
                        ┌─────────▼───────────┐
                        │     main.tsx         │   ReactDOM.createRoot
                        └─────────┬───────────┘
                                  │
                        ┌─────────▼───────────┐
                        │     App.tsx          │  页面壳 + useAwayTitle
                        └─────────┬───────────┘
               ┌──────────────────┼──────────────────────┐
               ▼                  ▼                      ▼
      ┌────────────────┐ ┌────────────────┐ ┌────────────────────┐
      │  intro.tsx     │ │  sections.tsx  │ │   content.ts       │
      │  头部介绍      │ │  ╰ Experience │ │   (所有数据)       │
      │  可拖拽头像    │ │  ╰ Projects   │ │                    │
      │  蓝色便签      │ │  ╰ Artifacts  │ │  Entry / Project   │
      │  花体首字母    │ │  ╰ Elsewhere  │ │  / Link 类型       │
      └────────┬───────┘ └───────┬────────┘ └────────────────────┘
               │                 │
               └────────┬────────┘
                        ▼
               ┌────────────────────┐
               │    desk.tsx        │
               │  所有视觉原语     │
               │  (标记线/便签/    │
               │   图钉/心形/火花) │
               └────────────────────┘
```

### 3.2 数据流

单向数据流：`content.ts` → `components/*.tsx` → `App.tsx`

1. **content.ts** 导出强类型数据数组（`Entry[]`, `Project[]`, `Link[]`）
2. **sections.tsx** 和 **intro.tsx** 导入数据并映射为 JSX
3. **desk.tsx** 提供所有展示性原语，不直接引用 content.ts
4. **App.tsx** 仅组合区块组件，不含业务逻辑

---

## 4. 模块详解

### 4.1 `src/content.ts` — 内容层

**职责：** 集中管理页面所有可编辑内容，不涉及任何布局逻辑。

**导出类型：**

| 类型 | 字段 | 用途 |
|---|---|---|
| `Entry` | `label: string`, `date: string`, `href?: string` | 经历/文章列表行 |
| `Project` | `label`, `date`, `color` (`"red"\|"green"\|"blue"`), `stamp`, `href?`, `site?`, `blurb?`, `stack?` | 项目卡片 |
| `Link` | `label`, `href`, `heart?: boolean` | 社交链接（`heart` 标记赞助） |

**导出数据：**

| 导出名 | 类型 | 说明 |
|---|---|---|
| `intro` | 对象 | 名字、首字母、介绍段落、状态、GitHub/消息链接 |
| `experience` | `Entry[]` | 工作/教育经历（当前支持 2 条） |
| `projects` | `Project[]` | 项目列表（当前 3 个：Ech0, Dox, Kemate） |
| `artifacts` | `Entry[]` | 年度回顾文章（2023-2025） |
| `links` | `Link[]` | 社交链接（GitHub, Blog, Memo, CV, Sponsor） |

**关键设计：** 编辑文本、日期、项目内容只需修改此文件，无需触碰组件层。

---

### 4.2 `src/components/desk.tsx` — 视觉原语层

**职责：** 提供一切"桌面/手写笔记本"风格的展示性 React 组件。

#### 公开导出组件

| 组件 | 参数 | 描述 |
|---|---|---|
| `DraggableSticker` | `children`, `className?` | 可拖拽贴纸，松开后弹簧回弹，拖拽时倾斜 + 放大 |
| `Monogram` | `children: string` | 花体首字母（悬停时重演墨水擦除动画） |
| `DateTag` | `children: string`, `tilt: string` | 黄色便签日期标签，悬停时抬起摆正 |
| `Stamp` | `children: string` | 橄榄色橡皮印章，带双边框效果 |
| `ProjectDetail` | `blurb`, `stack?`, `href?`, `site?`, `color`, `stamp` | 项目展开详情（framed-note 文字 + 技术栈 + 链接） |
| `HandUnderline` | `children`, `color?`, `note?` | 手绘波浪下划线（三色可选），悬停显示注释 |
| `MarkerHighlight` | `children`, `note?` | 高亮标记笔划痕，悬停显示注释 |
| `LinkDoodle` | — | 链接的小箭头草稿 |
| `HeartDoodle` | — | 手绘红心（用于赞助链接） |
| `LiveDot` | — | 绿色在线指示点，带脉冲动画 |
| `SectionLabel` | `children: string` | 分区标题（火花符号 + 小写上标文字） |
| `DashedFrame` | — | 虚线边框（邮票穿孔效果） |
| `Pushpin` | — | 手绘红色图钉，带高光 |

#### 内部组件（不导出）

| 组件 | 描述 |
|---|---|
| `HandStamp` | 手绘标记印章（SVG 椭圆环绕文字） |
| `Annotation` | 悬停时弹出的注解气泡 |
| `Spark` | 手绘星号火花（替代 iOS 上的彩色 emoji） |

#### 关键 Hooks

- **`useHoverReplay()`** — 返回 `[key, replay]`，通过 remount（递增 key）在悬停时重放进入动画；仅在 `(hover: hover)` 设备上生效，触摸设备仅显示静态效果。

---

### 4.3 `src/components/intro.tsx` — 头部介绍块

**职责：** 渲染页面顶部的介绍区域。

**组件：** `Intro()` — 包含三部分：
1. **头部行** — 可拖拽头像（`DraggableSticker`） + 花体首字母（`Monogram`）
2. **介绍段落** — 使用 `decorateIntro()` 函数将文本按预设词高亮：
   - 名字 → 红色波浪下划线（"yep, that's me"）
   - "full-stack" → 绿色波浪下划线（"does a bit of everything"）
   - "design" → 黄色高亮（"pixels matter"）
   - "The Finals" → 蓝色波浪下划线（"★ my comfort game"）
3. **状态便签** — 蓝色便签（`.note`）带虚线边框和图钉，显示当前状态 + GitHub/消息链接

---

### 4.4 `src/components/sections.tsx` — 正文区块

**职责：** 实现四个正文区块，遍历 `content.ts` 数据映射为 UI。

#### 导出的区块组件

| 组件 | 数据源 | 特性 |
|---|---|---|
| `Experience()` | `experience: Entry[]` | 列表行，首项使用橡皮章（Stamp），其余纯文本 |
| `Projects()` | `projects: Project[]` | 可折叠展开，一次只能展开一个（`useState<string \| null>` 控制） |
| `Artifacts()` | `artifacts: Entry[]` | 列表行，右侧黄色便签日期标签，交替倾斜 |
| `Elsewhere()` | `links: Link[]` | 弹性行布局，最后一项附带 `LiveDot` 在线指示点 |

#### 内部辅助组件

| 组件 | 描述 |
|---|---|
| `RowShell` | 列表行容器（CSS Grid: `[minmax(0,1fr)_auto]`） |
| `Label` | 行左侧标签文字 |
| `PlainMeta` | 行右侧元数据（mono 字体、muted 颜色） |
| `ProjectRow` | 单个项目行，含折叠按钮（`aria-expanded`）和详情面板（`inert` 属性控制可访问性） |

#### 折叠交互

- `Projects` 使用 `useState<string | null>` 控制展开状态
- 点击已展开行 = 关闭；点击其他行 = 切换
- 折叠面板使用 CSS `grid-template-rows: 0fr → 1fr` 过渡动画
- 折叠时 `inert` 属性确保内部链接不在 Tab 键顺序中

---

### 4.5 `src/App.tsx` — 页面壳

**职责：** 作为页面容器，组合所有区块，提供全局 Hook。

- **`useAwayTitle(away: string)`** — 监听 `visibilitychange` 事件，页面隐藏时将标题改为 "come back :("
- **布局**：居中单栏布局（`max-w-[33rem]`），段落间 `pt-16 pb-28`

---

### 4.6 `src/main.tsx` — 应用入口

标准 React 19 入口：`StrictMode` 包裹 `App`，挂载到 `#root`。

---

### 4.7 `src/index.css` — 设计系统

**字体配置（`@theme` 块）：**

| 变量 | 字体 | 用途 |
|---|---|---|
| `--font-sans` | Hanken Grotesk Variable | 正文 |
| `--font-mono` | IBM Plex Mono | 标签/便签 |
| `--font-hand` | Caveat Variable | 标记手写 |
| `--font-script` | Pinyon Script (自托管子集) | 角落花体首字母 |

**色彩体系：**

| 变量 | 值 | 用途 |
|---|---|---|
| `--color-paper` | `#f8f4ec` | 暖纸背景 |
| `--color-ink` | `#26221c` | 主要文字 |
| `--color-soft` | `#6f685c` | 次要文字 |
| `--color-muted` | `#736b5b` | 最淡文字（WCAG AA 4.81:1） |
| `--color-hair` | `#e7e0d2` | 虚线点 |
| `--color-sticky` | `#fbf1a4` | 黄色便签 |
| `--color-marker` | `#d75a48` | 红色标记 |
| `--color-marker-green` | `#4f9d69` | 绿色标记 |
| `--color-marker-blue` | `#4f6fc0` | 蓝色标记 |
| `--color-note` | `#dde8fb` | 蓝色便签 |
| `--color-stamp` | `#7a6f3e` | 橡皮章 |

**组件类（`@layer components`）：**

| 类名 | 描述 |
|---|---|
| `.dotted` | 笔记本虚线页边距背景 |
| `.sticky-note` | 黄色便签纸样式 |
| `.stamp` | 橄榄色双边框印章 |
| `.note` | 蓝色便签 |
| `.fold` / `.open` | 折叠展开动画（grid-rows 0fr→1fr） |
| `.framed-note` | 双发丝线框起的项目描述 |

**动画（`@keyframes`）：**

| 动画名 | 触发 | 效果 |
|---|---|---|
| `rise` | 进入视口 | 淡入 + 上移 10px（各区块 staggered） |
| `scribble` | 进入 / 悬停 | 标记线从左侧绘制 |
| `peel` | 每 5 秒 | 贴纸一角翘起 |
| `inkwipe` | 进入 / 悬停 | 花体字从左到右揭示 |
| `ping` | 持续 | 在线点脉冲扩散 |
| `heartbeat` | 悬停 | 赞助红心跳动 |
| 折叠过渡 | 点击 | 项目详情平滑展开 0.32s |

所有动画受 `@media (prefers-reduced-motion: no-preference)` 保护。

---

### 4.8 配置文件

#### `vite.config.ts`
```ts
plugins: [react(), tailwindcss()]
```
使用 `@vitejs/plugin-react` 处理 JSX 转换，`@tailwindcss/vite` 集成 Tailwind v4。

#### `wrangler.jsonc`
```jsonc
{ "assets": { "directory": "./dist" } }
```
Cloudflare Workers Static Assets——无 Worker 脚本，直接托管构建产物。

#### `public/_headers`
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```
Vite 构建产物的内容哈希文件名可实现永久缓存。

#### `tsconfig.app.json`
- `target: es2023`, `jsx: react-jsx`
- `moduleResolution: bundler`
- `verbatimModuleSyntax: true`（强制 `import type` 语法）
- `noUnusedLocals / noUnusedParameters: true`
- `types: ["vite/client"]`

---

## 5. 依赖关系

### 运行时依赖

| 包 | 用途 |
|---|---|
| `react` / `react-dom` ^19.2 | 框架核心 |
| `tailwindcss` ^4.3 | CSS 工具类框架 |
| `@tailwindcss/vite` ^4.3 | Tailwind v4 Vite 插件 |
| `@fontsource-variable/hanken-grotesk` | 可变字体 - 正文 |
| `@fontsource-variable/caveat` | 可变字体 - 手写 |
| `@fontsource/ibm-plex-mono` | 等宽字体（仅 Latin 400 + 500） |
| `@fontsource/pinyon-script` | 花体字（仅用于子集生成，实际自托管） |

### 开发依赖

| 包 | 用途 |
|---|---|
| `typescript` ~6.0 | 类型系统 + 编译检查 |
| `vite` ^8.0 | 构建工具 / 开发服务器 |
| `@vitejs/plugin-react` ^6.0 | Vite React 支持 |
| `eslint` ^10.3 | 代码检查 |
| `typescript-eslint` ^8.59 | TypeScript ESLint 集成 |
| `eslint-plugin-react-hooks` | React Hooks 规范检查 |
| `eslint-plugin-react-refresh` | HMR 安全导出检查 |
| `eslint-config-prettier` | 与 Prettier 共存配置 |
| `prettier` ^3.8 | 代码格式化 |
| `@types/react` / `@types/react-dom` | React 类型定义 |

---

## 6. 项目运行与构建

### 环境要求
- Node.js >= 22（`.node-version` 指定）
- bun（首选包管理器，也可以使用 npm）

### 开发命令

```bash
bun install               # 安装依赖
bun run dev               # 启动 Vite 开发服务器
```

### 构建命令

```bash
bun run build             # tsc -b && vite build  → dist/
bun run preview           # 本地预览构建产物
```

### 代码质量

```bash
bun run lint              # ESLint 检查
bun run lint:fix          # ESLint 自动修复
bun run format            # Prettier 格式化所有文件
bun run format:check      # Prettier 格式检查
```

### 部署

项目通过 Cloudflare Workers Static Assets 部署：
1. 运行 `bun run build` 生成 `dist/` 目录
2. Cloudflare 读取 `wrangler.jsonc` 中的 `assets.directory` 配置
3. 直接托管静态文件，无需 Worker 脚本

---

## 7. 编码约定

- **TypeScript**: 严格模式，使用 `verbatimModuleSyntax`（强制 `import type`）
- **JSX**: `react-jsx` 运行时
- **CSS**: Tailwind v4 的 `@theme` 块定义设计令牌；不使用 JS 配置文件
- **格式化**: 双引号、分号、尾逗号（Prettier 配置）
- **字体优化**: 仅导入使用的字重和 Latin 子集；花体字自托管 A-Z 子集
- **无障碍**: 折叠面板使用 `aria-expanded`/`aria-controls` 和 `inert` 属性；动画受 `prefers-reduced-motion` 保护
- **触摸设备**: 动画/标注仅在 `(hover: hover)` 设备上生效，触摸设备保持干净静态

---

## 8. 数据流总结

```
content.ts (数据)
    │
    ├── intro → intro.tsx → App.tsx
    │              │
    │              └── 使用 desk.tsx 原语渲染
    │
    ├── experience → sections.tsx (Experience) → App.tsx
    ├── projects   → sections.tsx (Projects)   → App.tsx
    ├── artifacts  → sections.tsx (Artifacts)  → App.tsx
    └── links      → sections.tsx (Elsewhere)  → App.tsx
                       │
                       └── 使用 desk.tsx 原语渲染
```

**扩展指南：**
- **新增内容**：在 `content.ts` 对应数组中添加条目
- **新增区块**：在 `sections.tsx` 中添加组件，导入数据，在 `App.tsx` 中引用
- **新增视觉元素**：在 `desk.tsx` 中创建原语，在其他组件中使用
- **修改风格**：在 `index.css` 的 `@theme` 块中调整设计令牌

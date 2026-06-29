# kemiao

克喵Moretti 的个人主页，部署于 [www.081531.xyz](https://www.081531.xyz/)。

风格模仿桌面/手写笔记本——暖纸背景、手绘标记线、便签纸标签、图钉和橡皮印章。

## 技术栈

| 层级 | 技术 | 版本 |
|---|---|---|
| 框架 | React | ^19.2.6 |
| 语言 | TypeScript | ~6.0.2 |
| 构建 | Vite | ^8.0.12 |
| 样式 | Tailwind CSS | ^4.3.0 |
| 部署 | EdgeOne Pages | — |
| 代码检查 | ESLint + Prettier | — |

## 功能

- **明暗主题切换** — 浅色暖纸 / 深色夜桌，持久化到 localStorage
- **二维码弹窗** — 悬停 Telegram / QQ 显示可扫码的联系方式
- **RSS 文章列表** — 通过 Edge Function 自动拉取博客最新文章
- **可拖拽头像** — 弹簧回弹效果
- **手绘动画** — 墨水描线、贴纸翘起、花体字揭示

## 本地开发

```bash
node -v        # 需要 >= 22
npm install
npm run dev    # 启动开发服务器
```

## 构建

```bash
npm run build   # tsc -b && vite build → dist/
npm run preview # 本地预览构建产物
```

## 部署

项目部署在 EdgeOne Pages。`dist/` 目录为静态产物，`edge-functions/` 目录由 EdgeOne Pages 自动识别为边缘函数。

## 项目结构

```
src/
├── components/
│   ├── desk.tsx       # 视觉原语（便签、图钉、印章、QR弹窗、主题切换…）
│   ├── intro.tsx      # 头部介绍块
│   └── sections.tsx   # 四个正文区块
├── content.ts         # 所有页面数据（集中管理，修改数据无需动组件）
├── index.css          # 设计系统（颜色、字体、动画）
├── App.tsx            # 页面壳
└── main.tsx           # 应用入口
edge-functions/
└── api/
    └── rss.ts         # RSS 代理（EdgeOne Pages Edge Function）
```

## License

[AGPL-3.0](LICENSE)

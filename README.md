# Aurora Vault

Aurora Vault 是一款面向线报、方案、教程及文件等多类型资料的收藏管理面板。最新版本融入“太极”灵感——黑白平衡的极简配色、动感阴阳背景以及宝箱式新增仪式感，让高价值情报的整理既沉稳又富有期待。项目基于 React + Vite + Tailwind CSS 构建，默认使用浏览器 `localStorage` 持久化，可直接部署在任意静态托管平台。

## 功能特性
- 🔎 **多维筛选与检索**：支持关键词、类型、状态、标签组合过滤，置顶条目优先展示。
- 📦 **宝箱式新增体验**：CTA 按钮配合 confetti 动效唤起新增弹窗，录入支持标签推荐、价值评分、备注等字段。
- 📂 **抽屉详情**：点击卡片即可滑出右侧详情，快速查看来源、备注并修改状态、置顶、评分。
- 🛠️ **编辑 / 删除**：卡片和抽屉内均可直接编辑或删除条目，删除前有统一样式的确认弹窗。
- 🌉 **JSON 导入 / 导出**：一键导出当前资源为 JSON；导入支持上传/粘贴/读取剪贴板，自动校验并替换本地收藏。
- 🌗 **主题与夜间适配**：浅色 / 深色主题随时切换，全局控制下拉、输入等控件的对比度，暗色模式默认可读。
- ☯️ **太极氛围背景**：阴阳平衡的动态背景与黑白+赤色点缀的界面语言，相互呼应宝箱 CTA，营造沉浸式仪式感。

## 技术栈
- React 19 + TypeScript
- Vite 7、Tailwind CSS 3
- Framer Motion、canvas-confetti

## 环境要求
- **Node.js ≥ 20.19.0**（或 22.12+），以满足 Vite 的运行要求
- npm ≥ 10（随 Node 20 一同升级即可）

## 快速开始
```bash
npm install
npm run dev
```
浏览器访问终端提示的地址（默认 http://localhost:5173）。开发前请确认已切换到 Node 20.19+。

## 常用脚本
- `npm run dev`：本地开发 + 热更新
- `npm run build`：产出生产构建到 `dist/`
- `npm run preview`：本地预览生产版本
- `npm run lint`：运行 ESLint

## 数据导入 / 导出
- **导出**：点击顶部工具区的“导出 JSON”按钮，会将当前 `localStorage` 中的资源复制到剪贴板。
- **导入**：
  1. 点击“导入 JSON”按钮
  2. 选择 JSON 文件、粘贴内容或直接读取剪贴板
  3. 校验通过后将替换本地所有资源，并重置筛选条件
- **数据格式**：导入文件需为 `ResourceItem[]` 数组，每项支持字段：
  ```json
  {
    "id": "string (可选，缺失时自动生成)",
    "title": "string",
    "description": "string",
    "type": "intel | method | tutorial | tool | file | idea",
    "status": "new | in-review | verified | archived",
    "tags": ["string", "..."] 或 "tag1,tag2",
    "url": "string (可选)",
    "source": "string (可选)",
    "notes": "string (可选)",
    "rating": 0-5 (可选),
    "pinned": true/false (可选),
    "createdAt": ISO 时间字符串 (缺失时自动补充当前时间)
  }
  ```

## 交互速查
- `⌘/Ctrl + N`：打开新增弹窗
- `⌘/Ctrl + K`：聚焦搜索框
- `Esc`：关闭新增弹窗 / 详情抽屉 / 导入对话框

## 部署
1. 升级部署环境 Node 版本至 ≥20.19
2. 执行 `npm run build`
3. 将 `dist/` 目录上传至任意静态托管平台（Vercel、Netlify、Cloudflare Pages、S3 + CloudFront 等）
4. 若使用 CI/CD，在平台环境变量中设置 `NODE_VERSION=20.19.0`

## 可自定义方向
- 接入后端 API：在 `handleDialogSubmit` / `handleImportResources` / `handleDeleteResource` 等函数中调用后端接口或同步至云端
- 扩展字段：在 `types.ts`、`AddResourceDialog`、`ResourceDetailDrawer` 中加入自定义字段
- UI 主题：调整 `src/index.css` 的 CSS 变量或 Tailwind 配置以匹配品牌视觉
- 增加测试：可引入 Vitest + React Testing Library 或 Playwright，为核心筛选/导入流程编写自动化测试

祝使用愉快，愿 Aurora Vault 成为你的灵感宝库 ✨

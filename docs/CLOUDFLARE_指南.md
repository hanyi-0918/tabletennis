# Cloudflare Pages 部署指南

把前端部署到 Cloudflare Pages，用 Supabase 提供数据（无需 Python 后端）。

---

## 前提

- 代码已推到 **GitHub** 或 **GitLab**
- **Supabase** 已建表并导入数据（表里有数据、本地能正常显示）

---

## 一、创建 Pages 项目

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com) 并登录。
2. 左侧选 **Workers & Pages**。
3. 点 **Create** → **Pages** → **Connect to Git**。
4. 选 **GitHub**（或 GitLab），授权后选择你的**仓库**。
5. 点 **Begin setup** 进入构建配置。

---

## 二、构建配置

本项目是「仓库根目录 = 项目根目录，前端在 `frontend` 子目录」的结构，按下面填：

| 配置项 | 填写内容 |
|--------|----------|
| **Project name** | 随意，如 `table-tennis-h2h` |
| **Production branch** | 一般是 `main` 或 `master` |
| **Framework preset** | 选 **Vite** |
| **Build command** | `cd frontend && npm ci && npm run build` |
| **Build output directory** | `frontend/dist` |
| **Root directory** | 留空（表示用仓库根目录） |

如果仓库根目录**就是** frontend（没有上一层），则改为：

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: 留空

填好后点 **Save and Deploy**，等第一次构建完成（可能 1～2 分钟）。

---

## 三、配置环境变量（必做）

构建会通过，但页面连不上 Supabase，会没有数据。需要把 Supabase 的配置写进环境变量：

1. 在 **Workers & Pages** 里点进你的 **Pages 项目**。
2. 顶部选 **Settings**，左侧选 **Environment variables**。
3. 在 **Production** 一栏点 **Add**（或 **Edit**），添加两条：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | `https://wzdxpcfudhhywjcztsat.supabase.co` | 你的 Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | 你的 anon public key | Supabase → Settings → API 里复制 |

4. 若你有 **Preview** 环境（如 PR 预览），可在 **Preview** 里同样添加这两条。
5. 点 **Save**。

---

## 四、重新部署

环境变量只在新构建时生效，所以需要再部署一次：

1. 进入 **Deployments** 标签。
2. 在最新一次部署右侧点 **⋯** → **Retry deployment**；  
   或随便改一处代码 push 一次，触发自动部署。

部署完成后，打开 Pages 给的地址（如 `https://xxx.pages.dev`），选球员、选对手，应能看到交手数据。

---

## 五、自定义域名（可选）

1. 在 Pages 项目里点 **Custom domains**。
2. 点 **Set up a custom domain**，输入你的域名（如 `h2h.example.com`）。
3. 按提示在域名服务商处添加 CNAME 或 A 记录，指向 Cloudflare 要求的目标。
4. 验证通过后，即可用该域名访问。

---

## 常见问题

**Q：页面能打开，但没有数据？**  
- 检查环境变量是否填了 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，且填的是 **Production**（或当前用的环境）。
- 填好后必须**重新部署**一次。

**Q：构建失败？**  
- 看 **Deployments** 里失败那次点的 **View build logs**。
- 常见原因：`Build command` 或 `Build output directory` 填错（例如没写 `frontend/`），或仓库里缺少 `frontend/package.json`。

**Q：想用本地后端而不是 Supabase？**  
- 本地可以：不设上述两个 VITE_ 变量，并运行 `uvicorn main:app --reload`，前端会请求本地 8000 端口。
- Cloudflare Pages 只能托管静态前端，不能跑 Python，所以线上必须用 Supabase（或其它可公网访问的 API）。

---

## 小结

| 步骤 | 操作 |
|------|------|
| 1 | Workers & Pages → Create → Pages → Connect to Git → 选仓库 |
| 2 | Build command: `cd frontend && npm ci && npm run build`，Output: `frontend/dist` |
| 3 | Settings → Environment variables → 添加 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY` |
| 4 | 再部署一次，用新地址访问 |

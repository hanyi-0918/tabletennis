# Cloudflare Pages + Supabase 部署说明

前端部署到 **Cloudflare Pages**，数据使用 **Supabase**（无需再跑 Python 后端）。

---

## 一、Supabase 准备

### 1. 建表

1. 登录 [Supabase](https://supabase.com) → 进入项目 → **SQL Editor**。
2. 复制并执行项目中的 `supabase/schema.sql`。  
   会创建 `players`、`h2h` 表及只读策略。

### 2. 导入交手数据

在**项目根目录**执行：

```bash
# 1. 导出当前后端数据为 JSON（需 Python 环境）
cd backend
python scripts/export_h2h.py > h2h_export.json
cd ..

# 2. 写入 Supabase（需 service_role key，仅本地执行一次）
# 在 Dashboard → Settings → API 中复制 URL 和 service_role key
export SUPABASE_URL="https://你的项目.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="你的 service_role key"
node frontend/scripts/seedSupabase.js
```

或指定 JSON 路径：

```bash
H2H_JSON_PATH=/path/to/h2h_export.json node frontend/scripts/seedSupabase.js
```

---

## 二、Cloudflare Pages 部署

### 1. 连接仓库（推荐）

1. 将代码推到 GitHub/GitLab。
2. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
3. 选仓库，构建配置：
   - **Framework preset**: Vite
   - **Build command**: `cd frontend && npm ci && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: 项目根目录（若仓库根就是项目根则留空；若 frontend 在子目录，则 Root 填 `frontend` 并改 Build 为 `npm run build`、output 为 `dist`）

若仓库根就是 `frontend` 目录，则：

- Build command: `npm run build`
- Build output directory: `dist`

### 2. 环境变量

在 Pages 项目 → **Settings** → **Environment variables** 中为 **Production**（和 Preview 如需要）添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | `https://你的项目.supabase.co` | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | 你的 anon public key | Supabase API → anon public |

保存后重新部署一次，前端会连 Supabase 读数据。

---

## 三、本地开发两种方式

1. **用 Supabase（与线上一致）**  
   在 `frontend` 下建 `.env`，填写 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，然后：

   ```bash
   cd frontend && npm run dev
   ```

2. **用本地 Python 后端**  
   不设上述两个变量（或删掉），并保证：

   ```bash
   # 终端 1
   cd backend && uvicorn main:app --reload --port 8000
   # 终端 2
   cd frontend && npm run dev
   ```

   前端会请求 `http://127.0.0.1:8000`（可通过 `VITE_API_URL` 覆盖）。

---

## 四、小结

- **Supabase**：存球员和 H2H 数据，前端用 anon key 只读。
- **Cloudflare Pages**：构建并托管前端静态资源，环境变量里配好 Supabase 即可。
- 部署后不再需要单独跑 Python 后端。

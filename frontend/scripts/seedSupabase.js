/**
 * 一次性将 backend 导出的 h2h_export.json 写入 Supabase。
 * 使用方式：
 * 1. 在 backend 目录执行: python scripts/export_h2h.py > h2h_export.json
 * 2. 把 h2h_export.json 放到项目根目录或指定路径
 * 3. 在项目根目录: SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node frontend/scripts/seedSupabase.js
 *    或: node frontend/scripts/seedSupabase.js  （会读取 .env 或 .env.local 中的 SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY）
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '../..')
const jsonPath = process.env.H2H_JSON_PATH || join(root, 'backend', 'h2h_export.json')

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('需要环境变量 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

let raw
try {
  raw = readFileSync(jsonPath, 'utf8')
} catch (e) {
  console.error('读取 JSON 失败:', jsonPath, e.message)
  process.exit(1)
}

const rows = JSON.parse(raw)
const supabase = createClient(url, key)

async function main() {
  const toInsert = rows.map((r) => ({
    player1: r.player1,
    player2: r.player2,
    player1_wins: r.player1_wins,
    player2_wins: r.player2_wins,
    player1_major_wins: r.player1_major_wins ?? 0,
    player2_major_wins: r.player2_major_wins ?? 0,
    recent_matches: r.recent_matches ?? [],
  }))
  const { data, error } = await supabase.from('h2h').upsert(toInsert, {
    onConflict: 'player1,player2',
  }).select()
  if (error) {
    console.error('Supabase 写入失败:', error)
    process.exit(1)
  }
  console.log('已写入', (data || []).length, '条 H2H 记录')
}

main()

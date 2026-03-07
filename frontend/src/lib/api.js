import { supabase, useSupabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

/** 球员名模糊匹配：精确或包含 */
function searchPlayerFuzzy(players, query) {
  const q = (query || '').trim()
  if (!q) return null
  for (const name of players) {
    if (name === q || name.includes(q) || q.includes(name)) return { name, fuzzy: false }
  }
  for (const name of players) {
    if (name.startsWith(q) || q.startsWith(name)) return { name, fuzzy: true }
  }
  return null
}

/** 获取全部球员名单 */
export async function getPlayers() {
  if (useSupabase()) {
    const { data, error } = await supabase.from('players').select('name_zh').order('name_zh')
    if (error) throw error
    return (data || []).map((r) => r.name_zh)
  }
  const res = await fetch(`${API_BASE}/api/players`)
  if (!res.ok) return []
  const json = await res.json()
  return Array.isArray(json.players) ? json.players : []
}

/** 搜索球员，返回 { player_name, opponents, is_fuzzy_match } */
export async function searchPlayer(name, players) {
  if (useSupabase()) {
    const list = players && players.length ? players : await getPlayers()
    const match = searchPlayerFuzzy(list, name)
    if (!match) return null
    const opponents = list.filter((n) => n !== match.name)
    return {
      player_name: match.name,
      opponents,
      is_fuzzy_match: match.fuzzy,
    }
  }
  const res = await fetch(`${API_BASE}/api/search-player/${encodeURIComponent(name)}`)
  if (!res.ok) return null
  return res.json()
}

/** 获取两人 H2H：{ player_a, player_b, player_a_wins, player_b_wins, total_matches, player_a_major_wins, player_b_major_wins, recent_matches } */
export async function getH2h(playerA, playerB) {
  const a = (playerA || '').trim()
  const b = (playerB || '').trim()
  if (!a || !b) return null

  if (useSupabase()) {
    const key1 = a < b ? a : b
    const key2 = a < b ? b : a
    const { data, error } = await supabase
      .from('h2h')
      .select('*')
      .eq('player1', key1)
      .eq('player2', key2)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    const isAFirst = a === data.player1
    return {
      player_a: a,
      player_b: b,
      player_a_wins: isAFirst ? data.player1_wins : data.player2_wins,
      player_b_wins: isAFirst ? data.player2_wins : data.player1_wins,
      total_matches: data.player1_wins + data.player2_wins,
      player_a_major_wins: isAFirst ? data.player1_major_wins : data.player2_major_wins,
      player_b_major_wins: isAFirst ? data.player2_major_wins : data.player1_major_wins,
      recent_matches: Array.isArray(data.recent_matches) ? data.recent_matches : [],
    }
  }

  const res = await fetch(`${API_BASE}/api/get-h2h/${encodeURIComponent(a)}/${encodeURIComponent(b)}`)
  if (!res.ok) return null
  return res.json()
}

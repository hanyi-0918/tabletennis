#!/usr/bin/env python3
"""生成可在 Supabase SQL Editor 中执行的 INSERT 语句，无需 service_role。
用法: 在 backend 目录执行 python scripts/export_h2h_to_sql.py > h2h_seed.sql
然后在 Supabase Dashboard → SQL Editor 中打开 h2h_seed.sql 执行。"""
import sys
import json
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import main as m

# 先清空再插入（避免重复）
print("-- 清空并导入 H2H 数据（可在 Supabase SQL Editor 中执行）")
print("DELETE FROM public.h2h;")
print()

for (p1, p2), rec in m.H2H_RECORDS.items():
    recent = rec.get("recent", [])
    json_str = json.dumps(recent, ensure_ascii=False)
    escaped = json_str.replace("\\", "\\\\").replace("'", "''")
    p1_esc, p2_esc = p1.replace("'", "''"), p2.replace("'", "''")
    print(
        "INSERT INTO public.h2h (player1, player2, player1_wins, player2_wins, player1_major_wins, player2_major_wins, recent_matches)"
    )
    print(
        f"VALUES ('{p1_esc}', '{p2_esc}', {rec['player1_wins']}, {rec['player2_wins']}, "
        f"{rec.get('player1_major_wins', 0)}, {rec.get('player2_major_wins', 0)}, "
        f"'{escaped}'::jsonb);"
    )

print()
print("-- 完成")

#!/usr/bin/env python3
"""从 main.py 导出 H2H 数据为 JSON，用于导入 Supabase。在 backend 目录执行: python scripts/export_h2h.py > h2h_export.json"""
import sys
import json
import os

# 让 main 可被导入
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 只取数据，不启动 app
import main as m

out = []
for (p1, p2), rec in m.H2H_RECORDS.items():
    out.append({
        "player1": p1,
        "player2": p2,
        "player1_wins": rec["player1_wins"],
        "player2_wins": rec["player2_wins"],
        "player1_major_wins": rec.get("player1_major_wins", 0),
        "player2_major_wins": rec.get("player2_major_wins", 0),
        "recent_matches": rec.get("recent", []),
    })
print(json.dumps(out, ensure_ascii=False, indent=2))

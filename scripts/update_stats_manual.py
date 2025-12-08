#!/usr/bin/env python3
"""
Manual CTF Statistics Update Tool
Use this when APIs are unavailable to manually populate stats
"""

import json
from pathlib import Path
from datetime import datetime


def update_stats_manually():
    """Interactive tool to manually update CTF stats"""
    
    stats_file = Path(__file__).parent.parent / "src" / "data" / "ctf-stats.json"
    
    print("=" * 60)
    print("CTF Statistics Manual Update Tool")
    print("=" * 60)
    print("\n📋 Enter your CTF statistics below:")
    print("(Leave blank to skip or use defaults)\n")
    
    # HTB Stats
    print("🔴 Hack The Box Stats:")
    htb_enabled = input("Include HTB stats? (y/n) [n]: ").lower() == 'y'
    
    htb_stats = {}
    if htb_enabled:
        htb_stats = {
            "name": "Hack The Box",
            "username": input("  HTB Username: ") or "anonymous",
            "rank": input("  HTB Rank: ") or "Beginner",
            "points": int(input("  HTB Points: ") or "0"),
            "owns": int(input("  Machines Owned: ") or "0"),
            "respect": int(input("  Respect Points: ") or "0"),
            "ranking": int(input("  Global Ranking: ") or "0"),
            "avatar": "",
        }
    
    # THM Stats
    print("\n🟢 Try Hack Me Stats:")
    thm_enabled = input("Include THM stats? (y/n) [y]: ").lower() != 'n'
    
    thm_stats = {}
    if thm_enabled:
        thm_stats = {
            "name": "Try Hack Me",
            "username": input("  THM Username [Hackertz]: ") or "Hackertz",
            "rank": input("  THM Rank: ") or "Regular",
            "level": int(input("  THM Level: ") or "0"),
            "points": int(input("  THM Points: ") or "0"),
            "roomsCompleted": int(input("  Rooms Completed: ") or "0"),
            "badges": int(input("  Badges Earned: ") or "0"),
            "streak": int(input("  Current Streak (days): ") or "0"),
            "ranking": int(input("  Global Ranking: ") or "0"),
            "avatar": "",
        }
    
    # Calculate totals
    total_machines = 0
    total_points = 0
    total_hours = 0
    
    if htb_stats:
        total_machines += htb_stats.get("owns", 0)
        total_points += htb_stats.get("points", 0)
    
    if thm_stats:
        total_machines += thm_stats.get("roomsCompleted", 0)
        total_points += thm_stats.get("points", 0)
    
    # Rough estimate: 1 machine ≈ 2 hours on average
    total_hours = total_machines * 2
    
    # Build final stats
    stats = {
        "lastUpdated": datetime.now().isoformat(),
        "platforms": {},
        "totals": {
            "machinesCompleted": total_machines,
            "pointsEarned": total_points,
            "rank": "Hacker",
            "hoursSpent": total_hours,
        }
    }
    
    if htb_stats:
        stats["platforms"]["hackthebox"] = htb_stats
    if thm_stats:
        stats["platforms"]["tryhackme"] = thm_stats
    
    # Write to file
    stats_file.parent.mkdir(parents=True, exist_ok=True)
    with open(stats_file, "w") as f:
        json.dump(stats, f, indent=2)
    
    print("\n" + "=" * 60)
    print(f"✅ Stats updated successfully!")
    print(f"📁 File: {stats_file}")
    print("=" * 60)
    print("\n📊 Summary:")
    print(f"   Machines: {total_machines}")
    print(f"   Points: {total_points}")
    print(f"   Est. Hours: {total_hours}")
    print(f"   Platforms: {len(stats['platforms'])}")


if __name__ == "__main__":
    try:
        update_stats_manually()
    except KeyboardInterrupt:
        print("\n\n❌ Update cancelled.")
    except ValueError:
        print("\n\n❌ Invalid input. Please enter numbers for numeric fields.")

#!/usr/bin/env python3
"""
CTF Statistics Scraper
Fetches stats from Hack The Box and Try Hack Me platforms
Generates JSON data for portfolio dashboard
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, Any
import requests
from pathlib import Path

# Configuration
HTB_USERNAME = os.getenv("HTB_USERNAME", "")  # Set your HTB username or hardcode here
HTB_API_TOKEN = os.getenv("HTB_API_TOKEN", "")  # Set your HTB API token or hardcode here
THM_USERNAME = os.getenv("THM_USERNAME", "Hackertz")  # Your THM username

# Output path
OUTPUT_DIR = Path(__file__).parent.parent / "src" / "data"
OUTPUT_FILE = OUTPUT_DIR / "ctf-stats.json"


class CTFStatsScraper:
    """Scraper for CTF platform statistics"""

    def __init__(self):
        self.stats = {
            "lastUpdated": datetime.now().isoformat(),
            "platforms": {},
            "totals": {
                "machinesCompleted": 0,
                "pointsEarned": 0,
                "rank": "",
                "hoursSpent": 0,
            },
        }

    def fetch_htb_stats(self) -> Dict[str, Any]:
        """Fetch Hack The Box statistics"""
        print("🔍 Fetching Hack The Box stats...")

        if not HTB_USERNAME or not HTB_API_TOKEN:
            print("⚠️  HTB credentials not set. Skipping HTB stats.")
            return {}

        try:
            headers = {"Authorization": f"Bearer {HTB_API_TOKEN}"}
            response = requests.get(
                f"https://www.hackthebox.com/api/v4/user/profile/basic/{HTB_USERNAME}",
                headers=headers,
                timeout=10,
            )

            if response.status_code == 200:
                data = response.json()
                profile = data.get("profile", {})

                htb_stats = {
                    "name": "Hack The Box",
                    "username": HTB_USERNAME,
                    "rank": profile.get("rank", "Unknown"),
                    "points": profile.get("points", 0),
                    "systemOwns": profile.get("system_owns", 0),
                    "userOwns": profile.get("user_owns", 0),
                    "totalOwns": profile.get("system_owns", 0)
                    + profile.get("user_owns", 0),
                    "respect": profile.get("respect", 0),
                    "ranking": profile.get("ranking", 0),
                    "avatar": profile.get("avatar", ""),
                }

                print(f"✅ HTB Stats: Rank {htb_stats['rank']}, {htb_stats['points']} points")
                return htb_stats

            else:
                print(f"❌ HTB API error: {response.status_code}")
                return {}

        except Exception as e:
            print(f"❌ Error fetching HTB stats: {str(e)}")
            return {}

    def fetch_thm_stats(self) -> Dict[str, Any]:
        """Fetch Try Hack Me statistics"""
        print("🔍 Fetching Try Hack Me stats...")

        if not THM_USERNAME:
            print("⚠️  THM username not set. Skipping THM stats.")
            return {}

        try:
            # Try with Accept header for JSON
            headers = {"Accept": "application/json"}
            response = requests.get(
                f"https://tryhackme.com/api/user/public-profile?username={THM_USERNAME}",
                headers=headers,
                timeout=10,
            )

            # Check content type - THM API may be returning HTML
            content_type = response.headers.get("content-type", "")
            if "application/json" not in content_type:
                print(f"⚠️  THM API returned {content_type} instead of JSON")
                print(f"    💡 Manual Update: Edit src/data/ctf-stats.json directly")
                print(f"    💡 Or visit: https://tryhackme.com/profile/{THM_USERNAME}")
                return {}

            if response.status_code == 200:
                data = response.json()

                thm_stats = {
                    "name": "Try Hack Me",
                    "username": THM_USERNAME,
                    "rank": data.get("userRank", "Unknown"),
                    "level": data.get("level", 0),
                    "points": data.get("points", 0),
                    "roomsCompleted": len(data.get("completedRooms", [])),
                    "badges": len(data.get("badges", [])),
                    "streak": data.get("streak", 0),
                    "ranking": data.get("ranking", 0),
                    "avatar": data.get("avatar", ""),
                }

                print(
                    f"✅ THM Stats: Level {thm_stats['level']}, {thm_stats['roomsCompleted']} rooms completed"
                )
                return thm_stats

            else:
                print(f"❌ THM API error: {response.status_code}")
                return {}

        except json.JSONDecodeError as e:
            print(f"❌ Error parsing THM JSON: {str(e)}")
            print(f"    💡 The API may have changed format. Try manual update:")
            print(f"    💡 Edit src/data/ctf-stats.json with your stats from:")
            print(f"    💡 https://tryhackme.com/profile/{THM_USERNAME}")
            return {}
        except Exception as e:
            print(f"❌ Error fetching THM stats: {str(e)}")
            return {}

    def calculate_totals(self):
        """Calculate total statistics across platforms"""
        total_machines = 0
        total_points = 0
        total_hours = 0

        # HTB stats
        if "hackthebox" in self.stats["platforms"]:
            htb = self.stats["platforms"]["hackthebox"]
            total_machines += htb.get("totalOwns", 0)
            total_points += htb.get("points", 0)

        # THM stats
        if "tryhackme" in self.stats["platforms"]:
            thm = self.stats["platforms"]["tryhackme"]
            total_machines += thm.get("roomsCompleted", 0)
            total_points += thm.get("points", 0)

        # Estimate hours (rough estimate: 2 hours per machine)
        total_hours = total_machines * 2

        self.stats["totals"] = {
            "machinesCompleted": total_machines,
            "pointsEarned": total_points,
            "hoursSpent": total_hours,
            "platforms": len(self.stats["platforms"]),
        }

    def scrape(self):
        """Main scraping function"""
        print("🚀 Starting CTF stats scraping...\n")

        # Fetch HTB stats
        htb_data = self.fetch_htb_stats()
        if htb_data:
            self.stats["platforms"]["hackthebox"] = htb_data

        # Fetch THM stats
        thm_data = self.fetch_thm_stats()
        if thm_data:
            self.stats["platforms"]["tryhackme"] = thm_data

        # Calculate totals
        self.calculate_totals()

        print(f"\n📊 Total Stats:")
        print(f"   Machines: {self.stats['totals']['machinesCompleted']}")
        print(f"   Points: {self.stats['totals']['pointsEarned']}")
        print(f"   Est. Hours: {self.stats['totals']['hoursSpent']}")

        return self.stats

    def save_to_file(self):
        """Save statistics to JSON file"""
        try:
            OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(self.stats, f, indent=2, ensure_ascii=False)

            print(f"\n✅ Stats saved to: {OUTPUT_FILE}")
            return True

        except Exception as e:
            print(f"\n❌ Error saving stats: {str(e)}")
            return False


def main():
    """Main entry point"""
    print("=" * 60)
    print("CTF Statistics Scraper")
    print("=" * 60 + "\n")

    # Check for credentials
    if not HTB_USERNAME and not THM_USERNAME:
        print("⚠️  Warning: No credentials configured!")
        print("\nSet environment variables:")
        print("  export HTB_USERNAME='your_htb_username'")
        print("  export HTB_API_TOKEN='your_htb_api_token'")
        print("  export THM_USERNAME='your_thm_username'")
        print("\nOr edit the script to set them directly.")
        sys.exit(1)

    # Run scraper
    scraper = CTFStatsScraper()
    scraper.scrape()
    success = scraper.save_to_file()

    print("\n" + "=" * 60)
    if success:
        print("✨ Scraping completed successfully!")
    else:
        print("❌ Scraping completed with errors.")
    print("=" * 60)

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())

# CTF Statistics System - Quick Start

Your portfolio now has a fully automated CTF statistics dashboard! Here's how to use it:

## 📊 What You Get

The CTF Statistics Dashboard displays:

- 🏆 **Machines Completed** - Total machines/rooms across all platforms
- 🎯 **Points Earned** - Total points from HTB and THM
- ⏱️ **Hours Spent** - Estimated time invested (machines × 2 hours)
- 📈 **Platforms** - Individual breakdowns for HTB and THM

## 🚀 Getting Started (3 options)

### Option 1: Automatic Scraping (Recommended)

Set up your credentials once, then scraper updates automatically:

```bash
# Set your HTB API token and usernames
export HTB_USERNAME="your_username"
export HTB_API_TOKEN="your_api_token"  # From HTB Settings
export THM_USERNAME="your_thm_username"

# Run the scraper
cd scripts
python3 scrape_ctf_stats.py
```

The scraper will fetch live stats from both platforms and update `src/data/ctf-stats.json`.

### Option 2: Manual Update (Quick)

Don't want to set up API tokens? Use the interactive tool:

```bash
cd scripts
python3 update_stats_manual.py
```

Answer the prompts and your stats are saved instantly.

### Option 3: Direct JSON Edit (Developer)

Edit `src/data/ctf-stats.json` manually with your stats:

```json
{
  "lastUpdated": "2025-12-08T...",
  "platforms": {
    "hackthebox": {
      "name": "Hack The Box",
      "username": "your_username",
      "rank": "Pro Hacker",
      "points": 2850,
      "owns": 68
    },
    "tryhackme": {
      "name": "Try Hack Me",
      "username": "Hackertz",
      "rank": "Regular",
      "level": 25,
      "points": 5320,
      "roomsCompleted": 89
    }
  },
  "totals": {
    "machinesCompleted": 157,
    "pointsEarned": 8170,
    "rank": "Hacker",
    "hoursSpent": 314
  }
}
```

## 🔄 Automation (Optional)

### Daily Updates on Linux/Mac

```bash
crontab -e
# Add: 0 6 * * * cd /path/to/port-cyber/scripts && python3 scrape_ctf_stats.py
```

### Daily Updates on Windows

1. Open Task Scheduler
2. Create Basic Task → "Update CTF Stats"
3. Trigger: Daily at preferred time
4. Action: Run `python scripts/scrape_ctf_stats.py`

## 📍 Where It Shows

The dashboard appears on your portfolio's **Home page** in the "CTF Statistics Dashboard" section, right before the Skills section.

## ⚙️ API Setup (If Using Automatic Scraping)

### Hack The Box API Token

1. Visit [hackthebox.com](https://hackthebox.com/settings/api-key)
2. Click "Create API Key"
3. Copy the token
4. Set: `export HTB_API_TOKEN="paste_here"`

### Try Hack Me

- Just set username: `export THM_USERNAME="your_username"`
- If API unavailable, use manual tool instead

## 🛠️ Troubleshooting

| Problem                 | Solution                                                  |
| ----------------------- | --------------------------------------------------------- |
| Dashboard shows 0 stats | Run `update_stats_manual.py` or check credentials         |
| API returns error       | Use manual update tool - API may be down                  |
| Want to hide stats      | Remove CTFStatsDashboard import from `src/pages/Home.tsx` |
| Forgot API token        | Use manual update tool (no credentials needed)            |

## 📝 Files

- `scripts/scrape_ctf_stats.py` - Automatic scraper (fetches from APIs)
- `scripts/update_stats_manual.py` - Interactive manual updater
- `src/data/ctf-stats.json` - Data file (dashboard reads this)
- `src/components/CTFStatsDashboard.tsx` - React component (displays stats)

## 🎓 What Next?

1. **Try manual update**: `python3 scripts/update_stats_manual.py` (no setup needed)
2. **Verify on portfolio**: Visit home page, check CTF Statistics section
3. **Set up automation**: Add cron job for daily updates
4. **Customize**: Edit dashboard colors in `CTFStatsDashboard.tsx`

For detailed setup: See `scripts/README.md`

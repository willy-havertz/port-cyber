# CTF Stats Scraper

Automatically fetch your Hack The Box and Try Hack Me statistics, or manually update them.

## Setup

1. Install Python dependencies:

```bash
cd scripts
pip install -r requirements.txt
```

2. Set your credentials (choose one method):

### Method 1: Environment Variables

```bash
export HTB_USERNAME="your_htb_username"
export HTB_API_TOKEN="your_htb_api_token"
export THM_USERNAME="your_thm_username"
```

### Method 2: Edit the script

Open `scrape_ctf_stats.py` and update lines 15-17:

```python
HTB_USERNAME = "your_htb_username"
HTB_API_TOKEN = "your_htb_api_token"
THM_USERNAME = "your_thm_username"
```

### Method 3: Use .env file

Create `.env` in the root directory:

```
HTB_USERNAME=your_htb_username
HTB_API_TOKEN=your_htb_api_token
THM_USERNAME=your_thm_username
```

## Getting API Credentials

### Hack The Box API Token

1. Log in to [hackthebox.com](https://hackthebox.com)
2. Go to Settings → Create API Token
3. Copy the token

### Try Hack Me

- Only username needed (public profile)
- Visit `https://tryhackme.com/profile/YourUsername` to view your stats

## Usage

### Automatic Scraping

Run the scraper to fetch live stats from platforms:

```bash
cd scripts
python3 scrape_ctf_stats.py
```

### Manual Update (If APIs are unavailable)

Use the interactive manual update tool:

```bash
cd scripts
python3 update_stats_manual.py
```

This will prompt you to enter your stats interactively:

```
🔴 Hack The Box Stats:
Include HTB stats? (y/n) [n]: y
  HTB Username: pro_hacker
  HTB Rank: Pro Hacker
  HTB Points: 2850
  Machines Owned: 68
  Respect Points: 145
  Global Ranking: 2341

🟢 Try Hack Me Stats:
Include THM stats? (y/n) [y]: y
  THM Username [Hackertz]: Hackertz
  THM Rank: Regular
  THM Level: 25
  THM Points: 5320
  Rooms Completed: 89
  Badges Earned: 34
  Current Streak (days): 12
  Global Ranking: 4521
```

Output will be saved to: `src/data/ctf-stats.json`

## Automation

### Run daily with cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 6 AM)
0 6 * * * cd /path/to/port-cyber/scripts && python3 scrape_ctf_stats.py
```

### Run on Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (daily)
4. Set action: Run `python scrape_ctf_stats.py` in scripts folder

## Output Format

```json
{
  "lastUpdated": "2025-12-08T...",
  "platforms": {
    "hackthebox": {
      "name": "Hack The Box",
      "username": "pro_hacker",
      "rank": "Pro Hacker",
      "points": 2850,
      "owns": 68,
      "respect": 145,
      "ranking": 2341
    },
    "tryhackme": {
      "name": "Try Hack Me",
      "username": "Hackertz",
      "rank": "Regular",
      "level": 25,
      "points": 5320,
      "roomsCompleted": 89,
      "badges": 34,
      "streak": 12,
      "ranking": 4521
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

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` | Check your HTB API token is correct |
| `404 Not Found` | Verify HTB/THM username is correct |
| `Timeout` | Check internet connection |
| `text/html instead of JSON` | THM API endpoint may be down - use manual update instead |
| Invalid JSON error | Use `update_stats_manual.py` for manual entry |

## Security Notes

- Never commit API tokens to git
- Use environment variables or `.env` file
- Add `.env` to `.gitignore`
- Dashboard display is public - stats shown on portfolio



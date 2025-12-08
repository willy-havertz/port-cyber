# CTF Stats Scraper

Automatically fetch your Hack The Box and Try Hack Me statistics.

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

## Getting API Credentials

### Hack The Box API Token

1. Log in to [hackthebox.com](https://hackthebox.com)
2. Go to Settings → Create API Token
3. Copy the token

### Try Hack Me

- Only username needed (public profile)

## Usage

Run the scraper:

```bash
cd scripts
python3 scrape_ctf_stats.py
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
4. Set action: Run `python scrape_ctf_stats.py`

## Output Format

```json
{
  "lastUpdated": "2025-12-08T...",
  "platforms": {
    "hackthebox": {
      "name": "Hack The Box",
      "rank": "Hacker",
      "points": 150,
      "totalOwns": 25
    },
    "tryhackme": {
      "name": "Try Hack Me",
      "level": 10,
      "roomsCompleted": 50
    }
  },
  "totals": {
    "machinesCompleted": 75,
    "pointsEarned": 15000,
    "hoursSpent": 150
  }
}
```

## Troubleshooting

**401 Unauthorized**: Check your API token
**404 Not Found**: Verify username is correct
**Timeout**: Check internet connection

## Security Notes

- Never commit API tokens to git
- Use environment variables or `.env` file
- Add `.env` to `.gitignore`

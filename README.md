# 🧠 AI Opportunity Scraper

A smart toolchain that scrapes **AI-related hackathons and conferences** from trusted sources like **Devpost** and **AllConferenceAlert**, stores them in CSV/JSON, and displays the data beautifully on a React-based web dashboard.

## ✨ Features

- 🔎 Scrapes AI/Machine Learning Hackathons from [Devpost](https://devpost.com)
- 📅 Gathers AI Conferences from [AllConferenceAlert](https://www.allconferencealert.com)
- 📁 Saves results in `.csv` and `.json` format
- 🖥️ Displays opportunities in a clean and responsive dashboard
- 🔍 Search, filter by domain, mode (online/offline), month
- ⭐ Save favorites (locally stored)

---

## 📁 Project Structure
  
    AI_opportunity_scraper/ │ 
      ├── conference_scraper.py # Scraper for AI Conferences (AllConferenceAlert) 
      ├── hackathon_scraper.py # Scraper for AI Hackathons (Devpost) 
      ├── csv/ # Output CSVs 
      ├── json/ # Output JSONs 
      └── dashboard/ # React + Tailwind frontend dashboard


---

## ⚙️ Setup

### 1. Clone the repo

```bash
git clone https://github.com/iworkforpurpose/AI_opportunity_scraper.git
cd AI_opportunity_scraper

2. Run the scrapers (Python 3.7+ required)
Install dependencies:

pip install -r requirements.txt

Run both scrapers:
python conference_scraper.py
python hackathon_scraper.py
Outputs will be saved in the csv/ and json/ folders.

3. Run the dashboard (Node.js 16+ recommended)
cd dashboard
npm install
npm run dev
Open your browser at http://localhost:3000

🧩 Dependencies
Python
beautifulsoup4

selenium

pandas

requests

JavaScript
Next.js

Tailwind CSS

shadcn/ui

PapaParse (CSV parser)

lucide-react (icons)

📌 Sources Used
Devpost Hackathons

AllConferenceAlert

🚀 Future Improvements
Automate daily/weekly scraping via GitHub Actions or Cron

Support more event sources

Add user accounts & saved dashboard

Export calendar reminders

Deploy online with Vercel / Netlify

🧑‍💻 Author
Vighnesh Nama
AI & ML Student @ ATLAS SkillTech University
LinkedIn: @vighneshnama
GitHub: @iworkforpurpose




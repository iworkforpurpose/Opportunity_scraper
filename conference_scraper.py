import time
import requests
import json
from datetime import datetime
import pandas as pd
from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL    = "https://www.allconferencealert.com"
LISTING_URL = BASE_URL + "/artificial-intelligence/june-2025"

def init_driver():
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    return webdriver.Chrome(options=opts)

def fetch_listing_selenium(driver):
    driver.get(LISTING_URL)
    WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "table")))
    time.sleep(1)

    table = driver.find_element(By.TAG_NAME, "table")
    rows  = table.find_elements(By.TAG_NAME, "tr")[1:]  # skip header

    listing = []
    for tr in rows:
        tds = tr.find_elements(By.TAG_NAME, "td")
        if len(tds) < 3:
            continue

        raw_date = tds[0].text.strip()    # e.g. "01 Jun"
        cell     = tds[1].find_element(By.TAG_NAME, "a")
        name     = cell.text.strip()
        link     = cell.get_attribute("href")
        venue    = tds[2].text.strip()

        # normalize raw_date → "Jun 01, 2025"
        try:
            dd, mon = raw_date.split()
            dt = datetime(2025, datetime.strptime(mon, "%b").month, int(dd))
            listing_date = dt.strftime("%b %d, %Y")
        except:
            listing_date = raw_date

        listing.append({
            "Name":         name,
            "Listing Date": listing_date,
            "Venue":        venue,
            "Link":         link
        })

    return listing

def parse_detail_page(link):
    resp = requests.get(link)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    # Dates & deadlines from <li> items
    submission_deadline = ""
    start_date          = ""
    end_date            = ""
    for li in soup.find_all("li"):
        txt = li.get_text(" ", strip=True)
        if "Deadline for submission" in txt or txt.startswith("Deadline"):
            submission_deadline = txt.split(":",1)[1].strip() if ":" in txt else ""
        elif txt.startswith("Conference start date"):
            start_date = txt.split(":",1)[1].strip() if ":" in txt else ""
        elif txt.startswith("Conference end date"):
            end_date = txt.split(":",1)[1].strip() if ":" in txt else ""

    return {
        "Submission Deadline":   submission_deadline,
        "Conference Start Date": start_date,
        "Conference End Date":   end_date
    }

def main():
    driver = init_driver()
    listing = fetch_listing_selenium(driver)
    driver.quit()

    output = []
    for item in listing:
        details = parse_detail_page(item["Link"])
        row = {
            "Name":                   item["Name"],
            "Listing Date":           item["Listing Date"],
            "Venue":                  item["Venue"],
            **details,
            "Link":                   item["Link"]
        }
        output.append(row)

    # Save CSV (no description column)
    df = pd.DataFrame(output)
    df.to_csv("allconferencealert_june2025_full.csv", index=False)

    # Save JSON
    with open("allconferencealert_june2025_full.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=4)

    print(f"✅ Scraped {len(output)} conferences (description omitted).")
    print("  • CSV → allconferencealert_june2025_full.csv")
    print("  • JSON → allconferencealert_june2025_full.json")

if __name__ == "__main__":
    main()

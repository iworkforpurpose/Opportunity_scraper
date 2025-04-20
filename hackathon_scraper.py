import re
import time
import json
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def init_driver():
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    return webdriver.Chrome(options=opts)

def fetch_listing(driver, url):
    driver.get(url)
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "a.tile-anchor, div[class*='HackathonTile'] a"))
    )
    # scroll to bottom
    pause = 1.5
    last_h = driver.execute_script("return document.body.scrollHeight")
    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(pause)
        new_h = driver.execute_script("return document.body.scrollHeight")
        if new_h == last_h:
            break
        last_h = new_h

    elems = driver.find_elements(By.CSS_SELECTOR, "a.tile-anchor")
    if not elems:
        elems = driver.find_elements(By.CSS_SELECTOR, "div[class*='HackathonTile'] a")

    print(f"→ Found {len(elems)} hackathons in listing.")
    listing = []
    for e in elems:
        # Event name
        try:
            name = e.find_element(By.TAG_NAME, "h2").text.strip()
        except:
            name = "N/A"
        link = e.get_attribute("href")
        mode = "Online" if "Online" in e.text else "Offline"
        listing.append({"Name": name, "Link": link, "mode": mode})
    return listing

def scrape_details(driver, url):
    driver.get(url)
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "#introduction"))
    )
    time.sleep(0.5)

    # 1) DESCRIPTION (left column)
    try:
        desc = driver.find_element(
            By.CSS_SELECTOR,
            "#introduction .large-8.columns.content"
        ).text.strip()
    except:
        desc = ""

    # 2) SIDEBAR (right column)
    try:
        sidebar = driver.find_element(
            By.CSS_SELECTOR,
            "#introduction .large-4.columns"
        )
    except:
        sidebar = driver  # fallback to whole page

    text = sidebar.text

    # 3) DEADLINE via regex
    #    looks for "May 1, 2025 @ 4:30am GMT+5:30" (or similar)
    dl = ""
    # first try anchor label+value pattern
    m = re.search(r"Deadline\s*[:\n]([\w]+ \d{1,2}, ?\d{4} @ [0-9:apmGMT+\-: ]+)", text)
    if not m:
        # fallback to any "Month Day, Year @ ..." pattern
        m = re.search(r"([A-Z][a-z]+ \d{1,2}, ?\d{4} @ [0-9:apmGMT+\-: ]+)", text)
    if m:
        dl = m.group(1).strip()

    # 4) PRIZE via regex
    #    matches "$140,000 in cash" or any "$... "
    pr = ""
    m2 = re.search(r"(\$\d[\d,]*(?:\s?in cash)?)", text)
    if m2:
        pr = m2.group(1).strip()

    return dl, pr, desc

def main():
    BASE_URL = "https://devpost.com/hackathons?themes[]=Machine%20Learning%2FAI"
    driver = init_driver()

    # 1) scrape listing
    listing = fetch_listing(driver, BASE_URL)

    # 2) visit each detail page
    output = []
    for item in listing:
        dl, pr, ds = scrape_details(driver, item["Link"])
        
        # pull first line of description as Name
        lines = ds.splitlines()
        if lines:
            name_from_desc = lines[0].strip()
            desc_body = "\n".join(lines[1:]).strip()
        else:
            name_from_desc = item["Name"]
            desc_body = ds
        
        output.append({
            "Name":        name_from_desc,
            "Domain":      "Machine Learning/AI",
            "Deadline":    dl,
            "mode":        item["mode"],
            "Prize":       pr,
            "Link":        item["Link"],
            "description": desc_body
        })

    driver.quit()

    # 3) save
    df = pd.DataFrame(output)
    df.to_csv("ml_ai_hackathons_final.csv", index=False)
    with open("ml_ai_hackathons_final.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=4, ensure_ascii=False)

    print(f"✅ Scraped {len(output)} hackathons. Files written to:")
    print("   • ml_ai_hackathons_final.csv")
    print("   • ml_ai_hackathons_final.json")

if __name__ == "__main__":
    main()

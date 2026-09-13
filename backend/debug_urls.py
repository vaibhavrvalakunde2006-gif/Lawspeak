import requests
import json
import trafilatura
from bs4 import BeautifulSoup

def test_extraction(url):
    print(f"Testing extraction for: {url}")
    
    # 1. Jina.ai
    try:
        jina_url = f"https://r.jina.ai/{url}"
        print(f"Calling Jina: {jina_url}")
        resp = requests.get(jina_url, timeout=10)
        print(f"Jina Status: {resp.status_code}, Length: {len(resp.text)}")
        if resp.ok and len(resp.text) > 200:
            print("Jina SUCCEEDED")
    except Exception as e:
        print(f"Jina FAILED: {e}")

    # 2. Trafilatura
    try:
        downloaded = trafilatura.fetch_url(url)
        web_text = trafilatura.extract(downloaded) if downloaded else None
        print(f"Trafilatura Length: {len(web_text) if web_text else 0}")
        if web_text and len(web_text) > 200:
            print("Trafilatura SUCCEEDED")
    except Exception as e:
        print(f"Trafilatura FAILED: {e}")

if __name__ == "__main__":
    test_extraction("https://www.google.com/policies/terms/")
    test_extraction("https://www.whatsapp.com/legal/terms-of-service")

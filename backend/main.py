from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
import fitz

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from dotenv import load_dotenv
load_dotenv()

import os
API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_API_KEY_HERE")

import time
def ask_groq(prompt):
    url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "gemini-3.5-flash",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }
    
    for attempt in range(3):
        response = requests.post(url, headers=headers, json=data, timeout=180)
        try:
            result = response.json()
        except:
            if attempt < 2:
                time.sleep(2)
                continue
            raise Exception("API returned non-JSON response: " + response.text)
            
        if "choices" in result:
            return result["choices"][0]["message"]["content"]
            
        # If it's a 503 or high demand error, wait and try again
        error_str = str(result).lower()
        if "503" in error_str or "high demand" in error_str:
            if attempt < 2:
                time.sleep(2)
                continue
                
    raise Exception("API error: " + str(result))


def run_analysis(text):
    text = text[:8000]
    prompt = """
You are LawSpeak, a contract danger detector.
Analyse this contract and find all risky clauses.
Reply ONLY with a JSON object in exactly this format, nothing else, no extra text:

{
  "overall_score": a number from 0 to 100,
  "summary": "two sentence plain English summary of the biggest risks",
  "clauses": [
    {
      "original": "short quote from the contract, max 20 words",
      "risk_level": "RED or AMBER or GREEN",
      "category": "one of: forced_arbitration, data_sharing, auto_renewal, liability_waiver, unilateral_changes, payment, general",
      "plain_english": "what this means in simple language a 12 year old can understand",
      "danger": "one sentence explaining why this is risky"
    }
  ]
}

Rules:
- RED = dangerous, user loses significant rights
- AMBER = concerning, user should be aware
- GREEN = fair and standard
- Find ALL risky clauses, be thorough
- Return ONLY the JSON, no other text

Contract text:
""" + text

    reply = ask_groq(prompt)
    clean = reply.strip()
    if clean.startswith("```"):
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    clean = clean.strip().rstrip("```").strip()
    result = json.loads(clean)
    return result


@app.get("/")
def home():
    return {"message": "LawSpeak is running"}


@app.post("/analyse")
def analyse_text(text: str = Form(...)):
    try:
        result = run_analysis(text)
        return result
    except Exception as e:
        return {"error": str(e)}


@app.post("/analyse-pdf")
async def analyse_pdf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        pdf = fitz.open(stream=contents, filetype="pdf")
        text = ""
        for page in pdf:
            text += page.get_text()
        pdf.close()
        if len(text.strip()) < 20:
            return {"error": "Could not extract text from this PDF."}
        result = run_analysis(text)
        return result
    except Exception as e:
        return {"error": str(e)}

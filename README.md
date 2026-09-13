# LawSpeak — Contract Danger Detector

LawSpeak is an AI-powered tool that automatically reads contracts, Terms of Service, NDAs, and rental agreements to spot dangerous or unfair legal clauses in seconds. It provides a plain English breakdown of every risky clause—free, instant, and with no lawyer needed!

## 🚀 Live Demo
**Try it out here:** [https://lawspeak-1.onrender.com/](https://lawspeak-1.onrender.com/)

## 🛠️ Features
- **Instant Analysis:** Paste any legal text or upload a PDF.
- **Risk Scoring:** Get a clear danger score from 0-100.
- **Plain English Translations:** Translates confusing legal jargon into simple sentences.
- **Clause Categorization:** Sorts risks into RED (dangerous), AMBER (concerning), and GREEN (fair).
- **Chrome Extension:** Automatically detects when you are viewing legal pages and analyzes them for you.

## 💻 Tech Stack
- **Backend:** Python, FastAPI, PyMuPDF (fitz)
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **AI Model:** Google Gemini API (gemini-3.5-flash)
- **Deployment:** Render (Web Service & Static Site)

## ⚙️ How to Run Locally

### Prerequisites
- Python 3.8+
- A Google Gemini API Key (Get one free at [Google AI Studio](https://aistudio.google.com/app/apikey))

### Setup
1. Clone the repository:
   `ash
   git clone https://github.com/vaibhavrvalakunde2006-gif/Lawspeak.git
   cd Lawspeak
   `

2. Create a .env file in the ackend folder and add your API key:
   `env
   GEMINI_API_KEY=your_actual_api_key_here
   `

3. Start the project:
   - On Windows, you can simply run the startup script:
     `powershell
     .\start-lawspeak.ps1
     `
   - **Alternatively**, you can start the services manually:
     `ash
     # Start Backend (Port 8000)
     cd backend
     pip install -r requirements.txt
     uvicorn main:app --reload --port 8000
     
     # Start Frontend (Port 3000)
     cd frontend
     python -m http.server 3000
     `

4. Open http://localhost:3000 in your browser.

## 📦 Chrome Extension Setup
1. Open Google Chrome and go to chrome://extensions/.
2. Turn on **Developer mode** (top right corner).
3. Click **Load unpacked** and select the extension folder from this project.
4. The LawSpeak icon will now appear in your browser toolbar!

## 📜 License
MIT License

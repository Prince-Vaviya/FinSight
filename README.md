# FinSight - Financial News Analyzer

A web application that analyzes sentiment of financial news for stocks using Flask backend and vanilla JavaScript frontend.

## Project Structure

```
FinSight/
├── backend/
│   ├── app.py              # Flask backend server
│   ├── requirements.txt    # Python dependencies
│   └── README.md          # Backend documentation
├── frontend/
│   ├── index.html         # Main HTML interface
│   ├── analyze.js         # Frontend JavaScript logic
│   ├── styles.css         # CSS styling
│   ├── package.json       # JavaScript dependencies
│   ├── node_modules/      # JavaScript packages
│   └── README.md          # Frontend documentation
├── venv/                  # Python virtual environment
└── README.md             # This file
```

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
# Open index.html in browser or use a local server
python -m http.server 8000
```

## Features
- Sentiment analysis of financial news
- Firebase authentication
- Real-time stock news fetching
- Responsive web interface
- User subscription management

## Technologies
- **Backend**: Flask, Python, VADER Sentiment Analysis
- **Frontend**: HTML, CSS, JavaScript, Firebase
- **APIs**: Finnhub API for financial data
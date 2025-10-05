# FinSight Backend

This directory contains the Flask backend server for the FinSight application.

## Files
- `app.py` - Main Flask application with sentiment analysis API
- `requirements.txt` - Python dependencies

## Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python app.py
   ```

The server will run on `http://127.0.0.1:5000`

## API Endpoints
- `GET /analyze?symbol=<STOCK_SYMBOL>` - Analyze sentiment for stock news
# FinSight Frontend

This directory contains the frontend web application for FinSight.

## Files
- `index.html` - Main HTML interface
- `analyze.js` - JavaScript frontend logic with Firebase authentication
- `styles.css` - CSS styling
- `package.json` - JavaScript dependencies

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Open `index.html` in a web browser or serve it using a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if http-server is installed)
   npx http-server
   ```

## Features
- Firebase authentication
- Stock sentiment analysis
- Responsive design
- Financial news display

## Configuration
The application connects to:
- Backend API: `http://127.0.0.1:5000`
- Firebase for authentication and data storage
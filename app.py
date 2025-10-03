# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Finnhub API Token
API_TOKEN = 'cuj17q1r01qm7p9n307gcuj17q1r01qm7p9n3080'

# API endpoint for analysis
@app.route('/analyze')
def analyze_sentiment():
    symbol = request.args.get('symbol', 'TSLA')
    if not symbol:
        return jsonify({"error": "Stock symbol is required"}), 400

    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=1)
        
        params = {
            'symbol': symbol,
            'from': start_date.strftime('%Y-%m-%d'),
            'to': end_date.strftime('%Y-%m-%d'),
            'token': API_TOKEN
        }
        
        response = requests.get('https://finnhub.io/api/v1/company-news', params=params)
        response.raise_for_status()
        articles = response.json()

        if not articles:
            return jsonify({"positive": [], "negative": []})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to fetch news from API: {e}"}), 500

    analyzer = SentimentIntensityAnalyzer()
    scored_articles = []
    for article in articles:
        score = analyzer.polarity_scores(article['headline'])['compound']
        article['sentimentScore'] = score
        scored_articles.append(article)
    
    sorted_by_sentiment = sorted(scored_articles, key=lambda x: x['sentimentScore'], reverse=True)
    
    top_3_positive = sorted_by_sentiment[:3]
    top_3_negative = sorted_by_sentiment[-3:][::-1]

    return jsonify({
        "positive": top_3_positive,
        "negative": top_3_negative
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
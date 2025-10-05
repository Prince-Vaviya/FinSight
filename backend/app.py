from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from pymongo import MongoClient

# Initialize Flask App
app = Flask(__name__)

# Simple CORS configuration that should work
CORS(app)

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# MongoDB connection
try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['finsight']
    user_leads_collection = db['user_leads']
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

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
        start_date = end_date - timedelta(days=7)
        
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

# API endpoint to track "Know More" button clicks
@app.route('/track-click', methods=['POST'])
def track_click():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        user_email = data.get('user_email')
        plan_type = data.get('plan_type')  # 'free', 'paid', or 'premium'
        
        if not user_email or not plan_type:
            return jsonify({"error": "user_email and plan_type are required"}), 400
            
        if plan_type not in ['free', 'paid', 'premium']:
            return jsonify({"error": "plan_type must be 'free', 'paid', or 'premium'"}), 400
        
        # Find existing user record or create new one
        user_record = user_leads_collection.find_one({"email": user_email})
        
        if user_record:
            # Update existing record - increment the specific plan counter
            update_query = {"$inc": {f"clicks.{plan_type}": 1}, "$set": {"last_updated": datetime.now()}}
            user_leads_collection.update_one({"email": user_email}, update_query)
            
            # Get updated counts
            updated_record = user_leads_collection.find_one({"email": user_email})
            click_count = updated_record["clicks"][plan_type]
        else:
            # Create new user record
            new_record = {
                "email": user_email,
                "clicks": {
                    "free": 1 if plan_type == 'free' else 0,
                    "paid": 1 if plan_type == 'paid' else 0,
                    "premium": 1 if plan_type == 'premium' else 0
                },
                "created_at": datetime.now(),
                "last_updated": datetime.now()
            }
            user_leads_collection.insert_one(new_record)
            click_count = 1
        
        return jsonify({
            "success": True,
            "message": f"Click tracked for {plan_type} plan",
            "click_count": click_count,
            "user_email": user_email,
            "plan_type": plan_type
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to track click: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
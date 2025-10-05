**FinSight - Financial News Analyzer**

FinSight is a web application designed to provide financial news sentiment for stock tickers. It integrates a Python Flask backend for API handling of sentiment analysis. A JavaScript frontend for user interaction, and Firebase and MongoDB for data storage, authentication and user interaction tracking.

## Features

- **Real-Time Sentiment Analysis**: Analyzes news headlines for stock tickers using the VADER sentiment model.
- **User Authentication**: Secure login and registration via Firebase Authentication.
- **Search History**: Stores user searches in Firebase Realtime Database.
- **Subscription Tracking**: Logs user interactions with subscription plans in MongoDB.
- **Responsive UI**: Mobile-friendly interface with modern styling (gradient backgrounds, glassmorphism).

---

## Setup and Configuration

- **Flask App**: Initialized with CORS enabled for all origins to support cross-origin requests.
- **MongoDB**: Connects to `mongodb://localhost:27017` using `pymongo`.
  - **Database**: Uses the `finsight` database.
  - **Collection**: Stores data in the `user_leads` collection.
- **Finnhub API**: Requires an API token for accessing external news data.
- **Sentiment Analyzer**: Utilizes the `VaderSentiment`, Python library to generate sentiment scores for news articles' headlines.

---

## API Endpoints

### 1. Analyze Sentiment
- **URL**: `/analyze`
- **Method**: `GET`
- **Query Parameters**:
  - `symbol` (string, required): Stock symbol to fetch news for (e.g., `TSLA`).
- **Description**: Retrieves news headlines from the past 7 days for the specified stock symbol via the Finnhub API. Returns the top 3 positive and top 3 negative news articles based on sentiment analysis.
- **Response**:
  ```json
  {
    "positive": [
      { "headline": "string", "sentiment_score": float },
      ...
    ],
    "negative": [
      { "headline": "string", "sentiment_score": float },
      ...
    ]
  }
  ```
- **Error Codes**:
  - `400`: Missing `symbol` parameter.
  - `500`: External API failure or internal server error.

### 2. Track Click
- **URL**: `/track-click`
- **Method**: `POST`
- **Request Body** (JSON):
  ```json
  {
    "useremail": "string",
    "plantype": "string" // One of: "free", "paid", "premium"
  }
  ```
- **Description**: Tracks clicks on the "Know More" button per user and plan type, storing data in MongoDB. Updates existing user records or creates new ones with initial click counts.
- **Response**:
  ```json
  {
    "success": boolean,
    "message": "string",
    "clickcount": int,
    "useremail": "string",
    "plantype": "string"
  }
  ```
- **Error Codes**:
  - `400`: Missing or invalid required fields.
  - `500`: Internal server error.

## MongoDB Schema (userleads collection)

| Field        | Type     | Description                          |
|--------------|----------|--------------------------------------|
| `email`      | string   | User email (unique identifier)       |
| `clicks`     | object   | Click counts per plan: `free`, `paid`, `premium` (integers) |
| `createdat`  | datetime | Record creation timestamp            |
| `lastupdated`| datetime | Latest update timestamp             |

## Key Features

- **CORS Support**: Added to all responses to allow cross-origin requests.
- **Error Handling**: Robust handling for external API requests and MongoDB operations.
- **Sentiment Analysis**: Sorts news articles to highlight the most positive and negative ones based on sentiment scores.
- **Click Tracking**: Incrementally tracks user clicks per subscription plan in MongoDB.

## Running the App

1. Ensure dependencies are installed:
   ```bash
   pip install flask pymongo vaderSentiment requests flask-cors
   ```
2. Set the Finnhub API token:
   ```bash
   export APITOKEN='your_finnhub_api_token'
   ```
3. Run the application:
   ```bash
   python app.py
   ```
4. The app runs in debug mode by default on `port 5000`.



---------------------------------------------------------------------------------------------------------------------------


- **Frontend**: 

### `index.html`
- **Purpose**: Main entry point for the application.
- **Components**:
  - Login/registration forms with email and password.
  - Dashboard with stock ticker input and popular suggestions (e.g., AAPL, GOOGL).
  - Subscription plan cards (Free, Paid, Premium).
  - Dynamic section for displaying sentiment analysis results.

### `styles.css`
- **Styling**: 
  - Styling the application.
  - Hover animations on buttons and cards.
  - Form validation states and loading spinners.
  - Tier badges for subscription plans (Free, Popular, Best Value).

### `analyze.js`
- **Functionality**:
  - Firebase Authentication for user login/registration.
  - Stores search history in `users/{email}/searchHistory`.
  - Sends stock ticker to backend via `handleTickerSubmit()`.
  - Displays positive/negative news articles with `renderArticles()`.
  - Tracks subscription plan interest with `trackButtonClick()`.
- **Error Handling**: User-friendly messages for login failures, network issues, and invalid inputs.

---

- **Databases**:
  - **Firebase Realtime Database**: Stores user search history.

## Schema :
#### `users/{email}/searchHistory`
Stores user search history:
```json
{
  "ticker": "AAPL",
  "userRequestTimestamp": ".sv": "timestamp",
  "articles": {
    "positive": [{ "headline": "...", "url": "...", "score": 0.8 }, ...],
    "negative": [{ "headline": "...", "url": "...", "score": -0.6 }, ...]
  }
}
```


  - **MongoDB**: Tracks user interactions with subscription plans for lead generation/capturing.

## Schema : 
#### `finsight` database
#### `user_leads` Collection
Tracks user interactions with subscription plans:
```json
{
  "email": "user@example.com",
  "clicks": {
    "free": 3,
    "paid": 1,
    "premium": 0
  },
  "createdat": "2025-10-05T10:00:00Z",
  "lastupdated": "2025-10-06T01:00:00Z"
}
```

---
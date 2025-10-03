// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHKYHCt626gdjKAuU-ifuErfxp3g9H3cQ",
  authDomain: "finsight-d0a8f.firebaseapp.com",
  projectId: "finsight-d0a8f",
  storageBucket: "finsight-d0a8f.firebasestorage.app",
  messagingSenderId: "764856226961",
  appId: "1:764856226961:web:ccdb159c15080e33795b30"
};
const API_TOKEN = 'cuj17q1r01qm7p9n307gcuj17q1r01qm7p9n3080';

// Initialize Firebase with error checking
let app, auth;
try {
  if (typeof firebase === 'undefined') {
    throw new Error('Firebase SDK not loaded');
  }
  
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Show error message to user
  setTimeout(() => {
    showMessage('Firebase initialization failed. Please refresh the page.', 'error');
  }, 1000);
}

// Authentication state tracking
let currentUser = null;
let isAuthInitialized = false;

// Check if user is authenticated
function isUserAuthenticated() {
  return currentUser !== null && isAuthInitialized;
}

// Protect functions that require authentication
function requireAuth(callback) {
  if (!isUserAuthenticated()) {
    showMessage('Please log in to access this feature', 'error');
    showAuthForms();
    return false;
  }
  return callback();
}

// DOM elements
let loginForm, registerForm, logoutBtn, authContainer, mainContent, userInfo;
let tickerForm, stockTickerInput, analysisResults;

// Initialize DOM elements when page loads
document.addEventListener('DOMContentLoaded', function() {
  loginForm = document.getElementById('loginForm');
  registerForm = document.getElementById('registerForm');
  logoutBtn = document.getElementById('logoutBtn');
  authContainer = document.getElementById('authContainer');
  mainContent = document.getElementById('mainContent');
  userInfo = document.getElementById('userInfo');
  tickerForm = document.getElementById('tickerForm');
  stockTickerInput = document.getElementById('stockTicker');
  analysisResults = document.getElementById('analysisResults');

  // Add event listeners
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  // Ticker form - currently just validates and shows placeholder message
  if (tickerForm) {
    tickerForm.addEventListener('submit', handleTickerSubmit);
  }
  
  // Add real-time uppercase conversion for ticker input
  if (stockTickerInput) {
    stockTickerInput.addEventListener('input', function(e) {
      // Convert to uppercase as user types
      const cursorPosition = e.target.selectionStart;
      e.target.value = e.target.value.toUpperCase();
      // Restore cursor position
      e.target.setSelectionRange(cursorPosition, cursorPosition);
    });
    
    // Also convert on paste
    stockTickerInput.addEventListener('paste', function(e) {
      setTimeout(() => {
        e.target.value = e.target.value.toUpperCase();
      }, 0);
    });
  }

  // Set up auth state listener
  setupAuthStateListener();
});

// Handle user registration
async function handleRegister(e) {
  e.preventDefault();
  
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters long', 'error');
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    showMessage('Account created successfully!', 'success');
    console.log('User registered:', user.email);
    
    // Clear form
    document.getElementById('registerForm').reset();
    
  } catch (error) {
    showMessage(getErrorMessage(error.code), 'error');
    console.error('Registration error:', error);
  }
}

// Handle user login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showMessage('Please enter both email and password', 'error');
    return;
  }

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    showMessage('Welcome back!', 'success');
    console.log('User logged in:', userCredential.user.email);
    
    // Clear form
    document.getElementById('loginForm').reset();
    
  } catch (error) {
    showMessage(getErrorMessage(error.code), 'error');
    console.error('Login error:', error);
  }
}

// Handle user logout
async function handleLogout() {
  try {
    await auth.signOut();
    showMessage('Logged out successfully!', 'success');
    console.log('User logged out');
  } catch (error) {
    showMessage('Error logging out', 'error');
    console.error('Logout error:', error);
  }
}

// Set up authentication state listener
function setupAuthStateListener() {
  if (!auth) {
    console.error('Firebase auth not initialized');
    showMessage('Authentication system not available. Please refresh the page.', 'error');
    return;
  }
  
  auth.onAuthStateChanged((user) => {
    isAuthInitialized = true;
    
    if (user) {
      // User is signed in
      currentUser = user;
      console.log('User is authenticated:', user.email);
      showMainContent(user);
      initializeNewsAnalyzer();
    } else {
      // User is signed out
      currentUser = null;
      console.log('User is signed out');
      showAuthForms();
    }
  });
}

// Show main content when user is authenticated
function showMainContent(user) {
  if (authContainer) authContainer.style.display = 'none';
  if (mainContent) mainContent.style.display = 'block';
  if (userInfo) {
    userInfo.innerHTML = `
      <div class="user-profile">
        <p class="user-email">Welcome, ${user.email}!</p>
        <div class="user-actions">
          <button id="logoutBtn" class="btn btn-secondary">Logout</button>
        </div>
      </div>
    `;
    
    // Re-attach logout event listener
    const newLogoutBtn = document.getElementById('logoutBtn');
    if (newLogoutBtn) {
      newLogoutBtn.addEventListener('click', handleLogout);
    }
  }
  
  // Initialize protected features
  initializeProtectedFeatures();
}

// Show authentication forms when user is not authenticated
function showAuthForms() {
  if (authContainer) authContainer.style.display = 'block';
  if (mainContent) mainContent.style.display = 'none';
}

// Show messages to user
function showMessage(message, type) {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}

// Convert Firebase error codes to user-friendly messages
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}

// Toggle between login and register forms
function toggleAuthMode() {
  const loginContainer = document.getElementById('loginContainer');
  const registerContainer = document.getElementById('registerContainer');
  
  if (loginContainer && registerContainer) {
    if (loginContainer.style.display === 'none') {
      loginContainer.style.display = 'block';
      registerContainer.style.display = 'none';
    } else {
      loginContainer.style.display = 'none';
      registerContainer.style.display = 'block';
    }
  }
}

// Make toggle function globally available
window.toggleAuthMode = toggleAuthMode;

// Financial News Analyzer specific functions will go here
function initializeNewsAnalyzer() {
  // This is where you'll add your financial news analysis functionality
  console.log('Financial News Analyzer initialized for authenticated user');
  
  // Placeholder for news analysis features
  // You can add APIs for fetching financial news, sentiment analysis, etc.
}

// Initialize protected features that require authentication
function initializeProtectedFeatures() {
  if (!isUserAuthenticated()) {
    console.log('Cannot initialize protected features - user not authenticated');
    return;
  }
  
  console.log('Initializing protected features for:', currentUser.email);
  
  // Add click handlers for protected features
  setupProtectedFeatureHandlers();
  
  // Load user's financial data (placeholder)
  loadUserFinancialData();
}

// Setup handlers for features that require authentication
function setupProtectedFeatureHandlers() {
  // Add protected functionality to feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.addEventListener('click', () => {
      requireAuth(() => {
        const feature = card.querySelector('h3').textContent;
        handleFeatureClick(feature);
      });
    });
  });
}

// Handle clicks on protected features
function handleFeatureClick(feature) {
  console.log(`User ${currentUser.email} accessed feature: ${feature}`);
  
  switch(feature) {
    case '📈 Market Analysis':
      showMessage('Loading market analysis...', 'success');
      // Add your market analysis logic here
      break;
    case '📰 News Sentiment':
      showMessage('Analyzing news sentiment...', 'success');
      // Add your news sentiment analysis logic here
      break;
    case '📊 Portfolio Insights':
      showMessage('Loading portfolio insights...', 'success');
      // Add your portfolio analysis logic here
      break;
    case '🔔 Smart Alerts':
      showMessage('Setting up smart alerts...', 'success');
      // Add your alerts logic here
      break;
    default:
      showMessage('Feature coming soon!', 'success');
  }
}

// Load user-specific financial data (protected function)
function loadUserFinancialData() {
  if (!isUserAuthenticated()) {
    console.log('Cannot load financial data - user not authenticated');
    return;
  }
  
  console.log('Loading financial data for user:', currentUser.email);
  
  // Placeholder for loading user's financial data
  // This is where you'd typically make API calls to fetch user-specific data
  const newsContainer = document.getElementById('newsContainer');
  if (newsContainer) {
    newsContainer.innerHTML = `
      <div class="protected-content">
        <h3>Your Personalized Financial News</h3>
        <p>Welcome back, ${currentUser.email}!</p>
        <p>This section would contain personalized financial news and analysis based on your preferences.</p>
        <div class="news-items">
          <div class="news-item">
            <h4>Sample News Item 1</h4>
            <p>This is where real financial news would appear...</p>
          </div>
          <div class="news-item">
            <h4>Sample News Item 2</h4>
            <p>Integrate with financial news APIs to show real data...</p>
          </div>
        </div>
      </div>
    `;
  }
  
  const analysisContainer = document.getElementById('analysisContainer');
  if (analysisContainer) {
    analysisContainer.innerHTML = `
      <div class="protected-content">
        <h3>Your Market Analysis Dashboard</h3>
        <p>User: ${currentUser.email}</p>
        <p>This section would contain your personalized market analysis and portfolio insights.</p>
        <div class="analysis-widgets">
          <div class="widget">
            <h4>Portfolio Performance</h4>
            <p>Your portfolio data would appear here...</p>
          </div>
          <div class="widget">
            <h4>Market Trends</h4>
            <p>Personalized market trend analysis...</p>
          </div>
        </div>
      </div>
    `;
  }
}

// Ticker Analysis Functions (Currently Disabled)
async function handleTickerSubmit(e) {
  e.preventDefault();
  
  if (!isUserAuthenticated()) {
    showMessage('Please log in to analyze stocks', 'error');
    return;
  }
  
  // Get ticker and ensure it's uppercase and trimmed
  const ticker = stockTickerInput.value.trim().toUpperCase();
  
  if (!ticker) {
    showMessage('Please enter a stock ticker symbol', 'error');
    stockTickerInput.focus();
    return;
  }
  
  // Validate ticker format (letters only)
  const tickerPattern = /^[A-Z]+$/;
  if (!tickerPattern.test(ticker)) {
    showMessage('Ticker symbol should contain only letters', 'error');
    stockTickerInput.focus();
    return;
  }
  
  // Update the input field to show the cleaned ticker
  stockTickerInput.value = ticker;
  
  // Disable submit button and show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Analyzing...';
  
  // Just log the ticker for now - no analysis implementation
  console.log(`Ticker entered: ${ticker} by user: ${currentUser.email}`);

  try {
    await fetchDataFromServer(ticker);
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
  
  // Analysis functionality will be implemented later
  // TODO: Implement real stock analysis here
}


// Utility function to select ticker from suggestion chips
function selectTicker(ticker) {
  if (stockTickerInput) {
    // Ensure ticker is uppercase
    const upperTicker = ticker.toUpperCase();
    stockTickerInput.value = upperTicker;
    stockTickerInput.focus();
    
    // Optional: Show message that ticker was selected
    console.log(`Ticker ${upperTicker} selected from suggestions`);
  }
}

// Make selectTicker function globally available
window.selectTicker = selectTicker;





// analyze.js

// This function renders the articles.
function renderArticles(articles, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let htmlContent = '';
    articles.forEach(article => {
        const scoreClass = article.sentimentScore > 0 ? 'positive' : 'negative';
        htmlContent += `
            <div class="article-card">
                <h3>${article.headline}</h3>
                <p>${article.summary}</p>
                <p>Sentiment Score: <span class="score ${scoreClass}">${article.sentimentScore.toFixed(3)}</span></p>
                <a href="${article.url}" target="_blank">Read Full Article</a>
            </div>
        `;
    });
    container.innerHTML = htmlContent;
}

// This function fetches data FROM YOUR PYTHON SERVER
async function fetchDataFromServer(ticker) {
    const symbol = ticker; // You can make this dynamic later
    
    // Show loading state
    showMessage('Analyzing stock data...', 'info');
    
    try {
        const response = await fetch(`http://127.0.0.1:5000/analyze?symbol=${symbol}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Show the analysis results section
        const analysisResultsSection = document.getElementById('analysisResults');
        if (analysisResultsSection) {
            analysisResultsSection.style.display = 'block';
            
            // Update the title to include the stock symbol
            const titleElement = analysisResultsSection.querySelector('h3');
            if (titleElement) {
                titleElement.textContent = `Analysis Results for ${symbol}`;
            }
            
            // Scroll to results section
            analysisResultsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
        
        // Render the results using the data from the server
        renderArticles(data.positive, 'positive-articles');
        renderArticles(data.negative, 'negative-articles');
        
        // Show success message
        showMessage(`Analysis complete for ${symbol}!`, 'success');
        
    } catch (error) {
        console.error('Error fetching data from server:', error.message);
        // Display an error message to the user
        showMessage('Error connecting to server. Please make sure the Python server is running on port 5000.', 'error');
        
        // Hide the results section if there was an error
        const analysisResultsSection = document.getElementById('analysisResults');
        if (analysisResultsSection) {
            analysisResultsSection.style.display = 'none';
        }
    }
}

// Run the function
// fetchDataFromServer();
// Utility function to sanitize email for Firebase path
function sanitizeEmailForPath(email) {
    return email.replace(/[.#$\[\]]/g, '_');
}

// Utility function to get user data path
function getUserDataPath(email) {
    return `users/${sanitizeEmailForPath(email)}`;
}

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHKYHCt626gdjKAuU-ifuErfxp3g9H3cQ",
  authDomain: "finsight-d0a8f.firebaseapp.com",
  projectId: "finsight-d0a8f",
  storageBucket: "finsight-d0a8f.firebasestorage.app",
  messagingSenderId: "764856226961",
  appId: "1:764856226961:web:ccdb159c15080e33795b30",
  databaseURL: "https://finsight-d0a8f-default-rtdb.firebaseio.com"
};
const API_TOKEN = 'cuj17q1r01qm7p9n307gcuj17q1r01qm7p9n3080';

// Initialize Firebase with error checking
let auth, database;
try {
  // Check if Firebase is already initialized
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  auth = firebase.auth();
  database = firebase.database();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  setTimeout(() => {
    showMessage('Firebase initialization failed. Please refresh the page.', 'error');
  }, 1000);
}


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

  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;
  
  showMessage('Account created successfully!', 'success');
  console.log('User registered:', user.email);
  
  // Clear form
  document.getElementById('registerForm').reset();
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

// Ticker Analysis Functions (Currently Disabled)
async function handleTickerSubmit(e) {
  e.preventDefault();
  
  // Check if user is authenticated
  if (!requireAuth(() => true)) {
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
  
  // Logging the ticker and user email
  console.log(`Ticker entered: ${ticker} by user: ${currentUser.email}`);

  try {
    await fetchDataFromServer(ticker);
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}


// Utility function to select ticker from suggestion chips
function selectTicker(ticker) {
  if (stockTickerInput) {
    // Ensure ticker is uppercase
    const upperTicker = ticker.toUpperCase();
    stockTickerInput.value = upperTicker;
    stockTickerInput.focus();
  }
}

// Make selectTicker function globally available
window.selectTicker = selectTicker;


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

// Function to save search history to Firebase
async function saveSearchHistory(ticker, positiveArticles, negativeArticles) {
    if (!currentUser || !database) {
        console.error('User not authenticated or database not initialized');
        return;
    }

    try {
        const searchData = {
            ticker: ticker,
            userRequestTimestamp: firebase.database.ServerValue.TIMESTAMP,
            articles: {
                positiveScore: positiveArticles.map(article => ({
                    headline: article.headline,
                    summary: article.summary || '',
                    url: article.url,
                    publishedAt: article.datetime || Date.now(),
                    sentimentScore: article.sentimentScore
                })),
                negativeScore: negativeArticles.map(article => ({
                    headline: article.headline,
                    summary: article.summary || '',
                    url: article.url,
                    publishedAt: article.datetime || Date.now(),
                    sentimentScore: article.sentimentScore
                }))
            }
        };

        // Create a new entry in the user's search history using their email
        const userPath = getUserDataPath(currentUser.email);
        const userSearchHistoryRef = database.ref(`${userPath}`);
        await userSearchHistoryRef.push(searchData);
        console.log('Search history saved successfully for:', currentUser.email);
    } catch (error) {
        console.error('Error saving search history:', error);
        showMessage('Failed to save search history', 'error');
    }
}

// This function fetches data FROM THE PYTHON SERVER
async function fetchDataFromServer(ticker) {
    const symbol = ticker;
    
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
        
        // Save search history to Firebase
        await saveSearchHistory(symbol, data.positive, data.negative);
        
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
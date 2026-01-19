// Cyber Security Extension for Web Browsers

// Security headers to check and their descriptions
const SECURITY_HEADERS = {
  'strict-transport-security': {
    name: 'HTTP Strict Transport Security (HSTS)',
    description: 'Forces browsers to use HTTPS connections only',
    points: 20
  },
  'content-security-policy': {
    name: 'Content Security Policy (CSP)',
    description: 'Prevents XSS attacks by controlling resource loading',
    points: 25
  },
  'x-frame-options': {
    name: 'X-Frame-Options',
    description: 'Prevents clickjacking by controlling iframe embedding',
    points: 15
  },
  'x-content-type-options': {
    name: 'X-Content-Type-Options',
    description: 'Prevents MIME-sniffing attacks',
    points: 15
  },
  'referrer-policy': {
    name: 'Referrer-Policy',
    description: 'Controls how much referrer information is shared',
    points: 10
  },
  'permissions-policy': {
    name: 'Permissions-Policy',
    description: 'Controls browser features and APIs available',
    points: 15
  }
};

// Get current tab URL on load
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs[0].url;
  document.getElementById('current-url').textContent = url;
});

// Check button click handler
document.getElementById('check-btn').addEventListener('click', async () => {
  const checkBtn = document.getElementById('check-btn');
  const loading = document.getElementById('loading');
  const results = document.getElementById('results');

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url.startsWith('http')) {
    alert('This extension only works on HTTP/HTTPS websites');
    return;
  }

  // Show loading state
  checkBtn.disabled = true;
  loading.classList.remove('hidden');
  results.classList.add('hidden');

  try {
    // Fetch the page to get headers
    const response = await fetch(tab.url, { method: 'HEAD' });
    const headers = {};

    // Convert headers to object
    for (let [key, value] of response.headers.entries()) {
      headers[key.toLowerCase()] = value;
    }

    // Analyze headers
    analyzeHeaders(headers);

    // Show results
    loading.classList.add('hidden');
    results.classList.remove('hidden');

  } catch (error) {
    loading.classList.add('hidden');
    alert('Error analyzing headers. The site may be blocking the request.');
    console.error(error);
  } finally {
    checkBtn.disabled = false;
  }
});

function analyzeHeaders(headers) {
  let score = 0;
  let maxScore = 0;
  const headersList = document.getElementById('headers-list');
  headersList.innerHTML = '';

  // Check each security header
  for (let [headerKey, headerInfo] of Object.entries(SECURITY_HEADERS)) {
    maxScore += headerInfo.points;
    const exists = headers.hasOwnProperty(headerKey);

    if (exists) {
      score += headerInfo.points;
    }

    // Create header item
    const headerItem = document.createElement('div');
    headerItem.className = 'header-item';

    const status = exists ? '✅' : '❌';
    const statusSpan = document.createElement('div');
    statusSpan.className = 'header-status';
    statusSpan.textContent = status;

    const content = document.createElement('div');
    content.className = 'header-content';

    const name = document.createElement('div');
    name.className = 'header-name';
    name.textContent = headerInfo.name;

    const description = document.createElement('div');
    description.className = 'header-description';
    description.textContent = exists
      ? `✓ ${headerInfo.description}`
      : `⚠️ Missing - ${headerInfo.description}`;

    content.appendChild(name);
    content.appendChild(description);

    // Show header value if it exists
    if (exists) {
      const value = document.createElement('div');
      value.className = 'header-value';
      value.textContent = headers[headerKey].substring(0, 60) + (headers[headerKey].length > 60 ? '...' : '');
      content.appendChild(value);
    }

    headerItem.appendChild(statusSpan);
    headerItem.appendChild(content);
    headersList.appendChild(headerItem);
  }

  // Calculate percentage
  const percentage = Math.round((score / maxScore) * 100);

  // Update score display
  const scoreValue = document.getElementById('score-value');
  const scoreDisplay = document.getElementById('score-display');
  const scoreText = document.getElementById('score-text');

  scoreValue.textContent = percentage;

  // Set color and text based on score
  scoreDisplay.className = 'score';
  if (percentage >= 90) {
    scoreDisplay.classList.add('excellent');
    scoreText.textContent = 'Excellent Security';
  } else if (percentage >= 70) {
    scoreDisplay.classList.add('good');
    scoreText.textContent = 'Good Security';
  } else if (percentage >= 50) {
    scoreDisplay.classList.add('moderate');
    scoreText.textContent = 'Moderate Security';
  } else if (percentage >= 30) {
    scoreDisplay.classList.add('poor');
    scoreText.textContent = 'Poor Security';
  } else {
    scoreDisplay.classList.add('critical');
    scoreText.textContent = 'Critical - Vulnerable';
  }
}
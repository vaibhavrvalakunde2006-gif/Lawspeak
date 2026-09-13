// LawSpeak Content Script

function isLegalPage() {
  // Simple check to skip our own tools
  if (window.location.hostname.includes('localhost') || window.location.hostname.includes('ngrok')) {
    if (document.title.includes('LawSpeak')) return false;
  }

  const url = window.location.href.toLowerCase();
  const title = document.title.toLowerCase();

  // Strongly correlated URL patterns
  const urlPatterns = [
    /terms(?!.*search)/, 
    /privacy(?!.*search)/, 
    /conditions(?!.*search)/, 
    /legal(?!.*search)/, 
    /agreement(?!.*search)/,
    /policy(?!.*search)/
  ];

  if (urlPatterns.some(p => p.test(url))) return true;

  // Strongly correlated Title patterns
  const titlePatterns = [
    'terms of service',
    'terms and conditions',
    'privacy policy',
    'conditions of use',
    'user agreement',
    'end user license agreement',
    'eula'
  ];

  if (titlePatterns.some(p => title.includes(p))) return true;

  return false;
}

function extractPageText() {
  // Grab the main text context
  // Clone body, remove nav, footers, scripts, styles
  const clone = document.body.cloneNode(true);
  const elementsToRemove = clone.querySelectorAll('script, style, nav, header, footer, iframe, noscript');
  elementsToRemove.forEach(el => el.remove());

  // Extract text and clean it up
  let text = clone.innerText || clone.textContent;
  text = text.replace(/\s+/g, ' ').trim();
  
  // Truncate to avoid overloading the backend
  return text.substring(0, 18000); 
}

function injectUI() {
  const container = document.createElement('div');
  container.id = 'lawspeak-ext-container';

  // The panel that expands on click
  const panel = document.createElement('div');
  panel.id = 'lawspeak-ext-panel';
  
  // The floating badge
  const badge = document.createElement('div');
  badge.id = 'lawspeak-ext-badge';
  
  // Inside the badge
  const logo = document.createElement('div');
  logo.className = 'lawspeak-ext-logo';
  logo.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>';
  
  const textContainer = document.createElement('div');
  textContainer.id = 'lawspeak-ext-text-container';
  
  // Initial loading state
  textContainer.innerHTML = `
    <div class="lawspeak-ext-status-loading">
      <div class="lawspeak-ext-spinner"></div>
      <span class="lawspeak-ext-text">LawSpeak Analysing...</span>
    </div>
  `;

  badge.appendChild(logo);
  badge.appendChild(textContainer);
  
  container.appendChild(panel);
  container.appendChild(badge);
  
  document.body.appendChild(container);

  return { container, badge, panel, textContainer };
}

function renderResults(data, uiElements) {
  const { badge, panel, textContainer } = uiElements;
  const score = data.overall_score || 0;
  
  let riskClass = 'lawspeak-ext-green';
  let badgeVerdict = 'SAFE';
  
  if (score >= 60) {
    riskClass = 'lawspeak-ext-red';
    badgeVerdict = 'HIGH RISK';
  } else if (score >= 30) {
    riskClass = 'lawspeak-ext-amber';
    badgeVerdict = 'CAUTION';
  }

  // Update Badge
  textContainer.innerHTML = `
    <span class="lawspeak-ext-score ${riskClass}">${score}</span>
    <span class="lawspeak-ext-text">— ${badgeVerdict}</span>
  `;

  // Build Panel
  let panelHtml = `
    <div class="lawspeak-ext-header">
      <div class="lawspeak-ext-title">LawSpeak Analysis</div>
      <div class="lawspeak-ext-verdict" style="background: ${score >= 60 ? 'rgba(239, 68, 68, 0.2)' : score >= 30 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)'}; color: ${score >= 60 ? '#ef4444' : score >= 30 ? '#f59e0b' : '#22c55e'}">${badgeVerdict}</div>
    </div>
    <div class="lawspeak-ext-body">
      <div class="lawspeak-ext-summary">${data.summary_en || data.summary}</div>
  `;

  // Get top risky clauses (max 3)
  const clauses = data.clauses || [];
  const riskyClauses = clauses.filter(c => c.risk_level === 'RED' || c.risk_level === 'AMBER').slice(0, 3);
  
  if (riskyClauses.length > 0) {
    panelHtml += `<div class="lawspeak-ext-clauses-title">Top Dangerous Clauses</div>`;
    riskyClauses.forEach(c => {
      const cat = (c.category || 'General').replace(/_/g, ' ');
      panelHtml += `
        <div class="lawspeak-ext-clause ${c.risk_level}">
          <div class="lawspeak-ext-clause-header">
            <span class="lawspeak-ext-clause-cat">${cat}</span>
          </div>
          <div class="lawspeak-ext-clause-plain">${c.plain_english_en || c.plain_english}</div>
          <div class="lawspeak-ext-clause-danger">${c.danger_en || c.danger}</div>
        </div>
      `;
    });
  } else {
    panelHtml += `<div class="lawspeak-ext-clauses-title" style="color: #22c55e">No major red flags found.</div>`;
  }

  panelHtml += `
    </div>
    <div class="lawspeak-ext-footer">
      <span>Auto-detected Legal Page</span>
    </div>
  `;

  panel.innerHTML = panelHtml;

  // Add click listener
  badge.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('lawspeak-ext-open');
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !badge.contains(e.target)) {
      panel.classList.remove('lawspeak-ext-open');
    }
  });
}

function analysePageLocally(text, uiElements) {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('lang', 'en-IN'); // Fetch English for extension

  // Using the public Ngrok URL so anyone can use the extension
  fetch('https://excaudate-eleonor-repudiatory.ngrok-free.dev/analyse', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log("[LawSpeak Ext] Analysis complete", data);
    if (!data.error && data.overall_score !== undefined) {
      renderResults(data, uiElements);
    } else {
      uiElements.container.remove();
    }
  })
  .catch(err => {
    console.error("[LawSpeak Ext] Localhost backend unreachable. Extension will sleep. Error: ", err);
    // Local server is not running, silently hide
    uiElements.container.remove();
  });
}

// ── INIT ──
if (isLegalPage()) {
  const text = extractPageText();
  if (text.length > 500) {  // Ensure it's not a dummy page
    console.log(`[LawSpeak Ext] Auto-detected legal wording. Truncated Text length: ${text.length}. Starting analysis...`);
    const ui = injectUI();
    analysePageLocally(text, ui);
  }
}

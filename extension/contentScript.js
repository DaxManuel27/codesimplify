// Content Script for AI Research Assistant
console.log('AI Research Assistant content script loaded');

// Backend API URL
const BACKEND_URL = 'http://localhost:3000';

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "explainText") {
    explainSelectedText(request.text);
  }
  return true;
});
// Detect when the user highlights text on the page
document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
      explainSelectedText(selectedText);
      console.log("Selected text:", selectedText);
    }
  });

document.addEventListener('keyup', () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
      explainSelectedText(selectedText);
      console.log("Selected text:", selectedText);
    }
  });

  
// Function to explain selected text
async function explainSelectedText(text) {
  if (!text || text.trim().length === 0) {
    showNotification('Please select some text to explain', 'error');
    return;
  }

  // Show loading indicator
  showNotification('Getting AI explanation...', 'loading');

  try {
    const response = await fetch(`${BACKEND_URL}/api/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text })
    });

    const data = await response.json();

    if (data.success) {
      showExplanation(text, data.explanation);
    } else {
      showNotification(data.error || 'Failed to get explanation', 'error');
    }
  } catch (error) {
    console.error('Error communicating with backend:', error);
    showNotification('Error: Unable to connect to AI service. Make sure the backend server is running.', 'error');
  }
}

// Function to show explanation in a modal overlay
function showExplanation(originalText, explanation) {
  // Remove any existing explanation modal
  const existingModal = document.getElementById('ai-explanation-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'ai-explanation-modal';
  modal.innerHTML = `
    <div class="ai-modal-overlay">
      <div class="ai-modal-content">
        <div class="ai-modal-header">
          <h3>🤖 AI Code Explanation</h3>
          <button class="ai-modal-close">&times;</button>
        </div>
        <div class="ai-modal-body">
          <div class="ai-original-text">
            <h4>Selected Code:</h4>
            <pre><code>${escapeHtml(originalText)}</code></pre>
          </div>
          <div class="ai-explanation">
            <h4>Explanation:</h4>
            <div class="ai-explanation-content">${escapeHtml(explanation).replace(/\n/g, '<br>')}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal styles
  if (!document.getElementById('ai-modal-styles')) {
    const styles = document.createElement('style');
    styles.id = 'ai-modal-styles';
    styles.textContent = `
      .ai-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .ai-modal-content {
        background: white;
        border-radius: 12px;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        margin: 20px;
      }
      .ai-modal-header {
        padding: 20px 24px 16px;
        border-bottom: 1px solid #e5e5e5;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .ai-modal-header h3 {
        margin: 0;
        color: #333;
        font-size: 18px;
      }
      .ai-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 4px 8px;
        border-radius: 4px;
      }
      .ai-modal-close:hover {
        background: #f5f5f5;
        color: #333;
      }
      .ai-modal-body {
        padding: 24px;
      }
      .ai-original-text, .ai-explanation {
        margin-bottom: 20px;
      }
      .ai-original-text h4, .ai-explanation h4 {
        margin: 0 0 12px 0;
        color: #555;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .ai-original-text pre {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        padding: 16px;
        overflow-x: auto;
        font-size: 13px;
        line-height: 1.4;
      }
      .ai-explanation-content {
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 6px;
        padding: 16px;
        line-height: 1.6;
        color: #0c4a6e;
      }
    `;
    document.head.appendChild(styles);
  }

  // Add modal to page
  document.body.appendChild(modal);

  // Add event listeners
  modal.querySelector('.ai-modal-close').addEventListener('click', () => {
    modal.remove();
  });

  modal.querySelector('.ai-modal-overlay').addEventListener('click', (e) => {
    if (e.target === modal.querySelector('.ai-modal-overlay')) {
      modal.remove();
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// Function to show notifications
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existingNotification = document.getElementById('ai-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'ai-notification';
  notification.className = `ai-notification ai-notification-${type}`;
  notification.textContent = message;

  // Add notification styles
  if (!document.getElementById('ai-notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'ai-notification-styles';
    styles.textContent = `
      .ai-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        z-index: 10001;
        max-width: 350px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
      }
      .ai-notification-info { background: #3b82f6; }
      .ai-notification-error { background: #ef4444; }
      .ai-notification-loading { background: #f59e0b; }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(notification);

  // Auto-remove notification after 4 seconds (except loading)
  if (type !== 'loading') {
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.remove();
      }
    }, 4000);
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
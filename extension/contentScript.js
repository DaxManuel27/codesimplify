// Content Script for CodeSimplify - AI Code Explainer

// Backend API URL
const BACKEND_URL = 'https://codesimplify-o8m3.vercel.app/';

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "explainText") {
    explainSelectedText(request.text);
  }
  return true;
});

let aiExplainButton = null;

function showExplainPopupButton() {
  // Remove previous button if it exists
  if (aiExplainButton) {
    aiExplainButton.remove();
    aiExplainButton = null;
  }

  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText.length > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    aiExplainButton = document.createElement('button');
    aiExplainButton.id = 'ai-explain-popup-button';
    aiExplainButton.innerHTML = '✨ Explain Code';
    document.body.appendChild(aiExplainButton);

    // Position the button below the selection
    aiExplainButton.style.position = 'absolute';
    aiExplainButton.style.top = `${window.scrollY + rect.bottom + 5}px`;
    aiExplainButton.style.left = `${window.scrollX + rect.left}px`;
    aiExplainButton.style.zIndex = '9999';

    // Add styles for the button
    if (!document.getElementById('ai-popup-button-styles')) {
        const styles = document.createElement('style');
        styles.id = 'ai-popup-button-styles';
        styles.textContent = `
          #ai-explain-popup-button {
            background: #4A4A58;
            color: #E0E0E0;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            padding: 5px 10px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease-in-out; 
            opacity: 0;
            transform: translateY(-10px);
            animation: fadeIn 0.3s forwards;
          }
          #ai-explain-popup-button:hover {
            background: #5A5A68;
            transform: translateY(0) scale(1.05);
          }
          @keyframes fadeIn {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `;
        document.head.appendChild(styles);
    }

    aiExplainButton.addEventListener('click', (e) => {
      e.stopPropagation(); 
      explainSelectedText(selectedText);
      hideExplainPopupButton();
    });
  }
}

function hideExplainPopupButton() {
  if (aiExplainButton) {
    aiExplainButton.remove();
    aiExplainButton = null;
  }
}

// Show the button when text is selected
document.addEventListener('mouseup', (e) => {
    // Don't show button if clicking on the modal or the button itself
    if (e.target.closest('#ai-explain-popup-button') || e.target.closest('#ai-explanation-modal')) {
        return;
    }
    // Use timeout to allow selection to properly register
    setTimeout(showExplainPopupButton, 10);
});

// Hide the button if user clicks away or selection disappears
document.addEventListener('mousedown', (e) => {
    if (e.target.closest('#ai-explain-popup-button')) {
        return;
    }
    setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            hideExplainPopupButton();
        }
    }, 200);
});

// Function to explain selected text
async function explainSelectedText(text) {
  if (!text || text.trim().length === 0) {
    showNotification('Please select some text to explain', 'error');
    return;
  }

  // Show modal immediately with loading state
  showExplanationModal(text);

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
      startTypingInModal(data.explanation);
    } else {
      showErrorInModal(data.error || 'Failed to get explanation');
    }
  } catch (error) {
    showErrorInModal('Error: Unable to connect to AI service. Please try again later.');
  }
}

// Function to show modal immediately with loading state
function showExplanationModal(originalText) {
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
          <h3>CodeSimplify</h3>
          <button class="ai-modal-close">&times;</button>
        </div>
        <div class="ai-modal-body">
          <div class="ai-original-text">
            <h4>Selected Code:</h4>
            <pre><code>${escapeHtml(originalText)}</code></pre>
          </div>
          <div class="ai-explanation">
            <h4>Explanation:</h4>
            <div class="ai-explanation-content">
              <div class="loading-text">🤖 Analyzing your code...</div>
            </div>
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
        background: rgba(0, 0, 0, 0.1);
        z-index: 10000;
        display: flex;
        justify-content: flex-end;
        align-items: flex-start;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .ai-modal-content {
        background: rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(3px);
        border-radius: 8px;
        width: 400px;
        max-height: 60vh;
        overflow-y: auto;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .ai-modal-header {
        padding: 12px 16px 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .ai-modal-header h3 {
        margin: 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-weight: 600;
      }
      .ai-modal-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.7);
        padding: 2px 6px;
        border-radius: 4px;
      }
      .ai-modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
      }
      .ai-modal-body {
        padding: 16px;
      }
      .ai-original-text, .ai-explanation {
        margin-bottom: 12px;
      }
      .ai-original-text h4, .ai-explanation h4 {
        margin: 0 0 8px 0;
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .ai-original-text pre {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 12px;
        overflow-x: auto;
        font-size: 12px;
        line-height: 1.4;
        max-height: 150px;
        color: rgba(255, 255, 255, 0.95);
      }
      .ai-explanation-content {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 12px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.95);
        font-size: 13px;
      }
      .typing-cursor {
        animation: blink 1s infinite;
        color: rgba(255, 255, 255, 0.8);
      }
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      .loading-text {
        color: rgba(255, 255, 255, 0.7);
        font-style: italic;
        animation: pulse 1.5s ease-in-out infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
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

// Function to start typing animation in existing modal
function startTypingInModal(explanation) {
  const modal = document.getElementById('ai-explanation-modal');
  if (!modal) {
    return;
  }
  
  const explanationContainer = modal.querySelector('.ai-explanation-content');
  if (!explanationContainer) {
    return;
  }
  
  startTypingAnimation(explanationContainer, explanation);
}

// Function to show error in existing modal
function showErrorInModal(errorMessage) {
  const modal = document.getElementById('ai-explanation-modal');
  if (!modal) {
    return;
  }
  
  const explanationContainer = modal.querySelector('.ai-explanation-content');
  if (!explanationContainer) {
    return;
  }
  
  explanationContainer.innerHTML = `<div style="color: rgba(255, 100, 100, 0.9); font-style: italic;">❌ ${errorMessage}</div>`;
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

// Typing animation function
function startTypingAnimation(container, text) {
  const speed = 30; // milliseconds per character
  let index = 0;
  
  // Clear any existing content and add cursor
  container.innerHTML = '<span class="typing-cursor">|</span>';
  
  // Get cursor reference AFTER resetting innerHTML
  const cursor = container.querySelector('.typing-cursor');
  
  if (!cursor) {
    container.innerHTML = text.replace(/\n/g, '<br>');
    return;
  }
  
  function typeCharacter() {
    if (index < text.length) {
      const char = text[index];
      
      // Handle line breaks
      if (char === '\n') {
        container.insertBefore(document.createElement('br'), cursor);
      } else {
        const textNode = document.createTextNode(char);
        container.insertBefore(textNode, cursor);
      }
      
      index++;
      setTimeout(typeCharacter, speed);
    } else {
      // Remove cursor when typing is complete
      if (cursor && cursor.parentNode) {
        cursor.remove();
      }
    }
  }
  
  // Start typing after a short delay
  setTimeout(typeCharacter, 500);
}
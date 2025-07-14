// Background service worker for AI Research Assistant
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Research Assistant extension installed');
  
  // Create context menu
  chrome.contextMenus.create({
    id: "explainText",
    title: "Explain with AI",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainText") {
    console.log("Selected text:", info.selectionText); // <-- Add this line
    console.log("Text length:", info.selectionText?.length); // <-- And this one
    
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, {
      action: "explainText",
      text: info.selectionText
    });
  }
}); 


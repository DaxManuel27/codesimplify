// Create context menu item on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explainCode",
    title: "Explain with CodeSimplify",
    contexts: ["selection"] // Only show when text is selected
  });
});

// Listen for when the user clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Ensure the click is for our menu item and there's text selected
  if (info.menuItemId === "explainCode" && info.selectionText) {
    // Send a message to the content script in the active tab
    // The content script will only be on GitHub pages, as per your manifest
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: "explainText",
        text: info.selectionText
      });
    } else {
      console.error("Could not get active tab ID.");
    }
  }
}); 


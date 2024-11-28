// filepath: /Users/deva/Developer/ospr/chrome-ext/src/background.ts

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");

  // Create a context menu item
  chrome.contextMenus.create({
    id: "openSidePanel",
    title: "Open side panel",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Context menu item clicked:", info);
  if (info.menuItemId === "openSidePanel") {
    if (!tab) {
      console.error("Tab not found");
      return;
    }

    // Fetch the browsing history asynchronously
    chrome.history.search({ text: "", maxResults: 10 }, async (results) => {
      console.log("History results:", results);

      // Store the history results
      chrome.storage.local.set({ historyResults: results }, () => {
        console.log("History results stored");

        // Open the side panel after storing data
        chrome.sidePanel.setOptions({ path: "sidepanel.html" });
      });
    });

    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TEXT_SELECTED") {
    // Store the selected text
    // chrome.storage.local.set({ selectedText: message.text }, () => {
    //   console.log("Selected text stored:", message.text);
    // });
  }
});

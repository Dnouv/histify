// filepath: /Users/deva/Developer/ospr/chrome-ext/src/background.ts
import { tokenize, calculateTermFrequency } from "./tokenize.js";

const HISTORY_RECORD = "summaries";
const MAX_HISTORY_RECORDS = 100;
const ALARM_PERIOD = 12 * 60; // 12 hours in minutes

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");

  // Create a context menu item
  chrome.contextMenus.create({
    id: "openSidePanel",
    title: "Open side panel",
    contexts: ["all"],
  });

  // schedule a job to clear history every 12 hours
  chrome.alarms.create("refreshHistory", {
    periodInMinutes: ALARM_PERIOD,
    when: Date.now(),
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm triggered:", alarm);

  if (alarm.name === "refreshHistory") {
    chrome.storage.local.get([HISTORY_RECORD], (result) => {
      let summaries = result[HISTORY_RECORD] || {};
      const urls = Object.values(summaries) as {
        metadata: { url: string; timestamp: number; tab: chrome.tabs.Tab };
        summary: string;
      }[];

      if (urls.length === 0) {
        return;
      }

      if (urls.length > MAX_HISTORY_RECORDS) {
        const sortedUrls = urls.sort(
          (a, b) => b.metadata.timestamp - a.metadata.timestamp
        );
        console.log("History too large, cleaning up", sortedUrls);
        console.log("Summaries:", urls);
        // Sort URLs by some criteria if needed, here we just slice the any after 100
        const excessUrls = sortedUrls.slice(MAX_HISTORY_RECORDS);
        excessUrls.forEach((obj) => {
          delete summaries[obj.metadata.url];
        });

        chrome.storage.local.set({ [HISTORY_RECORD]: summaries }, () => {
          console.log("History cleaned up");
        });
      }
    });
  }

  return true;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Context menu item clicked:", info);
  if (info.menuItemId === "openSidePanel") {
    if (!tab) {
      console.error("Tab not found");
      return;
    }

    // Fetch the browsing history asynchronously
    chrome.history.search({ text: "", maxResults: 20 }, async (results) => {
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

chrome.webNavigation.onCompleted.addListener(async (details) => {
  console.log("Web navigation completed:", details);

  if (details.url && !details.url.startsWith("chrome://")) {
    chrome.tabs.sendMessage(details.tabId!, { action: "summarize" });
  }
  return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "storeSummary" && message.summary) {
    const summary = message.summary;
    const url = sender.tab?.url;

    if (url) {
      chrome.storage.local.get(["summaries"], (result) => {
        const summaries = result.summaries || {};
        const metadata = { url, timestamp: Date.now(), tab: sender.tab };

        const tokens = tokenize(summary); // Tokenize the text
        const termFrequency = calculateTermFrequency(tokens); // Calculate term frequency
        const docLength = tokens.length; // Document length

        console.log("other data", metadata, termFrequency, docLength);

        summaries[url] = { metadata, summary, termFrequency, docLength };
        chrome.storage.local.set({ summaries }, () => {
          console.log("Summary stored:", summary);
          sendResponse({ status: "success" });
        });
      });
      return true; // Keep the message channel open
    }
  }
  return false; // Close the message channel
});

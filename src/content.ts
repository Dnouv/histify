const PROMPT = `
You are an AI that summarizes text. Your task is to create a concise summary in English based on the text provided below. 

### Guidelines:
1. Summarize the text accurately, capturing its main idea and key details. The summary should clearly convey the essence of the original text.
2. If the text is in another language or script, romanize it and ensure the summary is in English alphabets only.
3. Do not include comments about the language or script; focus solely on summarizing the content.

### Input Text:
`;

const getSummaryFromPrompt = async (text: string): Promise<string> => {
  if (!(await checkPromptSupport())) {
    throw new Error("AI Language Model is not supported");
  }
  const session = await window.ai.languageModel.create();
  console.log(session.tokensLeft, "used out of a total of", session.maxTokens);

  const prompt = `
  ${PROMPT}
  ${text}
  ### Summary:
  `;
  // totale token limit is ~6144
  // TODO: If text is big summarize it in parts, kinda summaries of summaries
  const totalTokens = await session.countPromptTokens(prompt);
  console.log("total tokens", totalTokens);
  const response = await session.prompt(prompt);
  console.log("response genenrated", response);
  return response;
};

const checkPromptSupport = async (): Promise<boolean> => {
  const languageModelApiAvailable =
    window.ai !== undefined && window.ai.languageModel !== undefined;
  if (!languageModelApiAvailable) {
    return false;
  }

  let capabilites = await window.ai.languageModel.capabilities();
  if (
    capabilites.available === "readily" ||
    capabilites.available === "after-download"
  ) {
    return true;
  }

  try {
    await window.ai.languageModel.create();
  } catch (e) {}

  capabilites = await window.ai.languageModel.capabilities();
  return capabilites.available !== "no";
};

// Helper function to extract text from the page
function extractText(): string {
  const bodyText = document.body.innerText;
  if (!bodyText) return "";

  const words = bodyText.replace(/\s+/g, " ").trim().split(" ");

  const first200Words = words.slice(0, 200);
  return first200Words.join(" ");
}

// Basic summarization: Grab first N sentences
function summarizeText(text: string, numSentences: number = 3): string {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  console.log("Sentences:", sentences);
  return sentences.slice(0, numSentences).join(" ");
}

// Listen for the message from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "summarize") {
    // Handle async operations in a separate function
    handleSummarize().then(sendResponse);
    return true; // Keep message channel open for async response
  }
  return false;
});

async function handleSummarize() {
  try {
    const extractedText = extractText();
    const summary = await getSummaryFromPrompt(extractedText);
    console.log("Summary:", summary);
    await chrome.runtime.sendMessage({ action: "storeSummary", summary });
    return { status: "success" };
  } catch (error) {
    console.error("Error in handleSummarize:", error);
    return { status: "error", error: (error as any).message };
  }
}

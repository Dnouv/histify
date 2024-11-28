const PROMPT = `
You are an AI that can summarize text. Given the text below it can be in any language 
or any script, but your job is to output a summary in English text only. Don't mention 
anything about the language, just summarize the text. Also make sure to summarize such that
it captures the essence of the text, such that if I read the summary I should be able to say what
the rest of the text was about.
DO NOT OUTPUT TEXT IN ANY OTHER CHARACTERS ONLY USE ENGLISH ALPHABETS IN THE OUTPUTS. For the other scripts romanize it.
TEXT:
`;

const getSummaryFromPrompt = async (text: string): Promise<string> => {
  if (!(await checkPromptSupport())) {
    throw new Error("AI Language Model is not supported");
  }
  const session = await window.ai.languageModel.create();
  console.log(session.tokensLeft, "used out of a total of", session.maxTokens);

  const prompt = `${PROMPT} \n 
  ${text}
  SUMMARY:
  `;
  // totale token limit is ~6144
  // TODO: If text is big summarize it in parts, kinda summaries of summaries
  const totalTokens = await session.countPromptTokens(prompt);
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
  return bodyText ? bodyText.replace(/\s+/g, " ").trim() : "";
}

// Basic summarization: Grab first N sentences
function summarizeText(text: string, numSentences: number = 3): string {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  console.log("Sentences:", sentences);
  return sentences.slice(0, numSentences).join(" ");
}

// Listen for the message from the background script
// Listen for messages from the background script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "summarize") {
    const extractedText = extractText();
    const summary = await getSummaryFromPrompt(extractedText);
    console.log("Summary:", summary);
    // const summary = summarizeText(extractedText, 3); // Summarize to 3 sentences
    chrome.runtime.sendMessage({ action: "storeSummary", summary });
    sendResponse({ status: "success" });
  }
  return false; // Close the message channel
});

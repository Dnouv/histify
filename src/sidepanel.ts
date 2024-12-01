import { bm25Search } from "./tokenize.js";

function createMessage(content: string, isUser: boolean) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${
    isUser ? "user-message" : "assistant-message"
  }`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = isUser ? "U" : "A";

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.innerHTML = isUser
    ? content
    : (window as any).marked.parse(content);

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);
  return messageDiv;
}

document.addEventListener("DOMContentLoaded", () => {
  const actionButton = document.getElementById(
    "actionButton"
  ) as HTMLButtonElement;
  const userInput = document.getElementById("userInput") as HTMLInputElement;
  const outputArea = document.getElementById("outputArea") as HTMLDivElement;

  // Add a message to the chat interface
  function addMessage(content: string, isUser: boolean) {
    const message = createMessage(content, isUser);
    outputArea.appendChild(message);
    outputArea.scrollTop = outputArea.scrollHeight; // Auto-scroll to the bottom
  }

  // Add a welcome message

  addMessage(
    "Welcome! I'm an assistant that helps users find the most relevant links from their browsing history based on their query. Please enter a query to get started.",
    false
  );

  // Handle the "Send" button click
  actionButton.addEventListener("click", async () => {
    const query = userInput.value.trim();
    if (!query) {
      alert("Please enter a query.");
      return;
    }

    // Add user query to the chat
    addMessage(query, true);
    userInput.value = ""; // Clear input field

    // Add loading message
    const loadingMsg = createMessage(
      '<div class="loading-dots"><span></span><span></span><span></span></div>',
      false
    );
    outputArea.appendChild(loadingMsg);

    // Scroll to bottom to show "Thinking"
    outputArea.scrollTop = outputArea.scrollHeight;

    // Construct the assistant's prompt
    const PROMPT = `
You are an assistant that answers user queries based on their browsing history. Your task is to provide a clear, concise response to the user's query using information from the browsing history links and provided summaries. Include reference links for the sources at the end.

### Instructions:
1. Carefully analyze the browsing history summaries and titles to find information that directly answers the user's query.
2. If relevant information is found, craft a clear and concise response addressing the query. Reference the sources at the end of your response in this format:
    Here are some relevant sources from your browsing history:
   - [Title 1](URL 1)
   - [Title 2](URL 2)
   - [Title 3](URL 3)
4. Be assertive in providing responses. If you identify semantic matches, respond without hesitation or unnecessary apologies.
5. Avoid fabricating or guessing information. Use ONLY the browsing history provided.
6. Use semantic understanding to infer matches even if the query wording does not exactly match titles or summaries. 
7. Always rely on semantic relevance and context to provide accurate responses.
8. If there are multiple relevant sources, include all of them in the response.
---
### Constraints:
- Use ONLY the provided browsing history. Do not fabricate or assume information.
- Keep your response concise and directly related to the query.
- Reference titles must be concise (max 40 characters) and reflect the content.

### User Query:
${query}

### Browsing History (Titles, Links, and Summaries):
`;

    // Add placeholder for streaming response
    let currentResponseMsg: HTMLElement | null = createMessage("", false);

    try {
      // Check if window.ai is available
      if (window.ai && window.ai.languageModel) {
        const { available } = await window.ai.languageModel.capabilities();
        if (available !== "no") {
          console.time("BM25 Search");
          const results = await bm25Search(query); // Perform BM25 search
          console.timeEnd("BM25 Search");

          const combinedLinks = results
            .slice(0, 3)
            .map(
              (result, index) =>
                `${index + 1}. [${result.title}](${result.url}) \n Summary: ${
                  result.summary
                }`
            )
            .join("\n");

          console.time("AI Language Model");
          const session = await window.ai.languageModel.create(); // Create session
          console.timeEnd("AI Language Model");

          console.log(combinedLinks);

          const promptModel = `${PROMPT}\n ${combinedLinks}`;
          // Stream AI-generated response
          const stream = session.promptStreaming(promptModel);

          console.log(
            "BM25 Results:",
            await session.countPromptTokens(promptModel)
          );

          console.log("Prompt Model:", promptModel);

          const read = stream.getReader();
          let done = false;
          let responseMsgAdded = false;

          while (!done) {
            const { value, done: isDone } = await read.read();
            done = isDone;

            if (value) {
              if (!responseMsgAdded) {
                outputArea.removeChild(loadingMsg); // Remove "Thinking" message
                outputArea.appendChild(currentResponseMsg);
                responseMsgAdded = true;
              }
              const messageContent =
                currentResponseMsg.querySelector(".message-content");
              if (messageContent) {
                messageContent.innerHTML = (window as any).marked.parse(value);
              }
              outputArea.scrollTop = outputArea.scrollHeight; // Auto-scroll
            }
          }
        } else {
          throw new Error("AI language model is not available.");
        }
      } else {
        throw new Error("AI language model is not available.");
      }
    } catch (error) {
      // add error message to the chat

      addMessage("An error occurred. Please try again.", false);
      console.error("An error occurred:", error);
      outputArea.removeChild(loadingMsg); // Remove "Thinking" message

      outputArea.removeChild(currentResponseMsg); // Remove placeholder
      addMessage("An error occurred. Please try again.", false);
    }
  });
});

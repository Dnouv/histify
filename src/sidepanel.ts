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
    const prompt = `
      You are an assistant that helps users find the most relevant links from their browsing history based on their query.
      User Query: "${query}"

      Please provide the top 3 most relevant links from the browsing history that match the user's query.
      Respond in the following format:

      1. [Title 1](URL 1)
      2. [Title 2](URL 2)
      3. [Title 3](URL 3)

      Keep the title concise and relevant to the content of the link, maximum 30-40 characters.

      After listing the links, provide a brief explanation (in 2-3 sentences) of why these links are relevant to the user's query. 
      Remember to always reply in English no other language, and if there are no relevant links in the below browsing history, politely inform the user. DO NOT SHARE RANDOM LINKS.
      And be as concise as possible in your responses.
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
                `${index + 1}. [${result.summary}](${result.url})`
            )
            .join("\n");

          console.time("AI Language Model");
          const session = await window.ai.languageModel.create(); // Create session
          console.timeEnd("AI Language Model");

          // Stream AI-generated response
          const stream = session.promptStreaming(
            `${prompt}\nBROWSING HISTORY: ${combinedLinks}`
          );

          console.log(
            "BM25 Results:",
            await session.countPromptTokens(
              `${prompt}\nBROWSING HISTORY: ${combinedLinks}`
            )
          );

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

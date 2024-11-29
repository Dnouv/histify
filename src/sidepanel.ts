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

  actionButton.addEventListener("click", async () => {
    const query = userInput.value.trim();
    if (!query) {
      alert("Please enter a query.");
      return;
    }

    // Clear previous output
    // outputArea.textContent = "Processing...";
    outputArea.appendChild(createMessage(query, true));

    // Add loading message
    const loadingMsg = createMessage(
      'Thinking<div class="loading-dots"><span></span><span></span><span></span></div>',
      false
    );
    outputArea.appendChild(loadingMsg);

    // Scroll to bottom
    outputArea.scrollTop = outputArea.scrollHeight;

    // Improved prompt
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
            `;

    // Check if window.ai is available
    if (window.ai && window.ai.languageModel) {
      try {
        const { available } = await window.ai.languageModel.capabilities();
        if (available !== "no") {
          console.time("BM25 Search");
          const results = await bm25Search(query);
          console.timeEnd("BM25 Search");

          console.time("AI Language Model");
          const session = await window.ai.languageModel.create();
          console.timeEnd("AI Language Model");
          const combinedLinks = results
            .slice(0, 3)
            .map((result, index) => {
              return `${index + 1}. [${result.summary}](${result.url})`;
            })
            .join("\n");

          const stream = session.promptStreaming(
            `${prompt}\n BROWSING HISTORY: ${combinedLinks}`
          );

          console.log(
            "BM25 Results:",
            await session.countPromptTokens(
              `${prompt}\n BROWSING HISTORY: ${combinedLinks}`
            )
          );

          console.time("Reading Stream");
          const read = stream.getReader();
          console.timeEnd("Reading Stream");

          let done = false;
          outputArea.removeChild(loadingMsg);
          let currentResponseMsg: HTMLElement | null = createMessage("", false);
          outputArea.appendChild(currentResponseMsg);

          while (!done) {
            const { value, done: isDone } = await read.read();

            done = isDone;
            console.log("Value:", value);

            // value
            //   ? (outputArea.innerHTML = (window as any).marked.parse(value))
            //   : null;
            if (value) {
              const messageContent =
                currentResponseMsg.querySelector(".message-content");
              messageContent
                ? (messageContent.innerHTML = (window as any).marked.parse(
                    value
                  ))
                : null;
              outputArea.scrollTop = outputArea.scrollHeight;
            }
          }
        } else {
          outputArea.appendChild(
            createMessage("AI language model is not available.", false)
          );
        }
      } catch (error) {
        console.error("An error occurred:", error);
        outputArea.appendChild(
          createMessage("An error occurred. Please try again.", false)
        );
      }
    } else {
      outputArea.appendChild(
        createMessage("AI language model is not available.", false)
      );
    }
  });
});

import { bm25Search } from "./tokenize.js";

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
    outputArea.textContent = "Processing...";

    // Retrieve history data from storage
    chrome.storage.local.get("historyResults", async (data) => {
      if (data.historyResults && data.historyResults.length > 0) {
        // Prepare history data for the AI model
        const combinedHistory = data.historyResults
          .map(
            (item: { title: string; url: string }) =>
              `${item.title} - ${item.url}`
          )
          .join("\n");

        // Improved prompt
        const prompt = `
            You are an assistant that helps users find the most relevant links from their browsing history based on their query.
            User Query: "${query}"

            Please provide the top 3 most relevant links from the browsing history that match the user's query.
            Respond in the following format:

            1. [Title 1](URL 1)
            2. [Title 2](URL 2)
            3. [Title 3](URL 3)

            After listing the links, provide a brief explanation (in 2-3 sentences) of why these links are relevant to the user's query.
            `;

        // Check if window.ai is available
        if (window.ai && window.ai.languageModel) {
          try {
            const { available } = await window.ai.languageModel.capabilities();
            if (available !== "no") {
              const results = await bm25Search(query);

              const session = await window.ai.languageModel.create();
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

              const read = stream.getReader();

              let done = false;
              let response = "";
              while (!done) {
                const { value, done: isDone } = await read.read();

                done = isDone;
                console.log("Value:", value);

                value
                  ? (outputArea.innerHTML = (window as any).marked.parse(value))
                  : null;
              }
            } else {
              outputArea.textContent = "Language model is not available.";
            }
          } catch (error) {
            console.error("An error occurred:", error);
            outputArea.textContent =
              "An error occurred while processing your request.";
          }
        } else {
          outputArea.textContent = "AI language model is not available.";
        }
      } else {
        outputArea.textContent = "No browsing history data available.";
      }
    });
  });
});

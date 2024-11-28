document.addEventListener("DOMContentLoaded", () => {
  const actionButton = document.getElementById("actionButton");
  const userInput = document.getElementById("userInput");
  const outputArea = document.getElementById("outputArea");

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
          .map((item) => `${item.title} - ${item.url}`)
          .join("\n");

        // Improved prompt
        const prompt = `
You are an assistant that helps users find the most relevant links from their browsing history based on their query.
User Query: "${query}"
Browsing History:
${combinedHistory}

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
              const session = await window.ai.languageModel.create();

              // Prompt the model and get the result
              const stream = session.promptStreaming(prompt);

              for await (const chunk of stream) {
                outputArea.textContent = chunk;
                outputArea.scrollTop = outputArea.scrollHeight;
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

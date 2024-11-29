document.addEventListener("DOMContentLoaded", () => {
  const outputArea = document.getElementById("outputArea");

  if (!outputArea || typeof marked === "undefined") {
    console.error("Required elements not found");
    return;
  }

  // Configure marked once
  window.marked.setOptions({
    gfm: true,
    breaks: true,
    sanitize: true,
  });

  // Create observer to watch for content changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "characterData" || mutation.type === "childList") {
        const content = outputArea.textContent;
        if (content && content !== "Processing...") {
          try {
            outputArea.innerHTML = window.marked.parse(content);
          } catch (error) {
            console.error("Error rendering markdown:", error);
          }
        }
      }
    });
  });

  // Start observing
  observer.observe(outputArea, {
    childList: true,
    characterData: true,
    subtree: true,
  });
});

const HISTORY_RECORD = "summaries";
export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\b\w+\b/g) || [];
}

export function calculateTermFrequency(
  tokens: string[]
): Record<string, number> {
  return tokens.reduce((freq: Record<string, number>, word) => {
    freq[word] = (freq[word] || 0) + 1;
    return freq;
  }, {});
}

export async function bm25Search(query: string): Promise<any[]> {
  const k1 = 1.5;
  const b = 0.75;

  return new Promise((resolve) => {
    chrome.storage.local.get([HISTORY_RECORD], (data) => {
      const rdocuments = data[HISTORY_RECORD] || [];
      const queryTokens = tokenize(query);

      const documents = Object.values(rdocuments) as any[];
      console.log("documents", documents);

      // Calculate average document length
      const avgDocLength =
        documents.reduce(
          (sum: any, doc: { docLength: any }) => sum + doc.docLength,
          0
        ) / documents.length;

      // IDF calculation
      const docCount = documents.length;
      const idf = queryTokens.reduce(
        (idfScores: Record<string, number>, token) => {
          const docWithTerm = documents.filter(
            (doc: { termFrequency: any }) => token in doc.termFrequency
          ).length;
          idfScores[token] = Math.log(
            (docCount - docWithTerm + 0.5) / (docWithTerm + 0.5) + 1
          );
          return idfScores;
        },
        {}
      );

      // Score each document
      const results = documents.map(
        (doc: {
          termFrequency: { [x: string]: any };
          docLength: number;
          metadata: any;
          summary: any;
        }) => {
          const score = queryTokens.reduce((sum, token) => {
            if (!(token in doc.termFrequency)) return sum;

            const freq = doc.termFrequency[token];
            const numerator = freq * (k1 + 1);
            const denominator =
              freq + k1 * (1 - b + b * (doc.docLength / avgDocLength));
            return sum + idf[token] * (numerator / denominator);
          }, 0);

          return { url: doc.metadata.url, summary: doc.summary, score };
        }
      );

      // Sort by relevance score
      results.sort(
        (a: { score: number }, b: { score: number }) => b.score - a.score
      );
      resolve(results);
    });
  });
}

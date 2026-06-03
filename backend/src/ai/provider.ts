// Minimal AI provider adapter interface and placeholder for Ollama/Llama3
export interface AiResponse {
  text: string
  json?: any
}

export async function queryProvider(prompt: string): Promise<AiResponse> {
  // TODO: integrate Ollama / Llama3 providers here
  return { text: `Provider placeholder response for: ${prompt}` }
}

// File processing worker stub: extract text and compute a naive risk score
import fs from 'fs'

export async function extractTextFromFile(path: string): Promise<string> {
  // Minimal stub: read file as text. For PDFs/DOCs, integrate real extractors.
  try {
    const buf = await fs.promises.readFile(path, {encoding:'utf8'})
    return buf
  } catch (e) {
    return ''
  }
}

export function scoreTextRisk(text: string): number {
  const lower = text.toLowerCase()
  let score = 0
  if (lower.includes('password') || lower.includes('ssn')) score += 0.7
  if (text.length > 10000) score += 0.2
  return Math.min(1, score)
}

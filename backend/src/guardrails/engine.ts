// Simple guardrail engine example: runs a set of checks and returns action

export type GuardResult = {
  blocked: boolean
  reason?: string
}

export function runGuardrails(prompt: string): GuardResult {
  const lower = prompt.toLowerCase()
  const injections = ["ignore previous", "act as root", "system prompt", "bypass"]
  for (const inj of injections) {
    if (lower.includes(inj)) {
      return { blocked: true, reason: `Prompt injection detected: ${inj}` }
    }
  }
  return { blocked: false }
}

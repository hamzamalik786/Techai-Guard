# TechuAI Guard — Architecture

Overview of the AI processing flow:

User Input
  ↓
Intent Classifier
  ↓
Prompt Injection Detector
  ↓
Guardrail Engine
  ↓
JSON Validator
  ↓
LLM Provider
  ↓
Output Formatter
  ↓
Database Storage
  ↓
UI Response

See `backend/` for guardrail engine and `backend/ai` for provider adapters.

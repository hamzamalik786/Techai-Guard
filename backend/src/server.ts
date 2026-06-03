import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { runGuardrails } from './guardrails/engine'
import { queryProvider } from './ai/provider'
import { extractTextFromFile, scoreTextRisk } from './file_processor/index'
import { appendLog, readLogs } from './audit/logger'

dotenv.config()

const app = express()
app.use(bodyParser.json())
app.use(cors())

// Ensure uploads dir exists
const UPLOAD_DIR = path.join(process.cwd(), '..', '..', 'techuai_uploads')
try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }) } catch (e) {}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) { cb(null, UPLOAD_DIR) },
  filename: function (_req, file, cb) { cb(null, `${Date.now()}-${file.originalname}`) }
})
const upload = multer({ storage })

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

app.get('/health', (req, res) => res.json({ status: 'ok' }))

// Simple in-memory user "database" for scaffold purposes
const users: Record<string, { email: string; name?: string; id: string }> = {}

app.post('/api/auth/login', (req, res) => {
  const { email, name } = req.body || {}
  if (!email) return res.status(400).json({ error: 'email required' })
  const id = email
  users[id] = { email, name, id }
  const token = jwt.sign({ sub: id, email }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: users[id] })
})

app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'missing auth' })
  const parts = auth.split(' ')
  if (parts.length !== 2) return res.status(401).json({ error: 'invalid auth' })
  const token = parts[1]
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    const user = users[decoded.sub]
    if (!user) return res.status(404).json({ error: 'user not found' })
    return res.json({ user })
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' })
  }
})

app.post('/api/chat', async (req, res) => {
  const { input } = req.body || {}
  if (!input) return res.status(400).json({ error: 'input required' })

  // Run guardrails
  const guard = runGuardrails(input)
  if (guard.blocked) {
    appendLog({ ts: new Date().toISOString(), action: 'guard:block', level: 'warning', details: { reason: guard.reason, input: input } })
    return res.json({ status: 'blocked', reason: guard.reason, blocked: true })
  }

  // Query AI provider (stub)
  const ai = await queryProvider(input)

  const resp = {
    status: 'success',
    intent: 'unknown',
    confidence: 0.0,
    risk_level: 'low',
    summary: input ? input.substring(0, 60) : '',
    response: ai.text,
    suggestions: [],
  }
  res.json(resp)
})

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' })
  const filepath = req.file.path
  // Extract text and score
  const text = await extractTextFromFile(filepath)
  const score = scoreTextRisk(text)
  // Log upload
  appendLog({ ts: new Date().toISOString(), action: 'file:upload', level: 'info', details: { path: filepath, name: req.file.originalname, size: req.file.size, riskScore: score } })
  // Basic response
  res.json({ status: 'uploaded', path: filepath, name: req.file.originalname, size: req.file.size, text_snippet: text.substring(0, 500), riskScore: score })
})

app.get('/api/admin/logs', (_req, res) => {
  const logs = readLogs(200)
  res.json({ logs })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`TechuAI Backend listening on ${PORT}`))

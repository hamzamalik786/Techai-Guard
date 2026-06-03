import fs from 'fs'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), '..', '..', 'techuai_logs')
const LOG_FILE = path.join(LOG_DIR, 'audit.log')

try { fs.mkdirSync(LOG_DIR, { recursive: true }) } catch (e) {}

export type AuditEntry = {
  ts: string
  userId?: string | null
  action: string
  level: 'info' | 'warning' | 'error'
  details?: any
}

export function appendLog(entry: AuditEntry) {
  const line = JSON.stringify(entry)
  fs.appendFileSync(LOG_FILE, line + '\n', { encoding: 'utf8' })
}

export function readLogs(limit = 100): AuditEntry[] {
  try {
    const data = fs.readFileSync(LOG_FILE, 'utf8')
    const lines = data.trim().split('\n').filter(Boolean)
    const entries = lines.map(l => { try { return JSON.parse(l) } catch(e){ return null } }).filter(Boolean)
    return entries.slice(-limit).reverse()
  } catch (e) {
    return []
  }
}

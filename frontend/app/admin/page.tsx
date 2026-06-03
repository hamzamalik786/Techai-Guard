"use client"
import React, { useEffect, useState } from 'react'

type AuditEntry = {
  ts: string
  userId?: string
  action: string
  level: string
  details?: any
}

export default function AdminPage(){
  const [logs, setLogs] = useState<AuditEntry[]>([])

  useEffect(()=>{ fetchLogs() }, [])

  async function fetchLogs(){
    try {
      const res = await fetch('http://localhost:5000/api/admin/logs')
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (e) {
      setLogs([])
    }
  }

  return (
    <main style={{padding:20}}>
      <h2>Admin — Audit Logs</h2>
      <button onClick={fetchLogs}>Refresh</button>
      <div style={{marginTop:12}}>
        {logs.length === 0 && <div>No logs</div>}
        <ul>
          {logs.map((l, idx)=> (
            <li key={idx} style={{marginBottom:8}}>
              <strong>{l.ts}</strong> — <em>{l.level}</em> — {l.action}
              <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(l.details,null,2)}</pre>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

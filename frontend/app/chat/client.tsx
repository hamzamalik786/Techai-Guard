"use client"
import React, { useState } from 'react'

export default function ChatClient(){
  const [input, setInput] = useState('')
  const [resp, setResp] = useState<string | null>(null)

  async function send(e:any){
    e.preventDefault()
    const res = await fetch('/api/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({input})})
    const data = await res.json()
    setResp(JSON.stringify(data))
  }

  return (
    <div>
      <form onSubmit={send}>
        <input value={input} onChange={e=>setInput(e.target.value)} style={{width:'60%'}} />
        <button type="submit">Send</button>
      </form>
      <pre>{resp}</pre>
    </div>
  )
}

"use client"
import React, { useState } from 'react'

export default function UploadPage(){
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  async function submit(e:any){
    e.preventDefault()
    if (!file) return setMessage('Select a file')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('http://localhost:5000/api/upload', {method:'POST', body:fd})
    const data = await res.json()
    setMessage(JSON.stringify(data))
  }

  return (
    <main style={{padding:20}}>
      <h2>Upload File</h2>
      <form onSubmit={submit}>
        <input type="file" onChange={e=>setFile(e.target.files ? e.target.files[0] : null)} />
        <button type="submit">Upload</button>
      </form>
      <pre>{message}</pre>
    </main>
  )
}

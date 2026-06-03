"use client"
import React, { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function login(e:any){
    e.preventDefault()
    const res = await signIn('credentials', { redirect: false, email })
    if ((res as any)?.ok) setMessage('Signed in')
    else setMessage('Sign in failed')
  }

  return (
    <main style={{padding:20}}>
      <h2>Login</h2>
      <form onSubmit={login}>
        <label>Email</label><br/>
        <input value={email} onChange={e=>setEmail(e.target.value)} /><br/>
        <button type="submit">Sign in</button>
      </form>
      <div style={{marginTop:12}}>
        <div>{message}</div>
      </div>
    </main>
  )
}

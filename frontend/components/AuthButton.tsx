"use client"
import React from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function AuthButton(){
  const { data: session } = useSession()
  if (session) return <button onClick={() => signOut()}>Logout</button>
  return <a href="/login"><button>Login</button></a>
}

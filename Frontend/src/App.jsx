import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { SignInButton, SignOutButton, SignedOut, SignedIn, UserButton } from '@clerk/clerk-react'

function App() {

  return (
    <>
      <SignedOut>
        <h1>Welcome to app</h1>
        <SignInButton mode="modal">
          <button className='Sign up Please'></button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <UserButton />
    </>
  )
}

export default App


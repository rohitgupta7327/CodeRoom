import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { SignInButton, SignOutButton, SignedOut, SignedIn, UserButton } from '@clerk/clerk-react'

function App() {
  return (
    <div className="container">
      <h1 className="title">Welcome to CodeRoom</h1>

      <div className="auth-wrapper">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="auth-btn">Sign In / Register</button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="user-controls">
            <UserButton />
            <SignOutButton>
              <button className="auth-btn outline">Sign Out</button>
            </SignOutButton>
          </div>
        </SignedIn>
      </div>
    </div>
  )
}

export default App


import { useState } from 'react'
import './App.css'
import { SignInButton, SignOutButton, SignedOut, SignedIn, UserButton, useUser } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from "react-router";
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import DashboardPage from './pages/DashboardPage'
import ProblemsPage from './pages/ProblemsPage'
import ProblemPage from './pages/ProblemPage'
function App() {

  const { isSignedIn, isLoaded } = useUser();

  // this will get rid of blank screen during loading
  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />} />


        <Route path="/problems/:id" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
        <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />} />

      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  )
}

export default App


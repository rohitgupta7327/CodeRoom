import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from "react-router";
import { QueryClientProvider, QueryClient, } from "@tanstack/react-query";

// Prevent Monaco Editor internal cancellation errors from cluttering the console
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  if (
    reason === "Canceled" ||
    reason?.message === "Canceled" ||
    reason?.name === "Canceled"
  ) {
    event.preventDefault();
  }
});

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to Frontend/.env');
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <App />
        </ClerkProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)


import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add debug logging to see if entry point loads
console.log("Main entry point loading");

createRoot(document.getElementById("root")!).render(<App />);

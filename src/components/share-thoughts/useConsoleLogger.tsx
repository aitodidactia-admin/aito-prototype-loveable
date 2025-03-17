
import { useState, useEffect } from 'react';

export function useConsoleLogger() {
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      originalConsoleLog(...args);
      setConsoleOutput(prev => [...prev, args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')]);
    };
    
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  return consoleOutput;
}

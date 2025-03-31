
import { useState, useEffect } from 'react';

export function useConsoleLogger() {
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  useEffect(() => {
    // Only override console.log in development mode
    if (import.meta.env.DEV) {
      try {
        const originalConsoleLog = console.log;
        
        console.log = (...args) => {
          originalConsoleLog(...args);
          
          try {
            setConsoleOutput(prev => [
              ...prev, 
              args.map(arg => {
                if (arg === undefined) return 'undefined';
                if (arg === null) return 'null';
                try {
                  return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
                } catch (e) {
                  return '[Object cannot be stringified]';
                }
              }).join(' ')
            ]);
          } catch (error) {
            originalConsoleLog('Error in console logger:', error);
          }
        };
        
        return () => {
          console.log = originalConsoleLog;
        };
      } catch (error) {
        console.error('Failed to override console.log:', error);
      }
    }
    
    // In production, we don't track console logs
    return () => {};
  }, []);

  return consoleOutput;
}

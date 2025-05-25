import React from 'react';
import { useAppConfigStore } from './stores/useAppConfigStore';

// Simple component to test Zustand store
export function ZustandTest() {
  const { 
    theme, 
    language, 
    apiStage, 
    apiKey,
    setTheme,
    setLanguage,
    setApiStage,
    setApiKey
  } = useAppConfigStore();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Zustand Store Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Current State</h2>
        <pre>
          {JSON.stringify({ theme, language, apiStage, apiKey }, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Theme</h2>
        <button onClick={() => setTheme('light')}>Set Light</button>
        <button onClick={() => setTheme('dark')}>Set Dark</button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Language</h2>
        <button onClick={() => setLanguage('en')}>Set English</button>
        <button onClick={() => setLanguage('pl')}>Set Polish</button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>API Stage</h2>
        <button onClick={() => setApiStage('dev')}>Set Dev</button>
        <button onClick={() => setApiStage('stage')}>Set Stage</button>
        <button onClick={() => setApiStage('prod')}>Set Prod</button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>API Key</h2>
        <input 
          type="text" 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)} 
          placeholder="Enter API Key"
        />
      </div>
    </div>
  );
}

export default ZustandTest;

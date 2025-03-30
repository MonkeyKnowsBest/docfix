import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Create custom styles for our app
const style = document.createElement('style');
style.textContent = `
  /* Code block styling */
  pre {
    background-color: #f5f5f5;
    border-radius: 4px;
    padding: 1em;
    margin: 1em 0;
    overflow: auto;
    position: relative;
  }
  
  .code-block-label {
    background-color: #e0e0e0;
    padding: 0.5em;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    font-size: 0.9em;
    margin-top: 1em;
    margin-bottom: -1em;
  }
  
  /* Header styling */
  h2, h3, h4 {
    font-weight: normal;
  }
  
  /* Image caption styling */
  .caption {
    font-style: italic;
    color: #555;
    margin-top: 0.5em;
    margin-bottom: 1em;
  }
  
  /* Analysis panel styling */
  .analysis-panel {
    background-color: #f0f7ff;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  /* Improved document view */
  .document-view {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    height: 70vh;
    overflow: auto;
  }
  
  /* Toolbar styling */
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  /* Button styling */
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
  }
  
  .btn-primary {
    background-color: #3b82f6;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #2563eb;
  }
  
  .btn-secondary {
    background-color: #f3f4f6;
    color: #374151;
  }
  
  .btn-secondary:hover {
    background-color: #e5e7eb;
  }
`;

document.head.appendChild(style);

// Render the app
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

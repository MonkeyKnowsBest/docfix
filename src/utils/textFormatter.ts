// utils/textFormatter.ts

/**
 * Converts text to sentence case while preserving proper nouns
 * @param text The text to convert
 * @returns The text in sentence case
 */
export function toSentenceCase(text: string): string {
  if (!text) return text;
  
  // Split the text into sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  return sentences.map(sentence => {
    // Capitalize the first letter of the sentence
    if (sentence.length > 0) {
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
    }
    
    // List of words that are likely proper nouns
    const properNouns = findProperNouns(sentence);
    
    // Replace proper nouns with their original capitalization
    properNouns.forEach(noun => {
      // Use word boundaries to ensure we're replacing whole words
      const regex = new RegExp(`\\b${noun.toLowerCase()}\\b`, 'g');
      sentence = sentence.replace(regex, noun);
    });
    
    return sentence;
  }).join(' ');
}

/**
 * Attempts to identify proper nouns in a text
 * This is a simplified implementation and might not catch all proper nouns
 * Ideally, this would use NLP libraries like compromise or natural
 * @param text The text to analyze
 * @returns Array of identified proper nouns
 */
function findProperNouns(text: string): string[] {
  // This is a simplified approach - in a real implementation, 
  // you might want to use a more sophisticated NLP approach
  
  const words = text.split(/\s+/);
  const properNouns: string[] = [];
  
  // Common proper noun indicators
  const properNounIndicators = [
    // Days of the week
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    // Months
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
    // Common company indicators
    'Inc', 'Corp', 'LLC', 'Ltd', 'Co',
    // Technical terms that should remain capitalized
    'API', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
    'Node.js', 'Python', 'Java', 'C#', 'PHP', 'JSON', 'XML', 'UI', 'UX',
    // Common brand names
    'Google', 'Microsoft', 'Apple', 'Amazon', 'Facebook', 'Twitter', 'LinkedIn',
    'YouTube', 'GitHub', 'GitLab', 'Contentful', 'WordPress'
  ];
  
  for (const word of words) {
    // Skip short words or words that don't start with a capital letter
    if (word.length <= 1 || !/^[A-Z]/.test(word)) continue;
    
    // Check if the word is in our list of common proper nouns
    const cleanWord = word.replace(/[.,;:!?]$/, ''); // Remove trailing punctuation
    if (properNounIndicators.includes(cleanWord)) {
      properNouns.push(cleanWord);
      continue;
    }
    
    // Check if this might be a proper noun (capitalized in the middle of a sentence)
    // This is a simple heuristic and not foolproof
    if (word.charAt(0) === word.charAt(0).toUpperCase() && 
        word.charAt(0) !== word.charAt(0).toLowerCase()) {
      properNouns.push(cleanWord);
    }
  }
  
  return properNouns;
}

/**
 * Identifies the programming language in a code block based on content
 * @param code The code content to analyze
 * @returns The identified language or 'plain' if unknown
 */
export function identifyCodeLanguage(code: string): string {
  const normalizedCode = code.trim().toLowerCase();
  
  // Simple language detection based on keywords and syntax
  if (normalizedCode.includes('import react') || 
      normalizedCode.includes('react.component') || 
      normalizedCode.includes('const [') || 
      (normalizedCode.includes('jsx') && normalizedCode.includes('export default'))) {
    return 'jsx';
  }
  
  if (normalizedCode.includes('func ') && normalizedCode.includes('package main')) {
    return 'go';
  }
  
  if (normalizedCode.includes('def ') && 
      (normalizedCode.includes('import ') || normalizedCode.includes('print('))) {
    return 'python';
  }
  
  if ((normalizedCode.includes('function ') || normalizedCode.includes('=>')) && 
      (normalizedCode.includes('const ') || normalizedCode.includes('let '))) {
    return 'javascript';
  }
  
  if (normalizedCode.includes('interface ') || 
      normalizedCode.includes('class ') && normalizedCode.includes(':')) {
    return 'typescript';
  }
  
  if (normalizedCode.includes('public class ') || 
      normalizedCode.includes('private ') || 
      normalizedCode.includes('protected ')) {
    return 'java';
  }
  
  if (normalizedCode.includes('#include <') || 
      normalizedCode.includes('int main(')) {
    return 'c';
  }
  
  if (normalizedCode.includes('using namespace') || 
      normalizedCode.includes('std::')) {
    return 'cpp';
  }
  
  if (normalizedCode.includes('<?php')) {
    return 'php';
  }
  
  if (normalizedCode.includes('<html') || 
      normalizedCode.includes('<!doctype html')) {
    return 'html';
  }
  
  if (normalizedCode.includes('@media') || 
      normalizedCode.includes('{') && 
      normalizedCode.includes(':') && 
      normalizedCode.includes(';')) {
    return 'css';
  }
  
  // Default to plain text if no language is identified
  return 'plain';
}

// src/utils/types.ts

/**
 * Document content with original and formatted versions
 */
export interface DocumentContent {
  original: {
    html: string;
    text: string;
  };
  formatted: {
    html: string;
    text: string;
  };
  fileName: string;
}

/**
 * Analysis of document structure and potential issues
 */
export interface DocumentAnalysis {
  headerCounts: {
    h1: number;  // H1s converted to H2
    h2: number;  // Standard H2s
    h3: number;  // Standard H3s
    h4: number;  // Standard H4s
    h5Plus: number;  // H5+ converted to H4
  };
  imagesWithoutLinks: number;
  totalImages: number;
  codeBlocks: number;
  potentialIssues: string[];
}

/**
 * Options for document formatting
 */
export interface FormattingOptions {
  // Text formatting
  standardizeQuotes: boolean;  // Convert fancy quotes to straight quotes
  fixSpacing: boolean;  // Fix spacing around punctuation
  
  // Structure formatting
  addParagraphMarkers: boolean;  // Add paragraph markers for Contentful
  removeExtraLineBreaks: boolean;  // Remove unnecessary line breaks
  
  // Special element formatting
  fixBulletLists: boolean;  // Fix bullet list formatting
  standardizeHeadings: boolean;  // Standardize header formatting
  
  // Advanced options
  preserveCodeBlocks: boolean;  // Preserve code block formatting
  addCaptionPrefix: boolean;  // Add "Fig:" prefix to image captions
}

/**
 * Document processing result with content and analysis
 */
export interface ProcessingResult {
  content: DocumentContent;
  analysis: DocumentAnalysis;
}

// utils/docxConverter.ts
import mammoth from 'mammoth';

/**
 * Convert HTML back to DOCX format
 * Note: This is a placeholder implementation. In a production environment,
 * you would use a more robust solution like html-docx-js or a server-side
 * conversion using libraries like docx-wasm or python-docx.
 * 
 * @param html HTML content to convert
 * @param fileName Original filename for reference
 * @returns Promise resolving to a Blob containing the DOCX file
 */
export async function htmlToDocx(html: string, fileName: string): Promise<Blob> {
  // This is a placeholder implementation
  // In a real application, you would use a proper HTML to DOCX converter
  
  // For now, we're just creating a simple HTML file with styling
  const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${fileName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.5; }
        h2 { font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: normal; }
        h3 { font-size: 1.3em; margin-top: 1.3em; margin-bottom: 0.5em; font-weight: normal; }
        h4 { font-size: 1.1em; margin-top: 1.1em; margin-bottom: 0.5em; font-weight: normal; }
        pre { background-color: #f5f5f5; padding: 1em; border-radius: 4px; overflow: auto; }
        .code-block-label { background-color: #e0e0e0; padding: 0.5em; border-top-left-radius: 4px; border-top-right-radius: 4px; font-size: 0.9em; }
        img { max-width: 100%; }
      </style>
    </head>
    <body>
      ${html}
      <div style="text-align: center; margin-top: 2em; color: #888; font-size: 0.8em;">
        Processed with Document Formatter
      </div>
    </body>
    </html>
  `;
  
  // Return as a Blob
  return new Blob([styledHtml], { type: 'text/html' });
}

/**
 * Process a document with more advanced options, preserving DOCX format
 * This would be the ideal implementation when full rich text preservation is required
 * 
 * @param file The document file to process
 * @returns Promise resolving to processed DOCX as Blob and analysis
 */
export async function processDocxAdvanced(file: File) {
  // In a real implementation, this would:
  // 1. Use a library that directly manipulates DOCX format (like docx-wasm or server-side processing)
  // 2. Apply formatting rules while keeping the document in DOCX format
  // 3. Generate an analysis object
  // 4. Return both the processed DOCX and the analysis
  
  // For now, this is a placeholder to indicate the approach
  throw new Error('Advanced DOCX processing not yet implemented');
}

/**
 * Extract document structure for analysis
 * This extracts headers, images, and other elements for analysis without modifying the document
 * 
 * @param arrayBuffer Document file as ArrayBuffer
 * @returns Document structure information
 */
export async function extractDocumentStructure(arrayBuffer: ArrayBuffer) {
  try {
    // Convert to HTML for structure analysis
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;
    
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract headers
    const h1Count = doc.querySelectorAll('h1').length;
    const h2Count = doc.querySelectorAll('h2').length;
    const h3Count = doc.querySelectorAll('h3').length;
    const h4Count = doc.querySelectorAll('h4').length;
    const h5Count = doc.querySelectorAll('h5').length + doc.querySelectorAll('h6').length;
    
    // Extract images
    const images = doc.querySelectorAll('img');
    let imagesWithoutLinks = 0;
    
    images.forEach(img => {
      if (!img.closest('a')) {
        imagesWithoutLinks++;
      }
    });
    
    // Extract code blocks
    const codeBlocks = doc.querySelectorAll('pre, code').length;
    
    return {
      headerCounts: {
        h1: h1Count,
        h2: h2Count,
        h3: h3Count,
        h4: h4Count,
        h5Plus: h5Count
      },
      imageCount: images.length,
      imagesWithoutLinks,
      codeBlocks
    };
  } catch (err) {
    console.error('Error extracting document structure:', err);
    throw new Error('Failed to analyze document structure');
  }
}

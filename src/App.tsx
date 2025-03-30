import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, Download, BarChart } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import mammoth from 'mammoth';
import { toSentenceCase } from './utils/textFormatter';

// Types
interface DocumentContent {
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

interface DocumentAnalysis {
  headerCounts: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5Plus: number;
  };
  imagesWithoutLinks: number;
  totalImages: number;
  codeBlocks: number;
  potentialIssues: string[];
}

// Main App Component
function App() {
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);

  // Process the document
  const processDocument = async (file: File): Promise<{ content: DocumentContent; analysis: DocumentAnalysis }> => {
    try {
      // Read the document file
      const arrayBuffer = await file.arrayBuffer();
      
      // Use mammoth to convert docx to HTML
      const originalResult = await mammoth.convertToHtml({ 
        arrayBuffer,
        styleMap: [
          "p[style-name='Heading 1'] => h2.converted-h1",
          "p[style-name='Heading 5'] => h4.converted-h5",
          "p[style-name='Heading 6'] => h4.converted-h6"
        ]
      });
      
      const originalHtml = originalResult.value;
      const originalText = await mammoth.extractRawText({ arrayBuffer });
      
      // Create a DOM parser to manipulate the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(originalHtml, 'text/html');
      
      // Initialize analysis object
      const analysis: DocumentAnalysis = {
        headerCounts: {
          h1: 0,
          h2: 0,
          h3: 0,
          h4: 0,
          h5Plus: 0
        },
        imagesWithoutLinks: 0,
        totalImages: 0,
        codeBlocks: 0,
        potentialIssues: []
      };
      
      // Format headers (remove bold/italic, convert to sentence case)
      const processHeaders = (selector: string) => {
        const headers = doc.querySelectorAll(selector);
        headers.forEach(header => {
          // Count headers
          if (selector === 'h1' || header.classList.contains('converted-h1')) {
            analysis.headerCounts.h1++;
          } else if (selector === 'h2') {
            analysis.headerCounts.h2++;
          } else if (selector === 'h3') {
            analysis.headerCounts.h3++;
          } else if (selector === 'h4' || header.classList.contains('converted-h5') || header.classList.contains('converted-h6')) {
            analysis.headerCounts.h4++;
          } else {
            analysis.headerCounts.h5Plus++;
          }
          
          // Remove bold, italic, and other styling but keep the header tag
          const headerText = header.textContent || '';
          header.innerHTML = '';
          header.textContent = toSentenceCase(headerText);
        });
      };
      
      // Process all header levels
      processHeaders('h1, .converted-h1');
      processHeaders('h2');
      processHeaders('h3');
      processHeaders('h4, .converted-h5, .converted-h6');
      processHeaders('h5, h6');
      
      // Process images
      const images = doc.querySelectorAll('img');
      analysis.totalImages = images.length;
      
      images.forEach(img => {
        // Check if image is inside a link
        const parentAnchor = img.closest('a');
        if (!parentAnchor) {
          analysis.imagesWithoutLinks++;
        }
        
        // Find image caption (a paragraph that comes right after the image)
        let nextElement = img.parentElement?.nextElementSibling;
        if (nextElement && nextElement.tagName === 'P') {
          const captionText = nextElement.textContent || '';
          if (captionText && !captionText.startsWith('Fig:')) {
            // Add Fig: prefix to caption
            nextElement.textContent = 'Fig: ' + captionText.charAt(0).toUpperCase() + captionText.slice(1);
          }
        }
      });
      
      // Process code blocks
      const codeElements = doc.querySelectorAll('pre, code');
      analysis.codeBlocks = codeElements.length;
      
      // Title of the document (first h1 or h2)
      const title = doc.querySelector('h1, h2')?.textContent || file.name;
      
      // Add code block labels
      let codeBlockCount = 0;
      codeElements.forEach(codeEl => {
        if (codeEl.tagName === 'PRE') {
          codeBlockCount++;
          const codeLabel = document.createElement('div');
          codeLabel.className = 'code-block-label';
          codeLabel.textContent = `${title} Code Block ${codeBlockCount}`;
          codeEl.parentElement?.insertBefore(codeLabel, codeEl);
        }
      });
      
      // Generate potential issues
      if (analysis.headerCounts.h3 + analysis.headerCounts.h4 > analysis.headerCounts.h2 * 5) {
        analysis.potentialIssues.push('Navigation issue: Too many lower-level headers compared to H2 headers');
      }
      
      if (analysis.imagesWithoutLinks > 0) {
        analysis.potentialIssues.push(`${analysis.imagesWithoutLinks} embedded images without links`);
      }
      
      if (analysis.headerCounts.h1 > 0) {
        analysis.potentialIssues.push(`${analysis.headerCounts.h1} H1 elements were converted to H2`);
      }
      
      if (analysis.headerCounts.h5Plus > 0) {
        analysis.potentialIssues.push(`${analysis.headerCounts.h5Plus} H5+ elements were converted to H4`);
      }
      
      // Get the formatted HTML
      const formattedHtml = doc.documentElement.outerHTML;
      
      // Create the content object
      const content: DocumentContent = {
        original: {
          html: originalHtml,
          text: originalText.value
        },
        formatted: {
          html: formattedHtml,
          text: ''  // We'll extract this later if needed
        },
        fileName: file.name
      };
      
      return { content, analysis };
    } catch (err) {
      console.error('Error processing document:', err);
      throw new Error('Failed to process document. Ensure it\'s a valid Word document.');
    }
  };

  // Handle file drop
  const onDrop = async (acceptedFiles: File[]) => {
    // Reset previous errors
    setError(null);
    
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Only process docx files for now
    if (!file.name.endsWith('.docx')) {
      setError('Only Word documents (.docx) are supported currently');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await processDocument(file);
      setContent(result.content);
      setAnalysis(result.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const resetApp = () => {
    setContent(null);
    setAnalysis(null);
    setError(null);
    setShowAnalysis(false);
  };

  // Download the formatted document
  const downloadFormattedDoc = async () => {
    if (!content) return;
    
    // This is a placeholder. In a real implementation, you'd convert the HTML back to DOCX
    // using a library like html-docx-js or similar
    
    // For now, let's just provide the HTML for download
    const blob = new Blob([content.formatted.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.fileName.replace('.docx', '')}_formatted.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Document Formatter</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {!content ? (
            <div 
              {...getRootProps()} 
              className={`p-8 border-2 border-dashed rounded-lg ${
                isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} disabled={isProcessing} />
              <div className="text-center">
                {isProcessing ? (
                  <div>
                    <div className="mx-auto h-12 w-12 text-blue-500 animate-spin">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Processing document...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop your document here, or click to select
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Currently supports Word documents (.docx) only
                    </p>
                  </>
                )}
                {error && (
                  <div className="mt-2 flex items-center justify-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">{content.fileName}</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className="flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    <BarChart className="h-4 w-4 mr-1" />
                    {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                  </button>
                  <button 
                    onClick={downloadFormattedDoc}
                    className="flex items-center px-4 py-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                  <button 
                    onClick={resetApp}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                  >
                    Process another document
                  </button>
                </div>
              </div>
              
              {showAnalysis && analysis && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Document Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded shadow">
                      <h4 className="font-medium">Header Count</h4>
                      <ul className="mt-2 space-y-1">
                        <li className="text-sm">H1 → H2: {analysis.headerCounts.h1}</li>
                        <li className="text-sm">H2: {analysis.headerCounts.h2}</li>
                        <li className="text-sm">H3: {analysis.headerCounts.h3}</li>
                        <li className="text-sm">H4: {analysis.headerCounts.h4}</li>
                        <li className="text-sm">H5+ → H4: {analysis.headerCounts.h5Plus}</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-white rounded shadow">
                      <h4 className="font-medium">Images & Code</h4>
                      <ul className="mt-2 space-y-1">
                        <li className="text-sm">Total Images: {analysis.totalImages}</li>
                        <li className="text-sm">Images w/o Links: {analysis.imagesWithoutLinks}</li>
                        <li className="text-sm">Code Blocks: {analysis.codeBlocks}</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-white rounded shadow">
                      <h4 className="font-medium">Potential Issues</h4>
                      {analysis.potentialIssues.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {analysis.potentialIssues.map((issue, index) => (
                            <li key={index} className="text-sm text-orange-600">• {issue}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-green-600">No issues detected</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <h2 className="text-lg font-medium">Original</h2>
                  </div>
                  <div 
                    className="prose max-w-none overflow-auto max-h-[70vh]"
                    dangerouslySetInnerHTML={{ __html: content.original.html }}
                  />
                </div>
                <div className="border rounded p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-green-500 mr-2" />
                    <h2 className="text-lg font-medium">Formatted</h2>
                  </div>
                  <div 
                    className="prose max-w-none overflow-auto max-h-[70vh]"
                    dangerouslySetInnerHTML={{ __html: content.formatted.html }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

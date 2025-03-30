import React, { useState } from 'react';
import mammoth from 'mammoth';

// Components
import DropZone from './components/DropZone';
import DocumentAnalysis from './components/DocumentAnalysis';
import DocumentView from './components/DocumentView';
import Toolbar from './components/Toolbar';

// Utilities
import { toSentenceCase, identifyCodeLanguage } from './utils/textFormatter';
import { extractDocumentStructure, htmlToDocx } from './utils/docxConverter';

// Types
import { DocumentContent, DocumentAnalysis as AnalysisType, FormattingOptions } from './utils/types';

/**
 * Main application component
 */
function App() {
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptions>({
    standardizeQuotes: true,
    fixSpacing: true,
    addParagraphMarkers: true,
    removeExtraLineBreaks: true,
    fixBulletLists: true,
    standardizeHeadings: true,
    preserveCodeBlocks: true,
    addCaptionPrefix: true
  });

  /**
   * Process a document file according to our formatting rules
   */
  const processDocument = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setIsProcessing(false);
        return;
      }

      // Validate file type
      if (!file.name.endsWith('.docx')) {
        setError('Only Word documents (.docx) are currently supported');
        setIsProcessing(false);
        return;
      }
      
      // Read the file
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
      const analysis: AnalysisType = {
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
      
      // Process headers
      if (formattingOptions.standardizeHeadings) {
        const processHeaders = (selector: string, level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5Plus') => {
          const headers = doc.querySelectorAll(selector);
          headers.forEach(header => {
            // Count headers
            analysis.headerCounts[level]++;
            
            // Remove bold, italic, and other styling but keep the header tag
            const headerText = header.textContent || '';
            
            // Remove all child nodes (which might have formatting) and set plain text content
            header.innerHTML = '';
            
            // Convert to sentence case if it's not already
            header.textContent = toSentenceCase(headerText);
          });
        };
        
        processHeaders('h1, .converted-h1', 'h1');
        processHeaders('h2', 'h2');
        processHeaders('h3', 'h3');
        processHeaders('h4, .converted-h5, .converted-h6', 'h4');
        processHeaders('h5, h6', 'h5Plus');
      }
      
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
        if (formattingOptions.addCaptionPrefix) {
          let nextElement = img.parentElement?.nextElementSibling;
          if (nextElement && nextElement.tagName === 'P') {
            const captionText = nextElement.textContent || '';
            if (captionText && !captionText.startsWith('Fig:')) {
              // Add Fig: prefix to caption
              nextElement.textContent = 'Fig: ' + captionText.charAt(0).toUpperCase() + captionText.slice(1);
            }
          }
        }
      });
      
      // Process code blocks
      const codeElements = doc.querySelectorAll('pre, code');
      analysis.codeBlocks = codeElements.length;
      
      // Get the document title (first h1 or h2)
      const title = doc.querySelector('h1, h2')?.textContent || file.name.replace('.docx', '');
      
      // Add code block labels
      if (formattingOptions.preserveCodeBlocks) {
        let codeBlockCount = 0;
        codeElements.forEach(codeEl => {
          if (codeEl.tagName === 'PRE') {
            codeBlockCount++;
            
            // Try to identify the language
            const codeContent = codeEl.textContent || '';
            const language = identifyCodeLanguage(codeContent);
            
            // Create a label div
            const codeLabel = document.createElement('div');
            codeLabel.className = 'code-block-label';
            codeLabel.textContent = `${title} Code Block ${codeBlockCount}`;
            
            // Add language indicator if available
            if (language !== 'plain') {
              codeLabel.textContent += ` (${language})`;
            }
            
            // Insert the label before the code block
            codeEl.parentElement?.insertBefore(codeLabel, codeEl);
            
            // Add a class to the code block for styling
            codeEl.classList.add('formatted-code-block');
          }
        });
      }
      
      // Generate potential issues
      if (analysis.headerCounts.h3 + analysis.headerCounts.h4 > analysis.headerCounts.h2 * 5) {
        analysis.potentialIssues.push('Navigation issue: Too many lower-level headers compared to H2 headers');
      }
      
      if (analysis.imagesWithoutLinks > 0) {
        analysis.potentialIssues.push(`${analysis.imagesWithoutLinks} embedded ${analysis.imagesWithoutLinks === 1 ? 'image' : 'images'} without links`);
      }
      
      if (analysis.headerCounts.h1 > 0) {
        analysis.potentialIssues.push(`${analysis.headerCounts.h1} H1 ${analysis.headerCounts.h1 === 1 ? 'element' : 'elements'} converted to H2`);
      }
      
      if (analysis.headerCounts.h5Plus > 0) {
        analysis.potentialIssues.push(`${analysis.headerCounts.h5Plus} H5+ ${analysis.headerCounts.h5Plus === 1 ? 'element' : 'elements'} converted to H4`);
      }
      
      // Get the formatted HTML
      const formattedHtml = new XMLSerializer().serializeToString(doc);
      
      // Create the content object
      const contentObj: DocumentContent = {
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
      
      setContent(contentObj);
      setAnalysis(analysis);
      setShowAnalysis(true);
      
    } catch (err) {
      console.error('Error processing document:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileDrop = (file: File) => {
    processDocument(file);
  };

  const resetApp = () => {
    setContent(null);
    setAnalysis(null);
    setError(null);
    setShowAnalysis(false);
  };

  const downloadFormattedDoc = async () => {
    if (!content) return;
    
    try {
      const blob = await htmlToDocx(content.formatted.html, content.fileName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.fileName.replace('.docx', '')}_formatted.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download the formatted document');
    }
  };

  const copyToClipboard = () => {
    if (!content) return;
    
    try {
      navigator.clipboard.writeText(content.formatted.html)
        .then(() => {
          alert('Formatted document HTML copied to clipboard');
        })
        .catch((err) => {
          console.error('Failed to copy:', err);
          setError('Failed to copy to clipboard');
        });
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Document Formatter</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          {!content ? (
            <DropZone 
              onFileDrop={handleFileDrop}
              isProcessing={isProcessing}
              error={error}
            />
          ) : (
            <>
              <Toolbar 
                fileName={content.fileName}
                onDownload={downloadFormattedDoc}
                onShowAnalysis={() => setShowAnalysis(!showAnalysis)}
                onReset={resetApp}
                onCopyToClipboard={copyToClipboard}
                showAnalysis={showAnalysis}
              />
              
              {showAnalysis && analysis && (
                <DocumentAnalysis analysis={analysis} />
              )}
              
              <DocumentView 
                originalHtml={content.original.html}
                formattedHtml={content.formatted.html}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

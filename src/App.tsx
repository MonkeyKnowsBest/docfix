import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import mammoth from 'mammoth';

interface DocumentContent {
  original: string;
  formatted: string;
  fileName: string;
}

function App() {
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const processDocument = async (file: File): Promise<DocumentContent> => {
    // Read the file
    const arrayBuffer = await file.arrayBuffer();
    
    try {
      // Convert Word document to HTML using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const htmlContent = result.value;
      
      // Simple formatting: Add proper spacing after periods and clean up extra spaces
      // This is a basic example - you can add more sophisticated formatting rules
      const formatted = htmlContent
        .replace(/\.(?! |\n|<)/g, '. ') // Add space after periods if missing
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .trim();
      
      return {
        original: htmlContent,
        formatted,
        fileName: file.name
      };
    } catch (err) {
      console.error('Error processing document:', err);
      throw new Error('Failed to process document. Ensure it\'s a valid Word document.');
    }
  };

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
      const processedContent = await processDocument(file);
      setContent(processedContent);
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
    setError(null);
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
                <button 
                  onClick={resetApp}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Process another document
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <h2 className="text-lg font-medium">Original</h2>
                  </div>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: content.original }}
                  />
                </div>
                <div className="border rounded p-4">
                  <div className="flex items-center mb-2">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <h2 className="text-lg font-medium">Formatted</h2>
                  </div>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: content.formatted }}
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

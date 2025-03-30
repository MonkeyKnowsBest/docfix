import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface DocumentContent {
  original: string;
  formatted: string;
}

function App() {
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    if (acceptedFiles[0].size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // TODO: Implement file processing
    console.log('Processing file:', acceptedFiles[0].name);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.google-apps.document': ['.gdoc']
    },
    maxSize: 5 * 1024 * 1024
  });

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
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop your document here, or click to select
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Supports Word documents and Google Docs
                </p>
                {error && (
                  <div className="mt-2 flex items-center justify-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-6">
              <div className="border rounded p-4">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  <h2 className="text-lg font-medium">Original</h2>
                </div>
                <div className="prose max-w-none">{content.original}</div>
              </div>
              <div className="border rounded p-4">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  <h2 className="text-lg font-medium">Formatted</h2>
                </div>
                <div className="prose max-w-none">{content.formatted}</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
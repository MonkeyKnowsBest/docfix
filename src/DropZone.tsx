import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFileDrop: (file: File) => void;
  isProcessing: boolean;
  error: string | null;
}

/**
 * DropZone component for file uploads with drag-and-drop functionality
 */
const DropZone: React.FC<DropZoneProps> = ({ onFileDrop, isProcessing, error }) => {
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file.size > 5 * 1024 * 1024) {
      // We'll handle this error in the parent component
      return;
    }
    
    onFileDrop(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div 
      {...getRootProps()} 
      className={`p-8 border-2 border-dashed rounded-lg transition-colors ${
        isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
            <p className="mt-1 text-xs text-gray-500">
              Maximum file size: 5MB
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
  );
};

export default DropZone;

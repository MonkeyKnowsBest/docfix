import React from 'react';
import { FileText, Check } from 'lucide-react';

interface DocumentViewProps {
  originalHtml: string;
  formattedHtml: string;
}

/**
 * DocumentView component for displaying the original and formatted documents side by side
 */
const DocumentView: React.FC<DocumentViewProps> = ({ originalHtml, formattedHtml }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Original document */}
      <div className="border rounded p-4 document-view">
        <div className="flex items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
          <FileText className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-medium">Original</h2>
        </div>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: originalHtml }}
        />
      </div>
      
      {/* Formatted document */}
      <div className="border rounded p-4 document-view">
        <div className="flex items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="text-lg font-medium">Formatted</h2>
        </div>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: formattedHtml }}
        />
      </div>
    </div>
  );
};

export default DocumentView;

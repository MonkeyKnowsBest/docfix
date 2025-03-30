import React from 'react';
import { BarChart, Download, Copy, RefreshCcw } from 'lucide-react';

interface ToolbarProps {
  fileName: string;
  onDownload: () => void;
  onShowAnalysis: () => void;
  onReset: () => void;
  onCopyToClipboard: () => void;
  showAnalysis: boolean;
}

/**
 * Toolbar component with action buttons for the document formatter
 */
const Toolbar: React.FC<ToolbarProps> = ({ 
  fileName, 
  onDownload, 
  onShowAnalysis, 
  onReset, 
  onCopyToClipboard,
  showAnalysis 
}) => {
  return (
    <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
      <h2 className="text-lg font-medium text-gray-800 mr-auto">
        {fileName}
      </h2>
      
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={onShowAnalysis}
          className="btn btn-secondary"
          title={showAnalysis ? "Hide analysis" : "Show analysis"}
        >
          <BarChart className="h-4 w-4" />
          <span>{showAnalysis ? 'Hide Analysis' : 'Show Analysis'}</span>
        </button>
        
        <button 
          onClick={onCopyToClipboard}
          className="btn btn-secondary"
          title="Copy formatted content to clipboard"
        >
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </button>
        
        <button 
          onClick={onDownload}
          className="btn btn-primary"
          title="Download formatted document"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>
        
        <button 
          onClick={onReset}
          className="btn btn-secondary"
          title="Process another document"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>New Document</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;

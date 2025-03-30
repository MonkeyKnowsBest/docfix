import React from 'react';
import { BarChart2, AlertTriangle, FileText, Image } from 'lucide-react';

interface AnalysisProps {
  analysis: {
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
  };
}

/**
 * DocumentAnalysis component displays statistics and potential issues
 * from the document formatting process
 */
const DocumentAnalysis: React.FC<AnalysisProps> = ({ analysis }) => {
  // Calculate header ratio
  const lowerLevelHeaders = analysis.headerCounts.h3 + analysis.headerCounts.h4;
  const topLevelHeaders = analysis.headerCounts.h2;
  const headerRatio = topLevelHeaders ? lowerLevelHeaders / topLevelHeaders : 0;
  
  // Determine if there's a potential navigation issue
  const hasNavigationIssue = headerRatio > 5;
  
  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <BarChart2 className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-blue-800">Document Analysis</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Header statistics */}
        <div className="bg-white p-3 rounded shadow">
          <h4 className="font-medium flex items-center">
            <FileText className="h-4 w-4 mr-1 text-blue-500" />
            Headers
          </h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex justify-between">
              <span>H1 → H2:</span>
              <span className={analysis.headerCounts.h1 > 0 ? "text-orange-600 font-medium" : ""}>
                {analysis.headerCounts.h1}
              </span>
            </li>
            <li className="flex justify-between">
              <span>H2:</span>
              <span>{analysis.headerCounts.h2}</span>
            </li>
            <li className="flex justify-between">
              <span>H3:</span>
              <span>{analysis.headerCounts.h3}</span>
            </li>
            <li className="flex justify-between">
              <span>H4:</span>
              <span>{analysis.headerCounts.h4}</span>
            </li>
            <li className="flex justify-between">
              <span>H5+ → H4:</span>
              <span className={analysis.headerCounts.h5Plus > 0 ? "text-orange-600 font-medium" : ""}>
                {analysis.headerCounts.h5Plus}
              </span>
            </li>
          </ul>
          
          {/* Header ratio information */}
          {hasNavigationIssue && (
            <div className="mt-3 p-2 bg-yellow-50 text-yellow-800 text-xs rounded">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Too many lower-level headers may cause navigation issues
            </div>
          )}
        </div>
        
        {/* Image and code block statistics */}
        <div className="bg-white p-3 rounded shadow">
          <h4 className="font-medium flex items-center">
            <Image className="h-4 w-4 mr-1 text-blue-500" />
            Media & Code
          </h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex justify-between">
              <span>Total Images:</span>
              <span>{analysis.totalImages}</span>
            </li>
            <li className="flex justify-between">
              <span>Images w/o Links:</span>
              <span className={analysis.imagesWithoutLinks > 0 ? "text-orange-600 font-medium" : ""}>
                {analysis.imagesWithoutLinks}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Code Blocks:</span>
              <span>{analysis.codeBlocks}</span>
            </li>
          </ul>
          
          {/* Image warning */}
          {analysis.imagesWithoutLinks > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 text-yellow-800 text-xs rounded">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              {analysis.imagesWithoutLinks} {analysis.imagesWithoutLinks === 1 ? 'image needs' : 'images need'} GDrive links
            </div>
          )}
        </div>
        
        {/* Potential issues */}
        <div className="bg-white p-3 rounded shadow">
          <h4 className="font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-blue-500" />
            Issues
          </h4>
          
          {analysis.potentialIssues.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {analysis.potentialIssues.map((issue, index) => (
                <li key={index} className="text-sm text-orange-600 flex items-start">
                  <span className="mr-1 mt-0.5">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-green-600 flex items-center">
              <span className="mr-1">✓</span>
              No issues detected
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalysis;

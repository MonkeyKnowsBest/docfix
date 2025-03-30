# Document Formatter

A tool for formatting Word documents with specific rules for easier import into Contentful CMS.

## Features

- Process Word (.docx) documents
- Format headers according to specific rules:
  - Remove bold, italic, and other formatting from headers
  - Convert headers to sentence case while preserving proper nouns
  - Convert H1 to H2 and H5+ to H4
- Format images:
  - Add "Fig:" prefix to image captions
  - Identify images without links
- Format code blocks:
  - Add labels with document title and block number
  - Attempt to identify programming language
- Provide document analysis:
  - Count headers by level
  - Flag potential navigation issues
  - Count images without links
  - Identify other potential issues
- Side-by-side view of original and formatted content

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/document-formatter.git
   cd document-formatter
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Drag and drop a Word document (or click to select)
2. The application will process the document according to the formatting rules
3. View the original and formatted documents side by side
4. Use the analysis panel to identify potential issues
5. Download the formatted document or copy its HTML

## Technical Details

This application uses the following technologies:

- React and TypeScript for the frontend
- Vite as the build tool
- Mammoth.js for processing Word documents
- React Dropzone for file upload
- Tailwind CSS for styling

## Future Enhancements

- Google Docs integration via OAuth
- Server-side processing for larger documents
- Direct integration with Contentful API
- More sophisticated proper noun detection for sentence case conversion
- More advanced code block formatting
- Support for batch processing multiple documents
- Custom formatting rules configuration
- Improved DOCX output format that preserves all rich text formatting

## Formatting Rules

The application applies the following formatting rules:

1. **Headers**:
   - Only H2, H3, and H4 are allowed
   - H1 elements are converted to H2
   - H5+ elements are converted to H4
   - All headers must be in sentence case (while preserving proper nouns)
   - Headers must not have bold, italic, or other formatting

2. **Images**:
   - "Fig:" prefix is added to image captions
   - First letter after "Fig:" is capitalized
   - Images without links are identified in the analysis

3. **Code Blocks**:
   - Each code block is labeled with the document title and a sequential number
   - Programming language is identified when possible
   - Code blocks are placed in containers for easier copying

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

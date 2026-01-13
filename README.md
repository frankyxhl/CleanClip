# CleanClip

> Screenshot/Image → OCR → Smart Paste Chrome Extension

CleanClip is a Chrome extension that upgrades "screenshot copy" to "smart paste" using AI-powered OCR. Capture any image or screen area, extract text instantly, and paste it anywhere in the perfect format.

## Features

- **Right-click Image OCR**: Right-click any image on a webpage to extract text
- **Area Screenshot**: Press `Cmd+Shift+X` to select and capture any area of the visible tab
- **Smart Text Processing**: Configurable options to remove line breaks and merge spaces
- **Output Formats**: Choose between Plain Text or Markdown output
- **History Panel**: Access all your OCR results with copy and delete actions
- **Persistent Storage**: History is saved locally and persists across browser sessions

## Installation

### Prerequisites

- Node.js 18+ and npm installed
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Development Setup

```bash
# Clone the repository
git clone https://github.com/frankyxhl/CleanClip.git
cd CleanClip

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Gemini API key to .env file
# GEMINI_API_KEY=your_api_key_here
```

### Loading the Extension

1. Run `npm run dev` to start development mode
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `dist` folder from the project directory

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Usage

### Right-click Image OCR

1. Find any image on a webpage
2. Right-click the image
3. Select "CleanClip: Recognize Text" from the context menu
4. The extracted text is automatically copied to your clipboard

### Area Screenshot OCR

1. Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux)
2. Click and drag to select the area you want to capture
3. Release to capture and process
4. The extracted text is automatically copied to your clipboard

### Accessing History

1. Click the CleanClip extension icon in your browser toolbar
2. View all past OCR results with timestamps
3. Click "Copy" to copy any result to clipboard
4. Click "Delete" to remove a result from history

### Configuring Settings

1. Right-click the CleanClip extension icon
2. Select "Options"
3. Configure:
   - **API Key**: Your Gemini API key
   - **Output Format**: Plain Text or Markdown
   - **Remove Line Breaks**: Merge consecutive line breaks
   - **Merge Spaces**: Collapse multiple spaces into one

## API Key Configuration

You need a Google Gemini API key to use CleanClip:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key in CleanClip Options page
4. **Security Note**: For this prototype, keys are stored locally in your browser (unencrypted). Consider using a separate API key with usage limits.

## Tech Stack

- **Extension**: Chrome Manifest V3
- **Language**: TypeScript
- **Build**: Vite + CRXJS
- **OCR**: Google Gemini 3 Flash API
- **Testing**: Vitest (unit tests) + Playwright (E2E tests)
- **Package Manager**: npm

## Development

### Running Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e
```

### Project Structure

```
cleanclip/
├── src/
│   ├── background.ts       # Extension background service worker
│   ├── ocr.ts              # OCR service integration
│   ├── clipboard.ts        # Clipboard operations
│   ├── text-processing.ts  # Text cleaning utilities
│   ├── history.ts          # History storage management
│   ├── content/            # Content scripts
│   ├── popup/              # Extension popup UI
│   ├── options/            # Settings page UI
│   └── history-panel/      # History panel component
├── tests/                  # Test files
└── public/                 # Static assets
```

## Limitations (Prototype)

This is an MVP prototype with the following known limitations:

- **Area Screenshot**: Only works within the visible tab area (no cross-window/desktop capture)
- **Site-specific Paste**: Currently outputs generic formats; site-specific optimization (Gmail/Notion/Sheets) planned for future releases
- **OCR Accuracy**: Best results with clear, high-resolution images
- **Clipboard Write**: May require user interaction on some websites due to browser security policies

## Roadmap

Future enhancements planned:

- Site-specific smart paste (Gmail, Notion, Google Sheets, etc.)
- HTML and TSV output formats
- Desktop-level screenshot capture
- Team and enterprise features
- Chrome Web Store publishing

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built with:
- [Google Gemini API](https://ai.google.dev/) for OCR capabilities
- [CRXJS](https://crxjs.dev/) for Chrome Extension development
- [Vite](https://vitejs.dev/) for fast development experience

---

**CleanClip** - Upgrade your copy-paste workflow with AI.

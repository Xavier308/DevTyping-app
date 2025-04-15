# DevTyping

A lightweight application for developers to practice typing code snippets. Improve your coding speed and reinforce programming knowledge by typing snippets in Python, JavaScript, and more.

## Features

- Practice typing code snippets in multiple languages
- Dark/Light mode toggle
- Upload your own code snippets
- Real-time statistics (WPM and elapsed time)
- Visual feedback with engaging emojis

## Setup Instructions

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone this repository or download the files
2. Navigate to the project directory in your terminal
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and go to: `http://localhost:5173`

### Building for Production

To create a production build:
```bash
npm run build
```

The build files will be in the `dist` directory, which you can deploy to any static hosting service.

## How to Use

1. Select a programming language (Python or JavaScript)
2. Choose a code snippet from the dropdown or upload your own
3. Start typing in the input area
4. The app will show 3 lines at a time from the snippet
5. As you type, the view automatically advances to the next lines
6. When you complete the snippet, a celebration screen appears
7. Check your WPM (words per minute) to track your progress

## Uploading Custom Snippets

You can upload your own code snippets by clicking the "Upload" button. The app accepts:
- `.py` files for Python code
- `.js` files for JavaScript code
- `.txt` files for any language

## License

MIT
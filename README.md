# My Chrome Extension

## Overview
This project is a Chrome extension named "Hello Pika!" that provides a simple interface and functionality. It includes a background script, content script, and a popup UI.

## Project Structure
```
my-chrome-extension
├── src
│   ├── background.ts       # Background script for managing extension lifecycle
│   ├── content.ts         # Content script for interacting with web pages
│   ├── popup.ts           # Script for the popup UI
│   └── types
│       └── index.ts       # Type definitions for better type safety
├── public
│   ├── hello.html         # HTML for the popup interface
│   ├── hello_extensions.png # Icon for the extension
│   └── manifest.json      # Configuration file for the Chrome extension
├── package.json           # npm configuration file
├── tsconfig.json          # TypeScript configuration file
└── README.md              # Documentation for the project
```

## Getting Started

### Prerequisites
- Node.js and npm installed on your machine.

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd my-chrome-extension
   ```
3. Install the dependencies:
   ```
   npm install
   ```

### Building the Project
To compile the TypeScript files, run:
```
npm run build
```

### Loading the Extension
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" at the top right.
3. Click on "Load unpacked" and select the `public` directory of the project.

### Usage
Click on the extension icon in the Chrome toolbar to open the popup and interact with the extension.

## License
This project is licensed under the MIT License.
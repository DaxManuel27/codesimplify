# CodeSimplify - AI Code Explainer Chrome Extension

A Chrome extension that provides instant AI-powered explanations of code snippets on GitHub. Simply select code and get clear, detailed explanations to help you understand any programming language.

## Features

- **Instant Code Explanation**: Select any code on GitHub and get AI-powered explanations
- **Multiple Interaction Methods**: 
  - Right-click context menu
  - Floating button that appears when text is selected
- **Beautiful UI**: Modern, clean interface with typing animations
- **Privacy-Focused**: No data storage, all processing happens in real-time
- **GitHub Integration**: Works seamlessly on all GitHub pages

## How to Use

1. **Install the Extension**: Add CodeSimplify to Chrome from the Chrome Web Store
2. **Navigate to GitHub**: Go to any GitHub repository or code page
3. **Select Code**: Highlight the code you want explained
4. **Get Explanation**: 
   - Right-click and choose "Explain with CodeSimplify"
   - Or click the floating "✨ Explain Code" button that appears
5. **Read the Explanation**: View the detailed AI-generated explanation in the overlay

## Technical Details

- **Manifest Version**: 3 (MV3)
- **Permissions**: 
  - `contextMenus` - For right-click menu
  - `scripting` - For content script injection
  - `activeTab` - For accessing current tab
- **Content Script**: Runs on `https://github.com/*`
- **Backend**: Uses Google Gemini AI for code explanations

## Privacy

- No personal data is collected or stored
- Selected code is processed in real-time only
- All communications are encrypted with HTTPS
- No browsing history or analytics are tracked

## Development

### File Structure
```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for context menu
├── contentScript.js       # Main functionality
├── popup.html            # Extension popup UI
├── styles.css            # Additional styles
├── privacy-policy.html   # Privacy policy
├── README.md             # This file
└── icons/
    ├── icon-16.png       # 16x16 icon
    ├── icon-48.png       # 48x48 icon
    └── icon-128.png      # 128x128 icon
```

### Local Development

1. Clone the repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `extension` folder
5. The extension will be installed and ready for testing

### Building for Production

1. Ensure all console.log statements are removed
2. Update version number in `manifest.json`
3. Test thoroughly on different GitHub pages
4. Create a ZIP file of the extension folder
5. Submit to Chrome Web Store

## Version History

- **v1.0.0** - Initial release with core functionality

## Support

- **Website**: https://codesimplify.com
- **Support**: https://codesimplify.com/support
- **Privacy Policy**: https://codesimplify.com/privacy

## License

This project is proprietary software. All rights reserved. 
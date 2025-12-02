# Minimalist Productivity - Firefox Extension

A beautiful productivity dashboard that replaces your new tab page with a minimalist clock, task manager, and calendar.

## Features

- **Flip Clock**: Beautiful digital clock with timer mode
- **Task Management**: Add, complete, and organize tasks with categories
- **Calendar Widget**: View and add events
- **Background Customization**: Choose from 10 rotating backgrounds or upload your own
- **Dark/Light Theme**: Toggle between themes
- **Reminders**: Get notifications for upcoming tasks
- **Data Export/Import**: Backup and restore your data

## Installation on Ubuntu LTS

### Method 1: Temporary Installation (for testing)

1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on..."
5. Navigate to the `firefox-extension` folder
6. Select the `manifest.json` file

### Method 2: Permanent Installation (recommended)

1. **Package the extension:**
   \`\`\`bash
   cd firefox-extension
   zip -r minimalist-productivity.xpi *
   \`\`\`

2. **Install in Firefox:**
   - Open Firefox
   - Go to `about:addons`
   - Click the gear icon ⚙️
   - Select "Install Add-on From File..."
   - Choose the `minimalist-productivity.xpi` file

### Method 3: Using web-ext (for development)

1. **Install web-ext:**
   \`\`\`bash
   sudo npm install -g web-ext
   \`\`\`

2. **Run the extension:**
   \`\`\`bash
   cd firefox-extension
   web-ext run
   \`\`\`

3. **Build for distribution:**
   \`\`\`bash
   web-ext build
   \`\`\`

## Directory Structure

\`\`\`
firefox-extension/
├── manifest.json          # Extension manifest
├── newtab.html            # Main HTML file
├── css/
│   └── styles.css         # All styles
├── js/
│   ├── app.js             # Main application logic
│   ├── storage.js         # Browser storage utilities
│   └── background.js      # Background script for notifications
├── icons/                 # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   ├── icon-96.png
│   └── icon-128.png
├── backgrounds/           # Default background images
│   ├── bg1.jpeg
│   ├── bg2.jpeg
│   └── ...
└── README.md
\`\`\`

## Permissions

The extension requires the following permissions:

- **storage**: To save your tasks, events, and settings
- **notifications**: To send task reminders
- **alarms**: To schedule reminder checks

## Ubuntu-Specific Notes

### Firefox Snap Version

If you're using the Snap version of Firefox (default on Ubuntu 22.04+), temporary add-on installation works but add-ons won't persist between sessions. For permanent installation:

1. Use the `.xpi` installation method above, or
2. Consider using the native Firefox package:
   \`\`\`bash
   sudo snap remove firefox
   sudo add-apt-repository ppa:mozillateam/ppa
   sudo apt update
   sudo apt install firefox
   \`\`\`

### Troubleshooting

**Extension not loading:**
- Check `about:debugging` for any errors
- Ensure all files are in place
- Verify the manifest.json is valid JSON

**Notifications not working:**
- Check Firefox notification permissions in System Settings
- Allow Firefox in GNOME Settings → Notifications

**Background images not showing:**
- Verify image files exist in the `backgrounds/` folder
- Check browser console for any loading errors

## Development

### Building

\`\`\`bash
# Create a zip package
cd firefox-extension
zip -r ../minimalist-productivity.zip *

# Or use web-ext
web-ext build
\`\`\`

### Testing

\`\`\`bash
# Run with auto-reload
web-ext run --verbose
\`\`\`

## License

MIT License

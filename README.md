# Productivity Timer Desktop App

A Windows 11 desktop application for tracking time and managing tasks with color-coded priorities.

## Features

- **Time Tracking**: Animated clock with start, pause, and reset functionality
- **Task Management**: Add, complete, and delete tasks
- **Priority System**: Color-coded tasks based on priority and difficulty
- **Custom Background**: Set your own background image
- **Windows 11 Native**: Designed for Windows 11 with modern UI

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Run in development mode:
   \`\`\`
   npm run dev
   \`\`\`

### Building for Production

To build the application for Windows:

\`\`\`
npm run dist
\`\`\`

This will create an installer in the `dist` folder.

## Usage

- **Timer Controls**: Start, pause, and reset the timer
- **Adding Tasks**: Click the + button to add a new task
- **Task Priority**: Tasks are color-coded by priority (blue = medium, green = low, orange = high)
- **Task Difficulty**: Each task can be marked as Easy, Difficult, or Time Consuming
- **Background Image**: Click the upload button in the top right to set a custom background

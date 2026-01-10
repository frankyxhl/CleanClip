# CleanClip Demo GIF Guide

This document provides instructions for creating a demo GIF to showcase CleanClip's functionality.

## Demo GIF Tasks

The demo GIF should showcase the following features in order:

1. **Right-click Image OCR** (3-5 seconds)
   - Navigate to a webpage with images containing text
   - Right-click on an image
   - Select "CleanClip: Recognize Text"
   - Show toast notification "Copied!"

2. **Area Screenshot OCR** (5-7 seconds)
   - Press `Cmd+Shift+C` to activate screenshot mode
   - Click and drag to select an area containing text
   - Release to capture
   - Show toast notification "Copied!"

3. **History Panel** (4-6 seconds)
   - Click the extension icon to open popup
   - Show history with previous OCR results
   - Click "Copy" on a history item
   - Show toast notification

4. **Settings Configuration** (3-5 seconds)
   - Open Options page
   - Show API key configuration
   - Toggle between Plain Text and Markdown
   - Enable text processing options

## Recording Tools

### Recommended Tools

- **macOS**: Use built-in screen recording (Cmd+Shift+5) or [Kap](https://kap.co/)
- **Windows**: [OBS Studio](https://obsproject.com/) or [ScreenToGif](https://www.screentogif.com/)
- **Linux**: [SimpleScreenRecorder](https://www.maartenbaert.be/simplescreenrecorder/) or [Kazam](https://vokoscreen.github.io/)

### Recording Settings

- **Resolution**: 1280x720 (720p) or 1920x1080 (1080p)
- **Frame Rate**: 15-30 fps
- **Format**: MP4 or MOV (can convert to GIF later)
- **Duration**: Keep under 30 seconds total
- **Show Mouse Cursor**: Yes
- **Highlight Clicks**: Optional but recommended

### Converting to GIF

#### Using FFmpeg

```bash
# Install FFmpeg if not already installed
# macOS: brew install ffmpeg
# Windows: choco install ffmpeg
# Linux: sudo apt install ffmpeg

# Convert video to GIF
ffmpeg -i demo.mp4 -vf "fps=10,scale=720:-1:flags=lanczos" -c:v gif demo.gif

# Optimize GIF size (optional)
gifsicle -O3 --lossy=80 demo.gif -o demo-optimized.gif
```

#### Using Online Tools

- [Ezgif](https://ezgif.com/video-to-gif) - Video to GIF converter with optimization
- [GIPHY](https://giphy.com/upload) - Upload and host your GIF

## Demo Script

### Scene 1: Right-click Image OCR (0:00-0:05)
1. Navigate to a news article or blog post with featured image text
2. Right-click the image
3. Click "CleanClip: Recognize Text"
4. Toast appears: "Copied!"

### Scene 2: Area Screenshot OCR (0:05-0:12)
1. Navigate to a different page or scroll down
2. Press `Cmd+Shift+C`
3. Overlay appears, cursor changes to crosshair
4. Click and drag to select text area
5. Release mouse
6. Toast appears: "Copied!"

### Scene 3: History Panel (0:12-0:18)
1. Click CleanClip extension icon
2. Popup opens showing history
3. Hover over items to show copy/delete buttons
4. Click "Copy" on first item
5. Toast appears: "Copied!"

### Scene 4: Settings (0:18-0:25)
1. Right-click extension icon → Options
2. Show API key field (blur actual key)
3. Toggle "Output Format" to Markdown
4. Check "Remove line breaks" option
5. Show save confirmation

### Scene 5: End Card (0:25-0:30)
1. Show CleanClip logo or text
2. Display: "Get CleanClip - Smart Paste with AI"
3. Show GitHub URL or call-to-action

## Sample Pages for Demo

Good test pages with lots of text in images:

- News websites with article thumbnails
- Twitter/X screenshots
- PDF screenshots
- Infographics with text
- Meme templates with text overlays

## Current Status

**Status**: Demo GIF not yet created

To create the demo GIF:
1. Follow the recording instructions above
2. Save the GIF to `/public/demo.gif`
3. Add to README.md: `<img src="public/demo.gif" alt="CleanClip Demo" width="720">`

## Optimization Tips

- Keep file size under 5MB for GitHub README
- Use 10-15 fps for GIF (smoother isn't necessary)
- Limit to 720p width (height can scale)
- Use lossy compression if needed
- Crop to show only browser window (hide desktop clutter)

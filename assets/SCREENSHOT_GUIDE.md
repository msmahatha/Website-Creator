# 📸 Screenshot Guide for README

This guide helps you capture professional screenshots for the README file.

## 🎯 Required Screenshots

### 1. Main Application Interface
**File**: `main-interface.png`
**Steps**:
1. Open http://localhost:3000
2. Enter a website URL (e.g., "https://example.com")
3. Click "Inspect Page"
4. Wait for results to load
5. Take screenshot showing the full interface

### 2. AI Health Dashboard
**File**: `ai-dashboard.png`
**Steps**:
1. Open http://localhost:3000/ai-health
2. Let it run for a few minutes to gather data
3. Take screenshot showing health metrics

### 3. Self-Healing Demo
**File**: `self-healing-demo.gif`
**Steps**:
1. Start screen recording
2. Run: `node test-ai-healing.js`
3. Show the terminal output with healing events
4. Convert to GIF (max 5MB)

### 4. Architecture Diagram
**File**: `architecture-diagram.png`
- Use draw.io, Lucidchart, or similar
- Show the component relationships
- Export as high-quality PNG

### 5. Performance Chart
**File**: `performance-chart.png`
- Screenshot of monitoring dashboard
- Or create with Chart.js/D3.js
- Show response times, memory usage

## 📝 Quick Commands

```bash
# Start the application
node self-healing-server.js

# Test AI healing (for demo)
node test-ai-healing.js

# Check health endpoint
curl http://localhost:3000/health

# Open in browser
open http://localhost:3000
```

## 🎨 Design Guidelines

- **Consistent styling**: Use the same browser, window size
- **Clean background**: Hide desktop clutter
- **Sharp quality**: Use native resolution
- **Proper lighting**: Good contrast for readability
- **Professional appearance**: Clean, organized interface

## 📱 Browser Setup

1. Use Chrome or Firefox for consistency
2. Set window size to 1400x900 for screenshots
3. Zoom to 100% for crisp images
4. Hide bookmark bars and extensions if distracting
5. Use light theme for better visibility

## 🔧 Post-Processing

1. **Crop appropriately**: Remove unnecessary borders
2. **Compress images**: Use TinyPNG or similar (keep under 1MB each)
3. **Add annotations**: Use tools like Skitch or Annotate
4. **Consistent format**: All images should be PNG except GIFs
5. **Descriptive names**: Use clear, descriptive filenames

## 📂 File Organization

```
assets/
├── images/
│   ├── logo.png
│   ├── main-interface.png
│   ├── ai-dashboard.png
│   ├── self-healing-demo.gif
│   ├── architecture-diagram.png
│   ├── performance-chart.png
│   └── security-dashboard.png
└── README-IMAGES.md
```

## 🚀 Upload to GitHub

After capturing screenshots:
1. Add files to the `assets/images/` folder
2. Update README.md image paths to point to local files
3. Commit and push to GitHub
4. Verify images display correctly in the GitHub README

Example:
```markdown
![Main Interface](./assets/images/main-interface.png)
```

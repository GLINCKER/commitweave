# 🎨 CommitWeave Branding Guide

This guide explains how to set up CommitWeave branding assets for the project and VS Code extension.

## 📁 Required Assets

### **1. Main Logo** (`assets/logo.png`)
- **Size**: 512x512 pixels (PNG)
- **Usage**: Main README, documentation, website
- **Style**: High-resolution, transparent background preferred
- **Content**: CommitWeave logo with GLINR STUDIOS branding

### **2. Extension Icon** (`assets/icon.png`)
- **Size**: **Exactly 128x128 pixels** (PNG) ⚠️ **CRITICAL**
- **Usage**: VS Code marketplace extension icon
- **Requirements**:
  - Must be PNG (SVG not allowed by VS Code)
  - Square aspect ratio required
  - High contrast for dark/light themes
  - Clean, recognizable at small sizes

### **3. Small Icon** (`assets/icon-small.png`) *Optional*
- **Size**: 64x64 pixels (PNG)
- **Usage**: Documentation, inline references
- **Style**: Simplified version of main icon

## 🚀 Setup Process

### **Step 1: Add Your Images**
```bash
# Place your images in the assets directory:
assets/
├── logo.png      # 512x512 main logo
├── icon.png      # 128x128 extension icon
└── icon-small.png # 64x64 small version (optional)
```

### **Step 2: Run Branding Setup**
```bash
# Cross-platform automated setup script
npm run setup:branding
```

**This Node.js script will:**
- ✅ Validate image sizes (requires imagemagick)
- ✅ Copy extension icon to `vscode-extension/icon.png`
- ✅ Update `vscode-extension/package.json` with icon reference
- ✅ Add logo to main README.md
- ✅ Add icon to extension README.md
- ✅ Ensure VS Code compliance

### **Step 3: Verify Results**
```bash
# Check VS Code extension builds correctly
cd vscode-extension && npm run build

# Verify icon appears in package.json
grep "icon" vscode-extension/package.json
```

## 🔍 VS Code Marketplace Requirements

### **✅ Compliant:**
- PNG format only (no SVG)
- Exactly 128x128 pixels
- Professional, clean design
- No offensive/copyrighted content
- Square aspect ratio

### **❌ NOT Allowed:**
- SVG files for extension icon
- Incorrect dimensions (must be 128x128)
- Low resolution/pixelated images
- Copyrighted or trademark-infringing content

## 📋 Verification Checklist

- [ ] `assets/logo.png` exists (512x512 recommended)
- [ ] `assets/icon.png` exists (exactly 128x128)
- [ ] Images are PNG format
- [ ] Extension icon is crisp and recognizable
- [ ] `npm run setup:branding` completed successfully
- [ ] VS Code extension builds without errors
- [ ] Icon appears in `vscode-extension/package.json`
- [ ] README files updated with branding

## 🎯 Brand Guidelines

### **Colors** (GLINR STUDIOS palette):
- **Primary**: #8b008b (Dark Magenta)
- **Accent**: #e94057 (Red-Pink)
- **Success**: #00ff87 (Bright Green)
- **Text**: Clean, professional fonts

### **Style**:
- Professional, developer-focused
- Clean, modern design
- Consistent with GLINR STUDIOS brand identity
- Works well in both dark and light themes

## 🚨 Troubleshooting

### **"Icon size is incorrect"**
```bash
# Check current size
identify -format "%wx%h" assets/icon.png

# Should output: 128x128
```

### **"VS Code extension won't build"**
- Ensure icon.png is exactly 128x128
- Check file isn't corrupted
- Verify PNG format (not JPEG/SVG)

### **"Icon doesn't appear in marketplace"**
- Check `vscode-extension/package.json` has `"icon": "icon.png"`
- Verify `vscode-extension/icon.png` exists
- Rebuild extension: `npm run build`

## 📦 Publishing Impact

**With Proper Branding:**
- ✅ Professional appearance in VS Code marketplace
- ✅ Higher user trust and adoption
- ✅ Clear GLINR STUDIOS brand recognition
- ✅ Consistent visual identity across platforms

**Without Branding:**
- ❌ Generic appearance in marketplace
- ❌ Lower user confidence
- ❌ Missed branding opportunities
- ❌ Less professional presentation

---

**Ready to add your CommitWeave branding! 🧶✨**

Follow the steps above to set up professional branding for both the main project and VS Code extension.
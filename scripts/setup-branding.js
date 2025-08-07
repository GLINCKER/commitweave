#!/usr/bin/env node
/**
 * CommitWeave Branding Setup Script
 * Automatically sets up branding assets for the project and VS Code extension
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧶 CommitWeave Branding Setup');
console.log('==============================');

// Check if we're in the right directory
const rootDir = process.cwd();
const assetsDir = path.join(rootDir, 'assets');
const extensionDir = path.join(rootDir, 'vscode-extension');

// Validate required assets
const logoPath = path.join(assetsDir, 'logo.png');
const iconPath = path.join(assetsDir, 'icon.png');

if (!fs.existsSync(logoPath)) {
    console.log('❌ Missing assets/logo.png - Please add your main logo');
    process.exit(1);
}

if (!fs.existsSync(iconPath)) {
    console.log('❌ Missing assets/icon.png - Please add your 128x128 extension icon');
    process.exit(1);
}

console.log('✅ Found brand assets');

// Validate icon size (optional - requires imagemagick)
try {
    const identify = execSync(`identify -format "%wx%h" "${iconPath}"`, { encoding: 'utf8' }).trim();
    if (identify !== '128x128') {
        console.log(`⚠️  Warning: Extension icon should be 128x128, found: ${identify}`);
        console.log('   VS Code requires exactly 128x128 PNG for extension icons');
    } else {
        console.log(`✅ Extension icon size correct: ${identify}`);
    }
} catch (error) {
    console.log('ℹ️  Install imagemagick to validate icon size: brew install imagemagick');
}

// Copy icon to VS Code extension
console.log('📁 Copying icon to VS Code extension...');
const extensionIconPath = path.join(extensionDir, 'icon.png');
fs.copyFileSync(iconPath, extensionIconPath);

// Update VS Code package.json with icon reference
console.log('📝 Updating VS Code extension manifest...');
const extensionPackagePath = path.join(extensionDir, 'package.json');
const extensionPackage = JSON.parse(fs.readFileSync(extensionPackagePath, 'utf8'));

if (!extensionPackage.icon) {
    extensionPackage.icon = 'icon.png';
    fs.writeFileSync(extensionPackagePath, JSON.stringify(extensionPackage, null, 2) + '\n');
    console.log('✅ Added icon reference to package.json');
} else {
    console.log('ℹ️  Icon reference already exists in package.json');
}

// Update main README with logo
console.log('📚 Updating main README with branding...');
const readmePath = path.join(rootDir, 'README.md');
let readme = fs.readFileSync(readmePath, 'utf8');

if (!readme.includes('assets/logo.png')) {
    // Replace the branding comment with actual logo
    readme = readme.replace(
        '<!-- Branding will be added here by setup:branding script when assets/logo.png is available -->',
        '<div align="center">\n  <img src="assets/logo.png" alt="CommitWeave Logo" width="120" height="120">\n</div>'
    );
    fs.writeFileSync(readmePath, readme);
    console.log('✅ Added logo to main README');
} else {
    console.log('ℹ️  Logo already exists in main README');
}

// Update extension README
console.log('📄 Updating VS Code extension README...');
const extensionReadmePath = path.join(extensionDir, 'README.md');
let extensionReadme = fs.readFileSync(extensionReadmePath, 'utf8');

if (!extensionReadme.includes('assets/icon')) {
    // Replace the branding comment with actual icon
    extensionReadme = extensionReadme.replace(
        '<!-- Extension branding will be added here by setup:branding script -->',
        '<div align="center">\n  <img src="../assets/icon.png" alt="CommitWeave" width="64" height="64">\n</div>'
    );
    fs.writeFileSync(extensionReadmePath, extensionReadme);
    console.log('✅ Added icon to extension README');
} else {
    console.log('ℹ️  Icon already exists in extension README');
}

console.log('');
console.log('🎉 Branding setup complete!');
console.log('');
console.log('📋 Next steps:');
console.log('   1. Review updated README files');
console.log('   2. Test VS Code extension: cd vscode-extension && npm run build');
console.log('   3. Commit changes: git add assets/ && git commit -m "feat: add CommitWeave branding assets"');
console.log('');
console.log('🚀 Ready for marketplace with proper branding!');
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Don't clean dist directory as it already contains our temp build

// Copy and rename files for optimal npm package structure
const tempDir = 'dist/temp';

if (fs.existsSync(tempDir)) {
  // Copy and fix main library files
  let indexContent = fs.readFileSync(`${tempDir}/src/index.js`, 'utf8');
  
  // Fix require paths to point to lib directory
  indexContent = indexContent.replace(/require\("\.\/([^"]+)"/g, 'require("./lib/$1"');
  
  fs.writeFileSync('dist/index.js', indexContent);
  copyFileSync(`${tempDir}/src/index.js.map`, 'dist/index.js.map');
  
  // Create corrected TypeScript declarations
  createMainDeclarations();

  // Create ESM version by copying and adjusting the CJS version
  let esmContent = fs.readFileSync(`${tempDir}/src/index.js`, 'utf8');
  
  // Convert require calls to import statements would need more sophisticated logic
  // For now, we'll create a simple ESM wrapper
  const esmWrapper = `
// ESM wrapper for commitweave
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cjsModule = require('./index.js');
export default cjsModule;
export * from './index.js';
`;
  
  fs.writeFileSync('dist/index.mjs', esmWrapper);
  
  // Copy CLI binary
  copyFileSync(`${tempDir}/bin/index.cjs.js`, 'dist/bin.js');
  
  // Make binary executable
  fs.chmodSync('dist/bin.js', '755');
  
  // Copy all other source files maintaining structure for internal imports
  copyDirectoryRecursive(`${tempDir}/src`, 'dist/lib');
  
  // Clean up temp directory
  fs.rmSync(tempDir, { recursive: true });
  
  console.log('✅ Distribution prepared successfully');
  console.log('📦 Package structure:');
  console.log('  dist/index.js     - Main CommonJS entry');
  console.log('  dist/index.mjs    - ESM entry');
  console.log('  dist/index.d.ts   - TypeScript definitions');
  console.log('  dist/bin.js       - CLI executable');
  console.log('  dist/lib/         - Internal modules');
} else {
  console.error('❌ Build output not found. Run npm run build:lib first.');
  process.exit(1);
}

function copyFileSync(src, dest) {
  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  } else {
    console.warn(`⚠️  Source file not found: ${src}`);
  }
}

function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src);
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createMainDeclarations() {
  const indexDtsContent = `// Main library exports
export * from './lib/core/commitBuilder';
export * from './lib/utils/git';
export * from './lib/utils/ai';
export * from './lib/types/index';

// Re-export specific items from config to avoid conflicts
export { 
  defaultCommitTypes, 
  defaultConfig, 
  getCommitTypeByAlias 
} from './lib/config/defaultConfig';
`;
  
  fs.writeFileSync('dist/index.d.ts', indexDtsContent);
}
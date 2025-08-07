#!/usr/bin/env tsx

/**
 * Version bump script for CommitWeave
 * 
 * This script:
 * 1. Updates package.json version
 * 2. Updates VS Code extension version
 * 3. Updates CHANGELOG.md with new version
 * 4. Creates git tag
 * 5. Optionally pushes tag to trigger release
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✅ ${message}`, colors.green);
}

function error(message: string) {
  log(`❌ ${message}`, colors.red);
  process.exit(1);
}

function warning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

interface BumpOptions {
  type: 'major' | 'minor' | 'patch' | 'premajor' | 'preminor' | 'prepatch' | 'prerelease';
  preid?: string;
  push?: boolean;
  dryRun?: boolean;
  changelog?: string;
}

function parseVersion(version: string): { major: number; minor: number; patch: number; prerelease?: string } {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4]
  };
}

function bumpVersion(currentVersion: string, bumpType: BumpOptions['type'], preid = 'beta'): string {
  const parsed = parseVersion(currentVersion);
  
  switch (bumpType) {
    case 'major':
      return `${parsed.major + 1}.0.0`;
    case 'minor':
      return `${parsed.major}.${parsed.minor + 1}.0`;
    case 'patch':
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    case 'premajor':
      return `${parsed.major + 1}.0.0-${preid}.0`;
    case 'preminor':
      return `${parsed.major}.${parsed.minor + 1}.0-${preid}.0`;
    case 'prepatch':
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}-${preid}.0`;
    case 'prerelease':
      if (parsed.prerelease) {
        const preMatch = parsed.prerelease.match(/^(.+)\.(\d+)$/);
        if (preMatch) {
          const preNum = parseInt(preMatch[2], 10);
          return `${parsed.major}.${parsed.minor}.${parsed.patch}-${preMatch[1]}.${preNum + 1}`;
        }
      }
      return `${parsed.major}.${parsed.minor}.${parsed.patch}-${preid}.0`;
    default:
      throw new Error(`Unknown bump type: ${bumpType}`);
  }
}

function updatePackageJson(newVersion: string, dryRun: boolean): void {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const oldVersion = packageJson.version;
  
  if (dryRun) {
    info(`Would update package.json: ${oldVersion} → ${newVersion}`);
    return;
  }
  
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  success(`Updated package.json: ${oldVersion} → ${newVersion}`);
}

function updateVSCodeExtension(newVersion: string, dryRun: boolean): void {
  const extensionPath = path.join(process.cwd(), 'vscode-extension', 'package.json');
  
  if (!fs.existsSync(extensionPath)) {
    warning('VS Code extension package.json not found, skipping');
    return;
  }
  
  const extensionJson = JSON.parse(fs.readFileSync(extensionPath, 'utf8'));
  const oldVersion = extensionJson.version;
  
  if (dryRun) {
    info(`Would update VS Code extension: ${oldVersion} → ${newVersion}`);
    return;
  }
  
  extensionJson.version = newVersion;
  fs.writeFileSync(extensionPath, JSON.stringify(extensionJson, null, 2) + '\n');
  success(`Updated VS Code extension: ${oldVersion} → ${newVersion}`);
}

function updateChangelog(newVersion: string, changelogText: string | undefined, dryRun: boolean): void {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  
  if (!fs.existsSync(changelogPath)) {
    warning('CHANGELOG.md not found, skipping');
    return;
  }
  
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  
  let newEntry = `\n## [${newVersion}] - ${today}\n`;
  
  if (changelogText) {
    newEntry += `\n${changelogText}\n`;
  } else {
    // Generate basic changelog entry
    if (newVersion.includes('beta') || newVersion.includes('alpha')) {
      newEntry += '\n### Changed\n- Pre-release version with ongoing development\n';
    } else {
      newEntry += '\n### Added\n- New features and improvements\n\n### Fixed\n- Bug fixes and stability improvements\n';
    }
  }
  
  // Insert after ## [Unreleased]
  const updatedChangelog = changelog.replace(
    /^(## \[Unreleased\])$/m,
    `$1${newEntry}`
  );
  
  if (dryRun) {
    info(`Would add changelog entry for version ${newVersion}`);
    return;
  }
  
  fs.writeFileSync(changelogPath, updatedChangelog);
  success(`Updated CHANGELOG.md with version ${newVersion}`);
}

function createGitTag(newVersion: string, dryRun: boolean, push: boolean): void {
  const tagName = `v${newVersion}`;
  
  try {
    // Check if tag already exists
    execSync(`git rev-parse ${tagName}`, { stdio: 'pipe' });
    error(`Tag ${tagName} already exists`);
  } catch {
    // Tag doesn't exist, continue
  }
  
  if (dryRun) {
    info(`Would create git tag: ${tagName}`);
    if (push) {
      info(`Would push tag: ${tagName}`);
    }
    return;
  }
  
  // Commit changes first
  try {
    execSync('git add package.json vscode-extension/package.json CHANGELOG.md', { stdio: 'pipe' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'pipe' });
    success(`Committed version bump changes`);
  } catch (error: any) {
    warning('No changes to commit (files may already be up to date)');
  }
  
  // Create tag
  execSync(`git tag -a ${tagName} -m "Release ${newVersion}"`);
  success(`Created git tag: ${tagName}`);
  
  if (push) {
    execSync(`git push origin ${tagName}`);
    execSync('git push origin main');
    success(`Pushed tag and changes to remote`);
    info('🚀 Release pipeline should start automatically!');
  } else {
    info(`To trigger release, run: git push origin ${tagName}`);
  }
}

function showUsage(): void {
  console.log(`
${colors.bright}🧶 CommitWeave Version Bump Tool${colors.reset}
`);
  console.log('Usage: tsx scripts/bump-version.ts <type> [options]\n');
  console.log('Bump Types:');
  console.log('  major      1.0.0 → 2.0.0');
  console.log('  minor      1.0.0 → 1.1.0');
  console.log('  patch      1.0.0 → 1.0.1');
  console.log('  premajor   1.0.0 → 2.0.0-beta.0');
  console.log('  preminor   1.0.0 → 1.1.0-beta.0');
  console.log('  prepatch   1.0.0 → 1.0.1-beta.0');
  console.log('  prerelease 1.0.0-beta.0 → 1.0.0-beta.1\n');
  console.log('Options:');
  console.log('  --preid <id>     Set prerelease identifier (default: beta)');
  console.log('  --push           Push tag after creating (triggers release)');
  console.log('  --dry-run        Show what would be done without making changes');
  console.log('  --changelog <text>  Custom changelog entry\n');
  console.log('Examples:');
  console.log('  tsx scripts/bump-version.ts patch');
  console.log('  tsx scripts/bump-version.ts prerelease --push');
  console.log('  tsx scripts/bump-version.ts minor --changelog "Added new AI features"');
  console.log('  tsx scripts/bump-version.ts major --dry-run\n');
}

function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }
  
  const bumpType = args[0] as BumpOptions['type'];
  const validBumpTypes = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'];
  
  if (!validBumpTypes.includes(bumpType)) {
    error(`Invalid bump type: ${bumpType}. Valid types: ${validBumpTypes.join(', ')}`);
  }
  
  // Parse options
  const options: BumpOptions = { type: bumpType };
  
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--preid':
        options.preid = args[++i];
        break;
      case '--push':
        options.push = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--changelog':
        options.changelog = args[++i];
        break;
      default:
        error(`Unknown option: ${args[i]}`);
    }
  }
  
  // Check git status
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status && !options.dryRun) {
      error('Working directory is not clean. Please commit or stash your changes.');
    }
  } catch {
    error('Not in a git repository');
  }
  
  // Get current version
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentVersion = packageJson.version;
  const newVersion = bumpVersion(currentVersion, bumpType, options.preid);
  
  log(`\n${colors.bright}🧶 CommitWeave Version Bump${colors.reset}\n`);
  log(`Current version: ${colors.cyan}${currentVersion}${colors.reset}`);
  log(`New version:     ${colors.green}${newVersion}${colors.reset}`);
  log(`Bump type:       ${colors.yellow}${bumpType}${colors.reset}`);
  
  if (options.dryRun) {
    log(`Mode:            ${colors.magenta}DRY RUN${colors.reset}\n`);
  } else {
    log('');
  }
  
  // Update files
  updatePackageJson(newVersion, options.dryRun || false);
  updateVSCodeExtension(newVersion, options.dryRun || false);
  updateChangelog(newVersion, options.changelog, options.dryRun || false);
  
  if (!options.dryRun) {
    createGitTag(newVersion, false, options.push || false);
  }
  
  log(`\n${colors.bright}🎉 Version bump complete!${colors.reset}`);
  
  if (options.dryRun) {
    info('Run without --dry-run to apply changes');
  } else if (!options.push) {
    info(`Run 'git push origin v${newVersion}' to trigger release`);
  }
}

if (require.main === module) {
  main();
}
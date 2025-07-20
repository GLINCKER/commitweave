import chalk from 'chalk';

export const BANNER = `
 ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗████████╗██╗    ██╗███████╗ █████╗ ██╗   ██╗███████╗
██╔════╝██╔═══██╗████╗ ████║████╗ ████║██║╚══██╔══╝██║    ██║██╔════╝██╔══██╗██║   ██║██╔════╝
██║     ██║   ██║██╔████╔██║██╔████╔██║██║   ██║   ██║ █╗ ██║█████╗  ███████║██║   ██║█████╗  
██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║   ██║   ██║███╗██║██╔══╝  ██╔══██║╚██╗ ██╔╝██╔══╝  
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║   ██║   ╚███╔███╔╝███████╗██║  ██║ ╚████╔╝ ███████╗
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝   ╚═╝    ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝
`;

export const COMPACT_BANNER = `
 ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗████████╗██╗    ██╗███████╗ █████╗ ██╗   ██╗███████╗
██╔════╝██╔═══██╗████╗ ████║████╗ ████║██║╚══██╔══╝██║ █╗ ██║██╔════╝██╔══██╗██║   ██║██╔════╝
██║     ██║   ██║██╔████╔██║██╔████╔██║██║   ██║   ██║███╗██║█████╗  ███████║██║   ██║█████╗  
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║   ██║   ╚███╔███╔╝███████╗██║  ██║ ╚████╔╝ ███████╗
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝   ╚═╝    ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝
`;

export const MINI_BANNER = `
 ▄████▄   ▒█████   ███▄ ▄███▓ ███▄ ▄███▓ ██▓▄▄▄█████▓ █     █░▓█████ ▄▄▄    ██▒   █▓▓█████ 
▒██▀ ▀█  ▒██▒  ██▒▓██▒▀█▀ ██▒▓██▒▀█▀ ██▒▓██▒▓  ██▒ ▓▒▓█░ █ ░█░▓█   ▀▒████▄ ▓██░   █▒▓█   ▀ 
▒▓█    ▄ ▒██░  ██▒▓██    ▓██░▓██    ▓██░▒██▒▒ ▓██░ ▒░▒█░ █ ░█ ▒███  ▒██  ▀█▄▓██  █▒░▒███   
▒▓▓▄ ▄██▒▒██   ██░▒██    ▒██ ▒██    ▒██ ░██░░ ▓██▓ ░ ░█░ █ ░█ ▒▓█  ▄░██▄▄▄▄██▒██ █░░▒▓█  ▄ 
▒ ▓███▀ ░░ ████▓▒░▒██▒   ░██▒▒██▒   ░██▒░██░  ▒██▒ ░ ░░██▒██▓ ░▒████▒▓█   ▓██▒▒▀█░  ░▒████▒
░ ░▒ ▒  ░░ ▒░▒░▒░ ░ ▒░   ░  ░░ ▒░   ░  ░░▓    ▒ ░░   ░ ▓░▒ ▒  ░░ ▒░ ░▒▒   ▓▒█░░ ▐░  ░░ ▒░ ░
  ░  ▒     ░ ▒ ▒░ ░  ░      ░░  ░      ░ ▒ ░    ░      ▒ ░ ░   ░ ░  ░ ▒   ▒▒ ░░ ░░   ░ ░  ░
░        ░ ░ ░ ▒  ░      ░   ░      ░    ▒ ░  ░        ░   ░     ░    ░   ▒     ░░     ░   
░ ░          ░ ░         ░          ░    ░               ░       ░  ░     ░  ░   ░     ░  ░
░                                                                              ░            
`;

export const LOADING_FRAMES = [
  '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'
];

export const TAGLINES = [
  "🧶 Weaving beautiful commits, one thread at a time",
  "🎨 Crafting perfect commits with style and intelligence", 
  "⚡ Smart, structured, and stunning git commits",
  "🚀 Elevating your commit game to the next level",
  "💎 Where conventional meets exceptional",
  "🎯 Precision-crafted commits for modern developers"
];

export const BRAND_COLORS = {
  primary: '#8b008b',    // Dark magenta - main brand color
  accent: '#e94057',     // Red-pink - prompts and highlights
  success: '#00ff87',    // Bright green for success
  warning: '#ffb347',    // Orange for warnings
  error: '#ff6b6b',      // Red for errors
  muted: '#6c757d'       // Gray for muted text
};

export function getRandomTagline(): string {
  return TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
}

export function printBanner(compact: boolean = false): void {
  console.clear();
  
  if (compact) {
    console.log(chalk.hex(BRAND_COLORS.primary).bold(COMPACT_BANNER));
  } else {
    console.log(chalk.hex(BRAND_COLORS.primary).bold(BANNER));
  }
  
  console.log(chalk.hex(BRAND_COLORS.muted).italic(getRandomTagline()));
  console.log('');
  
  // Add branding footer
  console.log(chalk.hex(BRAND_COLORS.muted)('                            ') + 
              chalk.hex(BRAND_COLORS.accent).bold('Powered by GLINR STUDIOS') + 
              chalk.hex(BRAND_COLORS.muted)(' • ') + 
              chalk.hex(BRAND_COLORS.primary)('Published by @typeweaver'));
  console.log('');
}

export function printMiniBanner(): void {
  console.log(chalk.hex(BRAND_COLORS.primary).bold(MINI_BANNER));
  console.log(chalk.hex(BRAND_COLORS.muted).italic(getRandomTagline()));
  console.log(chalk.hex(BRAND_COLORS.muted)('Powered by ') + 
              chalk.hex(BRAND_COLORS.accent).bold('GLINR STUDIOS') + 
              chalk.hex(BRAND_COLORS.muted)(' • ') + 
              chalk.hex(BRAND_COLORS.primary)('@typeweaver'));
  console.log('');
}

export async function showLoadingAnimation(message: string, duration: number = 2000): Promise<void> {
  return new Promise((resolve) => {
    let frameIndex = 0;
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const frame = LOADING_FRAMES[frameIndex % LOADING_FRAMES.length];
       
      process.stdout.write(`\r${chalk.hex(BRAND_COLORS.accent)(frame)} ${chalk.hex(BRAND_COLORS.muted)(message)}...`);
      
      frameIndex++;
      
      if (elapsed >= duration) {
        clearInterval(interval);
        process.stdout.write(`\r${chalk.hex(BRAND_COLORS.success)('✓')} ${chalk.hex(BRAND_COLORS.muted)(message)} complete!\n`);
        resolve();
      }
    }, 80);
  });
}

export async function typeWriter(text: string, delay: number = 50): Promise<void> {
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(text[i]);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  console.log('');
}


export function printFeatureHighlight(): void {
  console.log(chalk.hex(BRAND_COLORS.accent)('✨ Features:'));
  console.log('   ' + chalk.hex(BRAND_COLORS.primary)('🎯') + ' ' + chalk.white('Conventional Commits'));
  console.log('   ' + chalk.hex(BRAND_COLORS.primary)('🤖') + ' ' + chalk.white('AI-Powered Suggestions')); 
  console.log('   ' + chalk.hex(BRAND_COLORS.primary)('🎨') + ' ' + chalk.white('Beautiful Emoji Support'));
  console.log('   ' + chalk.hex(BRAND_COLORS.primary)('⚡') + ' ' + chalk.white('Lightning Fast & Interactive'));
  console.log('   ' + chalk.hex(BRAND_COLORS.primary)('🔧') + ' ' + chalk.white('Highly Configurable'));
  console.log('');
}
/**
 * Central command-line flag parsing for CommitWeave
 * Handles performance flags and UI modes
 */

export interface ParsedFlags {
  plain: boolean;
  debugPerf: boolean;
  ai: boolean;
  init: boolean;
  check: boolean;
  help: boolean;
  version: boolean;
  export: boolean;
  import: boolean;
  list: boolean;
  reset: boolean;
  doctor: boolean;
  force: boolean;
  pretty: boolean;
  preview: boolean;
  output: string | undefined;
  _: string[];
}

/**
 * Parse command line arguments into structured flags
 * @param argv Command line arguments (default: process.argv.slice(2))
 * @returns Parsed flags object
 */
export function parseFlags(argv: string[] = process.argv.slice(2)): ParsedFlags {
  const flags: ParsedFlags = {
    plain: false,
    debugPerf: false,
    ai: false,
    init: false,
    check: false,
    help: false,
    version: false,
    export: false,
    import: false,
    list: false,
    reset: false,
    doctor: false,
    force: false,
    pretty: false,
    preview: false,
    output: undefined as string | undefined,
    _: []
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    switch (arg) {
      case '--plain':
        flags.plain = true;
        break;
      case '--debug-perf':
        flags.debugPerf = true;
        process.env.COMMITWEAVE_DEBUG_PERF = "1";
        break;
      case '--ai':
      case 'ai':
        flags.ai = true;
        break;
      case 'init':
      case 'setup':
        flags.init = true;
        break;
      case 'check':
      case 'validate':
      case 'v':
        flags.check = true;
        break;
      case '--help':
      case '-h':
        flags.help = true;
        break;
      case '--version':
      case '-v':
        flags.version = true;
        break;
      case 'export':
        flags.export = true;
        break;
      case 'import':
        flags.import = true;
        break;
      case 'list':
      case 'ls':
      case 'show':
        flags.list = true;
        break;
      case 'reset':
      case 'clear':
        flags.reset = true;
        break;
      case 'doctor':
      case 'health':
      case 'check-config':
        flags.doctor = true;
        break;
      case '--force':
        flags.force = true;
        break;
      case '--pretty':
        flags.pretty = true;
        break;
      case '--preview':
        flags.preview = true;
        break;
      case '--output':
      case '-o':
        i++; // Move to next argument
        if (i < argv.length) {
          flags.output = argv[i];
        }
        break;
      default:
        // Handle output flag with equals syntax
        if (arg.startsWith('--output=')) {
          flags.output = arg.split('=')[1];
        } else if (arg.startsWith('-o=')) {
          flags.output = arg.split('=')[1];
        } else {
          flags._.push(arg);
        }
        break;
    }

    i++;
  }

  return flags;
}

/**
 * Check if the current execution should use fancy UI
 * @param flags Parsed command flags
 * @param config Optional config object to check UI preferences
 * @returns True if fancy UI should be enabled
 */
export function shouldUseFancyUI(flags: ParsedFlags, config?: any): boolean {
  // Fancy UI disabled by --plain flag or if CLI_FANCY is explicitly disabled
  if (flags.plain || process.env.CLI_FANCY === "0") {
    return false;
  }

  // Check config for UI preferences
  if (config?.ui?.fancyUI === false) {
    return false;
  }

  // Enable fancy UI by default, unless explicitly disabled
  return process.env.CLI_FANCY !== "0";
}

/**
 * Check if this is an interactive mode (no direct commands)
 * @param flags Parsed command flags
 * @returns True if should run in interactive mode
 */
export function isInteractiveMode(flags: ParsedFlags): boolean {
  return !flags.ai && !flags.init && !flags.check && !flags.help && 
         !flags.version && !flags.export && !flags.import && 
         !flags.list && !flags.reset && !flags.doctor;
}

/**
 * Check if this is a configuration management command
 * @param flags Parsed command flags
 * @returns True if this is a config command
 */
export function isConfigCommand(flags: ParsedFlags): boolean {
  return flags.export || flags.import || flags.list || flags.reset || flags.doctor;
}
import { readFile, writeFile, access } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { ConfigSchema, type Config } from '../types/config.js';
import { defaultConfig } from '../config/defaultConfig.js';

// Configuration file paths
export const CONFIG_PATH = join(process.cwd(), 'glinr-commit.json');
export const GLOBAL_CONFIG_PATH = join(homedir(), '.commitweaverc');

/**
 * Load configuration from local project file or global user config
 * Priority: local glinr-commit.json > ~/.commitweaverc > defaults
 */
export async function load(): Promise<Config> {
  let config = { ...defaultConfig };

  try {
    // First try local project config
    let configPath = CONFIG_PATH;
    let configExists = false;

    try {
      await access(configPath);
      configExists = true;
    } catch {
      // Try global config
      configPath = GLOBAL_CONFIG_PATH;
      try {
        await access(configPath);
        configExists = true;
      } catch {
        // No config files found, create default local config
        await save(defaultConfig);
        return defaultConfig;
      }
    }

    if (configExists) {
      const configFile = await readFile(configPath, 'utf-8');
      const rawConfig = JSON.parse(configFile);

      // Validate and merge with defaults
      const parsedConfig = ConfigSchema.parse({
        ...defaultConfig,
        ...rawConfig
      });

      return parsedConfig;
    }
  } catch (error) {
    console.warn(
      `Warning: Failed to load config file, using defaults. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return config;
}

/**
 * Save configuration to local project file
 */
export async function save(config: Config): Promise<void> {
  try {
    // Validate config before saving
    const validatedConfig = ConfigSchema.parse(config);

    const configJson = JSON.stringify(validatedConfig, null, 2);
    await writeFile(CONFIG_PATH, configJson, 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Save configuration to global user config
 */
export async function saveGlobal(config: Config): Promise<void> {
  try {
    // Validate config before saving
    const validatedConfig = ConfigSchema.parse(config);

    const configJson = JSON.stringify(validatedConfig, null, 2);
    await writeFile(GLOBAL_CONFIG_PATH, configJson, 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to save global configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if local config file exists
 */
export async function hasLocalConfig(): Promise<boolean> {
  try {
    await access(CONFIG_PATH);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if global config file exists
 */
export async function hasGlobalConfig(): Promise<boolean> {
  try {
    await access(GLOBAL_CONFIG_PATH);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the active config file path being used
 */
export async function getActiveConfigPath(): Promise<string | null> {
  if (await hasLocalConfig()) {
    return CONFIG_PATH;
  }
  if (await hasGlobalConfig()) {
    return GLOBAL_CONFIG_PATH;
  }
  return null;
}

/**
 * Merge two configurations, with the second overriding the first
 */
export function mergeConfigs(base: Config, override: Partial<Config>): Config {
  return {
    ...base,
    ...override,
    // Special handling for nested objects
    commitTypes: override.commitTypes || base.commitTypes,
    ai: override.ai ? { ...base.ai, ...override.ai } : base.ai,
    claude: override.claude ? { ...base.claude, ...override.claude } : base.claude,
    hooks: override.hooks ? { ...base.hooks, ...override.hooks } : base.hooks
  };
}

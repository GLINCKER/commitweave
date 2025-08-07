/**
 * Commit message validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];

/**
 * Validate a commit message against conventional commit standards
 */
export function validateCommitMessage(message: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!message || message.trim().length === 0) {
    return {
      isValid: false,
      errors: ['Commit message cannot be empty'],
      warnings: []
    };
  }

  const lines = message.trim().split('\n');
  const firstLine = lines[0];

  // Check format: type(scope): subject
  const conventionalRegex = /^(?:(?:✨|🐛|📚|🎨|♻️|⚡|✅|📦|👷|🔧|⏪)\s)?([a-z]+)(?:\(([^)]+)\))?\s*:\s*(.+)$/;
  const match = firstLine.match(conventionalRegex);

  if (!match) {
    errors.push('Commit message must follow format: type(scope): subject or emoji type(scope): subject');
  } else {
    const [, type, , subject] = match;

    // Validate type
    if (!VALID_TYPES.includes(type)) {
      errors.push(`Invalid commit type: ${type}. Valid types: ${VALID_TYPES.join(', ')}`);
    }

    // Validate subject
    if (subject.length > 50) {
      warnings.push(`Subject line is ${subject.length} characters (recommended: ≤50)`);
    }

    if (subject.length > 72) {
      errors.push(`Subject line is too long (${subject.length} characters, max: 72)`);
    }

    if (subject.endsWith('.')) {
      warnings.push('Subject should not end with a period');
    }

    if (subject[0] !== subject[0].toLowerCase()) {
      warnings.push('Subject should start with lowercase');
    }

    if (subject.startsWith(' ') || subject.endsWith(' ')) {
      errors.push('Subject should not have leading or trailing spaces');
    }
  }

  // Check line length for body
  if (lines.length > 1) {
    // Skip empty line after subject
    const bodyStart = lines[1] === '' ? 2 : 1;
    
    if (lines[1] !== '' && lines.length > 1) {
      warnings.push('Add a blank line between subject and body');
    }

    for (let i = bodyStart; i < lines.length; i++) {
      if (lines[i].length > 72) {
        warnings.push(`Body line ${i + 1} is too long (${lines[i].length} characters, recommended: ≤72)`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format validation results for display
 */
export function formatValidationResults(result: ValidationResult): string {
  let output = '';

  if (result.isValid) {
    output += '✅ Commit message is valid!\n';
  } else {
    output += '❌ Commit message has issues:\n';
  }

  if (result.errors.length > 0) {
    output += '\n🚨 Errors:\n';
    result.errors.forEach(error => {
      output += `  - ${error}\n`;
    });
  }

  if (result.warnings.length > 0) {
    output += '\n⚠️ Warnings:\n';
    result.warnings.forEach(warning => {
      output += `  - ${warning}\n`;
    });
  }

  return output;
}

/**
 * Get suggestions for improving a commit message
 */
export function getCommitSuggestions(message: string): string[] {
  const suggestions: string[] = [];
  const result = validateCommitMessage(message);

  if (!result.isValid) {
    suggestions.push('Follow conventional commit format: type(scope): subject');
    suggestions.push(`Use valid types: ${VALID_TYPES.join(', ')}`);
  }

  if (message.length > 50) {
    suggestions.push('Keep the first line under 50 characters');
  }

  if (!message.includes(':')) {
    suggestions.push('Add a colon after the type/scope');
  }

  return suggestions;
}
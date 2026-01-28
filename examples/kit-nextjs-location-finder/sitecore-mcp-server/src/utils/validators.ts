/**
 * Input Validation Utilities for Sitecore MCP Server
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate required field
 */
export function validateRequired(
  value: any,
  fieldName: string
): void {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(
      `${fieldName} is required`,
      fieldName,
      value
    );
  }
}

/**
 * Validate string field
 */
export function validateString(
  value: any,
  fieldName: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  } = {}
): void {
  if (options.required) {
    validateRequired(value, fieldName);
  }

  if (value === undefined || value === null) {
    if (!options.required) return;
    throw new ValidationError(`${fieldName} must be a string`, fieldName, value);
  }

  if (typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName} must be a string, got ${typeof value}`,
      fieldName,
      value
    );
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${options.minLength} characters long`,
      fieldName,
      value
    );
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${options.maxLength} characters long`,
      fieldName,
      value
    );
  }

  if (options.pattern && !options.pattern.test(value)) {
    throw new ValidationError(
      `${fieldName} does not match required pattern`,
      fieldName,
      value
    );
  }
}

/**
 * Validate GUID (with or without braces, with or without dashes)
 */
export function validateGuid(
  value: any,
  fieldName: string,
  required: boolean = true
): void {
  if (!required && (value === undefined || value === null)) {
    return;
  }

  validateString(value, fieldName, { required });

  // Remove braces and dashes for validation
  const cleaned = value.replace(/[{}]/g, '').replace(/-/g, '');
  
  // Check if it's a valid GUID format (32 hex characters)
  const guidPattern = /^[0-9a-fA-F]{32}$/;
  
  if (!guidPattern.test(cleaned)) {
    // Also check standard format with dashes
    const standardPattern = /^[{]?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}[}]?$/;
    if (!standardPattern.test(value)) {
      throw new ValidationError(
        `${fieldName} must be a valid GUID (e.g., "abc-123-..." or "{abc-123-...}")`,
        fieldName,
        value
      );
    }
  }
}

/**
 * Validate Sitecore path
 */
export function validatePath(
  value: any,
  fieldName: string,
  required: boolean = true
): void {
  if (!required && (value === undefined || value === null)) {
    return;
  }

  validateString(value, fieldName, { required });

  if (!value.startsWith('/sitecore/')) {
    throw new ValidationError(
      `${fieldName} must start with /sitecore/ (got: ${value})`,
      fieldName,
      value
    );
  }

  // Check for invalid characters
  if (/[<>:"|?*]/.test(value)) {
    throw new ValidationError(
      `${fieldName} contains invalid characters`,
      fieldName,
      value
    );
  }
}

/**
 * Validate either ID or path is provided
 */
export function validateIdOrPath(args: any): void {
  if (!args.itemId && !args.path) {
    throw new ValidationError(
      'Either itemId or path must be provided',
      'itemId/path'
    );
  }

  if (args.itemId) {
    validateGuid(args.itemId, 'itemId');
  }

  if (args.path) {
    validatePath(args.path, 'path');
  }
}

/**
 * Validate parent (ID or path)
 */
export function validateParent(args: any): void {
  if (!args.parent && !args.parentPath) {
    throw new ValidationError(
      'Either parent ID or parentPath must be provided',
      'parent/parentPath'
    );
  }

  if (args.parent) {
    validateGuid(args.parent, 'parent');
  }

  if (args.parentPath) {
    validatePath(args.parentPath, 'parentPath');
  }
}

/**
 * Validate language code
 */
export function validateLanguage(
  value: any,
  fieldName: string = 'language',
  required: boolean = false
): void {
  if (!required && (value === undefined || value === null)) {
    return;
  }

  validateString(value, fieldName, { required, minLength: 2, maxLength: 10 });

  // Basic language code pattern (en, en-US, etc.)
  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(value)) {
    throw new ValidationError(
      `${fieldName} must be a valid language code (e.g., "en", "en-US")`,
      fieldName,
      value
    );
  }
}

/**
 * Validate array field
 */
export function validateArray(
  value: any,
  fieldName: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: any, index: number) => void;
  } = {}
): void {
  if (options.required) {
    validateRequired(value, fieldName);
  }

  if (value === undefined || value === null) {
    if (!options.required) return;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError(
      `${fieldName} must be an array`,
      fieldName,
      value
    );
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(
      `${fieldName} must have at least ${options.minLength} items`,
      fieldName,
      value
    );
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(
      `${fieldName} must have at most ${options.maxLength} items`,
      fieldName,
      value
    );
  }

  if (options.itemValidator) {
    value.forEach((item, index) => {
      try {
        options.itemValidator!(item, index);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(
            `${fieldName}[${index}]: ${error.message}`,
            `${fieldName}[${index}]`,
            item
          );
        }
        throw error;
      }
    });
  }
}

/**
 * Validate field input for items
 */
export function validateFieldInput(field: any, index?: number): void {
  const prefix = index !== undefined ? `fields[${index}]` : 'field';
  
  validateString(field.name, `${prefix}.name`, { required: true });
  validateString(field.value, `${prefix}.value`, { required: false });
}

/**
 * Validate template field input
 */
export function validateTemplateFieldInput(field: any, index?: number): void {
  const prefix = index !== undefined ? `fields[${index}]` : 'field';
  
  validateString(field.name, `${prefix}.name`, { required: true });
  validateString(field.type, `${prefix}.type`, { required: true });
}

/**
 * Validate template section input
 */
export function validateTemplateSectionInput(section: any, index?: number): void {
  const prefix = index !== undefined ? `sections[${index}]` : 'section';
  
  validateString(section.name, `${prefix}.name`, { required: true });
  
  if (section.fields) {
    validateArray(section.fields, `${prefix}.fields`, {
      itemValidator: validateTemplateFieldInput,
    });
  }
}

/**
 * Validate number field
 */
export function validateNumber(
  value: any,
  fieldName: string,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}
): void {
  if (options.required) {
    validateRequired(value, fieldName);
  }

  if (value === undefined || value === null) {
    if (!options.required) return;
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (typeof num !== 'number' || isNaN(num)) {
    throw new ValidationError(
      `${fieldName} must be a valid number`,
      fieldName,
      value
    );
  }

  if (options.integer && !Number.isInteger(num)) {
    throw new ValidationError(
      `${fieldName} must be an integer`,
      fieldName,
      value
    );
  }

  if (options.min !== undefined && num < options.min) {
    throw new ValidationError(
      `${fieldName} must be at least ${options.min}`,
      fieldName,
      value
    );
  }

  if (options.max !== undefined && num > options.max) {
    throw new ValidationError(
      `${fieldName} must be at most ${options.max}`,
      fieldName,
      value
    );
  }
}

/**
 * Validate boolean field
 */
export function validateBoolean(
  value: any,
  fieldName: string,
  required: boolean = false
): void {
  if (!required && (value === undefined || value === null)) {
    return;
  }

  if (typeof value !== 'boolean') {
    throw new ValidationError(
      `${fieldName} must be a boolean (true/false)`,
      fieldName,
      value
    );
  }
}

/**
 * Sanitize GUID (remove curly braces)
 */
export function sanitizeGuid(guid: string): string {
  return guid.replace(/[{}]/g, '');
}

/**
 * Sanitize path (ensure it starts with /sitecore/ and has no trailing slash)
 */
export function sanitizePath(path: string): string {
  let sanitized = path.trim();
  
  // Remove trailing slash
  if (sanitized.endsWith('/') && sanitized !== '/sitecore/') {
    sanitized = sanitized.slice(0, -1);
  }
  
  return sanitized;
}

/**
 * Validate and sanitize input object
 */
export function validateAndSanitize<T extends Record<string, any>>(
  input: T,
  validators: Record<string, (value: any) => void>
): T {
  const sanitized: any = { ...input };

  for (const [field, validator] of Object.entries(validators)) {
    if (field in sanitized) {
      validator(sanitized[field]);
    }
  }

  // Sanitize GUIDs
  for (const key of Object.keys(sanitized)) {
    if (key.includes('Id') || key.includes('id')) {
      if (typeof sanitized[key] === 'string' && sanitized[key]) {
        sanitized[key] = sanitizeGuid(sanitized[key]);
      }
    }
    if (key.includes('Path') || key.includes('path')) {
      if (typeof sanitized[key] === 'string' && sanitized[key]) {
        sanitized[key] = sanitizePath(sanitized[key]);
      }
    }
  }

  return sanitized as T;
}


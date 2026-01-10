export interface TextProcessingOptions {
  removeLineBreaks: boolean;
  mergeSpaces: boolean;
}

/**
 * Removes extra line breaks from text.
 * Consecutive line breaks (more than 2) are reduced to maximum 2.
 * This preserves paragraph breaks while cleaning up excessive whitespace.
 *
 * @param text - The input text to process
 * @returns Text with extra line breaks removed
 */
export function removeLineBreaks(text: string): string {
  if (!text) return text;

  // Replace 3 or more consecutive newlines with exactly 2 newlines
  // This preserves paragraph breaks while removing excessive line breaks
  return text.replace(/\n{3,}/g, '\n\n');
}

/**
 * Merges consecutive spaces and tabs into a single space.
 * This cleans up OCR artifacts that often produce irregular spacing.
 *
 * @param text - The input text to process
 * @returns Text with consecutive whitespace merged into single spaces
 */
export function mergeSpaces(text: string): string {
  if (!text) return text;

  // Replace all whitespace sequences (spaces, tabs, mixed) with a single space
  return text.replace(/[ \t]+/g, ' ');
}

/**
 * Processes text based on user-configured options.
 * Applies removeLineBreaks and/or mergeSpaces based on settings.
 *
 * @param text - The input text to process
 * @param options - Processing options (undefined means no processing)
 * @returns Processed text according to options
 */
export function processText(text: string, options?: TextProcessingOptions): string {
  if (!text) return text;
  if (!options) return text;

  let result = text;

  // Apply line break removal if enabled
  if (options.removeLineBreaks) {
    result = removeLineBreaks(result);
  }

  // Apply space merging if enabled
  if (options.mergeSpaces) {
    result = mergeSpaces(result);
  }

  return result;
}

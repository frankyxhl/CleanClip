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
 * Removes common page number patterns from OCR text.
 * Targets standalone page numbers on their own lines while preserving inline references.
 *
 * Patterns removed:
 * - "Page X" (e.g., "Page 1", "Page 23")
 * - "X of Y" (e.g., "1 of 10", "23 of 100")
 * - "- X -" (e.g., "- 5 -", "- 12 -")
 * - Standalone numbers (e.g., "5", "23")
 *
 * Inline references like "See Page 5 for details" are preserved.
 *
 * @param text - The input text to process
 * @returns Text with page number patterns removed
 */
export function removePageNumbers(text: string): string {
  if (!text) return text;

  // Split into lines for processing
  const lines = text.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) return true;

    // Pattern 1: "Page X" on standalone line
    if (/^Page\s+\d+$/i.test(trimmed)) {
      return false;
    }

    // Pattern 2: "X of Y" on standalone line
    if (/^\d+\s+of\s+\d+$/i.test(trimmed)) {
      return false;
    }

    // Pattern 3: "- X -" on standalone line
    if (/^-\s*\d+\s*-$/.test(trimmed)) {
      return false;
    }

    // Pattern 4: Standalone number (potential page number)
    if (/^\d+$/.test(trimmed)) {
      return false;
    }

    // Keep all other lines (including inline page references)
    return true;
  });

  return filteredLines.join('\n');
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

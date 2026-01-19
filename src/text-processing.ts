export interface TextProcessingOptions {
  removeLineBreaks: boolean;
  mergeSpaces: boolean;
  removeHeaderFooter?: boolean;
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
 * Removes repeated short header lines from OCR text.
 * Only removes lines that are ≤80 characters and appear 3+ times.
 * Long lines (>80 chars) are preserved as they're likely body content.
 *
 * Semantic preservation:
 * - List items (-, *, 1., a), etc.) are always preserved
 * - Dialogue/quotes (", ', 「, 『, etc.) are always preserved
 *
 * Normalization:
 * - Whitespace differences are normalized when counting duplicates
 * - But original formatting is preserved in output
 *
 * @param text - The input text to process
 * @returns Text with repeated short header lines removed
 */
export function removeHeaders(text: string): string {
  if (!text) return text;

  // Helper: Check if line is a list item
  const isListItem = (line: string): boolean => {
    const trimmed = line.trim();
    // Match common list patterns: -, *, +, •, ◦, 1., 1), a., a), A., A), etc.
    // Marker with optional space (OCR may omit space after bullet)
    return /^[-*+•◦]\s?/.test(trimmed) ||
           /^\d+[.)]\s?/.test(trimmed) ||
           /^[a-zA-Z][.)]\s?/.test(trimmed);
  };

  // Helper: Check if line is dialogue/quote
  const isDialogue = (line: string): boolean => {
    const trimmed = line.trim();
    // Match opening quotes: ", ', 「, 『, ", ', ", ', etc. (including curly quotes)
    return /^["'「『"'"']/.test(trimmed);
  };

  // Helper: Normalize whitespace for comparison
  const normalizeWhitespace = (line: string): string => {
    return line.trim().replace(/\s+/g, ' ');
  };

  // Split into lines
  const lines = text.split('\n');

  // Count occurrences of normalized lines, mapping to original
  const normalizedCounts = new Map<string, number>();
  const normalizedToOriginal = new Map<string, string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      const normalized = normalizeWhitespace(trimmed);
      normalizedCounts.set(normalized, (normalizedCounts.get(normalized) || 0) + 1);
      // Store first occurrence as canonical original
      if (!normalizedToOriginal.has(normalized)) {
        normalizedToOriginal.set(normalized, trimmed);
      }
    }
  }

  // Identify short lines (≤80 chars) appearing 3+ times
  // Exclude semantic content (list items, dialogue)
  const headersToRemove = new Set<string>();

  for (const [normalized, count] of normalizedCounts.entries()) {
    const original = normalizedToOriginal.get(normalized)!;

    // Check normalized length since that's what we're comparing
    if (normalized.length <= 80 && count >= 3) {
      // Skip if it's semantic content
      if (!isListItem(original) && !isDialogue(original)) {
        headersToRemove.add(normalized);
      }
    }
  }

  // Filter out header lines
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return true; // Keep empty lines

    const normalized = normalizeWhitespace(trimmed);
    return !headersToRemove.has(normalized);
  });

  return filteredLines.join('\n');
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
 * Removes both headers and page numbers from OCR text.
 * This is a convenience function that combines removeHeaders() and removePageNumbers().
 *
 * @param text - The input text to process
 * @returns Text with both headers and page numbers removed
 */
export function removeHeaderFooter(text: string): string {
  if (!text) return text;

  // First remove page numbers, then remove headers
  let result = removePageNumbers(text);
  result = removeHeaders(result);

  return result;
}

/**
 * Processes text based on user-configured options.
 * Applies removeLineBreaks, mergeSpaces, and/or removeHeaderFooter based on settings.
 *
 * @param text - The input text to process
 * @param options - Processing options (undefined means no processing)
 * @returns Processed text according to options
 */
export function processText(text: string, options?: TextProcessingOptions): string {
  if (!text) return text;
  if (!options) return text;

  let result = text;

  // Apply header/footer removal if enabled
  if (options.removeHeaderFooter) {
    result = removeHeaderFooter(result);
  }

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

import { describe, it, expect } from 'vitest';
import { removeLineBreaks, mergeSpaces, processText, removePageNumbers, removeHeaders } from '../src/text-processing';

describe('Text Processing - removeLineBreaks', () => {
  it('should remove extra line breaks', () => {
    const input = 'Line 1\n\n\nLine 2\n\n\n\nLine 3';
    const expected = 'Line 1\n\nLine 2\n\nLine 3';
    expect(removeLineBreaks(input)).toBe(expected);
  });

  it('should preserve single line breaks', () => {
    const input = 'Line 1\nLine 2\nLine 3';
    expect(removeLineBreaks(input)).toBe(input);
  });

  it('should handle text with no line breaks', () => {
    const input = 'Single line text';
    expect(removeLineBreaks(input)).toBe(input);
  });

  it('should handle empty string', () => {
    expect(removeLineBreaks('')).toBe('');
  });

  it('should trim excessive consecutive line breaks to max 2', () => {
    const input = 'Text\n\n\n\n\n\nMore text';
    const expected = 'Text\n\nMore text';
    expect(removeLineBreaks(input)).toBe(expected);
  });
});

describe('Text Processing - mergeSpaces', () => {
  it('should merge consecutive spaces', () => {
    const input = 'Word1    Word2     Word3';
    const expected = 'Word1 Word2 Word3';
    expect(mergeSpaces(input)).toBe(expected);
  });

  it('should preserve single spaces', () => {
    const input = 'Word1 Word2 Word3';
    expect(mergeSpaces(input)).toBe(input);
  });

  it('should handle tabs as spaces', () => {
    const input = 'Word1\t\t\tWord2';
    const expected = 'Word1 Word2';
    expect(mergeSpaces(input)).toBe(expected);
  });

  it('should handle mixed spaces and tabs', () => {
    const input = 'Word1 \t  \t Word2';
    const expected = 'Word1 Word2';
    expect(mergeSpaces(input)).toBe(expected);
  });

  it('should handle empty string', () => {
    expect(mergeSpaces('')).toBe('');
  });

  it('should handle text with no spaces', () => {
    const input = 'Word1Word2Word3';
    expect(mergeSpaces(input)).toBe(input);
  });
});

describe('Text Processing - processText with options', () => {
  it('should apply removeLineBreaks when enabled', () => {
    const input = 'Line 1\n\n\n\nLine 2';
    const options = { removeLineBreaks: true, mergeSpaces: false };
    const expected = 'Line 1\n\nLine 2';
    expect(processText(input, options)).toBe(expected);
  });

  it('should apply mergeSpaces when enabled', () => {
    const input = 'Word1    Word2';
    const options = { removeLineBreaks: false, mergeSpaces: true };
    const expected = 'Word1 Word2';
    expect(processText(input, options)).toBe(expected);
  });

  it('should apply both options when both are enabled', () => {
    const input = 'Line 1\n\n\nLine 2    Word';
    const options = { removeLineBreaks: true, mergeSpaces: true };
    const expected = 'Line 1\n\nLine 2 Word';
    expect(processText(input, options)).toBe(expected);
  });

  it('should not apply any processing when both options are false', () => {
    const input = 'Line 1\n\n\nLine 2    Word';
    const options = { removeLineBreaks: false, mergeSpaces: false };
    expect(processText(input, options)).toBe(input);
  });

  it('should handle empty string', () => {
    const options = { removeLineBreaks: true, mergeSpaces: true };
    expect(processText('', options)).toBe('');
  });

  it('should handle undefined options (default to false)', () => {
    const input = 'Line 1\n\n\nLine 2    Word';
    expect(processText(input, undefined)).toBe(input);
  });
});

describe('Text Processing - removeHeaders', () => {
  // Task 2.1: Remove short lines appearing 3+ times
  it('should remove short lines (≤80 chars) appearing 3+ times', () => {
    const input = 'Header Line\nBody text here\nHeader Line\nMore body text\nHeader Line\nFinal text';
    const expected = 'Body text here\nMore body text\nFinal text';
    expect(removeHeaders(input)).toBe(expected);
  });

  // Task 2.4: Preserve long repeated lines (>80 chars)
  it('should preserve long repeated lines (>80 chars)', () => {
    const longLine = 'This is a very long line that exceeds eighty characters and should be preserved as body content';
    const input = `${longLine}\nSome text\n${longLine}\nMore text\n${longLine}`;
    expect(removeHeaders(input)).toBe(input);
  });

  // Task 2.5: Preserve lines appearing only twice
  it('should preserve lines appearing only twice', () => {
    const input = 'Repeated twice\nBody text\nRepeated twice\nMore text';
    expect(removeHeaders(input)).toBe(input);
  });

  // Task 2.6: Preserve unique lines
  it('should preserve unique lines', () => {
    const input = 'Line 1\nLine 2\nLine 3\nLine 4';
    expect(removeHeaders(input)).toBe(input);
  });

  it('should handle empty string', () => {
    expect(removeHeaders('')).toBe('');
  });

  it('should handle text with no repeated lines', () => {
    const input = 'First line\nSecond line\nThird line';
    expect(removeHeaders(input)).toBe(input);
  });

  it('should handle multiple different repeated headers', () => {
    const input = 'Header1\nHeader2\nBody\nHeader1\nMore body\nHeader2\nHeader1\nHeader2\nFinal';
    const expected = 'Body\nMore body\nFinal';
    expect(removeHeaders(input)).toBe(expected);
  });
});

describe('Text Processing - removePageNumbers', () => {
  // Task 1.1: Remove "Page X" pattern
  it('should remove "Page X" pattern on standalone line', () => {
    const input = 'First paragraph\nPage 1\nSecond paragraph';
    const expected = 'First paragraph\nSecond paragraph';
    expect(removePageNumbers(input)).toBe(expected);
  });

  it('should remove multiple "Page X" patterns', () => {
    const input = 'Text\nPage 1\nMore text\nPage 2\nFinal text';
    const expected = 'Text\nMore text\nFinal text';
    expect(removePageNumbers(input)).toBe(expected);
  });

  // Task 1.4: Remove "X of Y" and "- X -" patterns
  it('should remove "X of Y" pattern on standalone line', () => {
    const input = 'First paragraph\n1 of 10\nSecond paragraph';
    const expected = 'First paragraph\nSecond paragraph';
    expect(removePageNumbers(input)).toBe(expected);
  });

  it('should remove "- X -" pattern on standalone line', () => {
    const input = 'First paragraph\n- 5 -\nSecond paragraph';
    const expected = 'First paragraph\nSecond paragraph';
    expect(removePageNumbers(input)).toBe(expected);
  });

  it('should remove multiple different page number patterns', () => {
    const input = 'Chapter 1\nPage 1\nContent here\n1 of 10\nMore content\n- 5 -\nFinal text';
    const expected = 'Chapter 1\nContent here\nMore content\nFinal text';
    expect(removePageNumbers(input)).toBe(expected);
  });

  // Task 1.6: Preserve inline page references
  it('should preserve inline "Page X" references', () => {
    const input = 'See Page 5 for details';
    expect(removePageNumbers(input)).toBe(input);
  });

  it('should preserve inline page references in longer text', () => {
    const input = 'Please refer to Page 10 for more information about this topic.';
    expect(removePageNumbers(input)).toBe(input);
  });

  it('should remove standalone page numbers but preserve inline references', () => {
    const input = 'See Page 5 for details\nPage 1\nMore text refers to Page 3\n- 2 -\nFinal content';
    const expected = 'See Page 5 for details\nMore text refers to Page 3\nFinal content';
    expect(removePageNumbers(input)).toBe(expected);
  });

  it('should handle empty string', () => {
    expect(removePageNumbers('')).toBe('');
  });

  it('should handle text with no page numbers', () => {
    const input = 'Regular text\nWith multiple lines\nNo page numbers';
    expect(removePageNumbers(input)).toBe(input);
  });

  it('should handle text with only whitespace around page numbers', () => {
    const input = 'Text\n  Page 1  \nMore text';
    const expected = 'Text\nMore text';
    expect(removePageNumbers(input)).toBe(expected);
  });

  it('should remove standalone number lines (potential page numbers)', () => {
    const input = 'Text here\n5\nMore text';
    const expected = 'Text here\nMore text';
    expect(removePageNumbers(input)).toBe(expected);
  });
});

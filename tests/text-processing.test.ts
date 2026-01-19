import { describe, it, expect } from 'vitest';
import { removeLineBreaks, mergeSpaces, processText, removePageNumbers, removeHeaders, removeHeaderFooter } from '../src/text-processing';

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

  // Task 4.1: Test removeHeaderFooter option
  it('should apply removeHeaderFooter when enabled', () => {
    const input = 'Header Line\nBody text here\nPage 1\nHeader Line\nMore body text\n1 of 10\nHeader Line\nFinal text';
    const options = { removeLineBreaks: false, mergeSpaces: false, removeHeaderFooter: true };
    const expected = 'Body text here\nMore body text\nFinal text';
    expect(processText(input, options)).toBe(expected);
  });

  // Task 4.5: Test default behavior (option not set)
  it('should not remove header/footer when removeHeaderFooter is false', () => {
    const input = 'Header Line\nBody text here\nPage 1\nHeader Line\nMore body text\nHeader Line\nFinal text';
    const options = { removeLineBreaks: false, mergeSpaces: false, removeHeaderFooter: false };
    expect(processText(input, options)).toBe(input);
  });

  it('should not remove header/footer when removeHeaderFooter option is not set', () => {
    const input = 'Header Line\nBody text here\nPage 1\nHeader Line\nMore body text\nHeader Line\nFinal text';
    const options = { removeLineBreaks: false, mergeSpaces: false };
    expect(processText(input, options)).toBe(input);
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

  // Improvement 1: Semantic detection - preserve list items
  it('should preserve repeated list items with dash marker', () => {
    const input = '- Item one\n- Item two\n- Item three\n- Item four';
    expect(removeHeaders(input)).toBe(input);
  });

  it('should preserve repeated list items with asterisk marker', () => {
    const input = '* First item\n* Second item\n* Third item\n* Fourth item';
    expect(removeHeaders(input)).toBe(input);
  });

  it('should preserve repeated numbered list items', () => {
    const input = '1. First step\n2. Second step\n3. Third step\n4. Fourth step';
    expect(removeHeaders(input)).toBe(input);
  });

  it('should preserve repeated list items with letter markers', () => {
    const input = 'a) Option A\nb) Option B\nc) Option C\nd) Option D';
    expect(removeHeaders(input)).toBe(input);
  });

  it('should preserve mixed list patterns even when repeated 3+ times', () => {
    const input = '- Task\nHeader\n* Point\nHeader\n1. Step\nHeader\na) Choice';
    const expected = '- Task\n* Point\n1. Step\na) Choice';
    expect(removeHeaders(input)).toBe(expected);
  });

  // Improvement 1: Semantic detection - preserve dialogue/quotes
  it('should preserve repeated lines starting with double quotes', () => {
    const input = '"Hello there"\n"How are you?"\n"I am fine"\n"Thank you"';
    expect(removeHeaders(input)).toBe(input);
  });

  it('should preserve repeated lines starting with single quotes', () => {
    const input = "'First quote'\n'Second quote'\n'Third quote'\n'Fourth quote'";
    expect(removeHeaders(input)).toBe(input);
  });

  it('should preserve repeated lines with CJK quotes', () => {
    const input = '「こんにちは」\n「元気ですか」\n「はい、元気です」\n「ありがとう」';
    expect(removeHeaders(input)).toBe(input);
  });

  it('should preserve repeated lines with CJK corner brackets', () => {
    const input = '『第一章』\n『第二章』\n『第三章』\n『第四章』';
    expect(removeHeaders(input)).toBe(input);
  });

  it('should remove real headers but preserve dialogue', () => {
    const input = 'Header\n"Quote one"\nHeader\n"Quote two"\nHeader\n"Quote three"';
    const expected = '"Quote one"\n"Quote two"\n"Quote three"';
    expect(removeHeaders(input)).toBe(expected);
  });

  // Enhancement: Curly quotes support - SAME line repeated 3+ times must be preserved
  it('should preserve identical curly double quote lines repeated 3+ times', () => {
    // U+201C = " (left curly double quote)
    const sameLine = '\u201CSame dialogue line\u201D';
    const input = `${sameLine}\nBody text\n${sameLine}\nMore body\n${sameLine}\nFinal`;
    // Without isDialogue check, "Same dialogue line" would be removed as header
    expect(removeHeaders(input)).toBe(input);
  });

  it('should preserve identical curly single quote lines repeated 3+ times', () => {
    // U+2018 = ' (left curly single quote)
    const sameLine = '\u2018Same quote\u2019';
    const input = `${sameLine}\nBody text\n${sameLine}\nMore body\n${sameLine}\nFinal`;
    expect(removeHeaders(input)).toBe(input);
  });

  // Enhancement: Right curly quotes at line start (OCR errors)
  it('should preserve lines starting with right curly double quote repeated 3+ times', () => {
    // U+201D = " (right curly double quote) - OCR may place closing quote at line start
    const sameLine = '\u201DOops OCR error';
    const input = `${sameLine}\nBody text\n${sameLine}\nMore body\n${sameLine}\nFinal`;
    expect(removeHeaders(input)).toBe(input);
  });

  it('should preserve lines starting with right curly single quote repeated 3+ times', () => {
    // U+2019 = ' (right curly single quote)
    const sameLine = '\u2019Another OCR error';
    const input = `${sameLine}\nBody text\n${sameLine}\nMore body\n${sameLine}\nFinal`;
    expect(removeHeaders(input)).toBe(input);
  });

  // Enhancement: List items without space after marker - SAME line repeated 3+ times
  it('should preserve identical bullet items without space repeated 3+ times', () => {
    const sameLine = '•SameItem';
    const input = `${sameLine}\nBody text\n${sameLine}\nMore body\n${sameLine}\nFinal`;
    // Without isListItem allowing no space, this would be removed as header
    expect(removeHeaders(input)).toBe(input);
  });

  it('should preserve identical numbered items without space repeated 3+ times', () => {
    const sameLine = '1.SameItem';
    const input = `${sameLine}\nBody text\n${sameLine}\nMore body\n${sameLine}\nFinal`;
    expect(removeHeaders(input)).toBe(input);
  });

  // Improvement 2: Normalization - detect headers with whitespace differences
  it('should detect repeated headers with different whitespace', () => {
    const input = 'Header  Line\nBody text\nHeader Line\nMore body\n Header   Line\nFinal';
    const expected = 'Body text\nMore body\nFinal';
    expect(removeHeaders(input)).toBe(expected);
  });

  it('should detect repeated headers with leading/trailing spaces', () => {
    const input = '  Header\nBody\nHeader  \nMore\n Header \nFinal';
    const expected = 'Body\nMore\nFinal';
    expect(removeHeaders(input)).toBe(expected);
  });

  it('should detect headers with tabs normalized to spaces', () => {
    const input = 'Header\t\tText\nBody\nHeader  Text\nMore\nHeader\tText\nFinal';
    const expected = 'Body\nMore\nFinal';
    expect(removeHeaders(input)).toBe(expected);
  });

  // Combined: normalization + semantic preservation
  it('should preserve list items with varied whitespace but remove headers with varied whitespace', () => {
    const input = '- Item  one\nHeader  Line\n-  Item two\nHeader Line\n- Item   three\n Header   Line\nFinal';
    const expected = '- Item  one\n-  Item two\n- Item   three\nFinal';
    expect(removeHeaders(input)).toBe(expected);
  });
});

describe('Text Processing - removeHeaderFooter', () => {
  // Task 3.1: Remove both headers and page numbers
  it('should remove both headers and page numbers', () => {
    const input = 'Header Line\nBody text here\nPage 1\nHeader Line\nMore body text\n1 of 10\nHeader Line\nFinal text';
    const expected = 'Body text here\nMore body text\nFinal text';
    expect(removeHeaderFooter(input)).toBe(expected);
  });

  it('should handle text with only headers', () => {
    const input = 'Header Line\nBody text\nHeader Line\nMore text\nHeader Line\nFinal';
    const expected = 'Body text\nMore text\nFinal';
    expect(removeHeaderFooter(input)).toBe(expected);
  });

  it('should handle text with only page numbers', () => {
    const input = 'First paragraph\nPage 1\nSecond paragraph\n- 5 -\nThird paragraph';
    const expected = 'First paragraph\nSecond paragraph\nThird paragraph';
    expect(removeHeaderFooter(input)).toBe(expected);
  });

  it('should handle empty string', () => {
    expect(removeHeaderFooter('')).toBe('');
  });

  it('should handle text with no headers or page numbers', () => {
    const input = 'Regular text\nWith multiple lines\nNo headers or footers';
    expect(removeHeaderFooter(input)).toBe(input);
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

import { describe, it, expect } from 'vitest';
import { removeLineBreaks, mergeSpaces, processText } from '../src/text-processing';

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

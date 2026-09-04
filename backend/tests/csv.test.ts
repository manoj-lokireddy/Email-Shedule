import { describe, expect, it } from 'vitest';
import { parseRecipients } from '../src/utils/csv';
describe('recipient parsing', () => {
  it('skips headers, validates, and removes duplicates', () => {
    const result = parseRecipients('email\nAlice@example.com\nalice@example.com\ninvalid\nBob@example.com');
    expect(result.valid).toEqual(['alice@example.com', 'bob@example.com']);
    expect(result.invalid).toEqual(['invalid']);
    expect(result.duplicates).toBe(1);
  });
});

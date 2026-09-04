"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const csv_1 = require("../src/utils/csv");
(0, vitest_1.describe)('recipient parsing', () => {
    (0, vitest_1.it)('skips headers, validates, and removes duplicates', () => {
        const result = (0, csv_1.parseRecipients)('email\nAlice@example.com\nalice@example.com\ninvalid\nBob@example.com');
        (0, vitest_1.expect)(result.valid).toEqual(['alice@example.com', 'bob@example.com']);
        (0, vitest_1.expect)(result.invalid).toEqual(['invalid']);
        (0, vitest_1.expect)(result.duplicates).toBe(1);
    });
});

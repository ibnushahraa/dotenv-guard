const { isLegacyEncrypted, decryptValue } = require('../src/cryptoEncryption');

describe('Legacy Format Detection & Migration', () => {
  describe('isLegacyEncrypted', () => {
    test('should detect legacy keytar format', () => {
      // Legacy format: 32-char hex IV + hex encrypted data
      const legacyValue = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6:1a2b3c4d5e6f7a8b9c0d';
      expect(isLegacyEncrypted(legacyValue)).toBe(true);
    });

    test('should detect valid legacy format with long encrypted data', () => {
      const legacyValue = '0123456789abcdef0123456789abcdef:fedcba9876543210fedcba9876543210abcdef';
      expect(isLegacyEncrypted(legacyValue)).toBe(true);
    });

    test('should not detect new format as legacy', () => {
      const newValue = 'aes:a1b2c3:d4e5f6:g7h8i9';
      expect(isLegacyEncrypted(newValue)).toBe(false);
    });

    test('should not detect plaintext as legacy', () => {
      expect(isLegacyEncrypted('plaintext')).toBe(false);
      expect(isLegacyEncrypted('postgresql://localhost')).toBe(false);
      expect(isLegacyEncrypted('3000')).toBe(false);
    });

    test('should not detect malformed hex as legacy', () => {
      // Non-hex characters
      expect(isLegacyEncrypted('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz:abcdef')).toBe(false);

      // Wrong IV length (not 32 chars)
      expect(isLegacyEncrypted('abc:def')).toBe(false);
      expect(isLegacyEncrypted('a1b2c3d4:e5f6g7h8')).toBe(false);
    });

    test('should not detect values with wrong separator count', () => {
      expect(isLegacyEncrypted('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6')).toBe(false); // No colon
      expect(isLegacyEncrypted('a1:b2:c3')).toBe(false); // Too many colons
    });

    test('should handle null and undefined', () => {
      expect(isLegacyEncrypted(null)).toBe(false);
      expect(isLegacyEncrypted(undefined)).toBe(false);
      expect(isLegacyEncrypted('')).toBe(false);
    });
  });

  describe('decryptValue with legacy format', () => {
    test('should throw error for legacy format', () => {
      const legacyValue = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6:1a2b3c4d5e6f7a8b9c0d';

      // This should detect legacy format and throw error
      // (either migration required or failed to decrypt)
      expect(() => decryptValue(legacyValue)).toThrow();
    });

    test('should return plaintext as-is', () => {
      expect(decryptValue('plaintext')).toBe('plaintext');
      expect(decryptValue('postgresql://localhost')).toBe('postgresql://localhost');
      expect(decryptValue('3000')).toBe('3000');
    });

    test('should handle empty values', () => {
      expect(decryptValue('')).toBe('');
      expect(decryptValue(null)).toBe(null);
      expect(decryptValue(undefined)).toBe(undefined);
    });
  });

  describe('Format detection patterns', () => {
    test('should correctly identify different formats', () => {
      const formats = [
        // [value, isLegacy, isNew]
        ['aes:abc123:def456:aaa789', false, true],
        ['a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6:fedcba9876543210', true, false],
        ['plaintext-value', false, false],
        ['PORT=3000', false, false],
        ['', false, false],
      ];

      formats.forEach(([value, expectedLegacy, expectedNew]) => {
        expect(isLegacyEncrypted(value)).toBe(expectedLegacy);
        expect(value.startsWith('aes:')).toBe(expectedNew);
      });
    });
  });

  describe('Edge cases', () => {
    test('should handle values that look like legacy but are not', () => {
      // Almost valid but not quite
      const almostValid = [
        'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5pX:abcdef', // Non-hex in IV (X)
        'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p:abcdef',  // IV too short (31 chars)
        'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6a:abcdef', // IV too long (33 chars)
        'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6:xyz',     // Non-hex in cipher
      ];

      almostValid.forEach(value => {
        expect(isLegacyEncrypted(value)).toBe(false);
      });
    });

    test('should handle values with colons that are not encrypted', () => {
      const notEncrypted = [
        'http://localhost:3000',
        'user:password',
        'key:value:pair',
        ':leading',
        'trailing:',
      ];

      notEncrypted.forEach(value => {
        expect(isLegacyEncrypted(value)).toBe(false);
      });
    });
  });
});

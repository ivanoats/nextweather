import {
  isValidStationId,
  sanitizeStationId,
} from '../../src/util/validate-station-id';

describe('isValidStationId', () => {
  describe('valid station IDs', () => {
    it('should accept standard NDBC station IDs', () => {
      expect(isValidStationId('WPOW1')).toBe(true);
      expect(isValidStationId('SISW1')).toBe(true);
      expect(isValidStationId('46042')).toBe(true);
    });

    it('should accept standard NWS station IDs', () => {
      expect(isValidStationId('KSEA')).toBe(true);
      expect(isValidStationId('KPDX')).toBe(true);
      expect(isValidStationId('KBFI')).toBe(true);
    });

    it('should accept tide station IDs', () => {
      expect(isValidStationId('9447130')).toBe(true);
      expect(isValidStationId('9447131')).toBe(true);
    });

    it('should accept mixed alphanumeric IDs', () => {
      expect(isValidStationId('ABC123')).toBe(true);
      expect(isValidStationId('123ABC')).toBe(true);
    });

    it('should accept IDs at max length', () => {
      expect(isValidStationId('A123456789', 10)).toBe(true);
    });
  });

  describe('invalid station IDs', () => {
    it('should reject empty strings', () => {
      expect(isValidStationId('')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(isValidStationId(null as any)).toBe(false);
      expect(isValidStationId(undefined as any)).toBe(false);
    });

    it('should reject non-string types', () => {
      expect(isValidStationId(123 as any)).toBe(false);
      expect(isValidStationId({} as any)).toBe(false);
      expect(isValidStationId([] as any)).toBe(false);
    });

    it('should reject IDs that are too long', () => {
      expect(isValidStationId('VERYLONGSTATIONID123', 10)).toBe(false);
    });

    it('should reject IDs with special characters', () => {
      expect(isValidStationId('WPOW1!')).toBe(false);
      expect(isValidStationId('KSEA@')).toBe(false);
      expect(isValidStationId('test#123')).toBe(false);
    });

    it('should reject path traversal attempts', () => {
      expect(isValidStationId('../etc/passwd')).toBe(false);
      expect(isValidStationId('../../secret')).toBe(false);
      expect(isValidStationId('..')).toBe(false);
      expect(isValidStationId('.')).toBe(false);
    });

    it('should reject URL injection attempts', () => {
      expect(isValidStationId('http://evil.com')).toBe(false);
      expect(isValidStationId('https://attacker.com/data')).toBe(false);
      expect(isValidStationId('//evil.com')).toBe(false);
    });

    it('should reject IDs with slashes', () => {
      expect(isValidStationId('WPOW1/test')).toBe(false);
      expect(isValidStationId(String.raw`test\bad`)).toBe(false);
    });

    it('should reject IDs with spaces', () => {
      expect(isValidStationId('WPOW 1')).toBe(false);
      expect(isValidStationId(' KSEA')).toBe(false);
      expect(isValidStationId('KSEA ')).toBe(false);
    });

    it('should reject IDs with query parameters', () => {
      expect(isValidStationId('WPOW1?param=value')).toBe(false);
      expect(isValidStationId('KSEA&evil=1')).toBe(false);
    });

    it('should reject IDs with encoded characters', () => {
      expect(isValidStationId('WPOW%201')).toBe(false);
      expect(isValidStationId('test%2F')).toBe(false);
    });
  });
});

describe('sanitizeStationId', () => {
  it('should return valid station IDs unchanged', () => {
    expect(sanitizeStationId('WPOW1', 'DEFAULT')).toBe('WPOW1');
    expect(sanitizeStationId('KSEA', 'DEFAULT')).toBe('KSEA');
    expect(sanitizeStationId('9447130', 'DEFAULT')).toBe('9447130');
  });

  it('should return default for undefined input', () => {
    expect(sanitizeStationId(undefined, 'DEFAULT')).toBe('DEFAULT');
  });

  it('should remove special characters', () => {
    expect(sanitizeStationId('WPOW1!', 'DEFAULT')).toBe('WPOW1');
    expect(sanitizeStationId('K-SEA', 'DEFAULT')).toBe('KSEA');
    expect(sanitizeStationId('test@123', 'DEFAULT')).toBe('test123');
  });

  it('should sanitize path traversal attempts', () => {
    expect(sanitizeStationId('../WPOW1', 'DEFAULT')).toBe('WPOW1');
    expect(sanitizeStationId('../../etc/passwd', 'DEFAULT')).toBe('etcpasswd');
  });

  it('should sanitize URL injection attempts', () => {
    expect(sanitizeStationId('http://evil.com', 'DEFAULT', 20)).toBe(
      'httpevilcom'
    );
  });

  it('should truncate long IDs', () => {
    const result = sanitizeStationId('VERYLONGSTATIONID123', 'DEFAULT', 10);
    expect(result.length).toBeLessThanOrEqual(10);
    expect(result).toBe('VERYLONGST');
  });

  it('should return default for IDs that become empty after sanitization', () => {
    expect(sanitizeStationId('!!!', 'DEFAULT')).toBe('DEFAULT');
    expect(sanitizeStationId('---', 'DEFAULT')).toBe('DEFAULT');
    expect(sanitizeStationId('...', 'DEFAULT')).toBe('DEFAULT');
  });

  it('should handle mixed valid and invalid characters', () => {
    expect(sanitizeStationId('WPOW-1', 'DEFAULT')).toBe('WPOW1');
    expect(sanitizeStationId('K_SEA', 'DEFAULT')).toBe('KSEA');
    expect(sanitizeStationId('9447-130', 'DEFAULT')).toBe('9447130');
  });

  it('should respect custom max length', () => {
    expect(sanitizeStationId('WPOW1', 'DEFAULT', 4)).toBe('WPOW');
    expect(sanitizeStationId('VERYLONGID', 'DEFAULT', 5)).toBe('VERYL');
  });

  it('should handle whitespace', () => {
    expect(sanitizeStationId(' WPOW1 ', 'DEFAULT')).toBe('WPOW1');
    expect(sanitizeStationId('W P O W 1', 'DEFAULT')).toBe('WPOW1');
  });
});

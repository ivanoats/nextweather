import NWSDateToJSDate from '../../src/util/nws-date-to-js-date';

describe('NWSDateToJSDate', () => {
  it('converts valid NWS date string to formatted date/time', () => {
    const nwsDate = '2026-02-10T15:45:00Z';
    const result = NWSDateToJSDate(nwsDate);

    // Result should be a string with date and time
    expect(typeof result).toBe('string');
    expect(result).toContain('/');
    expect(result).toContain(':');
  });

  it('converts ISO 8601 date string to formatted date/time', () => {
    const isoDate = '2026-02-11T19:00:00-08:00';
    const result = NWSDateToJSDate(isoDate);

    expect(typeof result).toBe('string');
    expect(result).toContain('/');
    expect(result).toContain(':');
  });

  it('returns original string when date is invalid', () => {
    const invalidDate = 'invalid-date-string';
    const result = NWSDateToJSDate(invalidDate);

    expect(result).toBe(invalidDate);
  });

  it('returns original string for empty string', () => {
    const emptyDate = '';
    const result = NWSDateToJSDate(emptyDate);

    expect(result).toBe(emptyDate);
  });

  it('handles various valid date formats', () => {
    const testDates = [
      '2026-02-10',
      '2026-02-10T12:00:00',
      '2026-02-10T12:00:00.000Z',
      'Feb 10, 2026',
    ];

    testDates.forEach((date) => {
      const result = NWSDateToJSDate(date);
      expect(typeof result).toBe('string');
      // Valid dates should be converted to formatted strings
      expect(result).not.toBe(date);
    });
  });

  it('handles unparseable strings', () => {
    const testDates = ['not a date', '99999999', 'random text'];

    testDates.forEach((date) => {
      const result = NWSDateToJSDate(date);
      // Invalid dates should return original string
      expect(result).toBe(date);
    });
  });
});

import { generateForecastSummary } from '../../src/util/forecast-summary';
import type { ForecastPeriod } from '../../src/util/forecast-summary';

describe('generateForecastSummary', () => {
  const createMockPeriod = (
    windSpeed: string,
    temperature: number,
    shortForecast: string,
    isDaytime = true
  ): ForecastPeriod => ({
    startTime: '2024-01-15T09:00:00-08:00',
    endTime: '2024-01-15T10:00:00-08:00',
    windSpeed,
    windDirection: 'NW',
    shortForecast,
    temperature,
    temperatureUnit: 'F',
    isDaytime,
  });

  it('should return message for empty periods', () => {
    const summary = generateForecastSummary([]);
    expect(summary).toBe('No forecast data available.');
  });

  it('should generate excited message for sustained high wind over 12mph', () => {
    const periods = [
      createMockPeriod('15 mph', 65, 'Sunny'),
      createMockPeriod('16 mph', 66, 'Sunny'),
      createMockPeriod('14 mph', 64, 'Sunny'),
      createMockPeriod('15 mph', 65, 'Sunny'),
    ];

    const summary = generateForecastSummary(periods);

    // Should contain one of the excited openings or positive words
    expect(
      summary.includes('Sweet!') ||
        summary.includes('Nice!') ||
        summary.includes('Perfect!') ||
        summary.includes('Excellent!') ||
        summary.includes('sick waves') ||
        summary.includes('good!') ||
        summary.includes('Not bad!') ||
        summary.includes('Decent!')
    ).toBe(true);

    // Should mention wind
    expect(summary.toLowerCase()).toContain('wind');

    // Should be enthusiastic (contains emoji or exclamation)
    expect(/🎉|🚀|⛵|🏄|🌊|!/u.test(summary)).toBe(true);
  });

  it('should generate epic message for very high sustained wind', () => {
    const periods = [
      createMockPeriod('22 mph', 60, 'Partly Cloudy'),
      createMockPeriod('24 mph', 61, 'Partly Cloudy'),
      createMockPeriod('23 mph', 60, 'Partly Cloudy'),
      createMockPeriod('25 mph', 62, 'Partly Cloudy'),
    ];

    const summary = generateForecastSummary(periods);

    // Should be very excited - check for any enthusiastic words or emoji
    expect(
      summary.includes('EPIC') ||
        summary.includes('MAJOR') ||
        summary.includes('MASSIVE') ||
        summary.includes('WILD') ||
        summary.includes('WHOA') ||
        summary.includes('PUMPED') ||
        /🔥|⚡|💨/u.test(summary)
    ).toBe(true);
  });

  it('should generate calm message for light wind under 12mph', () => {
    const periods = [
      createMockPeriod('6 mph', 70, 'Sunny'),
      createMockPeriod('7 mph', 71, 'Sunny'),
      createMockPeriod('5 mph', 69, 'Sunny'),
      createMockPeriod('8 mph', 72, 'Sunny'),
    ];

    const summary = generateForecastSummary(periods);

    // Should be calmer (not overly excited)
    expect(/EPIC|MAJOR|MASSIVE|sick waves/i.test(summary)).toBe(false);

    // Should mention light/gentle/mellow conditions
    expect(
      summary.toLowerCase().includes('light') ||
        summary.toLowerCase().includes('gentle') ||
        summary.toLowerCase().includes('mellow') ||
        summary.toLowerCase().includes('cruising') ||
        summary.toLowerCase().includes('relaxed')
    ).toBe(true);
  });

  it('should mention wind speed range when variable', () => {
    const periods = [
      createMockPeriod('8 mph', 65, 'Sunny'),
      createMockPeriod('20 mph', 66, 'Sunny'),
      createMockPeriod('15 mph', 64, 'Sunny'),
    ];

    const summary = generateForecastSummary(periods);

    // Should mention wind speed
    expect(/\d+(-\d+)?\s*mph/i.test(summary)).toBe(true);
  });

  it('should handle gusty conditions (range like "10-15 mph")', () => {
    const periods = [
      createMockPeriod('10-18 mph', 65, 'Sunny'),
      createMockPeriod('12-20 mph', 66, 'Sunny'),
      createMockPeriod('11-19 mph', 64, 'Sunny'),
    ];

    const summary = generateForecastSummary(periods);

    // Should mention gusts or be excited about wind
    expect(
      summary.toLowerCase().includes('gust') ||
        summary.toLowerCase().includes('wind')
    ).toBe(true);
  });

  it('should mention rain when present', () => {
    const periods = [
      createMockPeriod('12 mph', 55, 'Rain Showers'),
      createMockPeriod('13 mph', 54, 'Light Rain'),
      createMockPeriod('14 mph', 53, 'Rain'),
    ];

    const summary = generateForecastSummary(periods);

    expect(summary.toLowerCase()).toMatch(/rain|shower|wet/);
  });

  it('should mention storms with warning', () => {
    const periods = [
      createMockPeriod('18 mph', 60, 'Thunderstorms'),
      createMockPeriod('20 mph', 59, 'Storms'),
      createMockPeriod('16 mph', 58, 'Thunderstorms'),
    ];

    const summary = generateForecastSummary(periods);

    expect(summary.toLowerCase()).toMatch(/storm|safe|intense|check/);
  });

  it('should describe temperature context', () => {
    const warmPeriods = [
      createMockPeriod('10 mph', 80, 'Sunny'),
      createMockPeriod('11 mph', 82, 'Sunny'),
    ];

    const coolPeriods = [
      createMockPeriod('10 mph', 50, 'Sunny'),
      createMockPeriod('11 mph', 48, 'Sunny'),
    ];

    const warmSummary = generateForecastSummary(warmPeriods);
    const coolSummary = generateForecastSummary(coolPeriods);

    // Should describe temperature (warm/cool/comfortable/chilly) or weather
    expect(
      /warm|cool|comfortable|chilly|sunny|clear|beautiful|perfect/i.test(
        warmSummary
      )
    ).toBe(true);
    expect(
      /warm|cool|comfortable|chilly|sunny|clear|beautiful|perfect/i.test(
        coolSummary
      )
    ).toBe(true);
  });

  it('should include action recommendation', () => {
    const goodPeriods = [
      createMockPeriod('15 mph', 70, 'Sunny'),
      createMockPeriod('16 mph', 71, 'Sunny'),
      createMockPeriod('17 mph', 72, 'Sunny'),
      createMockPeriod('16 mph', 71, 'Sunny'),
    ];

    const summary = generateForecastSummary(goodPeriods);

    // Should have some kind of recommendation/action
    expect(
      summary.includes('Get out') ||
        summary.includes('shred') ||
        summary.includes('session') ||
        summary.includes('action') ||
        summary.includes('cruising') ||
        summary.includes('water') ||
        summary.includes('day')
    ).toBe(true);
  });

  it('should provide consistent structure', () => {
    const periods = [
      createMockPeriod('13 mph', 65, 'Partly Cloudy'),
      createMockPeriod('14 mph', 66, 'Partly Cloudy'),
      createMockPeriod('15 mph', 64, 'Partly Cloudy'),
    ];

    const summary = generateForecastSummary(periods);

    // Should be a single paragraph with multiple sentences
    expect(summary.split('.').length).toBeGreaterThanOrEqual(3);

    // Should contain common emoji used (fire, wave, wind, etc.)
    expect(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/u.test(summary)).toBe(true);
  });
});

import { generateForecastSummary } from '../../src/util/forecast-summary';
import type {
  ForecastPeriod,
  CurrentConditions,
} from '../../src/util/forecast-summary';

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
    // Check for keywords from any of the possible action recommendations
    expect(
      summary.includes('Get out') ||
        summary.includes('shred') ||
        summary.includes('session') ||
        summary.includes('action') ||
        summary.includes('cruising') ||
        summary.includes('water') ||
        summary.includes('day') ||
        summary.includes('play') ||
        summary.includes('paddle') ||
        summary.includes('beginners') ||
        summary.includes('Decent') ||
        summary.includes('conditions')
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

  describe('with current conditions', () => {
    it('should tone down excitement when current wind is significantly better than forecast', () => {
      const periods = [
        createMockPeriod('14 mph', 65, 'Sunny'),
        createMockPeriod('15 mph', 66, 'Sunny'),
        createMockPeriod('13 mph', 64, 'Sunny'),
        createMockPeriod('14 mph', 65, 'Sunny'),
      ];

      const currentConditions: CurrentConditions = {
        windSpeed: 22, // Currently much stronger than 14 mph forecast average
        windGust: 26,
        windDirection: 320,
      };

      const summary = generateForecastSummary(periods, currentConditions);

      // Should NOT be overly excited since current is better
      expect(
        summary.includes('EPIC') ||
          summary.includes('MAJOR') ||
          summary.includes('MASSIVE') ||
          summary.includes('sick waves')
      ).toBe(false);

      // Should indicate conditions staying good or better, or enjoying current conditions
      expect(
        summary.toLowerCase().includes('still') ||
          summary.toLowerCase().includes('steady') ||
          summary.toLowerCase().includes('holding') ||
          summary.toLowerCase().includes('staying') ||
          summary.toLowerCase().includes('consistent') ||
          summary.toLowerCase().includes('currently better') ||
          summary.toLowerCase().includes('enjoy') ||
          summary.toLowerCase().includes('making the most')
      ).toBe(true);
    });

    it('should emphasize steady conditions when current and forecast are similar', () => {
      const periods = [
        createMockPeriod('15 mph', 65, 'Sunny'),
        createMockPeriod('16 mph', 66, 'Sunny'),
        createMockPeriod('14 mph', 64, 'Sunny'),
        createMockPeriod('15 mph', 65, 'Sunny'),
      ];

      const currentConditions: CurrentConditions = {
        windSpeed: 16, // Similar to 15 mph forecast average (within 3 mph)
        windGust: 20,
        windDirection: 320,
      };

      const summary = generateForecastSummary(periods, currentConditions);

      // Should emphasize steady/consistent conditions
      expect(
        summary.toLowerCase().includes('steady') ||
          summary.toLowerCase().includes('consistent') ||
          summary.toLowerCase().includes('holding')
      ).toBe(true);
    });

    it('should handle middle-ground wind differences between similar and significant', () => {
      // Forecast slightly better than current (difference = +4 mph)
      const slightlyBetterPeriods = [
        createMockPeriod('21 mph', 60, 'Partly Cloudy'),
        createMockPeriod('21 mph', 61, 'Partly Cloudy'),
        createMockPeriod('21 mph', 60, 'Partly Cloudy'),
        createMockPeriod('21 mph', 62, 'Partly Cloudy'),
      ];

      const currentSlightlyLower: CurrentConditions = {
        windSpeed: 17, // 4 mph lower than ~21 mph forecast average
        windGust: 20,
        windDirection: 320,
      };

      const summarySlightlyBetter = generateForecastSummary(
        slightlyBetterPeriods,
        currentSlightlyLower
      );

      expect(typeof summarySlightlyBetter).toBe('string');
      expect(summarySlightlyBetter.length).toBeGreaterThan(0);

      // Forecast slightly worse than current (difference = -4 mph)
      const slightlyWorsePeriods = [
        createMockPeriod('13 mph', 60, 'Partly Cloudy'),
        createMockPeriod('13 mph', 61, 'Partly Cloudy'),
        createMockPeriod('13 mph', 60, 'Partly Cloudy'),
        createMockPeriod('13 mph', 62, 'Partly Cloudy'),
      ];

      const currentSlightlyHigher: CurrentConditions = {
        windSpeed: 17, // 4 mph higher than ~13 mph forecast average
        windGust: 20,
        windDirection: 320,
      };

      const summarySlightlyWorse = generateForecastSummary(
        slightlyWorsePeriods,
        currentSlightlyHigher
      );

      expect(typeof summarySlightlyWorse).toBe('string');
      expect(summarySlightlyWorse.length).toBeGreaterThan(0);
    });
    it('should be excited when forecast is better than current conditions', () => {
      const periods = [
        createMockPeriod('22 mph', 60, 'Partly Cloudy'),
        createMockPeriod('24 mph', 61, 'Partly Cloudy'),
        createMockPeriod('23 mph', 60, 'Partly Cloudy'),
        createMockPeriod('25 mph', 62, 'Partly Cloudy'),
      ];

      const currentConditions: CurrentConditions = {
        windSpeed: 12, // Currently light, forecast shows improvement to ~23.5 mph
        windGust: 15,
        windDirection: 320,
      };

      const summary = generateForecastSummary(periods, currentConditions);

      // Should be excited about incoming wind (either epic level or high level)
      expect(
        summary.includes('Sweet!') ||
          summary.includes('Nice!') ||
          summary.includes('Perfect!') ||
          summary.includes('Excellent!') ||
          summary.includes('sick waves') ||
          summary.includes('EPIC') ||
          summary.includes('MAJOR') ||
          summary.includes('MASSIVE') ||
          summary.includes('WILD') ||
          /🎉|🚀|⛵|🏄|🔥|⚡|💨/u.test(summary)
      ).toBe(true);
    });

    it('should warn about dying wind when forecast is lighter than current', () => {
      const periods = [
        createMockPeriod('8 mph', 65, 'Sunny'),
        createMockPeriod('7 mph', 66, 'Sunny'),
        createMockPeriod('6 mph', 64, 'Sunny'),
        createMockPeriod('7 mph', 65, 'Sunny'),
      ];

      const currentConditions: CurrentConditions = {
        windSpeed: 15, // Currently good, but forecast shows it dropping
        windGust: 18,
        windDirection: 320,
      };

      const summary = generateForecastSummary(periods, currentConditions);

      // Should mention easing/mellowing/lighter conditions
      expect(
        summary.toLowerCase().includes('ease') ||
          summary.toLowerCase().includes('mellow') ||
          summary.toLowerCase().includes('lighter') ||
          summary.toLowerCase().includes('currently better')
      ).toBe(true);
    });

    it('should work without current conditions (backwards compatibility)', () => {
      const periods = [
        createMockPeriod('15 mph', 65, 'Sunny'),
        createMockPeriod('16 mph', 66, 'Sunny'),
        createMockPeriod('14 mph', 64, 'Sunny'),
        createMockPeriod('15 mph', 65, 'Sunny'),
      ];

      // No current conditions provided
      const summary = generateForecastSummary(periods);

      // Should still generate a valid summary
      expect(summary).toBeTruthy();
      expect(summary.length).toBeGreaterThan(0);
      expect(summary.toLowerCase()).toContain('wind');
    });

    it('should handle missing wind speed in current conditions', () => {
      const periods = [
        createMockPeriod('15 mph', 65, 'Sunny'),
        createMockPeriod('16 mph', 66, 'Sunny'),
        createMockPeriod('14 mph', 64, 'Sunny'),
      ];

      const currentConditions: CurrentConditions = {
        windSpeed: undefined,
        windGust: 18,
        windDirection: 320,
      };

      const summary = generateForecastSummary(periods, currentConditions);

      // Should generate normal excited forecast without comparison
      expect(summary).toBeTruthy();
      expect(summary.length).toBeGreaterThan(0);
    });

    it('should handle epic wind forecast with lower current conditions', () => {
      const periods = [
        createMockPeriod('24 mph', 60, 'Partly Cloudy'),
        createMockPeriod('26 mph', 61, 'Partly Cloudy'),
        createMockPeriod('25 mph', 60, 'Partly Cloudy'),
        createMockPeriod('27 mph', 62, 'Partly Cloudy'),
      ];

      const currentConditions: CurrentConditions = {
        windSpeed: 15,
        windGust: 18,
        windDirection: 320,
      };

      const summary = generateForecastSummary(periods, currentConditions);

      // Should be very excited about incoming epic wind
      expect(
        summary.includes('EPIC') ||
          summary.includes('MAJOR') ||
          summary.includes('MASSIVE') ||
          summary.includes('WILD') ||
          /🔥|⚡|💨/u.test(summary)
      ).toBe(true);
    });

    it('should warn about gusty conditions when gusts are significantly higher', () => {
      const periods = [
        createMockPeriod('15 mph', 65, 'Sunny'),
        createMockPeriod('16 mph', 66, 'Sunny'),
        createMockPeriod('14 mph', 64, 'Sunny'),
      ];

      const currentConditions: CurrentConditions = {
        windSpeed: 12, // Current wind speed
        windGust: 25, // Gusts 13 mph higher - significant
        windDirection: 320,
      };

      const summary = generateForecastSummary(periods, currentConditions);

      // Should include gusty warning
      expect(summary).toContain('Watch for strong gusts');
    });

    it('should not warn about gusts when difference is not significant', () => {
      const periods = [
        createMockPeriod('15 mph', 65, 'Sunny'),
        createMockPeriod('16 mph', 66, 'Sunny'),
        createMockPeriod('14 mph', 64, 'Sunny'),
      ];

      const currentConditions: CurrentConditions = {
        windSpeed: 12,
        windGust: 18, // Only 6 mph higher - not significant enough
        windDirection: 320,
      };

      const summary = generateForecastSummary(periods, currentConditions);

      // Should NOT include gusty warning
      expect(summary).not.toContain('Watch for strong gusts');
    });

    it('should handle exactly 5 mph difference as significant', () => {
      const periods = [
        createMockPeriod('20 mph', 60, 'Partly Cloudy'),
        createMockPeriod('20 mph', 61, 'Partly Cloudy'),
        createMockPeriod('20 mph', 60, 'Partly Cloudy'),
      ];

      const currentConditions: CurrentConditions = {
        windSpeed: 15, // Exactly 5 mph lower than forecast
        windGust: 18,
        windDirection: 320,
      };

      const summary = generateForecastSummary(periods, currentConditions);

      // Should be treated as forecast stronger (excited)
      expect(
        summary.includes('Sweet!') ||
          summary.includes('Nice!') ||
          summary.includes('Perfect!') ||
          summary.includes('Excellent!') ||
          summary.includes('sick waves') ||
          summary.includes('EPIC') ||
          summary.includes('MAJOR') ||
          /🎉|🚀|⛵|🏄|🔥|⚡/u.test(summary)
      ).toBe(true);
    });
  });
});

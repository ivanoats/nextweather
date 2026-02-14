import endpoint from 'src/pages/api/forecast';
import { testApiHandler } from 'next-test-api-route-handler';
import axios from 'axios';
import cache from '../../../src/util/cache';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('/api/forecast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cache.clear();
  });

  it('returns hourly forecast periods', async () => {
    // Mock NWS station lookup (returns coordinates)
    const mockStationResponse = {
      geometry: {
        type: 'Point',
        coordinates: [-122.3972, 47.6606],
      },
    };

    // Mock NWS points lookup (returns forecast URL)
    const mockPointsResponse = {
      properties: {
        forecastHourly:
          'https://api.weather.gov/gridpoints/SEW/124,67/forecast/hourly',
        gridId: 'SEW',
        gridX: 124,
        gridY: 67,
      },
    };

    // Mock NWS hourly forecast
    const mockForecastResponse = {
      properties: {
        periods: [
          {
            startTime: '2026-02-11T19:00:00-08:00',
            endTime: '2026-02-11T20:00:00-08:00',
            windSpeed: '10 mph',
            windDirection: 'S',
            shortForecast: 'Partly Cloudy',
            temperature: 48,
            temperatureUnit: 'F',
            isDaytime: false,
          },
          {
            startTime: '2026-02-11T20:00:00-08:00',
            endTime: '2026-02-11T21:00:00-08:00',
            windSpeed: '12 mph',
            windDirection: 'SSW',
            shortForecast: 'Mostly Cloudy',
            temperature: 47,
            temperatureUnit: 'F',
            isDaytime: false,
          },
        ],
      },
    };

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockStationResponse })
      .mockResolvedValueOnce({ data: mockPointsResponse })
      .mockResolvedValueOnce({ data: mockForecastResponse });

    await testApiHandler({
      pagesHandler: endpoint,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toHaveProperty('stationId', 'WPOW1');
        expect(body).toHaveProperty('latitude', 47.6606);
        expect(body).toHaveProperty('longitude', -122.3972);
        expect(body).toHaveProperty('periods');
        expect(body.periods).toHaveLength(2);
        expect(body.periods[0]).toHaveProperty('windSpeed', '10 mph');
        expect(body.periods[0]).toHaveProperty('windDirection', 'S');
        expect(body.periods[0]).toHaveProperty(
          'shortForecast',
          'Partly Cloudy'
        );
        expect(body.periods[0]).toHaveProperty('temperature', 48);
      },
    });
  });

  it('returns 500 when station lookup fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Station not found'));

    await testApiHandler({
      pagesHandler: endpoint,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body).toHaveProperty('errors');
        expect(body.errors.length).toBeGreaterThan(0);
      },
    });
  });

  it('accepts a custom station query parameter', async () => {
    const mockStationResponse = {
      geometry: {
        type: 'Point',
        coordinates: [-122.5, 48.0],
      },
    };

    const mockPointsResponse = {
      properties: {
        forecastHourly:
          'https://api.weather.gov/gridpoints/SEW/120,80/forecast/hourly',
        gridId: 'SEW',
        gridX: 120,
        gridY: 80,
      },
    };

    const mockForecastResponse = {
      properties: {
        periods: [
          {
            startTime: '2026-02-11T19:00:00-08:00',
            endTime: '2026-02-11T20:00:00-08:00',
            windSpeed: '15 mph',
            windDirection: 'NW',
            shortForecast: 'Clear',
            temperature: 42,
            temperatureUnit: 'F',
            isDaytime: false,
          },
        ],
      },
    };

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockStationResponse })
      .mockResolvedValueOnce({ data: mockPointsResponse })
      .mockResolvedValueOnce({ data: mockForecastResponse });

    await testApiHandler({
      pagesHandler: endpoint,
      url: '/api/forecast?station=SISW1',
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.stationId).toBe('SISW1');
      },
    });
  });

  it('handles error without message property', async () => {
    // Mock an error that doesn't have a message property
    mockedAxios.get.mockRejectedValueOnce({ code: 'ECONNREFUSED' });

    await testApiHandler({
      pagesHandler: endpoint,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body).toHaveProperty('errors');
        expect(body.errors).toContain('Internal error');
      },
    });
  });
});

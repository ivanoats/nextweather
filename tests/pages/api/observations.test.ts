import endpoint from 'src/pages/api/observations';
import { testApiHandler } from 'next-test-api-route-handler';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('/api/observations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns observation data with default station', async () => {
    const mockObservationData = {
      '@context': ['https://geojson.org/geojson-ld/geojson-context.jsonld'],
      type: 'FeatureCollection' as const,
      features: [
        {
          id: 'https://api.weather.gov/stations/KSEA/observations/2026-02-12T15:00:00+00:00',
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [-122.44, 47.66] as [number, number],
          },
          properties: {
            '@id': 'https://api.weather.gov/stations/KSEA/observations/2026-02-12T15:00:00+00:00',
            '@type': 'wx:ObservationStation',
            elevation: { unitCode: 'wmoUnit:m', value: 3, qualityControl: 'V' },
            station: 'https://api.weather.gov/stations/KSEA',
            stationId: 'KSEA',
            stationName: 'Seattle',
            timestamp: '2026-02-12T15:00:00+00:00',
            rawMessage: '',
            textDescription: '',
            icon: null,
            presentWeather: [],
            temperature: { unitCode: 'wmoUnit:degC', value: 10, qualityControl: 'V' },
            dewpoint: { unitCode: 'wmoUnit:degC', value: 5, qualityControl: 'V' },
            windSpeed: { unitCode: 'wmoUnit:km_h-1', value: 5, qualityControl: 'V' },
            windDirection: { unitCode: 'wmoUnit:degree_(angle)', value: 180, qualityControl: 'V' },
            windGust: { unitCode: 'wmoUnit:km_h-1', value: null, qualityControl: 'Z' },
          },
        },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: mockObservationData,
    });

    await testApiHandler({
      pagesHandler: endpoint,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const body = await res.json();

        expect(body).toHaveProperty('statusCode', 200);
        expect(body).toHaveProperty('body');
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'https://api.weather.gov/stations/KSEA/observations'
        );
      },
    });
  });

  it('uses custom station query parameter', async () => {
    const mockObservationData = {
      '@context': ['https://geojson.org/geojson-ld/geojson-context.jsonld'],
      type: 'FeatureCollection' as const,
      features: [],
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: mockObservationData,
    });

    await testApiHandler({
      pagesHandler: endpoint,
      params: { station: 'WPOW1' },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
        });
        const body = await res.json();

        expect(body).toHaveProperty('statusCode', 200);
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'https://api.weather.gov/stations/WPOW1/observations'
        );
      },
    });
  });

  it('handles API errors gracefully', async () => {
    const mockError = new Error('Network error');

    mockedAxios.get.mockRejectedValueOnce(mockError);

    await testApiHandler({
      pagesHandler: endpoint,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const body = await res.json();

        expect(body).toHaveProperty('statusCode', 500);
        expect(body.body).toHaveProperty('message', 'Network error');
        expect(body.body).toHaveProperty('error');
      },
    });
  });

  it('returns valid response structure', async () => {
    const mockObservationData = {
      '@context': ['https://geojson.org/geojson-ld/geojson-context.jsonld'],
      type: 'FeatureCollection' as const,
      features: [
        {
          id: 'https://api.weather.gov/stations/WPOW1/observations/2026-02-10T15:00:00+00:00',
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [-122.44, 47.66] as [number, number],
          },
          properties: {
            '@id': 'https://api.weather.gov/stations/WPOW1/observations/2026-02-10T15:00:00+00:00',
            '@type': 'wx:ObservationStation',
            elevation: { unitCode: 'wmoUnit:m', value: 3, qualityControl: 'V' },
            station: 'https://api.weather.gov/stations/WPOW1',
            stationId: 'WPOW1',
            stationName: 'West Point',
            timestamp: '2026-02-10T15:00:00+00:00',
            rawMessage: '',
            textDescription: '',
            icon: null,
            presentWeather: [],
            temperature: { unitCode: 'wmoUnit:degC', value: 12.5, qualityControl: 'V' },
            dewpoint: { unitCode: 'wmoUnit:degC', value: null, qualityControl: 'Z' },
            windSpeed: { unitCode: 'wmoUnit:km_h-1', value: 10, qualityControl: 'V' },
            windDirection: { unitCode: 'wmoUnit:degree_(angle)', value: 180, qualityControl: 'V' },
            windGust: { unitCode: 'wmoUnit:km_h-1', value: null, qualityControl: 'Z' },
          },
        },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: mockObservationData,
    });

    await testApiHandler({
      pagesHandler: endpoint,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const body = await res.json();

        expect(body.statusCode).toBe(200);
        expect(body.body).toBeDefined();
        expect(typeof body.body).toBe('object');
      },
    });
  });
});

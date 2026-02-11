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
      '@context': 'https://geojson.org/geojson-ld/geojson-context.jsonld',
      type: 'FeatureCollection',
      features: [
        {
          properties: {
            temperature: { value: 10 },
            windSpeed: { value: 5 },
            windDirection: { value: 180 },
          },
        },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: JSON.stringify(mockObservationData),
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
      features: [],
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: JSON.stringify(mockObservationData),
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
        expect(body).toHaveProperty('body');
        expect(body.body).toBeDefined();
      },
    });
  });

  it('returns valid response structure', async () => {
    const mockObservationData = {
      features: [
        {
          properties: {
            timestamp: '2026-02-10T15:00:00+00:00',
            temperature: { value: 12.5 },
          },
        },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: JSON.stringify(mockObservationData),
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

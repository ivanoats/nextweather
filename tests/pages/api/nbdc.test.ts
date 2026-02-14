import endpoint from 'src/pages/api/nbdc';
import { testApiHandler } from 'next-test-api-route-handler';
import axios from 'axios';
import cache from '../../../src/util/cache';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('/api/csv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cache.clear();
  });

  it('returns key weather properties', async () => {
    // Mock NDBC weather data (space-delimited text format)
    const mockNdbcData = `#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s  m      sec   sec degT  hPa   degC  degC  degC  nmi  hPa   ft
2026 02 11 19 00  180  5.0  7.0  MM     MM    MM  MM   1013.5 10.5  MM    MM   MM   MM    MM`;

    // Mock current tide data
    const mockCurrentTide = {
      metadata: {
        id: '9447130',
        name: 'Seattle',
        lat: '47.6062',
        lon: '-122.3321',
      },
      data: [
        {
          t: '2026-02-11 18:54',
          v: '8.5',
          s: '0.1',
          f: '0,0,0,0',
          q: 'p',
        },
      ],
    };

    // Mock tide predictions
    const mockTidePredictions = {
      predictions: [
        {
          t: '2026-02-11 22:30',
          v: '10.2',
          type: 'H',
        },
        {
          t: '2026-02-12 04:15',
          v: '2.5',
          type: 'L',
        },
      ],
    };

    // Setup axios mocks for all three API calls
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockNdbcData })
      .mockResolvedValueOnce({ data: mockCurrentTide })
      .mockResolvedValueOnce({ data: mockTidePredictions });

    await testApiHandler({
      pagesHandler: endpoint,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const body = await res.json();
        // Core weather data should always be present
        expect(body).toHaveProperty('stationId');
        expect(body).toHaveProperty('windDirection');
        expect(body).toHaveProperty('windSpeed');
        expect(body).toHaveProperty('windGust');
        expect(body).toHaveProperty('airTemp');
        // Tide data may vary based on API availability
        expect(body).toHaveProperty('nextTide');
        expect(body).toHaveProperty('nextTideAfter');
      },
    });
  });

  it('handles weather data fetch failure', async () => {
    // Mock axios to fail on weather data but succeed on tide data
    mockedAxios.get
      .mockRejectedValueOnce(new Error('NDBC service unavailable'))
      .mockResolvedValueOnce({
        data: {
          metadata: { id: '9447130', name: 'Seattle' },
          data: [{ t: '2026-02-11 18:54', v: '8.5' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          predictions: [
            { t: '2026-02-11 22:30', v: '10.2', type: 'H' },
            { t: '2026-02-12 04:15', v: '2.5', type: 'L' },
          ],
        },
      });

    await testApiHandler({
      pagesHandler: endpoint,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body).toHaveProperty('errors');
        expect(body.errors).toHaveLength(1);
      },
    });
  });

  it('handles tide data fetch failure', async () => {
    const mockNdbcData = `#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s  m      sec   sec degT  hPa   degC  degC  degC  nmi  hPa   ft
2026 02 11 19 00  180  5.0  7.0  MM     MM    MM  MM   1013.5 10.5  MM    MM   MM   MM    MM`;

    // Mock axios: weather succeeds, tide fails
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockNdbcData })
      .mockRejectedValueOnce(new Error('Tide service unavailable'))
      .mockRejectedValueOnce(new Error('Tide predictions unavailable'));

    await testApiHandler({
      pagesHandler: endpoint,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body).toHaveProperty('errors');
        expect(body.errors.length).toBeGreaterThan(0);
      },
    });
  });

  it('handles empty NDBC data', async () => {
    const emptyNdbcData = `#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s  m      sec   sec degT  hPa   degC  degC  degC  nmi  hPa   ft`;

    mockedAxios.get
      .mockResolvedValueOnce({ data: emptyNdbcData })
      .mockResolvedValueOnce({
        data: {
          metadata: { id: '9447130' },
          data: [{ t: '2026-02-11 18:54', v: '8.5' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          predictions: [{ t: '2026-02-11 22:30', v: '10.2', type: 'H' }],
        },
      });

    await testApiHandler({
      pagesHandler: endpoint,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body).toHaveProperty('errors');
      },
    });
  });

  it('handles custom station query parameters', async () => {
    const mockNdbcData = `#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s  m      sec   sec degT  hPa   degC  degC  degC  nmi  hPa   ft
2026 02 11 19 00  180  5.0  7.0  MM     MM    MM  MM   1013.5 10.5  MM    MM   MM   MM    MM`;

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockNdbcData })
      .mockResolvedValueOnce({
        data: {
          metadata: { id: 'CUSTOM2' },
          data: [{ t: '2026-02-11 18:54', v: '8.5' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          predictions: [
            { t: '2026-02-11 22:30', v: '10.2', type: 'H' },
            { t: '2026-02-12 04:15', v: '2.5', type: 'L' },
          ],
        },
      });

    await testApiHandler({
      pagesHandler: endpoint,
      params: { station: 'CUSTOM1', tideStation: 'CUSTOM2' },
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.stationId).toBe('CUSTOM1');
        // currentTide should use the tide station data
        expect(body.currentTide).toBe('8.5');
      },
    });
  });

  it('parses missing values (MM) as null', async () => {
    // All MM values (missing data)
    const mockNdbcDataWithMissing = `#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s  m      sec   sec degT  hPa   degC  degC  degC  nmi  hPa   ft
2026 02 11 19 00  MM   MM   MM   MM     MM    MM  MM   1013.5 MM    MM    MM   MM   MM    MM`;

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockNdbcDataWithMissing })
      .mockResolvedValueOnce({
        data: {
          metadata: { id: '9447130' },
          data: [{ t: '2026-02-11 18:54', v: '8.5' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          predictions: [{ t: '2026-02-11 22:30', v: '10.2', type: 'H' }],
        },
      });

    await testApiHandler({
      pagesHandler: endpoint,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.stationId).toBe('WPOW1');
        // windSpeed, windGust, windDirection, airTemp should not be present
        expect(body.windSpeed).toBeUndefined();
        expect(body.windGust).toBeUndefined();
        expect(body.windDirection).toBeUndefined();
        expect(body.airTemp).toBeUndefined();
      },
    });
  });

  it('sanitizes station IDs to prevent SSRF attacks', async () => {
    const mockNdbcData = `#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s  m      sec   sec degT  hPa   degC  degC  degC  nmi  hPa   ft
2026 02 11 19 00  180  5.0  7.0  MM     MM    MM  MM   1013.5 10.5  MM    MM   MM   MM    MM`;

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockNdbcData })
      .mockResolvedValueOnce({
        data: {
          metadata: { id: '9447130' },
          data: [{ t: '2026-02-11 18:54', v: '8.5' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          predictions: [
            { t: '2026-02-11 22:30', v: '10.2', type: 'H' },
            { t: '2026-02-12 04:15', v: '2.5', type: 'L' },
          ],
        },
      });

    // Test with malicious input - path traversal attempt
    await testApiHandler({
      pagesHandler: endpoint,
      params: { station: '../../../etc/passwd', tideStation: '../../secret' },
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        const body = await res.json();
        // Station IDs should be sanitized to remove special characters
        expect(body.stationId).toBe('etcpasswd');

        // Verify the ACTUAL URLs called don't contain malicious patterns
        const allCalls = mockedAxios.get.mock.calls.map((call) => call[0]);

        // Ensure no call contains path traversal patterns
        expect(allCalls.every((url) => !url.includes('../'))).toBe(true);
        expect(allCalls.every((url) => !url.includes('etc/passwd'))).toBe(true);

        // Verify sanitized values were used instead
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('etcpasswd.txt')
        );
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('station=secret')
        );
      },
    });
  });

  it('blocks URL injection attempts in station parameters', async () => {
    const mockNdbcData = `#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s  m      sec   sec degT  hPa   degC  degC  degC  nmi  hPa   ft
2026 02 11 19 00  180  5.0  7.0  MM     MM    MM  MM   1013.5 10.5  MM    MM   MM   MM    MM`;

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockNdbcData })
      .mockResolvedValueOnce({
        data: {
          metadata: { id: '9447130' },
          data: [{ t: '2026-02-11 18:54', v: '8.5' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          predictions: [{ t: '2026-02-11 22:30', v: '10.2', type: 'H' }],
        },
      });

    // Test with URL injection attempt
    await testApiHandler({
      pagesHandler: endpoint,
      params: { station: 'http://evil.com/attack' },
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        const body = await res.json();
        // URL should be sanitized, removing special characters
        expect(body.stationId).toBe('httpevilco'); // truncated to max length

        // Verify no actual calls to evil.com or containing URL patterns
        const allCalls = mockedAxios.get.mock.calls.map((call) => call[0]);

        // Ensure no call attempts to reach evil.com
        expect(allCalls.every((url) => !url.includes('evil.com'))).toBe(true);
        expect(allCalls.every((url) => !url.includes('http://evil'))).toBe(
          true
        );
        expect(allCalls.every((url) => !url.includes('//evil'))).toBe(true);

        // All calls should only be to legitimate NOAA domains
        expect(
          allCalls.every(
            (url) =>
              url.includes('ndbc.noaa.gov') ||
              url.includes('tidesandcurrents.noaa.gov')
          )
        ).toBe(true);
      },
    });
  });

  it('returns cached data on subsequent requests', async () => {
    const mockNdbcData = `#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s  m      sec   sec degT  hPa   degC  degC  degC  nmi  hPa   ft
2026 02 11 19 00  180  5.0  7.0  MM     MM    MM  MM   1013.5 10.5  MM    MM   MM   MM    MM`;

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockNdbcData })
      .mockResolvedValueOnce({
        data: {
          metadata: { id: '9447130' },
          data: [{ t: '2026-02-11 18:54', v: '8.5' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          predictions: [
            { t: '2026-02-11 22:30', v: '10.2', type: 'H' },
            { t: '2026-02-12 04:15', v: '2.5', type: 'L' },
          ],
        },
      });

    // First request - should call API
    await testApiHandler({
      pagesHandler: endpoint,
      test: async ({ fetch }) => {
        const res1 = await fetch({ method: 'GET' });
        expect(res1.status).toBe(200);
        expect(res1.headers.get('X-Cache')).toBe('MISS');
        const body1 = await res1.json();
        expect(body1.windSpeed).toBeDefined();

        // Second request - should use cache
        const res2 = await fetch({ method: 'GET' });
        expect(res2.status).toBe(200);
        expect(res2.headers.get('X-Cache')).toBe('HIT');
        const body2 = await res2.json();
        expect(body2).toEqual(body1);
      },
    });

    // Verify API was only called once (3 calls for first request, 0 for second)
    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
  });

  it('caches different stations separately', async () => {
    const mockNdbcData1 = `#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s  m      sec   sec degT  hPa   degC  degC  degC  nmi  hPa   ft
2026 02 11 19 00  180  5.0  7.0  MM     MM    MM  MM   1013.5 10.5  MM    MM   MM   MM    MM`;

    const mockNdbcData2 = `#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s  m      sec   sec degT  hPa   degC  degC  degC  nmi  hPa   ft
2026 02 11 19 00  270  10.0  15.0  MM     MM    MM  MM   1015.0 15.0  MM    MM   MM   MM    MM`;

    // Mock for station1
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockNdbcData1 })
      .mockResolvedValueOnce({
        data: {
          metadata: { id: '9447130' },
          data: [{ t: '2026-02-11 18:54', v: '8.5' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          predictions: [{ t: '2026-02-11 22:30', v: '10.2', type: 'H' }],
        },
      })
      // Mock for station2
      .mockResolvedValueOnce({ data: mockNdbcData2 })
      .mockResolvedValueOnce({
        data: {
          metadata: { id: '9447131' },
          data: [{ t: '2026-02-11 18:54', v: '9.0' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          predictions: [{ t: '2026-02-11 22:45', v: '11.0', type: 'H' }],
        },
      });

    // Request station 1
    await testApiHandler({
      pagesHandler: endpoint,
      params: { station: 'STATION1', tideStation: '9447130' },
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.stationId).toBe('STATION1');
        expect(body.windDirection).toBe(180);
      },
    });

    // Request station 2 - should not use station 1's cache
    await testApiHandler({
      pagesHandler: endpoint,
      params: { station: 'STATION2', tideStation: '9447131' },
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        expect(res.headers.get('X-Cache')).toBe('MISS');
        const body = await res.json();
        expect(body.stationId).toBe('STATION2');
        expect(body.windDirection).toBe(270);
      },
    });

    // Both stations should have made API calls
    expect(mockedAxios.get).toHaveBeenCalledTimes(6);
  });
});

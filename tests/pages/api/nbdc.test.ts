import endpoint from 'src/pages/api/nbdc';
import { testApiHandler } from 'next-test-api-route-handler';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('/api/csv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});

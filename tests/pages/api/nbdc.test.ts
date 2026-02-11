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
});

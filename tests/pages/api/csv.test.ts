import endpoint from 'src/pages/api/csv';
import { testApiHandler } from 'next-test-api-route-handler';

describe('/api/csv', () => {
  it('returns key weather properties', async () => {
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

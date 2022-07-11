import endpoint from 'src/pages/api/csv';
import { testApiHandler } from 'next-test-api-route-handler';
const handler = endpoint;

describe('/api/csv', () => {
  it('returns key properties', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const body = await res.json();
        expect(body).toHaveProperty('airTemp');
        expect(body).toHaveProperty('currentTide');
        expect(body).toHaveProperty('nextTide');
        expect(body).toHaveProperty('windDirection');
        expect(body).toHaveProperty('windSpeed');
        expect(body).toHaveProperty('windGust');
      },
    });
  });
});

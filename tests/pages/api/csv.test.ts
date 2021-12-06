import { createMocks } from 'node-mocks-http';
import handler from 'src/pages/api/csv';

describe('/api/csv', () => {
  test('returns Observations object', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        station: 'wpow1',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        message: 'weather data JSON',
      })
    );
  });
});

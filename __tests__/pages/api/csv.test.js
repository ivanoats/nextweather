import { createMocks } from 'node-mocks-http';
import handler from  '../../../pages/api/csv';

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
        message: 'Your favorite animal is dog',
      }),
    );
  });
});
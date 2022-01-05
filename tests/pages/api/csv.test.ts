import endpoint from 'src/pages/api/csv';
import { testApiHandler } from 'next-test-api-route-handler';
const handler = endpoint;

describe('/api/csv', () => {
  it('returns Observations object', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        console.log(res);
        await expect(res.json()).resolves.toStrictEqual({ hello: 'world' });
      },
    });
  });
});

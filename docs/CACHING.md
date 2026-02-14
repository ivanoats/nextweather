# Server-Side Caching

NextWeather implements server-side caching to improve performance and reduce load on
external weather APIs (NOAA NDBC, NWS, Tides & Currents).

## Overview

The caching system uses a simple in-memory cache that is **portable across hosting
platforms** - no external dependencies or platform-specific services required. This makes
the caching solution work seamlessly on Netlify, Vercel, AWS Lambda, or any other Node.js
hosting environment.

## Cache Implementation

### Cache Utility

The cache is implemented in `/src/util/cache.ts` and provides:

- **In-memory storage**: Fast access with Map-based storage
- **TTL (Time To Live)**: Automatic expiration of cached data
- **Automatic cleanup**: Periodic removal of expired entries (every 60 seconds)
- **Type-safe API**: Full TypeScript support

### Cache TTL Configuration

Cache expiration times are configured based on how frequently weather data updates:

```typescript
export const CACHE_TTL = {
  OBSERVATIONS: 300, // 5 minutes - real-time weather observations
  FORECAST: 1800, // 30 minutes - weather forecasts
  TIDE_CURRENT: 300, // 5 minutes - current tide measurements
  TIDE_PREDICTIONS: 3600, // 1 hour - pre-calculated tide predictions
  NBDC: 300, // 5 minutes - buoy observations
} as const;
```

**Rationale:**

- **NDBC buoy data**: Updates every 10 minutes to hourly → 5 min cache
- **NOAA current tides**: Updates every 6 minutes → 5 min cache
- **NOAA tide predictions**: Pre-calculated, stable data → 1 hour cache
- **NWS observations**: Updates hourly or when conditions change → 5 min cache
- **NWS forecasts**: Updates every 1-6 hours → 30 min cache

### Cache Keys

Cache keys are generated based on the endpoint and station parameters to ensure:

- Different stations are cached separately
- Same station parameters always hit the same cache entry
- Query parameters are sorted for consistency

Example cache keys:

```text
nbdc:station=WPOW1&tideStation=9447130
forecast:station=WPOW1
observations:station=KSEA
```

## API Endpoints with Caching

### `/api/nbdc`

**What it caches:** Combined NDBC buoy data + current tide + tide predictions

**Cache TTL:** 5 minutes

**Cache key factors:**

- Weather station ID (e.g., `WPOW1`)
- Tide station ID (e.g., `9447130`)

**Example:**

```bash
# First request - fetches from external APIs
curl https://nextweather.example.com/api/nbdc?station=WPOW1
# Response header: X-Cache: MISS

# Second request within 5 minutes - returns cached data
curl https://nextweather.example.com/api/nbdc?station=WPOW1
# Response header: X-Cache: HIT
```

### `/api/forecast`

**What it caches:** 24-hour hourly weather forecast from NWS

**Cache TTL:** 30 minutes

**Cache key factors:**

- Weather station ID (e.g., `WPOW1`)

**Note:** This endpoint makes 3 sequential API calls to NWS (station lookup →
coordinates → forecast), so caching significantly improves performance.

### `/api/observations`

**What it caches:** Current weather observations from NWS

**Cache TTL:** 5 minutes

**Cache key factors:**

- Weather station ID (e.g., `KSEA`)

## HTTP Caching Headers

In addition to server-side caching, the API endpoints set appropriate HTTP cache headers
for browser and CDN caching:

```http
Cache-Control: public, max-age=300, s-maxage=300
X-Cache: HIT | MISS
```

- **`Cache-Control`**: Allows browsers and CDNs to cache responses
- **`max-age`**: Cache lifetime in seconds for browser cache
- **`s-maxage`**: Cache lifetime for shared caches (CDNs, proxies)
- **`X-Cache`**: Debug header indicating cache hit or miss

## Benefits

1. **Performance**: Reduced latency for users (5-30 second external API calls → <1ms
   cache hits)
2. **Reliability**: Less dependency on external API availability
3. **Cost**: Reduced bandwidth and API usage
4. **Scalability**: Handles high traffic without overwhelming external APIs
5. **Portability**: Works on any Node.js hosting platform

## Monitoring

Cache performance can be monitored via the `X-Cache` response header:

- `X-Cache: HIT` - Data served from cache
- `X-Cache: MISS` - Data fetched from external APIs and cached

## Error Handling

The cache only stores **successful responses** (status 200). Errors are not cached,
ensuring that temporary API failures don't persist in the cache.

## Input Validation & Security

All API endpoints validate station ID inputs to prevent Server-Side Request Forgery
(SSRF) attacks ([CWE-918](https://cwe.mitre.org/data/definitions/918.html)):

### Validation Rules

Station IDs must be:

- **Alphanumeric only** (a-z, A-Z, 0-9)
- **Maximum 10 characters** long
- **Non-empty**

This blocks:

- Path traversal attempts (`../`, `../../etc/passwd`)
- URL injection (`http://evil.com`, `//attacker.com`)
- Query parameter injection (`?evil=1`, `&malicious=true`)
- Special characters that could manipulate URLs

### Example

```typescript
// User input: ../../../etc/passwd
// Sanitized to: etcpasswd (special chars removed)

// User input: http://evil.com
// Sanitized to: httpevilco (special chars removed, truncated to 10 chars)

// Invalid after sanitization → falls back to default
// User input: !!!
// Result: WPOW1 (default station)
```

See `src/util/validate-station-id.ts` for implementation details.

## Testing

Comprehensive tests are included:

- Unit tests for cache utility (`tests/util/cache.test.ts`)
- Integration tests for all API endpoints with caching
- Tests for cache expiration, different stations, and concurrent requests

Run tests:

```bash
npm test
```

## Alternative Caching Solutions

While the current implementation uses in-memory caching for portability, here are
alternatives for specific hosting environments:

### Netlify

- **Netlify Edge Functions**: Built-in KV storage
- **Netlify Blobs**: Persistent storage for larger datasets

### Vercel

- **Vercel KV**: Redis-compatible key-value store
- **Next.js caching**: ISR (Incremental Static Regeneration) or data cache

### General

- **Redis**: External Redis instance for distributed caching
- **Memcached**: In-memory caching service
- **Database caching**: Use PostgreSQL, MongoDB for persistent cache

The in-memory solution was chosen for:

- Zero external dependencies
- No additional cost or configuration
- Works everywhere Node.js runs
- Sufficient for current traffic patterns

## Future Enhancements

Potential improvements:

- Cache warming: Pre-populate cache for common stations
- Adaptive TTL: Adjust cache duration based on data freshness
- Cache persistence: Optional Redis/external cache for multi-instance deployments
- Cache statistics: Track hit rates and performance metrics

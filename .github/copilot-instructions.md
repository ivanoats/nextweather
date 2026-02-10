# GitHub Copilot Instructions for NextWeather

## Project Overview
NextWeather is a specialized weather station data aggregator focused on wind and tide conditions for human-powered watercraft. The app consolidates data from multiple NOAA APIs into a unified interface.

## Core Architecture

### Data Sources & Integration Points
- **NDBC (National Data Buoy Center)**: Wind data via SOS (Sensor Observation Service) protocol at `sdf.ndbc.noaa.gov/sos/server.php`
- **NOAA Tides & Currents API**: Current tide levels and predictions via `tidesandcurrents.noaa.gov/api/datagetter`
- **National Weather Service**: Weather observations via `api.weather.gov/stations`

### API Handler Pattern (`/src/pages/api/csv.ts`)
The main data aggregator follows a specific error accumulation pattern:
```typescript
let errors = [];
let observations: Observations = {};
// Multiple try-catch blocks that push to errors array
// Return 500 with errors array if any failures occur
```

**Key Query Parameters:**
- `station`: Weather station ID (default: 'WPOW1')
- `tideStation`: Tide station ID (default: '9447130')  

### Technology Stack Specifics
- **Next.js 15** with Pages Router (not App Router)
- **React 19** with **Chakra UI v3** (uses `ChakraProvider` with `defaultSystem`)
- **TypeScript + JavaScript**: Mixed usage, with `.ts` for new features, `.js` for legacy endpoints
- **CSV Parsing**: Uses `csv-parse/sync` with custom type assertions for `unknown` data
- **Testing**: Jest with `next-test-api-route-handler` for API endpoint testing

## Development Workflows

### Critical Commands
```bash
npm run dev          # Next.js development server
npm run build        # Production build (ESLint disabled due to config issues)
npm run test         # Jest test suite
npm run storybook    # Storybook v8 development server
```

### Build Configuration Notes
- ESLint is disabled during builds (`ignoreDuringBuilds: true`) due to circular dependency issues
- Custom Jest moduleNameMapping for CSV parsing compatibility
- Storybook uses modern v8 format with `Meta` and `StoryObj` types

## Code Patterns & Conventions

### Utility Functions (`/src/util/`)
- `convert.ts`: Meters per second to MPH conversion
- `leading-zero.ts`: Zero-padding for date formatting  
- `nws-date-to-js-date.ts`: NOAA date string conversion to readable format

### Error Handling
APIs use error accumulation instead of early returns:
```typescript
try {
  // API call
} catch (error) {
  errors.push(error); // Continue processing other data sources
}
```

### CORS Configuration
Manual CORS headers in API responses:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
```

## Testing Approach
- API endpoints tested with `next-test-api-route-handler`
- Expect specific response shape: `airTemp`, `windSpeed`, `windDirection`, `windGust`, `currentTide`, `nextTide`
- Tests in `/tests/pages/api/` mirror the API structure

## Data Types
Key response structure from main API (`/api/csv`):
```typescript
type Observations = {
  stationId?: string;
  windSpeed?: number;     // Converted to MPH
  windDirection?: number; // Degrees
  windGust?: number;      // Converted to MPH  
  airTemp?: number;       // Celsius
  currentTide?: string;   // Current level
  nextTide?: string;      // Next tide prediction
  nextTideAfter?: string; // Following tide prediction
};
```

## Deployment Context
- **Netlify**: Production deployment with status badge in README
- **Environment**: Designed for real-time weather station monitoring
- **Target Users**: Kayakers, sailors, and other watercraft operators needing wind/tide conditions
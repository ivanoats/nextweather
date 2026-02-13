# GitHub Copilot Instructions for NextWeather

## Project Overview
NextWeather is a specialized weather station data aggregator focused on wind and tide conditions for human-powered watercraft — kayakers, sailors, and paddleboarders. The app consolidates data from multiple NOAA APIs into a single, glanceable interface. Data refreshes automatically every 5 minutes.

## Core Architecture

### Application Structure
```text
src/
├── pages/
│   ├── index.tsx              # Main dashboard (tabbed UI)
│   ├── _app.tsx               # ChakraProvider + global layout
│   └── api/
│       ├── nbdc.ts            # Wind + tide aggregator (primary endpoint)
│       ├── observations.ts    # NWS station observations proxy
│       └── forecast.ts        # NWS hourly forecast proxy
├── components/
│   ├── TabBar.tsx             # Tab navigation
│   ├── AboutTab.tsx           # About / info panel
│   ├── CustomTab.tsx          # Custom station selector
│   └── ForecastTab.tsx        # Hourly forecast display
└── util/
    ├── convert.ts             # Unit conversions (m/s → mph, °C → °F)
    ├── leading-zero.ts        # Zero-padding for date formatting
    └── nws-date-to-js-date.ts # NOAA date string → JS Date
```

### Data Sources & Integration Points
- **NDBC (National Data Buoy Center)**: Wind and temperature data via realtime2 text files at `www.ndbc.noaa.gov/data/realtime2/{station}.txt` (space-delimited format with 45-day history)
- **NOAA Tides & Currents API**: Current tide levels and predictions via `tidesandcurrents.noaa.gov/api/datagetter`
- **National Weather Service API**: Weather observations and hourly forecasts via `api.weather.gov`

### API Endpoints
| Endpoint | Source | Description |
| --- | --- | --- |
| `/api/nbdc?station=WPOW1&tideStation=9447130` | NDBC + NOAA T&C | Wind speed/direction/gust, air temp, tide level & predictions |
| `/api/forecast?station=KSEA` | NWS | Hourly wind & weather forecast for a station |
| `/api/observations?station=KSEA` | NWS | Latest weather observations for a station |

### API Handler Pattern (`/src/pages/api/nbdc.ts`)
The main data aggregator uses `Promise.allSettled` for parallel API calls with error accumulation:
```typescript
const [weatherResult, currentTideResult, nextTidesResult] = 
  await Promise.allSettled([...]);
const errors: unknown[] = [];
let observations: Observations = {};
// Check each result's status and accumulate errors
// Return 500 with errors array if any failures occur
```

**Key Helper Functions:**
- `parseNdbcObservations()`: Parses space-delimited NDBC realtime2 text data
- `parseValue()`: Handles NDBC missing data markers ("MM")
- `fetchWeatherData()`: Retrieves and parses NDBC observations
- `getCurrentTide()`: Gets latest tide measurement
- `getNextTides()`: Retrieves tide predictions for next 24hrs
- `setCorsHeaders()`: Applies CORS configuration

**Key Query Parameters:**
- `station`: Weather station ID (default: 'WPOW1')
- `tideStation`: Tide station ID (default: '9447130')  

### Technology Stack Specifics
- **Next.js 16** with Pages Router (not App Router)
- **React 19** with **Chakra UI v3** (uses `ChakraProvider` with `defaultSystem`) and **Framer Motion** for animations
- **Recharts**: For data visualization and charts
- **TypeScript + JavaScript**: Mixed usage, with `.ts` for new features, `.js` for legacy endpoints
- **NDBC Data Parsing**: Space-delimited text parsing with column index constants (`NDBC_COLUMNS`) for realtime2 format (MM = missing data, handled by `parseValue()` helper)
- **Testing**: Jest 30 with `next-test-api-route-handler` (uses `pagesHandler` config) for API endpoint testing
- **Commit Standards**: Commitizen + commitlint for Conventional Commits
- **Markdown Documentation**: Markdown generated should pass Markdownlint checks with standard configuration

## Development Workflows

### Prerequisites
- **Node.js** 22.x (matches `.nvmrc`)
- **npm** ≥ 9

### Critical Commands
```bash
npm run dev          # Next.js development server
npm run build        # Production build
npm run test         # Jest test suite
npm run lint         # ESLint
npm run commit       # Commitizen interactive commit prompt
npm run storybook    # Storybook 10 development server on http://localhost:6006
npm run build-storybook  # Static Storybook export
```

### Build Configuration Notes
- Custom Jest moduleNameMapping for CSV parsing compatibility
- Storybook uses modern v10 format with `Meta` and `StoryObj` types

## Code Patterns & Conventions

### Project Structure
- API routes go in `src/pages/api/`
- React components in `src/components/`
- Utility functions in `src/util/`
- Tests in `tests/` mirroring the source tree
- Storybook stories in `stories/`

### Utility Functions (`/src/util/`)
- `convert.ts`: Unit conversions (meters per second to MPH, Celsius to Fahrenheit)
- `leading-zero.ts`: Zero-padding for date formatting  
- `nws-date-to-js-date.ts`: NOAA date string conversion to readable format

### NDBC Data Constants (`/src/pages/api/nbdc.ts`)
```typescript
const NDBC_COLUMNS = {
  WDIR: 5,   // Wind direction (degrees True)
  WSPD: 6,   // Wind speed (m/s)
  GST: 7,    // Wind gust (m/s)
  ATMP: 13,  // Air temperature (°C)
} as const;
```
Column indices for parsing NDBC realtime2 space-delimited data format.

### NWS API Requirements (`/src/pages/api/forecast.ts`)
The National Weather Service API requires a User-Agent header:
```typescript
const NWS_USER_AGENT = 'NextWeather/1.0 (westpointwind.com)';
```
All NWS API requests include this header for API compliance and usage tracking.

### Error Handling
APIs use error accumulation with `Promise.allSettled` for parallel data fetching:
```typescript
const [weatherResult, currentTideResult, nextTidesResult] =
  await Promise.allSettled([...]);
  
if (weatherResult.status === 'fulfilled') {
  observations = { ...observations, ...weatherResult.value };
} else {
  errors.push(weatherResult.reason);
}
```
This pattern ensures partial data availability even when some sources fail.

### CORS Configuration
Manual CORS headers via helper function in API responses:
```typescript
const setCorsHeaders = (res: NextApiResponse): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
};
```

### Code Style
- **TypeScript** for all new source files (`.ts` / `.tsx`)
- **Prettier** for formatting
- **ESLint** with `eslint-config-next` and `eslint-config-prettier`

### Commit Convention
This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint. Use the `npm run commit` helper for a guided prompt, or write messages like:
```text
feat: add support for wave height data
fix: handle missing tide predictions gracefully
docs: update API endpoint table in README
```

This project uses [Conventional-Branch](https://conventional-branch.github.io/)

## Testing Approach
- API endpoints tested with `next-test-api-route-handler` using `pagesHandler` config
- Core weather properties: `stationId`, `windSpeed`, `windDirection`, `windGust`, `airTemp`
- Tide properties may be unavailable: `currentTide`, `nextTide`, `nextTideAfter`
- Tests in `/tests/pages/api/` mirror the API structure

## Data Types

### NBDC API (`/api/nbdc`)
```typescript
type Observations = {
  stationId?: string;
  windSpeed?: number;     // Converted to MPH
  windDirection?: number; // Degrees
  windGust?: number;      // Converted to MPH  
  airTemp?: number;       // Converted to Fahrenheit
  currentTide?: string;   // Current level
  nextTide?: string;      // Next tide prediction
  nextTideAfter?: string; // Following tide prediction
};

type Tide = {
  metadata: TideMetadata;
  data: TideDataEntity[];
};

type Predictions = {
  predictions: PredictionsEntity[];
};

type WeatherAPIerror = {
  errors: unknown[];
};
```

### Forecast API (`/api/forecast`)
**Exported Types:**
```typescript
export type ForecastPeriod = {
  startTime: string;
  endTime: string;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  temperature: number;
  temperatureUnit: string;
  isDaytime: boolean;
};

export type ForecastResponse = {
  stationId: string;
  latitude: number;
  longitude: number;
  periods: ForecastPeriod[];
};
```

### Observations API (`/api/observations`)
**Follows GeoJSON-LD specification:**
```typescript
interface WeatherValue {
  unitCode: string;
  value: number | null;
  qualityControl: string;
}

interface ObservationProperties {
  station: string;
  stationId?: string;
  timestamp: string;
  temperature: WeatherValue;
  dewpoint: WeatherValue;
  windDirection: WeatherValue;
  windSpeed: WeatherValue;
  windGust: WeatherValue;
  // ... additional optional properties
}

interface ObservationFeatureCollection {
  '@context': (string | object)[];
  type: 'FeatureCollection';
  features: ObservationFeature[];
}

type ObservationResponse = SuccessResponse | ErrorResponse;
```

### Component Types (`/src/components`)
```typescript
// TabBar.tsx
export type TabId = 'conditions' | 'forecast' | 'about' | 'custom';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ReactElement;
}

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}
```

## Features
- **Live wind observations** — speed, gust, and direction from NDBC buoy stations
- **Tide levels & predictions** — current water level plus upcoming high/low tides from NOAA Tides & Currents
- **Hourly forecast** — wind and weather forecast from the National Weather Service
- **Customizable stations** — query any NDBC or NWS station by ID
- **Responsive UI** — Chakra UI v3 with animated transitions via Framer Motion
- **Tabbed Interface** — Main dashboard with multiple tabs for different views (ForecastTab, CustomTab, AboutTab)

## Deployment Context
- **Netlify**: Production deployment with status badge in README
- **Environment**: Designed for real-time weather station monitoring with 5-minute auto-refresh
- **Target Users**: Kayakers, sailors, paddleboarders, and other watercraft operators needing wind/tide conditions
- **Data Sources**: NDBC (National Data Buoy Center), NOAA Tides & Currents, National Weather Service API
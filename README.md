# NextWeather

[![Netlify Status](https://api.netlify.com/api/v1/badges/ca0b1324-b434-41fb-8c62-1d13c0d36668/deploy-status)](https://app.netlify.com/sites/nextweather/deploys)

> Real-time wind and tide conditions for human-powered watercraft — kayakers,
> sailors, and paddleboarders.

NextWeather aggregates data from multiple NOAA APIs into a single, glanceable
interface so you can check conditions before heading out on the water. Data
refreshes automatically every 5 minutes.

## Features

- **Live wind observations** — speed, gust, and direction from NDBC buoy stations
- **Tide levels & predictions** — current water level plus upcoming high/low tides from NOAA Tides & Currents
- **Hourly forecast** — wind and weather forecast from the National Weather Service
- **Customizable stations** — query any NDBC or NWS station by ID
- **Responsive UI** — Chakra UI v3 with animated transitions via Framer Motion
- **Comprehensive TypeScript types** — Fully typed API responses with exported types for external consumers

## Architecture

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

### Data Flow

```mermaid
graph LR
    NDBC["NDBC realtime2 files"] --> nbdc["/api/nbdc"]
    TIDE["NOAA Tides & Currents API"] --> nbdc
    NWS["NWS Weather API"] --> forecast["/api/forecast"]
    NWS --> obs["/api/observations"]
    nbdc --> FE["Frontend (index.tsx)"]
    forecast --> FE
    obs --> FE
```

### API Endpoints

| Endpoint | Source | Description |
| --- | --- | --- |
| `/api/nbdc?station=WPOW1&tideStation=9447130` | NDBC + NOAA T&C | Wind speed/direction/gust, air temp, tide level & predictions |
| `/api/forecast?station=KSEA` | NWS | Hourly wind & weather forecast for a station |
| `/api/observations?station=KSEA` | NWS | Latest weather observations for a station |

#### API Implementation Details

The `/api/nbdc` endpoint uses `Promise.allSettled` for parallel data fetching:

- Fetches NDBC weather data, current tide, and tide predictions concurrently
- Accumulates errors without failing completely (partial data availability)
- Uses helper functions: `parseNdbcObservations()`, `parseValue()`, `fetchWeatherData()`, `getCurrentTide()`, `getNextTides()`

NDBC data parsing uses column index constants for the realtime2 space-delimited format:

```typescript
const NDBC_COLUMNS = {
  WDIR: 5,   // Wind direction (degrees True)
  WSPD: 6,   // Wind speed (m/s)
  GST: 7,    // Wind gust (m/s)
  ATMP: 13,  // Air temperature (°C)
} as const;
```

NWS API requests include a required User-Agent header:

```typescript
const NWS_USER_AGENT = 'NextWeather/1.0 (westpointwind.com)';
```

### Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (Pages Router) |
| UI | React 19, Chakra UI v3, Framer Motion |
| Language | TypeScript (new code) / JavaScript (legacy) |
| Charts | Recharts |
| Testing | Jest 30, React Testing Library, `next-test-api-route-handler` |
| Component Dev | Storybook 10 |
| Deployment | Netlify |
| Commit Standards | Commitizen + commitlint (Conventional Commits + Conventional Branch) |

## Getting Started

### Prerequisites

- **Node.js** 22.x (matches `.nvmrc`)
- **npm** ≥ 9

### Installation

```bash
git clone https://github.com/ivanoats/nextweather.git
cd nextweather
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. The page auto-updates as you edit files.

### Other Commands

```bash
npm test              # Run Jest test suite
npm run build         # Production build
npm run lint          # ESLint
npm run commit        # Commitizen interactive commit prompt
npm run storybook     # Storybook on http://localhost:6006
npm run build-storybook  # Static Storybook export
```

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository and create your branch from `main`.
2. **Install dependencies** — `npm install`.
3. **Make your changes** — write TypeScript for any new files.
4. **Add tests** — place them in `tests/` mirroring the source structure.
5. **Run the test suite** — `npm test` to make sure nothing is broken.
6. **Commit using Conventional Commits** — run `npm run commit` to use Commitizen, or
   format manually (e.g. `feat: add new station`, `fix: tide parsing`).
7. **Open a Pull Request** against `main`.

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/)
enforced by commitlint. Branch naming is encouraged to follow the
[Conventional-Branch](https://conventional-branch.github.io/) pattern as a
recommendation (not currently CI-enforced). Use the `npm run commit` helper for
a guided prompt, or write messages like:

```text
feat: add support for wave height data
fix: handle missing tide predictions gracefully
docs: update API endpoint table in README
```

### Code Style

- **TypeScript** for all new source files (`.ts` / `.tsx`)
- **Prettier** for formatting
- **ESLint** with `eslint-config-next` and `eslint-config-prettier`

### Project Structure Conventions

- API routes go in `src/pages/api/`
- React components in `src/components/`
- Utility functions in `src/util/`
- Tests in `tests/` mirroring the source tree
- Storybook stories in `stories/`

## API Types

NextWeather provides comprehensive TypeScript types for all API responses:

### `/api/nbdc` Response Types

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
```

### `/api/forecast` Response Types (Exported)

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

### `/api/observations` Response Types (GeoJSON-LD)

```typescript
interface WeatherValue {
  unitCode: string;
  value: number | null;
  qualityControl: string;
}

interface ObservationProperties {
  station: string;
  timestamp: string;
  temperature: WeatherValue;
  dewpoint: WeatherValue;
  windDirection: WeatherValue;
  windSpeed: WeatherValue;
  windGust: WeatherValue;
  // ... additional optional properties
}
```

## Data Sources

NextWeather relies on publicly available NOAA data:

- [**NDBC (National Data Buoy Center)**](https://www.ndbc.noaa.gov/) — realtime2 text
  files with 45-day wind/wave/temperature history
- [**NOAA Tides & Currents**](https://tidesandcurrents.noaa.gov/) — water level
  observations and tide predictions
- [**National Weather Service API**](https://www.weather.gov/documentation/services-web-api)
  — station observations and hourly forecasts

## Documentation Agent Resources

This repository includes **comprehensive guides for creating GitHub Copilot documentation agents**.

👉 **[Start Here: Documentation Agent Resources Index](DOCUMENTATION_AGENT_INDEX.md)** 👈

Learn how to create `.github/copilot-instructions.md` files that help GitHub Copilot better
understand and assist with your projects. The index provides:

- **[Complete Guide](DOCUMENTATION_AGENT_GUIDE.md)** — In-depth tutorial with examples and
  best practices
- **[Quick Reference](DOCUMENTATION_AGENT_QUICKREF.md)** — Essential tips for quick lookup
- **[Template](DOCUMENTATION_AGENT_TEMPLATE.md)** — Copy-paste template to get started
- **[Workflow & Diagrams](DOCUMENTATION_AGENT_WORKFLOW.md)** — Visual guides and process flows

Perfect for developers who want to improve their AI coding assistant experience!

## License

This project is not currently licensed for public use or redistribution. All rights
reserved © 2026 Ivan Storck. If you are interested in using this code, please
contact the author to discuss licensing terms.

---

Built with ☕ for the paddling community.

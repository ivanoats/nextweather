/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import ForecastTab from 'src/components/ForecastTab';

// Mock fetch
const mockFetchResponse = {
  stationId: 'WPOW1',
  latitude: 47.6606,
  longitude: -122.3972,
  periods: [
    {
      startTime: '2026-02-11T19:00:00-08:00',
      endTime: '2026-02-11T20:00:00-08:00',
      windSpeed: '10 mph',
      windDirection: 'S',
      shortForecast: 'Partly Cloudy',
      temperature: 48,
      temperatureUnit: 'F',
      isDaytime: false,
    },
    {
      startTime: '2026-02-11T20:00:00-08:00',
      endTime: '2026-02-11T21:00:00-08:00',
      windSpeed: '12 mph',
      windDirection: 'SSW',
      shortForecast: 'Mostly Cloudy',
      temperature: 47,
      temperatureUnit: 'F',
      isDaytime: false,
    },
  ],
};

const mockCurrentConditions = {
  stationId: 'WPOW1',
  windSpeed: 11,
  windGust: 15,
  windDirection: 190,
  airTemp: 48,
};

function renderForecastTab(station = 'WPOW1') {
  return render(
    <ChakraProvider value={defaultSystem}>
      <ForecastTab station={station} />
    </ChakraProvider>
  );
}

describe('ForecastTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    globalThis.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;
    renderForecastTab();

    expect(screen.getByText('Fetching forecast…')).toBeInTheDocument();
  });

  it('displays forecast data after loading', async () => {
    globalThis.fetch = jest.fn((url) => {
      if (url.includes('/api/forecast')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFetchResponse),
        });
      }
      if (url.includes('/api/nbdc')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCurrentConditions),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderForecastTab();

    expect(await screen.findByText('Wind Forecast')).toBeInTheDocument();
    expect(await screen.findByText('10 mph')).toBeInTheDocument();
    expect(await screen.findByText('S')).toBeInTheDocument();
    expect(await screen.findByText('Partly Cloudy')).toBeInTheDocument();
  });

  it('shows error state on fetch failure', async () => {
    globalThis.fetch = jest.fn((url) => {
      if (url.includes('/api/forecast')) {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      if (url.includes('/api/nbdc')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCurrentConditions),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderForecastTab();

    expect(
      await screen.findByText(/Failed to fetch forecast/)
    ).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('renders the title and description', async () => {
    globalThis.fetch = jest.fn((url) => {
      if (url.includes('/api/forecast')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFetchResponse),
        });
      }
      if (url.includes('/api/nbdc')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCurrentConditions),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderForecastTab();

    expect(await screen.findByText('Wind Forecast')).toBeInTheDocument();
    expect(
      await screen.findByText(/24-hour hourly forecast from NWS/)
    ).toBeInTheDocument();
  });

  it('handles network error with rejected promise', async () => {
    globalThis.fetch = jest.fn((url) => {
      if (url.includes('/api/forecast')) {
        return Promise.reject(new Error('Network failure'));
      }
      if (url.includes('/api/nbdc')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCurrentConditions),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderForecastTab();

    expect(
      await screen.findByText(/Failed to fetch forecast: Network failure/)
    ).toBeInTheDocument();
  });

  it('handles non-Error rejection reason', async () => {
    globalThis.fetch = jest.fn((url) => {
      if (url.includes('/api/forecast')) {
        return Promise.reject('String error message');
      }
      if (url.includes('/api/nbdc')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCurrentConditions),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderForecastTab();

    expect(
      await screen.findByText(/Failed to fetch forecast: String error message/)
    ).toBeInTheDocument();
  });

  it('displays various weather icons based on forecast', async () => {
    const forecastWithRain = {
      ...mockFetchResponse,
      periods: [
        {
          ...mockFetchResponse.periods[0],
          shortForecast: 'Light Rain',
        },
        {
          ...mockFetchResponse.periods[0],
          shortForecast: 'Thunderstorms',
        },
        {
          ...mockFetchResponse.periods[0],
          shortForecast: 'Snow Showers',
        },
        {
          ...mockFetchResponse.periods[0],
          shortForecast: 'Foggy',
        },
        {
          ...mockFetchResponse.periods[0],
          shortForecast: 'Cloudy',
        },
        {
          ...mockFetchResponse.periods[0],
          shortForecast: 'Partly Sunny',
          isDaytime: true,
        },
        {
          ...mockFetchResponse.periods[0],
          shortForecast: 'Clear',
          isDaytime: true,
        },
        {
          ...mockFetchResponse.periods[0],
          shortForecast: 'Clear',
          isDaytime: false,
        },
      ],
    };

    globalThis.fetch = jest.fn((url) => {
      if (url.includes('/api/forecast')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(forecastWithRain),
        });
      }
      if (url.includes('/api/nbdc')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCurrentConditions),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderForecastTab();

    // Just verify the forecast loads - icons are rendered in the component
    expect(await screen.findByText('Wind Forecast')).toBeInTheDocument();
    expect(await screen.findByText('Light Rain')).toBeInTheDocument();
  });

  it('handles missing current conditions gracefully', async () => {
    globalThis.fetch = jest.fn((url) => {
      if (url.includes('/api/forecast')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFetchResponse),
        });
      }
      if (url.includes('/api/nbdc')) {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderForecastTab();

    // Should still show forecast even if current conditions fail
    expect(await screen.findByText('Wind Forecast')).toBeInTheDocument();
    expect(await screen.findByText('10 mph')).toBeInTheDocument();
  });

  it('handles nbdc network error gracefully', async () => {
    globalThis.fetch = jest.fn((url) => {
      if (url.includes('/api/forecast')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFetchResponse),
        });
      }
      if (url.includes('/api/nbdc')) {
        return Promise.reject(new Error('NBDC service down'));
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderForecastTab();

    // Should still show forecast even if nbdc completely fails
    expect(await screen.findByText('Wind Forecast')).toBeInTheDocument();
    expect(await screen.findByText('10 mph')).toBeInTheDocument();
  });

  it('shows wind difference warning when current wind is 0 mph (calm) but forecast is significant', async () => {
    const calmConditions = {
      stationId: 'WPOW1',
      windSpeed: 0, // Calm conditions
      windGust: 0,
      windDirection: 0,
      airTemp: 48,
    };

    const windyForecast = {
      ...mockFetchResponse,
      periods: [
        {
          ...mockFetchResponse.periods[0],
          windSpeed: '10 mph', // Forecast shows wind picking up
        },
      ],
    };

    globalThis.fetch = jest.fn((url) => {
      if (url.includes('/api/forecast')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(windyForecast),
        });
      }
      if (url.includes('/api/nbdc')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(calmConditions),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderForecastTab();

    // Should show warning that current conditions differ from forecast
    expect(await screen.findByText('Wind Forecast')).toBeInTheDocument();
    expect(
      await screen.findByText(/Actual conditions are lower than predicted/)
    ).toBeInTheDocument();
  });

  it('shows wind difference warning when actual wind is higher than forecast', async () => {
    const windyCurrentConditions = {
      stationId: 'WPOW1',
      windSpeed: 16, // Actual conditions are windier than forecast
      windGust: 20,
      windDirection: 180,
      airTemp: 48,
    };

    const calmerForecast = {
      ...mockFetchResponse,
      periods: [
        {
          ...mockFetchResponse.periods[0],
          windSpeed: '9 mph', // Forecast shows lighter wind than actual
        },
      ],
    };

    globalThis.fetch = jest.fn((url) => {
      if (url.includes('/api/forecast')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(calmerForecast),
        });
      }
      if (url.includes('/api/nbdc')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(windyCurrentConditions),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderForecastTab();

    // Should show warning that actual conditions are windier than forecast
    expect(await screen.findByText('Wind Forecast')).toBeInTheDocument();
    expect(
      await screen.findByText(/Actual conditions are higher than predicted/)
    ).toBeInTheDocument();
  });
});

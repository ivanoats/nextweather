/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import ForecastTab from 'src/components/ForecastTab'

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
}

function renderForecastTab(station = 'WPOW1') {
  return render(
    <ChakraProvider value={defaultSystem}>
      <ForecastTab station={station} />
    </ChakraProvider>,
  )
}

describe('ForecastTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state initially', () => {
    globalThis.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock
    renderForecastTab()

    expect(screen.getByText('Fetching forecast…')).toBeInTheDocument()
  })

  it('displays forecast data after loading', async () => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFetchResponse),
      }),
    ) as jest.Mock

    renderForecastTab()

    expect(await screen.findByText('Wind Forecast')).toBeInTheDocument()
    expect(await screen.findByText('10 mph')).toBeInTheDocument()
    expect(await screen.findByText('S')).toBeInTheDocument()
    expect(await screen.findByText('Partly Cloudy')).toBeInTheDocument()
  })

  it('shows error state on fetch failure', async () => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      }),
    ) as jest.Mock

    renderForecastTab()

    expect(await screen.findByText(/Failed to fetch forecast/)).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
  })

  it('renders the title and description', async () => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFetchResponse),
      }),
    ) as jest.Mock

    renderForecastTab()

    expect(await screen.findByText('Wind Forecast')).toBeInTheDocument()
    expect(await screen.findByText(/24-hour hourly forecast from NWS/)).toBeInTheDocument()
  })
})

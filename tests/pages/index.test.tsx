/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import Home from 'src/pages/index'

const mockObservations = {
  stationId: 'WPOW1',
  windSpeed: 12.5,
  windDirection: 225,
  windGust: 18.3,
  airTemp: 55.4,
  currentTide: '3.21',
  nextTide: '2/10/2026 3:45:00 PM 0.12 ft L',
  nextTideAfter: '2/10/2026 9:30:00 PM 8.45 ft H',
}

function renderHome() {
  return render(
    <ChakraProvider value={defaultSystem}>
      <Home />
    </ChakraProvider>,
  )
}

beforeEach(() => {
  jest.useFakeTimers()
  globalThis.fetch = jest.fn()
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe('Home page', () => {
  it('shows a loading spinner before data arrives', () => {
    // fetch never resolves
    ;(globalThis.fetch as jest.Mock).mockReturnValue(new Promise(() => {}))

    renderHome()

    expect(screen.getByText('Fetching conditions…')).toBeInTheDocument()
  })

  it('renders weather data after a successful fetch', async () => {
    ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockObservations,
    })

    await act(async () => {
      renderHome()
    })

    await waitFor(() => {
      // Station ID
      expect(screen.getByText('Station WPOW1')).toBeInTheDocument()
    })

    // Wind speed (rounded)
    expect(screen.getByText('13')).toBeInTheDocument()

    // Wind direction – compass label and degrees
    expect(screen.getByText(/SW 225°/)).toBeInTheDocument()

    // Gusts card
    expect(screen.getByText('Gusts')).toBeInTheDocument()

    // Air temp card (rounded)
    expect(screen.getByText('Air Temp')).toBeInTheDocument()
    expect(screen.getByText('55')).toBeInTheDocument()

    // Tide section
    expect(screen.getByText('Tides')).toBeInTheDocument()
    expect(screen.getByText('3.21 ft')).toBeInTheDocument()

    // Compass SVG cardinal labels
    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()

    // Logo
    const logo = screen.getByAltText('west point wind')
    expect(logo).toBeInTheDocument()
  })

  it('shows an error state when fetch fails', async () => {
    ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    await act(async () => {
      renderHome()
    })

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data (500)')).toBeInTheDocument()
    })

    expect(screen.getByText('Try again')).toBeInTheDocument()
  })

  it('shows an error state on network failure', async () => {
    ;(globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    await act(async () => {
      renderHome()
    })

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('refetches data when the refresh button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    const updatedObs = { ...mockObservations, windSpeed: 20.1 }

    ;(globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockObservations })
      .mockResolvedValueOnce({ ok: true, json: async () => updatedObs })

    await act(async () => {
      renderHome()
    })

    await waitFor(() => {
      expect(screen.getByText('13')).toBeInTheDocument()
    })

    await user.click(screen.getByText('↻ Refresh'))

    await waitFor(() => {
      expect(screen.getByText('20')).toBeInTheDocument()
    })

    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })

  it('displays dash placeholders when optional fields are missing', async () => {
    const partial = { stationId: 'WPOW1', windSpeed: 5.0 }

    ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => partial,
    })

    await act(async () => {
      renderHome()
    })

    await waitFor(() => {
      expect(screen.getByText('Station WPOW1')).toBeInTheDocument()
    })

    // Multiple dash placeholders for missing data
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })
})

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

describe('Tab navigation integration', () => {
  it('renders the tab bar with all four tabs', async () => {
    ;(globalThis.fetch as jest.Mock).mockReturnValue(new Promise(() => {}))

    renderHome()

    expect(screen.getByRole('tab', { name: 'Conditions' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Forecast' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Custom' })).toBeInTheDocument()
  })

  it('shows the conditions tab by default', async () => {
    ;(globalThis.fetch as jest.Mock).mockReturnValue(new Promise(() => {}))

    renderHome()

    expect(screen.getByRole('tab', { name: 'Conditions' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Fetching conditions…')).toBeInTheDocument()
  })

  it('switches to the About tab when clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockObservations,
    })

    await act(async () => {
      renderHome()
    })

    await user.click(screen.getByRole('tab', { name: 'About' }))

    expect(screen.getByText('About NextWeather')).toBeInTheDocument()
    expect(screen.queryByText('Wind Speed')).not.toBeInTheDocument()
  })

  it('switches to the Custom tab when clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockObservations,
    })

    await act(async () => {
      renderHome()
    })

    await user.click(screen.getByRole('tab', { name: 'Custom' }))

    expect(screen.getByText('Custom Station')).toBeInTheDocument()
    expect(screen.getByLabelText('Weather Station ID')).toBeInTheDocument()
    expect(screen.queryByText('Wind Speed')).not.toBeInTheDocument()
  })

  it('returns to conditions tab after navigating away', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockObservations,
    })

    await act(async () => {
      renderHome()
    })

    await waitFor(() => {
      expect(screen.getByText('Station WPOW1')).toBeInTheDocument()
    })

    // Navigate to About
    await user.click(screen.getByRole('tab', { name: 'About' }))
    expect(screen.getByText('About NextWeather')).toBeInTheDocument()

    // Navigate back to Conditions
    await user.click(screen.getByRole('tab', { name: 'Conditions' }))
    expect(screen.getByText('Station WPOW1')).toBeInTheDocument()
  })

  it('applies custom station from Custom tab and returns to Conditions', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    ;(globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockObservations,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockObservations, stationId: 'SISW1' }),
      })

    await act(async () => {
      renderHome()
    })

    await waitFor(() => {
      expect(screen.getByText('Station WPOW1')).toBeInTheDocument()
    })

    // Navigate to Custom tab
    await user.click(screen.getByRole('tab', { name: 'Custom' }))

    // Change station
    const stationInput = screen.getByLabelText('Weather Station ID')
    await user.clear(stationInput)
    await user.type(stationInput, 'SISW1')

    // Apply
    await user.click(screen.getByRole('button', { name: /apply/i }))

    // Should switch back to conditions and re-fetch
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Conditions' })).toHaveAttribute('aria-selected', 'true')
    })

    // Verify new fetch was made with custom station
    const fetchCalls = (globalThis.fetch as jest.Mock).mock.calls
    const lastCall = fetchCalls[fetchCalls.length - 1][0]
    expect(lastCall).toContain('station=SISW1')
  })
})

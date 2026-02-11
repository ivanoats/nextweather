/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import AboutTab from 'src/components/AboutTab'

function renderAboutTab() {
  return render(
    <ChakraProvider value={defaultSystem}>
      <AboutTab />
    </ChakraProvider>,
  )
}

describe('AboutTab', () => {
  it('renders the heading', () => {
    renderAboutTab()
    expect(screen.getByText('About NextWeather')).toBeInTheDocument()
  })

  it('describes the app purpose', () => {
    renderAboutTab()
    expect(
      screen.getByText(/weather station data aggregator/i),
    ).toBeInTheDocument()
  })

  it('mentions the data sources', () => {
    renderAboutTab()
    expect(screen.getByText('Data Sources')).toBeInTheDocument()
    expect(screen.getByText('NDBC Realtime Observations')).toBeInTheDocument()
    expect(screen.getByText('NOAA Tides & Currents')).toBeInTheDocument()
  })

  it('shows default station info', () => {
    renderAboutTab()
    expect(screen.getByText('Default Station')).toBeInTheDocument()
    expect(screen.getByText(/WPOW1/)).toBeInTheDocument()
    expect(screen.getByText(/9447130/)).toBeInTheDocument()
  })

  it('mentions the Custom tab for changing stations', () => {
    renderAboutTab()
    expect(
      screen.getByText(/Use the Custom tab to monitor a different station/i),
    ).toBeInTheDocument()
  })
})

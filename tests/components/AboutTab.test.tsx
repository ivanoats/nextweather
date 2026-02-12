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

  it('renders the "About the Creator" section heading', () => {
    renderAboutTab()
    expect(screen.getByText('About the Creator')).toBeInTheDocument()
  })

  it('renders the creator image with correct alt text', () => {
    renderAboutTab()
    const image = screen.getByAltText('Ivan Storck paddling an outrigger canoe')
    expect(image).toBeInTheDocument()
    // Next.js Image component transforms the src URL
    expect(image).toHaveAttribute('src')
    expect(image.getAttribute('src')).toContain('ivan-on-oc.jpg')
  })

  it('renders link to creator website', () => {
    renderAboutTab()
    const link = screen.getByRole('link', { name: /Ivan Storck/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://ivanstorck.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders link to GitHub issues', () => {
    renderAboutTab()
    const link = screen.getByRole('link', { name: /GitHub/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://github.com/ivanoats/nextweather/issues')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

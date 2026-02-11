/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import CustomTab from 'src/components/CustomTab'

function renderCustomTab(
  props: {
    initialStation?: string
    initialTideStation?: string
    onApply?: (station: string, tideStation: string) => void
  } = {},
) {
  const onApply = props.onApply ?? jest.fn()
  return {
    onApply,
    ...render(
      <ChakraProvider value={defaultSystem}>
        <CustomTab
          initialStation={props.initialStation}
          initialTideStation={props.initialTideStation}
          onApply={onApply}
        />
      </ChakraProvider>,
    ),
  }
}

describe('CustomTab', () => {
  it('renders the heading and input fields', () => {
    renderCustomTab()

    expect(screen.getByText('Custom Station')).toBeInTheDocument()
    expect(screen.getByLabelText('Weather Station ID')).toBeInTheDocument()
    expect(screen.getByLabelText('Tide Station ID')).toBeInTheDocument()
  })

  it('shows default station values', () => {
    renderCustomTab()

    expect(screen.getByLabelText('Weather Station ID')).toHaveValue('WPOW1')
    expect(screen.getByLabelText('Tide Station ID')).toHaveValue('9447130')
  })

  it('allows typing custom station IDs', async () => {
    const user = userEvent.setup()
    renderCustomTab()

    const stationInput = screen.getByLabelText('Weather Station ID')
    await user.clear(stationInput)
    await user.type(stationInput, 'SISW1')
    expect(stationInput).toHaveValue('SISW1')

    const tideInput = screen.getByLabelText('Tide Station ID')
    await user.clear(tideInput)
    await user.type(tideInput, '9447110')
    expect(tideInput).toHaveValue('9447110')
  })

  it('calls onApply with entered values when Apply is clicked', async () => {
    const user = userEvent.setup()
    const { onApply } = renderCustomTab()

    const stationInput = screen.getByLabelText('Weather Station ID')
    await user.clear(stationInput)
    await user.type(stationInput, 'SISW1')

    const tideInput = screen.getByLabelText('Tide Station ID')
    await user.clear(tideInput)
    await user.type(tideInput, '9447110')

    await user.click(screen.getByRole('button', { name: /apply/i }))

    expect(onApply).toHaveBeenCalledWith('SISW1', '9447110')
  })

  it('shows confirmation feedback after applying', async () => {
    const user = userEvent.setup()
    renderCustomTab()

    await user.click(screen.getByRole('button', { name: /apply/i }))

    expect(screen.getByText('✓ Applied')).toBeInTheDocument()
  })

  it('accepts custom initial values', () => {
    renderCustomTab({
      initialStation: '46087',
      initialTideStation: '9447110',
    })

    expect(screen.getByLabelText('Weather Station ID')).toHaveValue('46087')
    expect(screen.getByLabelText('Tide Station ID')).toHaveValue('9447110')
  })

  it('renders help text about finding station IDs', () => {
    renderCustomTab()

    expect(screen.getByText('Finding Station IDs')).toBeInTheDocument()
    expect(screen.getByText(/NDBC station locator/)).toBeInTheDocument()
    expect(screen.getByText(/tidesandcurrents.noaa.gov/)).toBeInTheDocument()
  })
})

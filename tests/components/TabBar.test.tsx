/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import TabBar, { type TabId } from 'src/components/TabBar'

function renderTabBar(activeTab: TabId = 'forecast', onTabChange = jest.fn()) {
  return {
    onTabChange,
    ...render(
      <ChakraProvider value={defaultSystem}>
        <TabBar activeTab={activeTab} onTabChange={onTabChange} />
      </ChakraProvider>,
    ),
  }
}

describe('TabBar', () => {
  it('renders navigation with all three buttons', () => {
    renderTabBar()

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Forecast' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
  })

  it('marks the active navigation item with aria-current', () => {
    renderTabBar('about')

    expect(screen.getByRole('button', { name: 'About' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Forecast' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('button', { name: 'Custom' })).not.toHaveAttribute('aria-current')
  })

  it('calls onTabChange when a navigation button is clicked', async () => {
    const user = userEvent.setup()
    const { onTabChange } = renderTabBar('forecast')

    await user.click(screen.getByRole('button', { name: 'About' }))
    expect(onTabChange).toHaveBeenCalledWith('about')

    await user.click(screen.getByRole('button', { name: 'Custom' }))
    expect(onTabChange).toHaveBeenCalledWith('custom')
  })

  it('defaults forecast as the active navigation item', () => {
    renderTabBar()

    expect(screen.getByRole('button', { name: 'Forecast' })).toHaveAttribute('aria-current', 'page')
  })
})

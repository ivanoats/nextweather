/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import TabBar, { type TabId } from 'src/components/TabBar'

function renderTabBar(activeTab: TabId = 'conditions', onTabChange = jest.fn()) {
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
  it('renders navigation with all three tabs', () => {
    renderTabBar()

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Conditions' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Custom' })).toBeInTheDocument()
  })

  it('marks the active tab with aria-selected', () => {
    renderTabBar('about')

    expect(screen.getByRole('tab', { name: 'About' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Conditions' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'Custom' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onTabChange when a tab is clicked', async () => {
    const user = userEvent.setup()
    const { onTabChange } = renderTabBar('conditions')

    await user.click(screen.getByRole('tab', { name: 'About' }))
    expect(onTabChange).toHaveBeenCalledWith('about')

    await user.click(screen.getByRole('tab', { name: 'Custom' }))
    expect(onTabChange).toHaveBeenCalledWith('custom')
  })

  it('defaults Conditions as the active tab', () => {
    renderTabBar()

    expect(screen.getByRole('tab', { name: 'Conditions' })).toHaveAttribute('aria-selected', 'true')
  })
})

import { useCallback, memo } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'

export type TabId = 'conditions' | 'forecast' | 'about' | 'custom'

interface TabItem {
  id: TabId
  label: string
  icon: string
}

const tabs: TabItem[] = [
  { id: 'conditions', label: 'Conditions', icon: '🌊' },
  { id: 'forecast', label: 'Forecast', icon: '🌤️' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
  { id: 'custom', label: 'Custom', icon: '⚙️' },
]

interface TabBarProps {
  readonly activeTab: TabId
  readonly onTabChange: (tab: TabId) => void
}

/** Mobile-style bottom tab bar for navigation */
export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <Box
      as="nav"
      aria-label="Main navigation"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      pb="env(safe-area-inset-bottom)"
      zIndex={10}
    >
      <Flex role="tablist" justify="space-around" align="center" h="56px" maxW="480px" mx="auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={isActive}
              onClick={onTabChange}
            />
          )
        })}
      </Flex>
    </Box>
  )
}

/** Individual tab button component - memoized to prevent unnecessary re-renders */
interface TabButtonProps {
  readonly tab: TabItem
  readonly isActive: boolean
  readonly onClick: (tabId: TabId) => void
}

const TabButton = memo(function TabButton({ tab, isActive, onClick }: TabButtonProps) {
  const handleClick = useCallback(() => {
    onClick(tab.id)
  }, [onClick, tab.id])

  return (
    <Flex
      as="button"
      direction="column"
      align="center"
      justify="center"
      flex={1}
      h="100%"
      cursor="pointer"
      onClick={handleClick}
      role="tab"
      aria-selected={isActive}
      aria-label={tab.label}
      _hover={{ bg: 'gray.50' }}
      transition="background 0.15s"
    >
      <Text fontSize="lg" lineHeight="1" mb={0.5}>
        {tab.icon}
      </Text>
      <Text
        fontSize="2xs"
        fontWeight={isActive ? '700' : '500'}
        color={isActive ? 'blue.500' : 'gray.400'}
        letterSpacing="wide"
      >
        {tab.label}
      </Text>
    </Flex>
  )
})

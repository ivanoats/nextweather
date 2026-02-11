import { Box, Flex, Text } from '@chakra-ui/react'

export type TabId = 'forecast' | 'about' | 'custom'

interface TabItem {
  id: TabId
  label: string
  icon: string
}

const tabs: TabItem[] = [
  { id: 'forecast', label: 'Forecast', icon: '🌊' },
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
      role="navigation"
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
      <Flex justify="space-around" align="center" h="56px" maxW="480px" mx="auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <Flex
              key={tab.id}
              as="button"
              direction="column"
              align="center"
              justify="center"
              flex={1}
              h="100%"
              cursor="pointer"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
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
        })}
      </Flex>
    </Box>
  )
}

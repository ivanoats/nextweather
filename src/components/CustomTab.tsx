import { useState, useRef, useEffect, useCallback } from 'react'
import { Box, Flex, Text, VStack, Input } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box)

interface CustomTabProps {
  readonly initialStation?: string
  readonly initialTideStation?: string
  readonly onApply: (station: string, tideStation: string) => void
}

/** Custom tab allowing users to input weather and tide station IDs */
export default function CustomTab({
  initialStation = 'WPOW1',
  initialTideStation = '9447130',
  onApply,
}: CustomTabProps) {
  const [station, setStation] = useState(initialStation)
  const [tideStation, setTideStation] = useState(initialTideStation)
  const [saved, setSaved] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleApply = useCallback(() => {
    if (!station.trim() || !tideStation.trim()) return
    onApply(station.trim(), tideStation.trim())
    setSaved(true)
    // Clear any existing timeout before setting a new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => setSaved(false), 2000)
  }, [station, tideStation, onApply])

  // Memoize onChange handlers to prevent re-renders
  const handleStationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStation(e.target.value)
  }, [])

  const handleTideStationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTideStation(e.target.value)
  }, [])

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <VStack gap={4} align="stretch">
        <Box bg="white" borderRadius="2xl" boxShadow="0 1px 3px rgba(0,0,0,0.08)" px={6} py={5}>
          <Text fontSize="xl" fontWeight="800" color="gray.800" mb={1}>
            Custom Station
          </Text>
          <Text fontSize="sm" color="gray.500" mb={4}>
            Enter NOAA station IDs to monitor a different location.
          </Text>

          <VStack gap={4} align="stretch">
            <Box>
              <Text fontSize="xs" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                Weather Station ID
              </Text>
              <Input
                value={station}
                onChange={handleStationChange}
                placeholder="e.g. WPOW1"
                size="md"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="xl"
                fontWeight="600"
                aria-label="Weather Station ID"
                _focus={{ borderColor: 'blue.400', bg: 'white' }}
              />
              <Text fontSize="xs" color="gray.400" mt={1}>
                NDBC station ID (e.g. WPOW1, SISW1, 46087)
              </Text>
            </Box>

            <Box>
              <Text fontSize="xs" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                Tide Station ID
              </Text>
              <Input
                value={tideStation}
                onChange={handleTideStationChange}
                placeholder="e.g. 9447130"
                size="md"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="xl"
                fontWeight="600"
                aria-label="Tide Station ID"
                _focus={{ borderColor: 'blue.400', bg: 'white' }}
              />
              <Text fontSize="xs" color="gray.400" mt={1}>
                NOAA tide station number (e.g. 9447130)
              </Text>
            </Box>
          </VStack>
        </Box>

        <Flex
          as="button"
          justify="center"
          align="center"
          bg={saved ? 'green.500' : 'blue.500'}
          color="white"
          borderRadius="2xl"
          h="48px"
          fontWeight="700"
          fontSize="sm"
          cursor="pointer"
          onClick={handleApply}
          transition="background 0.2s"
          _hover={{ bg: saved ? 'green.600' : 'blue.600' }}
          role="button"
          aria-label="Apply station settings"
        >
          {saved ? '✓ Applied' : 'Apply & Switch to Conditions'}
        </Flex>

        <Box bg="white" borderRadius="2xl" boxShadow="0 1px 3px rgba(0,0,0,0.08)" px={6} py={5}>
          <Text fontSize="md" fontWeight="700" color="gray.800" mb={2}>
            Finding Station IDs
          </Text>
          <VStack gap={2} align="stretch">
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              <Text as="span" fontWeight="700">Weather stations:</Text>{' '}
              Visit the NDBC station locator at ndbc.noaa.gov to find your
              nearest buoy or coastal station.
            </Text>
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              <Text as="span" fontWeight="700">Tide stations:</Text>{' '}
              Find tide station IDs at tidesandcurrents.noaa.gov under the
              station listings.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </MotionBox>
  )
}

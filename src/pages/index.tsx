import Head from 'next/head'
import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Container,
  Flex,
  HStack,
  Text,
  VStack,
  Spinner,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import TabBar, { type TabId } from '../components/TabBar'
import AboutTab from '../components/AboutTab'
import CustomTab from '../components/CustomTab'

const MotionBox = motion.create(Box)
const MotionFlex = motion.create(Flex)

type Observations = {
  stationId?: string
  windSpeed?: number
  windDirection?: number
  windGust?: number
  airTemp?: number
  currentTide?: string
  nextTide?: string
  nextTideAfter?: string
}

/** Cardinal direction label from degrees */
function degToCompass(deg: number): string {
  const dirs = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ]
  return dirs[Math.round(deg / 22.5) % 16]
}

/** Simple SVG compass arrow */
function WindCompass({ direction }: Readonly<{ direction?: number }>) {
  if (direction === undefined) return null
  return (
    <Box position="relative" w="80px" h="80px" flexShrink={0}>
      <svg viewBox="0 0 100 100" width="80" height="80">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        {/* Cardinal labels */}
        <text x="50" y="14" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">N</text>
        <text x="50" y="96" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">S</text>
        <text x="8" y="54" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">W</text>
        <text x="92" y="54" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">E</text>
        {/* Arrow */}
        <g transform={`rotate(${direction}, 50, 50)`}>
          <polygon points="50,16 43,54 50,48 57,54" fill="#3b82f6" />
          <polygon points="50,84 43,54 50,60 57,54" fill="#94a3b8" opacity="0.4" />
        </g>
      </svg>
    </Box>
  )
}

/** Format a display value (round numbers, pass strings through) */
function formatValue(value: string | number): string | number {
  return typeof value === 'number' ? Math.round(value) : value
}

/** Animated data card */
function DataCard({
  label,
  value,
  unit,
  large,
  delay = 0,
}: Readonly<{
  label: string
  value: string | number | undefined
  unit?: string
  large?: boolean
  delay?: number
}>) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      bg="white"
      borderRadius="2xl"
      boxShadow="0 1px 3px rgba(0,0,0,0.08)"
      px={5}
      py={4}
      flex="1"
      minW="0"
    >
      <Text fontSize="xs" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <HStack gap={1} alignItems="baseline" mt={1}>
        <Text
          fontSize={large ? '4xl' : '2xl'}
          fontWeight="700"
          color="gray.800"
          lineHeight="1"
        >
          {value === undefined ? '—' : formatValue(value)}
        </Text>
        {unit && value !== undefined && (
          <Text fontSize={large ? 'md' : 'sm'} fontWeight="500" color="gray.400">
            {unit}
          </Text>
        )}
      </HStack>
    </MotionBox>
  )
}

/** Tide row */
function TideRow({ label, value, delay = 0 }: Readonly<{ label: string; value?: string; delay?: number }>) {
  return (
    <MotionFlex
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      justify="space-between"
      align="center"
      py={3}
      borderBottom="1px solid"
      borderColor="gray.100"
    >
      <Text fontSize="sm" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text fontSize="md" fontWeight="600" color="gray.700" textAlign="right" maxW="65%">
        {value || '—'}
      </Text>
    </MotionFlex>
  )
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export default function Home() {
  const [data, setData] = useState<Observations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('forecast')
  const [station, setStation] = useState('WPOW1')
  const [tideStation, setTideStation] = useState('9447130')

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const params = new URLSearchParams({ station, tideStation })
      const res = await fetch(`/api/nbdc?${params.toString()}`)
      if (!res.ok) throw new Error(`Failed to fetch data (${res.status})`)
      const json: Observations = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [station, tideStation])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchData])

  function handleApplyCustom(newStation: string, newTideStation: string) {
    setStation(newStation)
    setTideStation(newTideStation)
    setData(null)
    setLoading(true)
    setActiveTab('forecast')
  }

  return (
    <>
      <Head>
        <title>West Point Wind</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#f1f5f9" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        minH="100dvh"
        bg="gray.50"
        pt="env(safe-area-inset-top)"
        pb="calc(env(safe-area-inset-bottom) + 72px)"
      >
        <Container maxW="480px" px={5} py={6}>
          {activeTab === 'forecast' && (
            <>
              {/* Header */}
              <MotionBox
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                mb={6}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontSize="2xl" fontWeight="800" color="gray.800" lineHeight="1.1">
                      West Point Wind
                    </Text>
                    <Text fontSize="xs" fontWeight="500" color="gray.400" mt={0.5}>
                      {data?.stationId ? `Station ${data.stationId}` : 'Loading station…'}
                    </Text>
                  </Box>
                  {lastUpdated && (
                    <Text fontSize="xs" color="gray.400">
                      {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </Flex>
              </MotionBox>

              {/* Loading state */}
              {loading && !data && (
                <Flex justify="center" align="center" minH="300px">
                  <VStack gap={3}>
                    <Spinner size="lg" color="blue.400" />
                    <Text fontSize="sm" color="gray.400">Fetching conditions…</Text>
                  </VStack>
                </Flex>
              )}

              {/* Error state */}
              {error && !data && (
                <Flex justify="center" align="center" minH="300px">
                  <VStack gap={3}>
                    <Text fontSize="lg" color="red.400" fontWeight="600">⚠</Text>
                    <Text fontSize="sm" color="gray.500" textAlign="center">{error}</Text>
                    <Text
                      as="button"
                      fontSize="sm"
                      fontWeight="600"
                      color="blue.500"
                      onClick={fetchData}
                      cursor="pointer"
                    >
                      Try again
                    </Text>
                  </VStack>
                </Flex>
              )}

              <AnimatePresence>
                {data && (
                  <VStack gap={4} align="stretch">
                    {/* Wind hero section */}
                    <MotionBox
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      bg="white"
                      borderRadius="2xl"
                      boxShadow="0 1px 3px rgba(0,0,0,0.08)"
                      px={6}
                      py={5}
                    >
                      <Text fontSize="xs" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                        Wind Speed
                      </Text>
                      <Flex align="center" justify="space-between" mt={2}>
                        <HStack gap={2} alignItems="baseline">
                          <Text fontSize="6xl" fontWeight="800" color="gray.800" lineHeight="1">
                            {data.windSpeed === undefined ? '—' : Math.round(data.windSpeed)}
                          </Text>
                          <VStack gap={0} alignItems="flex-start">
                            <Text fontSize="lg" fontWeight="500" color="gray.400">mph</Text>
                            {data.windDirection !== undefined && (
                              <Text fontSize="sm" fontWeight="600" color="blue.400">
                                {degToCompass(data.windDirection)} {data.windDirection}°
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                        <WindCompass direction={data.windDirection} />
                      </Flex>
                    </MotionBox>

                    {/* Gust and Temperature row */}
                    <Flex gap={4}>
                      <DataCard label="Gusts" value={data.windGust} unit="mph" delay={0.1} />
                      <DataCard
                        label="Air Temp"
                        value={data.airTemp === undefined ? undefined : Math.round(data.airTemp)}
                        unit="°F"
                        delay={0.2}
                      />
                    </Flex>

                    {/* Tides section */}
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      bg="white"
                      borderRadius="2xl"
                      boxShadow="0 1px 3px rgba(0,0,0,0.08)"
                      px={5}
                      py={4}
                    >
                      <Text fontSize="xs" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={2}>
                        Tides
                      </Text>
                      <TideRow label="Current" value={data.currentTide ? `${data.currentTide} ft` : undefined} delay={0.35} />
                      <TideRow label="Next" value={data.nextTide} delay={0.4} />
                      <Box>
                        <MotionFlex
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.45 }}
                          justify="space-between"
                          align="center"
                          py={3}
                        >
                          <Text fontSize="sm" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                            After
                          </Text>
                          <Text fontSize="md" fontWeight="600" color="gray.700" textAlign="right" maxW="65%">
                            {data.nextTideAfter || '—'}
                          </Text>
                        </MotionFlex>
                      </Box>
                    </MotionBox>

                    {/* Refresh button */}
                    <MotionBox
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      textAlign="center"
                      pt={2}
                      pb={4}
                    >
                      <Text
                        as="button"
                        fontSize="sm"
                        fontWeight="600"
                        color="blue.500"
                        onClick={fetchData}
                        cursor="pointer"
                        _hover={{ color: 'blue.600' }}
                      >
                        ↻ Refresh
                      </Text>
                    </MotionBox>
                  </VStack>
                )}
              </AnimatePresence>
            </>
          )}

          {activeTab === 'about' && <AboutTab />}

          {activeTab === 'custom' && (
            <CustomTab
              initialStation={station}
              initialTideStation={tideStation}
              onApply={handleApplyCustom}
            />
          )}
        </Container>
      </Box>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}

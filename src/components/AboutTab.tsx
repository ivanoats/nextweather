import { Box, Image, Link, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box)

/** About tab content describing the NextWeather app */
export default function AboutTab() {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <VStack gap={4} align="stretch">
        <Box bg="white" borderRadius="2xl" boxShadow="0 1px 3px rgba(0,0,0,0.08)" px={6} py={5}>
          <Text fontSize="xl" fontWeight="800" color="gray.800" mb={3}>
            About NextWeather
          </Text>
          <VStack gap={3} align="stretch">
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              NextWeather is a weather station data aggregator built for
              human-powered watercraft enthusiasts — kayakers, sailors, and
              paddleboarders who need accurate wind and tide conditions at a
              glance.
            </Text>
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              The app pulls real-time data from NOAA sources including the
              National Data Buoy Center (NDBC) for wind observations and
              NOAA Tides &amp; Currents for tide levels and predictions.
            </Text>
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              Data refreshes automatically every 5 minutes so you always have
              the latest conditions before heading out on the water.
            </Text>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="2xl" boxShadow="0 1px 3px rgba(0,0,0,0.08)" px={6} py={5}>
          <Text fontSize="md" fontWeight="700" color="gray.800" mb={2}>
            Data Sources
          </Text>
          <VStack gap={2} align="stretch">
            <DataSourceRow label="Wind & Temperature" value="NDBC Realtime Observations" />
            <DataSourceRow label="Tide Levels" value="NOAA Tides & Currents" />
            <DataSourceRow label="Refresh Interval" value="Every 5 minutes" />
          </VStack>
        </Box>

        <Box bg="white" borderRadius="2xl" boxShadow="0 1px 3px rgba(0,0,0,0.08)" px={6} py={5}>
          <Text fontSize="md" fontWeight="700" color="gray.800" mb={2}>
            Default Station
          </Text>
          <VStack gap={2} align="stretch">
            <DataSourceRow label="Weather Station" value="WPOW1 (West Point, WA)" />
            <DataSourceRow label="Tide Station" value="9447130 (Seattle)" />
          </VStack>
          <Text fontSize="xs" color="gray.400" mt={3}>
            Use the Custom tab to monitor a different station.
          </Text>
        </Box>

        <Box bg="white" borderRadius="2xl" boxShadow="0 1px 3px rgba(0,0,0,0.08)" px={6} py={5}>
          <Text fontSize="md" fontWeight="700" color="gray.800" mb={2}>
            About the Creator
          </Text>
          <VStack gap={3} align="stretch">
            <Image
              src="/ivan-on-oc.jpg"
              alt="Ivan Storck paddling an outrigger canoe"
              borderRadius="xl"
              objectFit="cover"
              maxH="300px"
              w="100%"
            />
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              Developed by{' '}
              <Link href="https://ivanstorck.com" target="_blank" rel="noopener noreferrer" color="blue.500">
                Ivan Storck
              </Link>
              , a software engineer and avid paddler based in
              Seattle. NextWeather was born out of a desire for a simple,
              mobile-friendly way to check local conditions before heading out on
              the water.
            </Text>
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              If you have feedback or suggestions for improving the app, please
              reach out on{' '}
              <Link href="https://github.com/ivanoats/nextweather/issues" target="_blank" rel="noopener noreferrer" color="blue.500">
                GitHub
              </Link>
              .
            </Text>
          </VStack>
        </Box>
      </VStack>
    </MotionBox>
  )
}

function DataSourceRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
      <Text fontSize="sm" fontWeight="600" color="gray.400">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="600" color="gray.700">
        {value}
      </Text>
    </Box>
  )
}

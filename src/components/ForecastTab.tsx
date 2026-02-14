import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Spinner,
  Alert,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  Tooltip,
  XAxis,
} from 'recharts';
import {
  generateForecastSummary,
  type ForecastPeriod,
  type CurrentConditions,
} from '../util/forecast-summary';

const MotionBox = motion.create(Box);

type ForecastData = {
  stationId: string;
  latitude: number;
  longitude: number;
  periods: ForecastPeriod[];
};

interface ForecastTabProps {
  readonly station?: string;
}

function formatHour(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDay(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatShortHour(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: 'numeric' });
}

/** Parse wind speed string like "10 mph" to a number */
function parseWindSpeed(ws: string): number {
  const windSpeedMatch = /(\d+)/.exec(ws);
  return windSpeedMatch ? Number.parseInt(windSpeedMatch[1], 10) : 0;
}

/** Check if forecasted wind differs significantly from current conditions */
function isWindDifferent(
  forecastPeriod: ForecastPeriod | undefined,
  currentConditions: CurrentConditions | undefined
): { isDifferent: boolean; message: string } | null {
  if (!forecastPeriod || currentConditions?.windSpeed == null) {
    return null;
  }

  const forecastSpeed = parseWindSpeed(forecastPeriod.windSpeed);
  const currentSpeed = currentConditions.windSpeed;
  const speedDiff = Math.abs(forecastSpeed - currentSpeed);
  const SIGNIFICANT_DIFFERENCE = 5; // 5+ mph difference is significant

  if (speedDiff >= SIGNIFICANT_DIFFERENCE) {
    const direction = currentSpeed > forecastSpeed ? 'higher' : 'lower';
    return {
      isDifferent: true,
      message: `Current wind is ${Math.round(currentSpeed)} mph, but forecast shows ${Math.round(forecastSpeed)} mph for this hour. Actual conditions are ${direction} than predicted.`,
    };
  }

  return null;
}

/** Wind speed sparkline chart */
function WindSparkline({ periods }: Readonly<{ periods: ForecastPeriod[] }>) {
  const chartData = periods.map((p) => ({
    time: formatShortHour(p.startTime),
    wind: parseWindSpeed(p.windSpeed),
    gust: p.windSpeed.includes('-')
      ? parseWindSpeed(p.windSpeed.split('-')[1])
      : undefined,
  }));

  const maxWind = Math.max(...chartData.map((d) => d.gust ?? d.wind));
  const minWind = Math.min(...chartData.map((d) => d.wind));

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      boxShadow="0 1px 3px rgba(0,0,0,0.08)"
      px={4}
      py={4}
      mb={4}
      role="img"
      aria-label={`Wind speed sparkline chart ranging from ${minWind} to ${maxWind} mph over the next 24 hours`}
    >
      <Text
        fontSize="xs"
        fontWeight="600"
        color="gray.400"
        textTransform="uppercase"
        letterSpacing="wider"
        mb={2}
      >
        Wind Speed Trend
      </Text>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
        >
          <defs>
            <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <YAxis domain={[Math.max(0, minWind - 2), maxWind + 2]} hide />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            interval={Math.max(0, Math.floor(chartData.length / 6) - 1)}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
            }}
            formatter={(value?: number) => [`${value ?? 0} mph`, 'Wind']}
            labelFormatter={(label) => label ?? ''}
          />
          <Area
            type="monotone"
            dataKey="wind"
            stroke="#3b82f6"
            fill="url(#windGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: '#3b82f6' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

function weatherIcon(forecast: string, isDaytime: boolean): string {
  const lower = forecast.toLowerCase();
  if (lower.includes('rain') || lower.includes('shower')) return '🌧️';
  if (lower.includes('thunder') || lower.includes('storm')) return '⛈️';
  if (lower.includes('snow')) return '🌨️';
  if (lower.includes('fog') || lower.includes('mist')) return '🌫️';
  if (lower.includes('cloud') || lower.includes('overcast')) return '☁️';
  if (lower.includes('partly') || lower.includes('mostly'))
    return isDaytime ? '⛅' : '☁️';
  return isDaytime ? '☀️' : '🌙';
}

/** Forecast summary card with natural language description */
function ForecastSummary({
  periods,
  currentConditions,
}: Readonly<{
  periods: ForecastPeriod[];
  currentConditions?: CurrentConditions;
}>) {
  const summary = useMemo(
    () => generateForecastSummary(periods, currentConditions),
    [periods, currentConditions]
  );

  return (
    <Box
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      borderRadius="2xl"
      boxShadow="0 4px 12px rgba(102, 126, 234, 0.3)"
      px={5}
      py={4}
      mb={4}
    >
      <Text fontSize="md" fontWeight="600" color="white" lineHeight="1.6">
        {summary}
      </Text>
    </Box>
  );
}

/** Single forecast row */
function ForecastRow({
  period,
  delay = 0,
}: Readonly<{ period: ForecastPeriod; delay?: number }>) {
  const summary = `${formatHour(period.startTime)}: ${period.shortForecast}, wind ${period.windSpeed} ${period.windDirection}, ${period.temperature}°${period.temperatureUnit}`;
  return (
    <MotionBox
      as="li"
      role="listitem"
      aria-label={summary}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay }}
      py={3}
      borderBottom="1px solid"
      borderColor="gray.100"
      listStyleType="none"
    >
      <Flex justify="space-between" align="center">
        <HStack gap={3} flex={1} minW={0}>
          <Text fontSize="lg" flexShrink={0} aria-hidden="true" role="img">
            {weatherIcon(period.shortForecast, period.isDaytime)}
          </Text>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="600" color="gray.700">
              {formatHour(period.startTime)}
            </Text>
            <Text fontSize="xs" color="gray.400" truncate>
              {period.shortForecast}
            </Text>
          </Box>
        </HStack>
        <HStack gap={4} flexShrink={0}>
          <Box textAlign="right">
            <Text fontSize="sm" fontWeight="700" color="blue.500">
              {period.windSpeed}
            </Text>
            <Text fontSize="xs" color="gray.400">
              {period.windDirection}
            </Text>
          </Box>
          <Box textAlign="right" minW="40px">
            <Text fontSize="sm" fontWeight="600" color="gray.600">
              {period.temperature}°{period.temperatureUnit}
            </Text>
          </Box>
        </HStack>
      </Flex>
    </MotionBox>
  );
}

/** Forecast tab showing hourly wind forecast from NWS (HRRR-based) */
export default function ForecastTab({ station = 'WPOW1' }: ForecastTabProps) {
  const [data, setData] = useState<ForecastData | null>(null);
  const [currentConditions, setCurrentConditions] =
    useState<CurrentConditions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setCurrentConditions(null); // Reset to avoid stale data

      // Fetch both forecast and current conditions in parallel
      const [forecastRes, currentRes] = await Promise.allSettled([
        fetch(`/api/forecast?${new URLSearchParams({ station })}`),
        fetch(`/api/nbdc?${new URLSearchParams({ station })}`),
      ]);

      // Handle forecast response
      if (forecastRes.status === 'fulfilled' && forecastRes.value.ok) {
        const json: ForecastData = await forecastRes.value.json();
        setData(json);
      } else if (forecastRes.status === 'fulfilled') {
        throw new Error(
          `Failed to fetch forecast (${forecastRes.value.status})`
        );
      } else {
        const errorMsg =
          forecastRes.reason instanceof Error
            ? forecastRes.reason.message
            : String(forecastRes.reason);
        throw new Error(
          `Failed to fetch forecast: ${errorMsg || 'Network error'}`
        );
      }

      // Handle current conditions (non-critical, can fail silently)
      if (currentRes.status === 'fulfilled' && currentRes.value.ok) {
        const json = await currentRes.value.json();
        setCurrentConditions({
          windSpeed: json.windSpeed,
          windGust: json.windGust,
          windDirection: json.windDirection,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [station]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <VStack gap={4} align="stretch">
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="0 1px 3px rgba(0,0,0,0.08)"
          px={6}
          py={5}
        >
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="xl" fontWeight="800" color="gray.800">
              Wind Forecast
            </Text>
            {!loading && (
              <Text
                as="button"
                fontSize="sm"
                fontWeight="600"
                color="blue.500"
                onClick={fetchForecast}
                cursor="pointer"
                aria-label="Refresh forecast"
                _hover={{ color: 'blue.600' }}
                _focusVisible={{
                  outline: '2px solid',
                  outlineColor: 'blue.400',
                  outlineOffset: '2px',
                  borderRadius: 'md',
                }}
              >
                ↻
              </Text>
            )}
          </Flex>
          <Text fontSize="sm" color="gray.500" mb={4}>
            24-hour hourly forecast from NWS
            {data ? ` · Station ${data.stationId}` : ''}
          </Text>

          {loading && (
            <Flex justify="center" align="center" minH="200px" role="status">
              <VStack gap={3}>
                <Spinner
                  size="lg"
                  color="blue.400"
                  aria-label="Loading forecast data"
                />
                <Text fontSize="sm" color="gray.400">
                  Fetching forecast…
                </Text>
              </VStack>
            </Flex>
          )}

          {error && !loading && (
            <Flex justify="center" align="center" minH="200px" role="alert">
              <VStack gap={3}>
                <Text
                  fontSize="lg"
                  color="red.400"
                  fontWeight="600"
                  aria-hidden="true"
                >
                  ⚠
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  {error}
                </Text>
                <Text
                  as="button"
                  fontSize="sm"
                  fontWeight="600"
                  color="blue.500"
                  onClick={fetchForecast}
                  cursor="pointer"
                  _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'blue.400',
                    outlineOffset: '2px',
                    borderRadius: 'md',
                  }}
                >
                  Try again
                </Text>
              </VStack>
            </Flex>
          )}

          {data && !loading && (
            <>
              <ForecastSummary
                periods={data.periods}
                currentConditions={currentConditions ?? undefined}
              />
              {(() => {
                const windComparison = isWindDifferent(
                  data.periods[0],
                  currentConditions ?? undefined
                );
                return (
                  windComparison?.isDifferent && (
                    <Alert.Root status="warning" mb={4}>
                      <Alert.Indicator>⚠️</Alert.Indicator>
                      <Alert.Content>
                        <Alert.Title>Wind Conditions Differ</Alert.Title>
                        <Alert.Description fontSize="sm">
                          {windComparison.message}
                        </Alert.Description>
                      </Alert.Content>
                    </Alert.Root>
                  )
                );
              })()}
              <WindSparkline periods={data.periods} />
              {/* Group by day */}
              {groupByDay(data.periods).map(([day, periods]) => (
                <Box key={day} mb={4}>
                  <Text
                    as="h3"
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb={1}
                  >
                    {day}
                  </Text>
                  <Box
                    as="ul"
                    role="list"
                    aria-label={`Forecast for ${day}`}
                    listStyleType="none"
                    m={0}
                    p={0}
                  >
                    {periods.map((period, i) => (
                      <ForecastRow
                        key={period.startTime}
                        period={period}
                        delay={i * 0.01}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </>
          )}
        </Box>
      </VStack>
    </MotionBox>
  );
}

/** Group forecast periods by day label */
function groupByDay(periods: ForecastPeriod[]): [string, ForecastPeriod[]][] {
  const groups: Map<string, ForecastPeriod[]> = new Map();
  for (const period of periods) {
    const day = formatDay(period.startTime);
    const existing = groups.get(day);
    if (existing) {
      existing.push(period);
    } else {
      groups.set(day, [period]);
    }
  }
  return Array.from(groups.entries());
}

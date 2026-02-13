import type { Meta, StoryObj } from '@storybook/react';
import { Box, ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { generateForecastSummary } from '../src/util/forecast-summary';
import type { ForecastPeriod } from '../src/util/forecast-summary';

/** Forecast summary card with natural language description */
function ForecastSummary({ periods }: Readonly<{ periods: ForecastPeriod[] }>) {
  const summary = generateForecastSummary(periods);

  return (
    <Box
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      borderRadius="2xl"
      boxShadow="0 4px 12px rgba(102, 126, 234, 0.3)"
      px={5}
      py={4}
      mb={4}
    >
      <Box fontSize="md" fontWeight="600" color="white" lineHeight="1.6">
        {summary}
      </Box>
    </Box>
  );
}

const meta: Meta<typeof ForecastSummary> = {
  title: 'Components/ForecastSummary',
  component: ForecastSummary,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <ChakraProvider value={defaultSystem}>
        <Box maxW="400px" p={4}>
          <Story />
        </Box>
      </ChakraProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ForecastSummary>;

const createMockPeriod = (
  windSpeed: string,
  temperature: number,
  shortForecast: string,
  isDaytime = true
): ForecastPeriod => ({
  startTime: '2024-01-15T09:00:00-08:00',
  endTime: '2024-01-15T10:00:00-08:00',
  windSpeed,
  windDirection: 'NW',
  shortForecast,
  temperature,
  temperatureUnit: 'F',
  isDaytime,
});

// Epic wind day - Very excited!
export const EpicWindDay: Story = {
  args: {
    periods: [
      createMockPeriod('22 mph', 60, 'Partly Cloudy'),
      createMockPeriod('24 mph', 61, 'Partly Cloudy'),
      createMockPeriod('23 mph', 60, 'Partly Cloudy'),
      createMockPeriod('25 mph', 62, 'Partly Cloudy'),
      createMockPeriod('23 mph', 61, 'Partly Cloudy'),
    ],
  },
};

// Great sustained wind over 12mph - User's request!
export const SustainedWindOver12mph: Story = {
  args: {
    periods: [
      createMockPeriod('15 mph', 65, 'Sunny'),
      createMockPeriod('16 mph', 66, 'Sunny'),
      createMockPeriod('14 mph', 64, 'Sunny'),
      createMockPeriod('15 mph', 65, 'Sunny'),
      createMockPeriod('17 mph', 66, 'Sunny'),
      createMockPeriod('16 mph', 65, 'Sunny'),
    ],
  },
};

// Moderate wind day
export const ModerateWind: Story = {
  args: {
    periods: [
      createMockPeriod('10 mph', 70, 'Sunny'),
      createMockPeriod('12 mph', 71, 'Sunny'),
      createMockPeriod('11 mph', 69, 'Sunny'),
      createMockPeriod('13 mph', 72, 'Sunny'),
    ],
  },
};

// Light wind - calm conditions
export const LightWind: Story = {
  args: {
    periods: [
      createMockPeriod('6 mph', 70, 'Sunny'),
      createMockPeriod('7 mph', 71, 'Sunny'),
      createMockPeriod('5 mph', 69, 'Sunny'),
      createMockPeriod('8 mph', 72, 'Sunny'),
    ],
  },
};

// Gusty conditions
export const GustyConditions: Story = {
  args: {
    periods: [
      createMockPeriod('10-18 mph', 65, 'Partly Cloudy'),
      createMockPeriod('12-20 mph', 66, 'Partly Cloudy'),
      createMockPeriod('11-19 mph', 64, 'Partly Cloudy'),
      createMockPeriod('13-21 mph', 65, 'Partly Cloudy'),
    ],
  },
};

// Rainy day
export const RainyDay: Story = {
  args: {
    periods: [
      createMockPeriod('12 mph', 55, 'Rain Showers'),
      createMockPeriod('13 mph', 54, 'Light Rain'),
      createMockPeriod('14 mph', 53, 'Rain'),
      createMockPeriod('12 mph', 54, 'Rain Showers'),
    ],
  },
};

// Stormy weather
export const StormyWeather: Story = {
  args: {
    periods: [
      createMockPeriod('18 mph', 60, 'Thunderstorms'),
      createMockPeriod('20 mph', 59, 'Storms'),
      createMockPeriod('16 mph', 58, 'Thunderstorms'),
      createMockPeriod('19 mph', 59, 'Storms'),
    ],
  },
};

// Cold day
export const ColdDay: Story = {
  args: {
    periods: [
      createMockPeriod('10 mph', 40, 'Partly Cloudy'),
      createMockPeriod('11 mph', 38, 'Partly Cloudy'),
      createMockPeriod('12 mph', 39, 'Partly Cloudy'),
    ],
  },
};

// Warm day
export const WarmDay: Story = {
  args: {
    periods: [
      createMockPeriod('14 mph', 80, 'Sunny'),
      createMockPeriod('15 mph', 82, 'Sunny'),
      createMockPeriod('13 mph', 81, 'Sunny'),
    ],
  },
};

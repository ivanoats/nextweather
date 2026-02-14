import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to external API domains for faster network connections */}
        <link
          rel="preconnect"
          href="https://www.ndbc.noaa.gov"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://tidesandcurrents.noaa.gov"
          crossOrigin=""
        />
        <link rel="preconnect" href="https://api.weather.gov" crossOrigin="" />

        {/* DNS prefetch as fallback for older browsers */}
        <link rel="dns-prefetch" href="https://www.ndbc.noaa.gov" />
        <link rel="dns-prefetch" href="https://tidesandcurrents.noaa.gov" />
        <link rel="dns-prefetch" href="https://api.weather.gov" />

        {/* Meta tags */}
        <meta
          name="description"
          content="Real-time wind and tide conditions for West Point, Seattle. Live weather data for kayakers, sailors, and paddleboarders."
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

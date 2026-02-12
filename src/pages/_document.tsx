import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to external API domains for faster network connections */}
        <link rel="preconnect" href="https://www.ndbc.noaa.gov" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://tidesandcurrents.noaa.gov" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.weather.gov" crossOrigin="anonymous" />
        
        {/* DNS prefetch as fallback for older browsers */}
        <link rel="dns-prefetch" href="https://www.ndbc.noaa.gov" />
        <link rel="dns-prefetch" href="https://tidesandcurrents.noaa.gov" />
        <link rel="dns-prefetch" href="https://api.weather.gov" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

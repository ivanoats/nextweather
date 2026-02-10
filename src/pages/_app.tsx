// import '../styles/globals.css'
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { AppProps } from "next/app"

function MyApp({ Component, pageProps }: AppProps ) {
  return (
    <ChakraProvider value={defaultSystem}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp

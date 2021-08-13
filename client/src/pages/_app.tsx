import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import React from "react";
import { createClient, Provider } from "urql";
import theme from "../theme";

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
	const client = createClient({
		url: "http://localhost:4000/graphql",
		fetchOptions: {
			credentials: "include",
		},
	});

	return (
		<Provider value={client}>
			<ChakraProvider resetCSS theme={theme}>
				<Component {...pageProps} />
			</ChakraProvider>
		</Provider>
	);
}

export default MyApp;

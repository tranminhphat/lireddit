import { ChakraProvider } from "@chakra-ui/react";
import { Cache, cacheExchange, QueryInput } from "@urql/exchange-graphcache";
import { AppProps } from "next/app";
import React from "react";
import { createClient, dedupExchange, fetchExchange, Provider } from "urql";
import {
	CurrentUserDocument,
	CurrentUserQuery,
	LogoutMutation,
} from "../generated/graphql";
import theme from "../theme";

function betterUpdateQuery<Result, Query>(
	cache: Cache,
	qi: QueryInput,
	result: any,
	fn: (r: Result, q: Query) => Query
) {
	return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
	const client = createClient({
		url: "http://localhost:4000/graphql",
		fetchOptions: {
			credentials: "include",
		},
		exchanges: [
			dedupExchange,
			cacheExchange({
				updates: {
					Mutation: {
						logout: (result, args, cache, info) => {
							betterUpdateQuery<LogoutMutation, CurrentUserQuery>(
								cache,
								{ query: CurrentUserDocument },
								result,
								() => ({ currentUser: null })
							);
						},
					},
				},
			}),
			fetchExchange,
		],
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

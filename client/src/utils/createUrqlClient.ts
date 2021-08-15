import { cacheExchange } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange } from "urql";
import {
	CurrentUserDocument,
	CurrentUserQuery,
	LogoutMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

export const createUrqlClient = (ssrExchange: any) => ({
	url: "http://localhost:4000/graphql",
	fetchOptions: {
		credentials: "include" as RequestCredentials,
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
		ssrExchange,
		fetchExchange,
	],
});

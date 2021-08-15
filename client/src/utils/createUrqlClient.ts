import { cacheExchange } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange } from "urql";
import {
	CurrentUserDocument,
	CurrentUserQuery,
	LoginMutation,
	LogoutMutation,
	RegisterMutation,
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
					login: (result, args, cache, info) => {
						betterUpdateQuery<LoginMutation, CurrentUserQuery>(
							cache,
							{ query: CurrentUserDocument },
							result,
							({ login }, query) => {
								if (login.errors) {
									return query;
								} else {
									return {
										currentUser: login.user,
									};
								}
							}
						);
					},
					register: (result, args, cache, info) => {
						betterUpdateQuery<RegisterMutation, CurrentUserQuery>(
							cache,
							{ query: CurrentUserDocument },
							result,
							({ register }, query) => {
								if (register.errors) {
									return query;
								} else {
									return {
										currentUser: register.user,
									};
								}
							}
						);
					},
				},
			},
		}),
		ssrExchange,
		fetchExchange,
	],
});

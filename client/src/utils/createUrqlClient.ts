/* eslint-disable @typescript-eslint/no-unused-vars */
import { cacheExchange } from "@urql/exchange-graphcache";
import Router from "next/router";
import { dedupExchange, Exchange, fetchExchange } from "urql";
import { pipe, tap } from "wonka";
import {
	CurrentUserDocument,
	CurrentUserQuery,
	LoginMutation,
	LogoutMutation,
	RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

const errorExchange: Exchange =
	({ forward }) =>
	(ops$) => {
		return pipe(
			forward(ops$),
			tap(({ error }) => {
				if (error?.message.includes("not authenticated")) {
					Router.replace("/login");
				}
			})
		);
	};

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
					logout: (result, _args, cache, _info) => {
						betterUpdateQuery<LogoutMutation, CurrentUserQuery>(
							cache,
							{ query: CurrentUserDocument },
							result,
							() => ({ currentUser: null })
						);
					},
					login: (result, _args, cache, _info) => {
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
					register: (result, _args, cache, _info) => {
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
		errorExchange,
		ssrExchange,
		fetchExchange,
	],
});

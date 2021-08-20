/* eslint-disable @typescript-eslint/no-unused-vars */
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
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

// refactor from simplePagination()
const cursorPagination = (): Resolver => {
	return (_parent, fieldArgs, cache, info) => {
		const { parentKey: entityKey, fieldName } = info;
		const allFields = cache.inspectFields(entityKey);
		const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
		const size = fieldInfos.length;
		if (size === 0) {
			return undefined;
		}

		const isDataInTheCache = cache.resolve(entityKey, fieldName, fieldArgs);
		// do partial for the next cursor pagination query
		info.partial = !isDataInTheCache;
		const result: string[] = [];
		fieldInfos.forEach((fi) => {
			const data = cache.resolve(entityKey, fi.fieldKey) as string[];
			result.push(...data);
		});

		return result;
	};
};

export const createUrqlClient = (ssrExchange: any) => ({
	url: "http://localhost:4000/graphql",
	fetchOptions: {
		credentials: "include" as RequestCredentials,
	},
	exchanges: [
		dedupExchange,
		cacheExchange({
			resolvers: {
				Query: {
					posts: cursorPagination(),
				},
			},
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

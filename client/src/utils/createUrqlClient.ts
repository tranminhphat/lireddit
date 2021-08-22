/* eslint-disable @typescript-eslint/no-unused-vars */
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import gql from "graphql-tag";
import { NextPageContext } from "next";
import { SSRExchange } from "next-urql";
import Router from "next/router";
import { ClientOptions, dedupExchange, Exchange, fetchExchange } from "urql";
import { pipe, tap } from "wonka";
import { IS_SERVER } from "../constants";
import {
	CurrentUserDocument,
	CurrentUserQuery,
	DeletePostMutationVariables,
	LoginMutation,
	LogoutMutation,
	RegisterMutation,
	VoteMutationVariables,
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

		const isDataInTheCache = cache.resolve(
			cache.resolve(entityKey, fieldName, fieldArgs) as string,
			"data"
		);
		// do partial for the next cursor pagination query
		info.partial = !isDataInTheCache;
		const data: string[] = [];
		let hasMore = true;
		fieldInfos.forEach((fi) => {
			const key = cache.resolve(entityKey, fi.fieldKey) as string;
			const _data = cache.resolve(key, "data") as string[];
			const _hasMore = cache.resolve(key, "hasMore") as boolean;

			data.push(..._data);
			hasMore = _hasMore;
		});

		return {
			data,
			hasMore,
			__typename: "PaginatedPosts",
		};
	};
};

export const createUrqlClient = (
	ssrExchange: SSRExchange,
	ctx?: NextPageContext
): ClientOptions => {
	const cookie = IS_SERVER ? ctx?.req?.headers.cookie : "";
	return {
		url: "http://localhost:4000/graphql",
		fetchOptions: {
			credentials: "include" as RequestCredentials,
			headers: cookie ? { cookie } : undefined,
		},
		exchanges: [
			dedupExchange,
			cacheExchange({
				keys: {
					PaginatedPosts: () => null,
				},
				resolvers: {
					Query: {
						posts: cursorPagination(),
					},
				},
				updates: {
					Mutation: {
						deletePost: (result, args, cache, _info) => {
							cache.invalidate({
								__typename: "Post",
								id: (args as DeletePostMutationVariables).id,
							});
						},
						vote: (_result, args, cache, info) => {
							const { postId, value } = args as VoteMutationVariables;
							const data = cache.readFragment(
								gql`
									fragment _ on Post {
										id
										points
										voteStatus
									}
								`,
								{ id: postId } as any
							);

							if (data) {
								if (data.voteStatus === value) {
									return;
								}
								const newPoints =
									(data.points as number) + (!data.voteStatus ? 1 : 2) * value;
								cache.writeFragment(
									gql`
										fragment __ on Post {
											points
											voteStatus
										}
									`,
									{ id: postId, points: newPoints, voteStatus: value } as any
								);
							}
						},
						createPost: (result, _args, cache, _info) => {
							const allFields = cache.inspectFields("Query");
							const fieldInfos = allFields.filter(
								(info) => info.fieldName === "posts"
							);

							fieldInfos.forEach((fi) => {
								cache.invalidate("Query", "posts", fi.arguments);
							});
						},
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
	};
};

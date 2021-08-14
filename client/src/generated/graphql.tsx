/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import gql from "graphql-tag";
import * as Urql from "urql";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
	[K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
	{ [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
	{ [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
};

export type FieldError = {
	__typename?: "FieldError";
	field: Scalars["String"];
	message: Scalars["String"];
};

export type LoginInput = {
	username: Scalars["String"];
	password: Scalars["String"];
};

export type Mutation = {
	__typename?: "Mutation";
	createPost: Post;
	updatePost?: Maybe<Post>;
	deletePost: Scalars["Boolean"];
	register: UserResponse;
	login: UserResponse;
	deleteUser: Scalars["Boolean"];
};

export type MutationCreatePostArgs = {
	title: Scalars["String"];
};

export type MutationUpdatePostArgs = {
	title: Scalars["String"];
	id: Scalars["Float"];
};

export type MutationDeletePostArgs = {
	id: Scalars["Int"];
};

export type MutationRegisterArgs = {
	options: RegisterInput;
};

export type MutationLoginArgs = {
	options: LoginInput;
};

export type MutationDeleteUserArgs = {
	id: Scalars["Int"];
};

export type Post = {
	__typename?: "Post";
	id: Scalars["Int"];
	createdAt: Scalars["String"];
	updatedAt: Scalars["String"];
	title: Scalars["String"];
};

export type Query = {
	__typename?: "Query";
	posts: Array<Post>;
	post?: Maybe<Post>;
	users: Array<User>;
	user?: Maybe<User>;
};

export type QueryPostArgs = {
	id: Scalars["Float"];
};

export type QueryUserArgs = {
	id: Scalars["Float"];
};

export type RegisterInput = {
	username: Scalars["String"];
	email: Scalars["String"];
	password: Scalars["String"];
};

export type User = {
	__typename?: "User";
	id: Scalars["Int"];
	createdAt: Scalars["String"];
	updatedAt: Scalars["String"];
	username: Scalars["String"];
	email: Scalars["String"];
};

export type UserResponse = {
	__typename?: "UserResponse";
	errors?: Maybe<Array<FieldError>>;
	user?: Maybe<User>;
};

export type RegisterMutationVariables = Exact<{
	email: Scalars["String"];
	username: Scalars["String"];
	password: Scalars["String"];
}>;

export type RegisterMutation = {
	__typename?: "Mutation";
	register: {
		__typename?: "UserResponse";
		user?: Maybe<{
			__typename?: "User";
			id: number;
			username: string;
			email: string;
		}>;
		errors?: Maybe<
			Array<{ __typename?: "FieldError"; field: string; message: string }>
		>;
	};
};

export const RegisterDocument = gql`
	mutation Register($email: String!, $username: String!, $password: String!) {
		register(
			options: { email: $email, username: $username, password: $password }
		) {
			user {
				id
				username
				email
			}
			errors {
				field
				message
			}
		}
	}
`;

export function useRegisterMutation() {
	return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(
		RegisterDocument
	);
}

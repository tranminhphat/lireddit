import { Link } from "@chakra-ui/layout";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React from "react";
import Layout from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = (): React.ReactElement => {
	const [{ data }] = usePostsQuery({
		variables: {
			limit: 5,
		},
	});

	return (
		<Layout size="xl">
			<NextLink href="create-post">
				<Link>create post</Link>
			</NextLink>
			<br />
			{!data ? (
				<div>...loading</div>
			) : (
				data.posts.map((p) => <div key={p.id}>{p.title}</div>)
			)}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

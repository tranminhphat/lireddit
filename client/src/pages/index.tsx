import { Link } from "@chakra-ui/layout";
import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React from "react";
import Layout from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = (): React.ReactElement => {
	const [{ data }] = usePostsQuery({
		variables: {
			limit: 10,
		},
	});

	return (
		<Layout size="md">
			<Flex align="center">
				<Heading>LiReddit</Heading>
				<NextLink href="create-post">
					<Link ml="auto">create post</Link>
				</NextLink>
			</Flex>
			<br />
			{!data ? (
				<div>...loading</div>
			) : (
				<Stack spacing={8}>
					{data.posts.map((p) => (
						<Box key={p.id} p={5} shadow="md" borderWidth="1px">
							<Heading fontSize="xl">{p.title}</Heading>
							<Text mt={4}>{p.textSnippet}</Text>
						</Box>
					))}
				</Stack>
			)}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

import { Link } from "@chakra-ui/layout";
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import Layout from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = (): React.ReactElement => {
	const [pagination, setPagination] = useState({
		limit: 10,
		cursor: null as string | null,
	});
	const [{ data, fetching }] = usePostsQuery({
		variables: pagination,
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
			{!data && fetching ? (
				<div>...loading</div>
			) : (
				<Stack spacing={8}>
					{data?.posts.map((p) => (
						<Box key={p.id} p={5} shadow="md" borderWidth="1px">
							<Heading fontSize="xl">{p.title}</Heading>
							<Text mt={4}>{p.textSnippet}</Text>
						</Box>
					))}
				</Stack>
			)}
			{data ? (
				<Flex>
					<Button
						onClick={() =>
							setPagination({
								limit: pagination.limit,
								cursor: data.posts[data.posts.length - 1].createdAt,
							})
						}
						isLoading={fetching}
						mx="auto"
						my="8"
					>
						load more
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

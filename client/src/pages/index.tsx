import { Link } from "@chakra-ui/layout";
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import Layout from "../components/Layout";
import UpdootSection from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = (): React.ReactElement => {
	const [pagination, setPagination] = useState({
		limit: 33,
		cursor: null as string | null,
	});
	const [{ data: queryData, fetching }] = usePostsQuery({
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
			{!queryData && fetching ? (
				<div>...loading</div>
			) : (
				<Stack spacing={8}>
					{queryData?.posts.data.map((p) => (
						<Flex key={p.id} p={5} shadow="md" borderWidth="1px">
							<UpdootSection post={p} />
							<Box>
								<Heading fontSize="xl">{p.title}</Heading>
								<Flex>
									<Text>posted by</Text>
									<Text ml={1} fontWeight="bold">
										{p.creator.username}
									</Text>
								</Flex>
								<Text mt={4}>{p.textSnippet}</Text>
							</Box>
						</Flex>
					))}
				</Stack>
			)}
			{queryData && queryData.posts.hasMore ? (
				<Flex>
					<Button
						onClick={() =>
							setPagination({
								limit: pagination.limit,
								cursor:
									queryData.posts.data[queryData.posts.data.length - 1]
										.createdAt,
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

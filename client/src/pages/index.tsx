import { DeleteIcon } from "@chakra-ui/icons";
import { Link } from "@chakra-ui/layout";
import {
	Box,
	Button,
	Flex,
	Heading,
	IconButton,
	Stack,
	Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import Layout from "../components/Layout";
import UpdootSection from "../components/UpdootSection";
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = (): React.ReactElement => {
	const [pagination, setPagination] = useState({
		limit: 15,
		cursor: null as string | null,
	});
	const [{ data: queryData, fetching }] = usePostsQuery({
		variables: pagination,
	});

	const [, deletePost] = useDeletePostMutation();

	if (!fetching && !queryData) {
		return <div>you got query failed for some reason</div>;
	}

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
					{queryData?.posts.data.map((p) =>
						!p ? null : (
							<Flex key={p.id} p={5} shadow="md" borderWidth="1px">
								<UpdootSection post={p} />
								<Box>
									<NextLink href="/post/[id]" as={`/post/${p.id}`}>
										<Link>
											<Heading fontSize="xl">{p.title}</Heading>
										</Link>
									</NextLink>
									<Flex>
										<Text>posted by</Text>
										<Text ml={1} fontWeight="bold">
											{p.creator.username}
										</Text>
									</Flex>
									<Text mt={4}>{p.textSnippet}</Text>
								</Box>
								<Box ml="auto">
									<IconButton
										onClick={async () => await deletePost({ id: p.id })}
										aria-label="delete post"
										icon={<DeleteIcon />}
									/>
								</Box>
							</Flex>
						)
					)}
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

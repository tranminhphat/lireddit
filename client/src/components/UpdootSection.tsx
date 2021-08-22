import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import * as React from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
	post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({
	post,
}: UpdootSectionProps) => {
	const [, vote] = useVoteMutation();
	return (
		<Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
			<IconButton
				onClick={async () => {
					if (post.voteStatus === 1) {
						return;
					}
					await vote({ postId: post.id, value: 1 });
				}}
				aria-label="updoot post"
				icon={<ChevronUpIcon />}
				size="lg"
				bgColor={post.voteStatus === 1 ? "green" : undefined}
			/>
			<Text>{post.points}</Text>
			<IconButton
				onClick={async () => {
					if (post.voteStatus === -1) {
						return;
					}
					await vote({ postId: post.id, value: -1 });
				}}
				aria-label="updoot post"
				icon={<ChevronDownIcon />}
				size="lg"
				bgColor={post.voteStatus === -1 ? "red" : undefined}
			/>
		</Flex>
	);
};

export default UpdootSection;

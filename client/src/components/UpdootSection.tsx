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
					await vote({ postId: post.id, value: 1 });
				}}
				aria-label="updoot post"
				icon={<ChevronUpIcon />}
				size="lg"
			/>
			<Text>{post.points}</Text>
			<IconButton
				onClick={async () => {
					await vote({ postId: post.id, value: -1 });
				}}
				aria-label="updoot post"
				icon={<ChevronDownIcon />}
				size="lg"
			/>
		</Flex>
	);
};

export default UpdootSection;

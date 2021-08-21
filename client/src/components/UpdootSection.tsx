import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import * as React from "react";
import { PostSnippetFragment } from "../generated/graphql";

interface UpdootSectionProps {
	post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({
	post,
}: UpdootSectionProps) => {
	return (
		<Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
			<IconButton aria-label="updoot post" icon={<ChevronUpIcon />} size="lg" />
			<Text>{post.points}</Text>
			<IconButton
				aria-label="updoot post"
				icon={<ChevronDownIcon />}
				size="lg"
			/>
		</Flex>
	);
};

export default UpdootSection;

import { Flex, Heading } from "@chakra-ui/react";
import React from "react";

export const Hero = ({ title }: { title: string }): React.ReactElement => (
	<Flex
		justifyContent="center"
		alignItems="center"
		height="100vh"
		bgGradient="linear(to-l, #7928CA, #FF0080)"
		bgClip="text"
	>
		<Heading fontSize="6vw">{title}</Heading>
	</Flex>
);

Hero.defaultProps = {
	title: "with-chakra-ui-typescript",
};
